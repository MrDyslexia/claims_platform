import { Router } from 'express';
import { asignarDenuncia, crearComentario, crearDenuncia, crearResolucion, lookupDenuncia } from '../controllers/denuncia.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Public lookup by numero + clave
router.get('/lookup', lookupDenuncia);

// Crear denuncia autenticado (se setea created_by)
router.post('/', authMiddleware, requirePermission('DENUNCIA_CREAR'), crearDenuncia);

// Crear denuncia pública (created_by = null)
router.post('/public', crearDenuncia);

// Comment (denunciante) - public endpoint
router.post('/comentario', crearComentario);

// Resolucion (requires auth + permission)
router.post('/resolucion', authMiddleware, requirePermission('DENUNCIA_RESOLVER'), crearResolucion);

// Asignar (requires auth + permission)
router.post('/asignar', authMiddleware, requirePermission('DENUNCIA_REASIGNAR'), asignarDenuncia);

export default router;
