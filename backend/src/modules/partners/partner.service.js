import { MESSAGES } from '../../constants/messages.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import * as partnerRepository from './partner.repository.js';

/** Service: semua aturan bisnis mitra. Tidak tahu apa-apa soal req/res. */

export const PARTNER_LABEL = 'Mitra';

async function findOrFail(id) {
  const partner = await partnerRepository.findById(id);
  if (!partner) throw AppError.notFound(MESSAGES.notFound(PARTNER_LABEL));
  return partner;
}

/** Kode harus unik. `exceptId` dipakai saat update supaya tidak bentrok dengan dirinya sendiri. */
async function assertCodeAvailable(code, exceptId) {
  const existing = await partnerRepository.findByCode(code);
  if (existing && existing.id !== exceptId) {
    throw AppError.conflict(MESSAGES.CODE_TAKEN, [{ field: 'code', message: MESSAGES.codeTaken(code) }]);
  }
}

export async function list(query) {
  const { rows, total } = await partnerRepository.findAll(query);
  return { data: rows, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
}

export const getById = findOrFail;

export async function create(payload) {
  await assertCodeAvailable(payload.code);
  const id = await partnerRepository.create(payload);
  return partnerRepository.findById(id);
}

export async function update(id, payload) {
  await findOrFail(id);
  await assertCodeAvailable(payload.code, id);
  await partnerRepository.update(id, payload);
  return partnerRepository.findById(id);
}

/**
 * Aturan bisnis 7: mitra yang masih dipakai unit tidak boleh dihapus.
 * Dicek di sini agar pesannya jelas; FK RESTRICT di database tetap menjadi pengaman terakhir.
 */
export async function remove(id) {
  const partner = await findOrFail(id);
  const unitCount = await partnerRepository.countUnits(id);
  if (unitCount > 0) throw AppError.conflict(MESSAGES.inUse(PARTNER_LABEL, partner.name, unitCount));

  await partnerRepository.remove(id);
}
