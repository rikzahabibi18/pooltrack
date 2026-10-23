import { MESSAGES } from '../../constants/messages.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import * as vehicleTypeRepository from './vehicleType.repository.js';

/** Service: semua aturan bisnis jenis kendaraan. */

export const VEHICLE_TYPE_LABEL = 'Jenis kendaraan';

async function findOrFail(id) {
  const vehicleType = await vehicleTypeRepository.findById(id);
  if (!vehicleType) throw AppError.notFound(MESSAGES.notFound(VEHICLE_TYPE_LABEL));
  return vehicleType;
}

async function assertCodeAvailable(code, exceptId) {
  const existing = await vehicleTypeRepository.findByCode(code);
  if (existing && existing.id !== exceptId) {
    throw AppError.conflict(MESSAGES.CODE_TAKEN, [{ field: 'code', message: MESSAGES.codeTaken(code) }]);
  }
}

export async function list(query) {
  const { rows, total } = await vehicleTypeRepository.findAll(query);
  return { data: rows, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
}

export const getById = findOrFail;

export async function create(payload) {
  await assertCodeAvailable(payload.code);
  const id = await vehicleTypeRepository.create(payload);
  return vehicleTypeRepository.findById(id);
}

export async function update(id, payload) {
  await findOrFail(id);
  await assertCodeAvailable(payload.code, id);
  await vehicleTypeRepository.update(id, payload);
  return vehicleTypeRepository.findById(id);
}

/** Aturan bisnis 7: jenis kendaraan yang masih dipakai unit tidak boleh dihapus. */
export async function remove(id) {
  const vehicleType = await findOrFail(id);
  const unitCount = await vehicleTypeRepository.countUnits(id);
  if (unitCount > 0) throw AppError.conflict(MESSAGES.inUse(VEHICLE_TYPE_LABEL, vehicleType.name, unitCount));

  await vehicleTypeRepository.remove(id);
}
