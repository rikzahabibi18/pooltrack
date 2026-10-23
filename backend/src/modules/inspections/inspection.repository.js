import { db } from '../../config/database.js';
import { getOffset, orWherePlateLike, toLikePattern } from '../../utils/pagination.js';

/** Repository: HANYA query Knex untuk tabel inspections, tanpa aturan bisnis. */

const COLUMNS = [
  'inspections.id',
  'inspections.inspection_date',
  'inspections.inspector_name',
  'inspections.odometer_km',
  'inspections.exterior_notes',
  'inspections.interior_notes',
  'inspections.engine_notes',
  'inspections.notes',
  'inspections.created_at',
  'inspections.updated_at',
  'units.id as unit_id',
  'units.plate_number as unit_plate_number',
  'units.brand as unit_brand',
  'units.model as unit_model',
  'pools.id as pool_id',
  'pools.name as pool_name',
  'inspection_grades.id as grade_id',
  'inspection_grades.code as grade_code',
  'inspection_grades.name as grade_name',
];

const SORT_COLUMNS = {
  inspection_date: 'inspections.inspection_date',
  created_at: 'inspections.created_at',
  plate_number: 'units.plate_number',
  grade: 'inspection_grades.code',
};

const FILTER_COLUMNS = {
  grade_id: 'inspections.grade_id',
  pool_id: 'units.pool_id',
  unit_id: 'inspections.unit_id',
};

const inspectionsWithRelations = () =>
  db('inspections')
    .join('units', 'units.id', 'inspections.unit_id')
    .join('pools', 'pools.id', 'units.pool_id')
    .join('inspection_grades', 'inspection_grades.id', 'inspections.grade_id');

function toInspection(row) {
  const { unit_id, unit_plate_number, unit_brand, unit_model, pool_id, pool_name, grade_id, grade_code, grade_name, ...inspection } =
    row;

  return {
    ...inspection,
    unit: {
      id: unit_id,
      plate_number: unit_plate_number,
      brand: unit_brand,
      model: unit_model,
      pool: { id: pool_id, name: pool_name },
    },
    grade: { id: grade_id, code: grade_code, name: grade_name },
  };
}

export async function findAll({ page, limit, search, sort, order, ...filters }) {
  const query = inspectionsWithRelations();

  if (search) {
    query.where((builder) => {
      orWherePlateLike(builder, 'units.plate_number', search).orWhere(
        'inspections.inspector_name',
        'like',
        toLikePattern(search),
      );
    });
  }

  for (const [name, column] of Object.entries(FILTER_COLUMNS)) {
    if (filters[name] !== undefined) query.where(column, filters[name]);
  }

  const [rows, countResult] = await Promise.all([
    query
      .clone()
      .select(COLUMNS)
      .orderBy([{ column: SORT_COLUMNS[sort], order }, { column: 'inspections.id', order }])
      .limit(limit)
      .offset(getOffset({ page, limit })),
    query.clone().count({ total: '*' }).first(),
  ]);

  return { rows: rows.map(toInspection), total: Number(countResult.total) };
}

export async function findById(id) {
  const row = await inspectionsWithRelations().select(COLUMNS).where('inspections.id', id).first();
  return row ? toInspection(row) : null;
}

/** Semua inspeksi satu unit, terbaru dulu (untuk halaman detail unit). */
export async function findByUnit(unitId) {
  const rows = await inspectionsWithRelations()
    .select(COLUMNS)
    .where('inspections.unit_id', unitId)
    .orderBy([{ column: 'inspections.inspection_date', order: 'desc' }, { column: 'inspections.id', order: 'desc' }]);
  return rows.map(toInspection);
}

export async function create(data, trx) {
  const [id] = await trx('inspections').insert(data);
  return id;
}

export const update = (id, data, trx = db) => trx('inspections').where({ id }).update(data);

export const remove = (id, trx = db) => trx('inspections').where({ id }).del();
