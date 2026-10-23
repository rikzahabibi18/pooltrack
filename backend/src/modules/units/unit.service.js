import { db } from '../../config/database.js';
import { MESSAGES } from '../../constants/messages.js';
import { UNIT_STATUS } from '../../constants/unitStatus.js';
import { AppError } from '../../utils/AppError.js';
import { todayDate } from '../../utils/date.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import * as partnerRepository from '../partners/partner.repository.js';
import * as poolRepository from '../pools/pool.repository.js';
import * as referenceRepository from '../references/reference.repository.js';
import * as vehicleTypeRepository from '../vehicle-types/vehicleType.repository.js';
import * as unitRepository from './unit.repository.js';

/**
 * Service unit: SEMUA aturan bisnis unit ada di sini.
 *
 * Istilah "unit aktif" = unit yang status-nya `counts_toward_capacity = true`
 * (masih menempati pool). Unit yang sudah KELUAR tidak aktif lagi dan menjadi arsip.
 *
 * Urutan kunci (FOR UPDATE) selalu: unit dulu, baru pool — supaya tidak terjadi deadlock.
 */

export const UNIT_LABEL = 'Unit';

/** Panjang maksimal kolom unit_status_histories.note */
const HISTORY_NOTE_MAX = 255;

const fieldError = (field, message) => AppError.badRequest(MESSAGES.VALIDATION_FAILED, [{ field, message }]);

async function findOrFail(id) {
  const unit = await unitRepository.findById(id);
  if (!unit) throw AppError.notFound(MESSAGES.notFound(UNIT_LABEL));
  return unit;
}

/** Kunci baris unit untuk transaction ini + ambil status saat ini. */
async function lockUnitWithStatus(id, trx) {
  const unit = await unitRepository.findByIdForUpdate(id, trx);
  if (!unit) throw AppError.notFound(MESSAGES.notFound(UNIT_LABEL));
  const status = await referenceRepository.findStatusById(unit.status_id, trx);
  return { unit, status };
}

/** Keputusan C: unit yang sudah tidak aktif (KELUAR) adalah arsip dan tidak boleh diubah. */
function assertUnitIsActive(status, action) {
  if (!status.counts_toward_capacity) {
    throw AppError.conflict(`Unit berstatus "${status.name}" sudah menjadi arsip dan tidak dapat ${action}`);
  }
}

/** Keputusan E: master untuk data baru harus ada dan aktif. */
async function assertActiveMaster(repository, id, field, label) {
  const record = await repository.findById(id);
  if (!record || !record.is_active) throw fieldError(field, `${label} tidak ditemukan atau sudah nonaktif`);
  return record;
}

/** Aturan bisnis 1: plat unik di antara unit AKTIF (unit yang sudah KELUAR boleh masuk lagi). */
async function assertPlateAvailable(plateNumber, exceptId, trx) {
  const existing = await unitRepository.findActiveByPlate(plateNumber, exceptId, trx);
  if (existing) {
    throw AppError.conflict(`Plat ${plateNumber} sudah terdaftar pada unit aktif di ${existing.pool_name}`, [
      { field: 'plate_number', message: 'Plat ini masih dipakai unit aktif' },
    ]);
  }
}

/**
 * Aturan bisnis 2: unit tidak bisa masuk/pindah ke pool yang penuh.
 * Baris pool dikunci (FOR UPDATE) sehingga dua admin yang memasukkan unit
 * ke pool yang sama secara bersamaan akan diproses bergantian, bukan "balapan".
 */
async function assertPoolHasSpace(poolId, trx) {
  const pool = await poolRepository.findByIdForUpdate(poolId, trx);
  if (!pool || !pool.is_active) throw fieldError('pool_id', 'Pool tidak ditemukan atau sudah nonaktif');

  const occupied = await poolRepository.countActiveUnits(poolId, trx);
  if (occupied >= pool.capacity) {
    throw AppError.conflict(`Kapasitas ${pool.name} penuh (${occupied}/${pool.capacity})`, [
      { field: 'pool_id', message: `Pool penuh (${occupied}/${pool.capacity})` },
    ]);
  }
  return pool;
}

/**
 * Alasan langkah status berikutnya BELUM boleh dilakukan (null = boleh).
 * Satu sumber aturan: dipakai changeStatus() untuk validasi, dan buildActions() untuk FE.
 */
function getNextStepBlockedReason(next, inspectionCount) {
  if (!next) return 'Unit sudah berada di status terakhir';
  if (next.code === UNIT_STATUS.DIINSPEKSI) {
    return 'Status Diinspeksi diberikan otomatis saat hasil inspeksi pertama disimpan. Tambahkan hasil inspeksi untuk unit ini.';
  }
  if (next.code === UNIT_STATUS.SIAP_JUAL && inspectionCount === 0) {
    return 'Unit belum pernah diinspeksi sehingga belum dapat ditandai Siap Jual';
  }
  return null;
}

/**
 * Aksi yang diizinkan untuk satu unit, dikirim ke frontend bersama datanya.
 * Dengan begitu frontend tidak perlu tahu kode status atau aturan bisnis apa pun —
 * cukup menampilkan / menonaktifkan tombol sesuai field ini.
 */
function buildActions(unit, statuses) {
  const current = statuses.find((status) => status.id === unit.status.id);
  const next = statuses.find((status) => status.sequence === current.sequence + 1) ?? null;
  const isActive = current.counts_toward_capacity;
  const blockedReason = getNextStepBlockedReason(next, unit.inspection_count);

  return {
    can_edit: isActive,
    can_move: isActive,
    can_inspect: isActive,
    can_delete: current.code === UNIT_STATUS.MASUK && unit.inspection_count === 0,
    next_status: next && { id: next.id, name: next.name, color: next.color },
    can_change_status: blockedReason === null,
    change_status_blocked_reason: next ? blockedReason : null,
  };
}

/* ============================== Query ============================== */

export async function list(query) {
  const [{ rows, total }, statuses] = await Promise.all([
    unitRepository.findAll(query),
    referenceRepository.findUnitStatuses(),
  ]);

  return {
    data: rows.map((unit) => ({ ...unit, actions: buildActions(unit, statuses) })),
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
  };
}

export async function getById(id) {
  const [unit, statuses] = await Promise.all([findOrFail(id), referenceRepository.findUnitStatuses()]);
  return { ...unit, actions: buildActions(unit, statuses) };
}

export async function getHistories(id) {
  await findOrFail(id);
  return unitRepository.findHistories(id);
}

/* ============================== Perintah ============================== */

/** Unit baru masuk → status MASUK + riwayat pertama (null → MASUK). */
export async function create(payload) {
  await assertActiveMaster(partnerRepository, payload.partner_id, 'partner_id', 'Mitra');
  await assertActiveMaster(vehicleTypeRepository, payload.vehicle_type_id, 'vehicle_type_id', 'Jenis kendaraan');

  const id = await db.transaction(async (trx) => {
    const pool = await assertPoolHasSpace(payload.pool_id, trx);
    await assertPlateAvailable(payload.plate_number, null, trx);

    const masuk = await referenceRepository.findStatusByCode(UNIT_STATUS.MASUK, trx);
    const unitId = await unitRepository.create({ ...payload, status_id: masuk.id }, trx);
    await unitRepository.insertHistory(
      { unit_id: unitId, from_status_id: null, to_status_id: masuk.id, note: `Unit diterima di ${pool.name}` },
      trx,
    );
    return unitId;
  });

  return getById(id);
}

/** Edit data unit. Pool & status TIDAK bisa diubah di sini (keputusan B). */
export async function update(id, payload) {
  await db.transaction(async (trx) => {
    const { unit, status } = await lockUnitWithStatus(id, trx);
    assertUnitIsActive(status, 'diubah');

    // Master yang diganti harus aktif; master lama yang kini nonaktif tetap boleh dipertahankan.
    if (payload.partner_id !== unit.partner_id) {
      await assertActiveMaster(partnerRepository, payload.partner_id, 'partner_id', 'Mitra');
    }
    if (payload.vehicle_type_id !== unit.vehicle_type_id) {
      await assertActiveMaster(vehicleTypeRepository, payload.vehicle_type_id, 'vehicle_type_id', 'Jenis kendaraan');
    }
    if (payload.plate_number !== unit.plate_number) {
      await assertPlateAvailable(payload.plate_number, id, trx);
    }

    const earliestInspection = await unitRepository.findEarliestInspectionDate(id, trx);
    if (earliestInspection && payload.received_at > earliestInspection) {
      throw fieldError('received_at', `Tanggal masuk tidak boleh setelah inspeksi pertama (${earliestInspection})`);
    }

    await unitRepository.update(id, payload, trx);
  });

  return getById(id);
}

/** Aturan bisnis 8 + keputusan F: hanya unit MASUK yang belum diinspeksi (koreksi salah input). */
export async function remove(id) {
  const unit = await findOrFail(id);

  if (unit.status.code !== UNIT_STATUS.MASUK) {
    throw AppError.conflict(`Unit hanya dapat dihapus saat berstatus Masuk. Status unit ini: ${unit.status.name}`);
  }
  if (unit.inspection_count > 0) {
    throw AppError.conflict('Unit yang sudah memiliki hasil inspeksi tidak dapat dihapus');
  }

  await unitRepository.remove(id);
}

/**
 * Ubah status unit (aturan bisnis 3, 5, 6, 9).
 * - Hanya boleh maju 1 langkah sesuai kolom `sequence`.
 * - DIINSPEKSI hanya lewat inspeksi pertama, tidak bisa dipilih manual (keputusan I).
 * - SIAP_JUAL wajib minimal 1 inspeksi.
 * - KELUAR mengisi released_at; unit otomatis tidak dihitung kapasitas (flag status).
 */
export async function changeStatus(id, { to_status_id: toStatusId, note }) {
  await db.transaction(async (trx) => {
    const { status: current } = await lockUnitWithStatus(id, trx);

    const target = await referenceRepository.findStatusById(toStatusId, trx);
    if (!target) throw fieldError('to_status_id', 'Status tujuan tidak ditemukan');

    if (target.sequence !== current.sequence + 1) {
      const next = await referenceRepository.findStatusBySequence(current.sequence + 1, trx);
      throw AppError.conflict(
        next
          ? `Status hanya bisa maju satu langkah: dari "${current.name}" ke "${next.name}"`
          : `Unit sudah berada di status terakhir (${current.name})`,
      );
    }

    const blockedReason = getNextStepBlockedReason(target, await unitRepository.countInspections(id, trx));
    if (blockedReason) throw AppError.conflict(blockedReason);

    const changes = { status_id: target.id };
    if (target.code === UNIT_STATUS.KELUAR) changes.released_at = todayDate();

    await unitRepository.update(id, changes, trx);
    await unitRepository.insertHistory(
      { unit_id: id, from_status_id: current.id, to_status_id: target.id, note: note ?? null },
      trx,
    );
  });

  return getById(id);
}

/**
 * Pindah pool (aturan bisnis 2 + keputusan C & H).
 * Status tidak berubah; perpindahan dicatat di riwayat agar terlihat di timeline.
 */
export async function move(id, { pool_id: toPoolId, note }) {
  await db.transaction(async (trx) => {
    const { unit, status } = await lockUnitWithStatus(id, trx);
    assertUnitIsActive(status, 'dipindahkan');

    if (toPoolId === unit.pool_id) throw fieldError('pool_id', 'Unit sudah berada di pool ini');

    const fromPool = await poolRepository.findById(unit.pool_id);
    const toPool = await assertPoolHasSpace(toPoolId, trx);

    await unitRepository.update(id, { pool_id: toPoolId }, trx);
    await unitRepository.insertHistory(
      {
        unit_id: id,
        from_status_id: status.id,
        to_status_id: status.id,
        note: `Pindah pool: ${fromPool.name} → ${toPool.name}${note ? `. ${note}` : ''}`.slice(0, HISTORY_NOTE_MAX),
      },
      trx,
    );
  });

  return getById(id);
}
