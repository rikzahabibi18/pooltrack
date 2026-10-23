import { UNIT_STATUS } from '../../constants/unitStatus.js';
import { SEED_UNITS } from '../seed-data/units.js';

/**
 * Seed unit beserta inspeksi dan riwayat statusnya.
 *
 * Riwayat dibangun mengikuti alur sesungguhnya: setiap unit melewati semua status
 * dari sequence 1 sampai status akhirnya, sehingga data contoh selalu konsisten
 * dengan aturan bisnis (mis. SIAP_JUAL pasti sudah pernah diinspeksi).
 */

// Jam kejadian tiap langkah, supaya urutan dalam satu hari tetap masuk akal.
const STEP_TIME = {
  [UNIT_STATUS.MASUK]: '08:00:00',
  [UNIT_STATUS.DIINSPEKSI]: '10:00:00',
  [UNIT_STATUS.SIAP_JUAL]: '14:00:00',
  [UNIT_STATUS.KELUAR]: '16:00:00',
};

// Catatan MASUK dilengkapi nama pool saat insert (sama seperti yang ditulis API)
const STEP_NOTE = {
  [UNIT_STATUS.MASUK]: 'Unit diterima di',
  [UNIT_STATUS.DIINSPEKSI]: 'Otomatis setelah inspeksi pertama',
  [UNIT_STATUS.SIAP_JUAL]: 'Unit siap diserahkan ke kanal penjualan',
  [UNIT_STATUS.KELUAR]: 'Unit diserahkan dan keluar dari pool',
};

const INSPECTION_TIME = STEP_TIME[UNIT_STATUS.DIINSPEKSI];

/** Tanggal lokal "x hari lalu" dalam format YYYY-MM-DD. */
function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const dateTimeDaysAgo = (days, time) => `${dateDaysAgo(days)} ${time}`;

/** Kapan (x hari lalu) unit mencapai setiap status. */
function getStatusDays(unit) {
  return {
    [UNIT_STATUS.MASUK]: unit.received,
    [UNIT_STATUS.DIINSPEKSI]: unit.inspections?.[0]?.days,
    [UNIT_STATUS.SIAP_JUAL]: unit.ready,
    [UNIT_STATUS.KELUAR]: unit.released,
  };
}

/** Status yang dilalui unit: semua status dengan sequence <= status akhirnya. */
const getStatusPath = (statuses, target) => statuses.filter((status) => status.sequence <= target.sequence);

async function getIdsByCode(knex, table) {
  const rows = await knex(table).select('id', 'code');
  return Object.fromEntries(rows.map((row) => [row.code, row.id]));
}

/** Memastikan data contoh mematuhi aturan bisnis sebelum disimpan. */
function assertSeedIsConsistent(statuses, pools) {
  const statusByCode = Object.fromEntries(statuses.map((status) => [status.code, status]));
  const activeCountByPool = {};
  const activePlates = new Set();
  const errors = [];

  for (const unit of SEED_UNITS) {
    const target = statusByCode[unit.status];
    if (!target) {
      errors.push(`${unit.plate}: status "${unit.status}" tidak dikenal`);
      continue;
    }

    // Setiap status yang dilalui harus punya tanggal, dan tanggalnya tidak boleh mundur
    const statusDays = getStatusDays(unit);
    let previousDays = Infinity;
    for (const step of getStatusPath(statuses, target)) {
      const days = statusDays[step.code];
      if (days === undefined) errors.push(`${unit.plate}: tanggal untuk status ${step.code} belum diisi`);
      else if (days > previousDays) errors.push(`${unit.plate}: tanggal status ${step.code} lebih awal dari status sebelumnya`);
      else previousDays = days;
    }

    if (unit.released !== undefined && unit.status !== UNIT_STATUS.KELUAR) {
      errors.push(`${unit.plate}: released hanya boleh diisi untuk unit KELUAR`);
    }
    if ((unit.inspections ?? []).some((inspection) => inspection.days > unit.received)) {
      errors.push(`${unit.plate}: inspeksi tidak boleh sebelum unit diterima`);
    }

    if (target.counts_toward_capacity) {
      activeCountByPool[unit.pool] = (activeCountByPool[unit.pool] ?? 0) + 1;
      if (activePlates.has(unit.plate)) errors.push(`${unit.plate}: plat ganda di antara unit aktif`);
      activePlates.add(unit.plate);
    }
  }

  for (const pool of pools) {
    const occupied = activeCountByPool[pool.code] ?? 0;
    if (occupied > pool.capacity) errors.push(`Pool ${pool.code}: ${occupied} unit aktif melebihi kapasitas ${pool.capacity}`);
  }

  if (errors.length > 0) {
    throw new Error(`Data seed unit tidak konsisten:\n- ${errors.join('\n- ')}`);
  }
}

export async function seed(knex) {
  const statuses = await knex('unit_statuses').orderBy('sequence');
  const pools = await knex('pools').select('code', 'name', 'capacity');
  assertSeedIsConsistent(statuses, pools);
  const poolNameByCode = Object.fromEntries(pools.map((pool) => [pool.code, pool.name]));

  const statusByCode = Object.fromEntries(statuses.map((status) => [status.code, status]));
  const [partnerIds, poolIds, vehicleTypeIds, gradeIds] = await Promise.all([
    getIdsByCode(knex, 'partners'),
    getIdsByCode(knex, 'pools'),
    getIdsByCode(knex, 'vehicle_types'),
    getIdsByCode(knex, 'inspection_grades'),
  ]);

  // Satu transaction: jika satu unit gagal, tidak ada data setengah jadi.
  await knex.transaction(async (trx) => {
    for (const unit of SEED_UNITS) {
      const target = statusByCode[unit.status];
      const path = getStatusPath(statuses, target);
      const lastStep = path.at(-1);
      const statusDays = getStatusDays(unit);

      const [unitId] = await trx('units').insert({
        plate_number: unit.plate,
        brand: unit.brand,
        model: unit.model,
        year: unit.year,
        color: unit.color ?? null,
        chassis_number: unit.chassis ?? null,
        engine_number: unit.engine ?? null,
        vehicle_type_id: vehicleTypeIds[unit.type],
        partner_id: partnerIds[unit.partner],
        pool_id: poolIds[unit.pool],
        status_id: target.id,
        received_at: dateDaysAgo(unit.received),
        released_at: unit.released === undefined ? null : dateDaysAgo(unit.released),
        notes: unit.notes ?? null,
        created_at: dateTimeDaysAgo(unit.received, STEP_TIME[UNIT_STATUS.MASUK]),
        updated_at: dateTimeDaysAgo(statusDays[lastStep.code], STEP_TIME[lastStep.code]),
      });

      for (const inspection of unit.inspections ?? []) {
        const inspectedAt = dateTimeDaysAgo(inspection.days, INSPECTION_TIME);
        await trx('inspections').insert({
          unit_id: unitId,
          inspection_date: dateDaysAgo(inspection.days),
          inspector_name: inspection.inspector,
          odometer_km: inspection.km ?? null,
          exterior_notes: inspection.exterior ?? null,
          interior_notes: inspection.interior ?? null,
          engine_notes: inspection.engine ?? null,
          grade_id: gradeIds[inspection.grade],
          notes: inspection.notes ?? null,
          created_at: inspectedAt,
          updated_at: inspectedAt,
        });
      }

      await trx('unit_status_histories').insert(
        path.map((step, index) => ({
          unit_id: unitId,
          from_status_id: index === 0 ? null : path[index - 1].id,
          to_status_id: step.id,
          note: step.code === UNIT_STATUS.MASUK ? `${STEP_NOTE[step.code]} ${poolNameByCode[unit.pool]}` : STEP_NOTE[step.code],
          changed_at: dateTimeDaysAgo(statusDays[step.code], STEP_TIME[step.code]),
        })),
      );
    }
  });
}
