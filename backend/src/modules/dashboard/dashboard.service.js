import { DASHBOARD } from '../../constants/dashboard.js';
import * as dashboardRepository from './dashboard.repository.js';

/** Ringkasan dashboard: empat query dijalankan paralel supaya cepat. */
export async function getSummary() {
  const [statusCounts, poolOccupancy, unitsByPartner, recentInspections] = await Promise.all([
    dashboardRepository.countUnitsPerStatus(),
    dashboardRepository.getPoolOccupancy(),
    dashboardRepository.countActiveUnitsPerPartner(),
    dashboardRepository.findRecentInspections(DASHBOARD.RECENT_INSPECTIONS_LIMIT),
  ]);

  const sumTotals = (rows) => rows.reduce((sum, row) => sum + row.total, 0);

  return {
    status_counts: statusCounts,
    total_units: sumTotals(statusCounts),
    total_active_units: sumTotals(statusCounts.filter((status) => status.counts_toward_capacity)),
    pool_occupancy: poolOccupancy,
    units_by_partner: unitsByPartner,
    recent_inspections: recentInspections,
  };
}
