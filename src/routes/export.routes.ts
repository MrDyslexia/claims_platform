import { Router } from 'express';
import { registrarExport } from '../controllers/export.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, requirePermission('auditoria:exportar'), registrarExport);

export default router;

