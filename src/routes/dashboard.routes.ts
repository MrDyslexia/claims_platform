import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Endpoint para obtener estadísticas del dashboard
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

export default router;
