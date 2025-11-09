import { Router } from 'express';
import {
    obtenerAdjunto,
    listarAdjuntos,
    crearAdjunto,
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
 * @access Privado
 */
router.post('/', crearAdjunto);

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
 * @access Privado
 */
router.put('/:id', actualizarAdjunto);

/**
 * @route DELETE /api/adjuntos/:id
 * @desc Eliminar adjunto
 * @access Privado
 */
router.delete('/:id', eliminarAdjunto);

export default router;
