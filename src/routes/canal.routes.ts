import express from 'express';
import {
    listarCanales,
    obtenerCanal,
    crearCanal,
    actualizarCanal,
    desactivarCanal,
} from '../controllers/canal.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = express.Router();

/**
 * Rutas públicas
 */

// GET /api/canales - Listar canales activos (público para formulario)
router.get('/', listarCanales);

// GET /api/canales/:id - Obtener canal específico (público)
router.get('/:id', obtenerCanal);

/**
 * Rutas protegidas - requieren autenticación y permisos
 */

// POST /api/canales - Crear nuevo canal (requiere GESTIONAR_CANALES)
router.post(
    '/',
    authMiddleware,
    requirePermission('canales:gestionar'),
    crearCanal
);

// PUT /api/canales/:id - Actualizar canal (requiere GESTIONAR_CANALES)
router.put(
    '/:id',
    authMiddleware,
    requirePermission('canales:gestionar'),
    actualizarCanal
);

// DELETE /api/canales/:id - Desactivar canal (requiere GESTIONAR_CANALES)
router.delete(
    '/:id',
    authMiddleware,
    requirePermission('canales:gestionar'),
    desactivarCanal
);

export default router;
