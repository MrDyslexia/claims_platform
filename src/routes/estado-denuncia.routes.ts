import { Router } from 'express';
import {
    crearEstadoDenuncia,
    obtenerEstadoDenuncia,
    listarEstadosDenuncia,
    actualizarEstadoDenuncia,
    eliminarEstadoDenuncia,
} from '../controllers/estado-denuncia.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/estados-denuncia
 * @desc Crear nuevo estado de denuncia
 * @access Privado - Requiere permiso CREATE_ESTADO_DENUNCIA
 */
router.post(
    '/',
    requirePermission('estados:crear'),
    crearEstadoDenuncia
);

/**
 * @route GET /api/estados-denuncia/:id
 * @desc Obtener estado de denuncia por ID
 * @access Privado
 */
router.get('/:id', obtenerEstadoDenuncia);

/**
 * @route GET /api/estados-denuncia
 * @desc Listar todos los estados de denuncia
 * @access Privado
 */
router.get('/', listarEstadosDenuncia);

/**
 * @route PUT /api/estados-denuncia/:id
 * @desc Actualizar estado de denuncia
 * @access Privado - Requiere permiso UPDATE_ESTADO_DENUNCIA
 */
router.put(
    '/:id',
    requirePermission('estados:editar'),
    actualizarEstadoDenuncia
);

/**
 * @route DELETE /api/estados-denuncia/:id
 * @desc Eliminar estado de denuncia
 * @access Privado - Requiere permiso DELETE_ESTADO_DENUNCIA
 */
router.delete(
    '/:id',
    requirePermission('estados:eliminar'),
    eliminarEstadoDenuncia
);

export default router;
