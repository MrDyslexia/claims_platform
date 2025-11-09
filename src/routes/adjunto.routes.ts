import { Router } from 'express';
import {
    crearAdjunto,
    obtenerAdjunto,
    listarAdjuntos,
    actualizarAdjunto,
    eliminarAdjunto,
} from '../controllers/adjunto.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/adjuntos
 * @desc Crear nuevo adjunto
 * @access Privado - Requiere permiso CREATE_ADJUNTO
 */
router.post('/', requirePermission('CREATE_ADJUNTO'), crearAdjunto);

/**
 * @route GET /api/adjuntos/:id
 * @desc Obtener adjunto por ID
 * @access Privado
 */
router.get('/:id', obtenerAdjunto);

/**
 * @route GET /api/adjuntos
 * @desc Listar adjuntos
 * @access Privado
 */
router.get('/', listarAdjuntos);

/**
 * @route PUT /api/adjuntos/:id
 * @desc Actualizar adjunto
 * @access Privado - Requiere permiso UPDATE_ADJUNTO
 */
router.put('/:id', requirePermission('UPDATE_ADJUNTO'), actualizarAdjunto);

/**
 * @route DELETE /api/adjuntos/:id
 * @desc Eliminar adjunto
 * @access Privado - Requiere permiso DELETE_ADJUNTO
 */
router.delete('/:id', requirePermission('DELETE_ADJUNTO'), eliminarAdjunto);

export default router;
