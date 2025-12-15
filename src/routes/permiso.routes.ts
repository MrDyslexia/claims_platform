import { Router } from 'express';
import {
    crearPermiso,
    obtenerPermiso,
    listarPermisos,
    actualizarPermiso,
    eliminarPermiso,
    obtenerPermisosUsuario,
} from '../controllers/permiso.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/permisos
 * @desc Crear nuevo permiso
 * @access Privado - Requiere permiso CREATE_PERMISO
 */
router.post('/', requirePermission('permisos:crear'), crearPermiso);

/**
 * @route GET /api/permisos/:id
 * @desc Obtener permiso por ID
 * @access Privado
 */
router.get('/:id', obtenerPermiso);

/**
 * @route GET /api/permisos
 * @desc Listar todos los permisos
 * @access Privado
 */
router.get('/', listarPermisos);

/**
 * @route PUT /api/permisos/:id
 * @desc Actualizar permiso
 * @access Privado - Requiere permiso UPDATE_PERMISO
 */
router.put('/:id', requirePermission('permisos:editar'), actualizarPermiso);

/**
 * @route DELETE /api/permisos/:id
 * @desc Eliminar permiso
 * @access Privado - Requiere permiso DELETE_PERMISO
 */
router.delete('/:id', requirePermission('permisos:eliminar'), eliminarPermiso);

/**
 * @route GET /api/permisos/usuario/:usuario_id
 * @desc Obtener permisos de un usuario
 * @access Privado
 */
router.get('/usuario/:usuario_id', obtenerPermisosUsuario);

export default router;
