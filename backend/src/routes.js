import { Router } from 'express';
import { checkDatabaseConnection } from './config/database.js';
import { MESSAGES } from './constants/messages.js';
import { requireAuth } from './middlewares/requireAuth.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import inspectionRoutes from './modules/inspections/inspection.routes.js';
import partnerRoutes from './modules/partners/partner.routes.js';
import poolRoutes from './modules/pools/pool.routes.js';
import referenceRoutes from './modules/references/reference.routes.js';
import unitRoutes from './modules/units/unit.routes.js';
import vehicleTypeRoutes from './modules/vehicle-types/vehicleType.routes.js';
import { sendSuccess } from './utils/response.js';

/** Daftar semua route API (semua di bawah prefix /api). */
const router = Router();

/* ---------- Terbuka (tanpa login) ---------- */

router.get('/health', async (_req, res) => {
  let database = 'up';
  try {
    await checkDatabaseConnection();
  } catch {
    database = 'down';
  }

  sendSuccess(res, {
    message: MESSAGES.HEALTHY,
    data: { status: 'ok', database, uptime_seconds: Math.round(process.uptime()) },
  });
});

router.use('/auth', authRoutes);

/* ---------- Wajib login (requireAuth dipasang per modul) ---------- */

// Master
router.use('/partners', requireAuth, partnerRoutes);
router.use('/pools', requireAuth, poolRoutes);
router.use('/vehicle-types', requireAuth, vehicleTypeRoutes);

// Referensi (read-only)
router.use('/references', requireAuth, referenceRoutes);

// Transaksi
router.use('/units', requireAuth, unitRoutes);
router.use('/inspections', requireAuth, inspectionRoutes);

// Dashboard
router.use('/dashboard', requireAuth, dashboardRoutes);

export default router;
