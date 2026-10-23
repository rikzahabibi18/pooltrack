import { db } from '../../config/database.js';

/** Data referensi (diisi seeder, read-only). */

const STATUS_COLUMNS = ['id', 'code', 'name', 'sequence', 'counts_toward_capacity', 'color'];

export const findUnitStatuses = () => db('unit_statuses').select(STATUS_COLUMNS).orderBy('sequence');

export const findInspectionGrades = () =>
  db('inspection_grades').select('id', 'code', 'name', 'description').orderBy('code');

/* ---------- Dipakai service unit & inspeksi (bisa di dalam transaction) ---------- */

export const findStatusById = (id, trx = db) => trx('unit_statuses').select(STATUS_COLUMNS).where({ id }).first();

export const findStatusByCode = (code, trx = db) => trx('unit_statuses').select(STATUS_COLUMNS).where({ code }).first();

export const findStatusBySequence = (sequence, trx = db) =>
  trx('unit_statuses').select(STATUS_COLUMNS).where({ sequence }).first();

export const findGradeById = (id, trx = db) => trx('inspection_grades').select('id', 'code', 'name').where({ id }).first();
