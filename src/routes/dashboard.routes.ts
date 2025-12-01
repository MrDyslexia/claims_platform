import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Endpoint para obtener estadísticas del dashboard
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

// Endpoint para generar reportes con métricas detalladas
// Query param: period (weekly|monthly|quarterly|yearly)
router.post('/reports', authMiddleware, dashboardController.generateReports);

// Endpoint para dashboard de analista (filtrado por empresa del usuario)
router.get('/analista', authMiddleware, dashboardController.getDashboardAnalista);

// Endpoint para dashboard de supervisor
router.get('/supervisor', authMiddleware, dashboardController.getDashboardSupervisor);

// Endpoint para obtener todas las denuncias del supervisor
router.get('/supervisor/claims', authMiddleware, dashboardController.getAllSupervisorClaims);

// Endpoint para obtener denuncias pendientes del supervisor
router.get('/supervisor/pending', authMiddleware, dashboardController.getPendingSupervisorClaims);

// Endpoint para obtener denuncias resueltas del supervisor
router.get('/supervisor/resolved', authMiddleware, dashboardController.getResolvedSupervisorClaims);

export default router;
