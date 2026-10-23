import { db } from '../../config/database.js';
import { MESSAGES } from '../../constants/messages.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import * as poolRepository from './pool.repository.js';

/** Service: semua aturan bisnis pool. */

export const POOL_LABEL = 'Pool';

async function findOrFail(id) {
  const pool = await poolRepository.findById(id);
  if (!pool) throw AppError.notFound(MESSAGES.notFound(POOL_LABEL));
  return pool;
}

async function assertCodeAvailable(code, exceptId) {
  const existing = await poolRepository.findByCode(code);
  if (existing && existing.id !== exceptId) {
    throw AppError.conflict(MESSAGES.CODE_TAKEN, [{ field: 'code', message: MESSAGES.codeTaken(code) }]);
  }
}

export async function list(query) {
  const { rows, total } = await poolRepository.findAll(query);
  return { data: rows, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
}

export const getById = findOrFail;

export async function create(payload) {
  await assertCodeAvailable(payload.code);
  const id = await poolRepository.create(payload);
  return poolRepository.findById(id);
}

/**
 * Kapasitas tidak boleh diturunkan di bawah jumlah unit aktif saat ini
 * (kalau boleh, pool otomatis "kelebihan kapasitas").
 *
 * Dijalankan dalam transaction + FOR UPDATE: selama pengecekan, tidak ada unit
 * yang bisa masuk/pindah ke pool ini, jadi angka okupansi pasti akurat.
 */
export async function update(id, payload) {
  await assertCodeAvailable(payload.code, id);

  await db.transaction(async (trx) => {
    const pool = await poolRepository.findByIdForUpdate(id, trx);
    if (!pool) throw AppError.notFound(MESSAGES.notFound(POOL_LABEL));

    const occupied = await poolRepository.countActiveUnits(id, trx);
    if (payload.capacity < occupied) {
      throw AppError.conflict(`Kapasitas ${pool.name} tidak boleh kurang dari jumlah unit aktif saat ini (${occupied})`, [
        { field: 'capacity', message: `Minimal ${occupied} sesuai jumlah unit aktif` },
      ]);
    }

    await poolRepository.update(id, payload, trx);
  });

  return poolRepository.findById(id);
}

/** Aturan bisnis 7: pool yang masih punya unit (termasuk riwayat unit KELUAR) tidak boleh dihapus. */
export async function remove(id) {
  const pool = await findOrFail(id);
  const unitCount = await poolRepository.countUnits(id);
  if (unitCount > 0) throw AppError.conflict(MESSAGES.inUse(POOL_LABEL, pool.name, unitCount));

  await poolRepository.remove(id);
}
