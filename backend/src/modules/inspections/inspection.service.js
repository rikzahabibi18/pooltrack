import { db } from '../../config/database.js';
import { MESSAGES } from '../../constants/messages.js';
import { UNIT_STATUS } from '../../constants/unitStatus.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import * as referenceRepository from '../references/reference.repository.js';
import * as unitRepository from '../units/unit.repository.js';
import { UNIT_LABEL } from '../units/unit.service.js';
import * as inspectionRepository from './inspection.repository.js';

/** Service inspeksi: aturan bisnis 4, keputusan C & D. */

export const INSPECTION_LABEL = 'Inspeksi';

const fieldError = (field, message) => AppError.badRequest(MESSAGES.VALIDATION_FAILED, [{ field, message }]);

async function findOrFail(id) {
  const inspection = await inspectionRepository.findById(id);
  if (!inspection) throw AppError.notFound(MESSAGES.notFound(INSPECTION_LABEL));
  return inspection;
}

/**
 * Kunci baris unit (FOR UPDATE) + pastikan unit masih aktif.
 * Keputusan C: unit yang sudah KELUAR adalah arsip, inspeksinya tidak bisa ditambah/diubah/dihapus.
 */
async function lockActiveUnit(unitId, trx) {
  const unit = await unitRepository.findByIdForUpdate(unitId, trx);
  if (!unit) throw AppError.notFound(MESSAGES.notFound(UNIT_LABEL));

  const status = await referenceRepository.findStatusById(unit.status_id, trx);
  if (!status.counts_toward_capacity) {
    throw AppError.conflict(`Unit berstatus "${status.name}" sudah menjadi arsip; data inspeksinya tidak dapat diubah`);
  }
  return { unit, status };
}

async function assertGradeExists(gradeId, trx) {
  const grade = await referenceRepository.findGradeById(gradeId, trx);
  if (!grade) throw fieldError('grade_id', 'Grade tidak ditemukan');
}

/** Inspeksi tidak mungkin dilakukan sebelum unit diterima di pool. */
function assertDateAfterReceived(inspectionDate, unit) {
  if (inspectionDate < unit.received_at) {
    throw fieldError('inspection_date', `Tanggal inspeksi tidak boleh sebelum unit masuk (${unit.received_at})`);
  }
}

/* ============================== Query ============================== */

export async function list(query) {
  const { rows, total } = await inspectionRepository.findAll(query);
  return { data: rows, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
}

export const getById = findOrFail;

export async function listByUnit(unitId) {
  const unit = await unitRepository.findById(unitId);
  if (!unit) throw AppError.notFound(MESSAGES.notFound(UNIT_LABEL));
  return inspectionRepository.findByUnit(unitId);
}

/* ============================== Perintah ============================== */

/**
 * Aturan bisnis 4: menyimpan inspeksi pada unit berstatus MASUK otomatis
 * mengubah status menjadi DIINSPEKSI. Insert inspeksi, update status, dan
 * catatan riwayat berada dalam SATU transaction: semuanya berhasil atau semuanya batal.
 *
 * Inspeksi ulang (unit sudah DIINSPEKSI / SIAP_JUAL) tidak mengubah status.
 */
export async function createForUnit(unitId, payload) {
  const result = await db.transaction(async (trx) => {
    const { unit, status } = await lockActiveUnit(unitId, trx);
    await assertGradeExists(payload.grade_id, trx);
    assertDateAfterReceived(payload.inspection_date, unit);

    const inspectionId = await inspectionRepository.create({ ...payload, unit_id: unitId }, trx);

    let newStatus = null;
    if (status.code === UNIT_STATUS.MASUK) {
      newStatus = await referenceRepository.findStatusByCode(UNIT_STATUS.DIINSPEKSI, trx);
      await unitRepository.update(unitId, { status_id: newStatus.id }, trx);
      await unitRepository.insertHistory(
        { unit_id: unitId, from_status_id: status.id, to_status_id: newStatus.id, note: 'Otomatis setelah inspeksi pertama' },
        trx,
      );
    }

    return { inspectionId, newStatus };
  });

  return {
    inspection: await inspectionRepository.findById(result.inspectionId),
    newStatus: result.newStatus,
  };
}

export async function update(id, payload) {
  const inspection = await findOrFail(id);

  await db.transaction(async (trx) => {
    const { unit } = await lockActiveUnit(inspection.unit.id, trx);
    await assertGradeExists(payload.grade_id, trx);
    assertDateAfterReceived(payload.inspection_date, unit);

    await inspectionRepository.update(id, payload, trx);
  });

  return inspectionRepository.findById(id);
}

/**
 * Keputusan D: inspeksi terakhir milik unit tidak boleh dihapus.
 * Unit yang punya inspeksi pasti sudah DIINSPEKSI atau lebih; tanpa inspeksi,
 * statusnya tidak lagi sah (mis. Siap Jual tanpa pernah diinspeksi).
 */
export async function remove(id) {
  const inspection = await findOrFail(id);

  await db.transaction(async (trx) => {
    await lockActiveUnit(inspection.unit.id, trx);

    const inspectionCount = await unitRepository.countInspections(inspection.unit.id, trx);
    if (inspectionCount <= 1) {
      throw AppError.conflict(
        `Ini satu-satunya inspeksi unit ${inspection.unit.plate_number} sehingga tidak dapat dihapus. Ubah datanya jika ada kesalahan input.`,
      );
    }

    await inspectionRepository.remove(id, trx);
  });
}
