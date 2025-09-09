import { Router } from 'express';
import authRoutes from './auth.routes';
import denunciaRoutes from './denuncia.routes';
import exportRoutes from './export.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/denuncias', denunciaRoutes);
router.use('/export', exportRoutes);

export default router;

