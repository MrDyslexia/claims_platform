import { Router } from 'express';
import {
    crearRol,
    obtenerRol,
    listarRoles,
    actualizarRol,
    eliminarRol,
    asignarPermisosRol,
    obtenerPermisosRol,
} from '../controllers/rol.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/roles
 * @desc Crear nuevo rol
 * @access Privado - Requiere permiso CREATE_ROL
 */
router.post('/', requirePermission('CREATE_ROL'), crearRol);

/**
 * @route GET /api/roles/:id
 * @desc Obtener rol por ID
 * @access Privado
 */
router.get('/:id', obtenerRol);

/**
 * @route GET /api/roles
 * @desc Listar todos los roles
 * @access Privado
 */
router.get('/', listarRoles);

/**
 * @route PUT /api/roles/:id
 * @desc Actualizar rol
 * @access Privado - Requiere permiso UPDATE_ROL
 */
router.put('/:id', requirePermission('UPDATE_ROL'), actualizarRol);

/**
 * @route DELETE /api/roles/:id
 * @desc Eliminar rol
 * @access Privado - Requiere permiso DELETE_ROL
 */
router.delete('/:id', requirePermission('DELETE_ROL'), eliminarRol);

/**
 * @route POST /api/roles/:id/permisos
 * @desc Asignar permisos a un rol
 * @access Privado - Requiere permiso MANAGE_ROL_PERMISOS
 */
router.post(
    '/:id/permisos',
    requirePermission('MANAGE_ROL_PERMISOS'),
    asignarPermisosRol
);

/**
 * @route GET /api/roles/:id/permisos
 * @desc Obtener permisos de un rol
 * @access Privado
 */
router.get('/:id/permisos', obtenerPermisosRol);

export default router;
