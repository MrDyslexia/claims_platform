import { Router } from 'express';
import {
    crearTipoDenuncia,
    obtenerTipoDenuncia,
    listarTiposDenuncia,
    actualizarTipoDenuncia,
    eliminarTipoDenuncia,
} from '../controllers/tipo-denuncia.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/tipos-denuncia
 * @desc Crear nuevo tipo de denuncia
 * @access Privado - Requiere permiso CREATE_TIPO_DENUNCIA
 */
router.post('/', requirePermission('CREATE_TIPO_DENUNCIA'), crearTipoDenuncia);

/**
 * @route GET /api/tipos-denuncia/:id
 * @desc Obtener tipo de denuncia por ID
 * @access Privado
 */
router.get('/:id', obtenerTipoDenuncia);

/**
 * @route GET /api/tipos-denuncia
 * @desc Listar todos los tipos de denuncia
 * @access Privado
 */
router.get('/', listarTiposDenuncia);

/**
 * @route PUT /api/tipos-denuncia/:id
 * @desc Actualizar tipo de denuncia
 * @access Privado - Requiere permiso UPDATE_TIPO_DENUNCIA
 */
router.put(
    '/:id',
    requirePermission('UPDATE_TIPO_DENUNCIA'),
    actualizarTipoDenuncia
);

/**
 * @route DELETE /api/tipos-denuncia/:id
 * @desc Eliminar tipo de denuncia
 * @access Privado - Requiere permiso DELETE_TIPO_DENUNCIA
 */
router.delete(
    '/:id',
    requirePermission('DELETE_TIPO_DENUNCIA'),
    eliminarTipoDenuncia
);

export default router;
