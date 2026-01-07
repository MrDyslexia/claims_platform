import { Router } from 'express';
import {
    crearRol,
    obtenerRol,
    listarRoles,
    actualizarRol,
    eliminarRol,
    asignarPermisosRol,
    obtenerPermisosRol,
    asignarCategoriasRol,
    obtenerCategoriasRol,
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
router.post('/', requirePermission('roles:crear'), crearRol);

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
router.put('/:id', requirePermission('roles:editar'), actualizarRol);

/**
 * @route DELETE /api/roles/:id
 * @desc Eliminar rol
 * @access Privado - Requiere permiso DELETE_ROL
 */
router.delete('/:id', requirePermission('roles:eliminar'), eliminarRol);

/**
 * @route POST /api/roles/:id/permisos
 * @desc Asignar permisos a un rol
 * @access Privado - Requiere permiso MANAGE_ROL_PERMISOS
 */
router.post(
    '/:id/permisos',
    requirePermission('roles:gestionar_permisos'),
    asignarPermisosRol
);

/**
 * @route GET /api/roles/:id/permisos
 * @desc Obtener permisos de un rol
 * @access Privado
 */
router.get('/:id/permisos', obtenerPermisosRol);

/**
 * @route POST /api/roles/:id/categorias
 * @desc Asignar categorías a un rol
 * @access Privado - Requiere permiso MANAGE_ROL_PERMISOS
 */
router.post(
    '/:id/categorias',
    requirePermission('roles:gestionar_permisos'),
    asignarCategoriasRol
);

/**
 * @route GET /api/roles/:id/categorias
 * @desc Obtener categorías de un rol
 * @access Privado
 */
router.get('/:id/categorias', obtenerCategoriasRol);

export default router;

