import { Router } from 'express';
import {
    crearUsuario,
    obtenerUsuario,
    listarUsuarios,
    actualizarUsuario,
    cambiarContraseña,
    eliminarUsuario,
    asignarRolUsuario,
    obtenerRolesUsuario,
    obtenerSesionesUsuario,
    obtenerListaCompletaUsuarios,
    toggleActivo,
} from '../controllers/usuario.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Crear usuario (sin autenticación - registro público)
router.post('/registro', crearUsuario);

// Aplicar autenticación a las demás rutas
router.use(authMiddleware);

/**
 * @route GET /api/usuarios/admin/lista-completa
 * @desc Obtener lista completa de usuarios con roles y permisos para admin
 * @access Privado - Requiere ser ADMIN
 */
router.get('/admin/lista-completa', obtenerListaCompletaUsuarios);

/**
 * @route GET /api/usuarios
 * @desc Listar todos los usuarios
 * @access Privado
 */
router.get('/', listarUsuarios);

/**
 * @route POST /api/usuarios
 * @desc Crear nuevo usuario (admin)
 * @access Privado - Requiere permiso CREATE_USUARIO
 */
router.post('/', requirePermission('usuarios:crear'), crearUsuario);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener usuario por ID
 * @access Privado
 */
router.get('/:id', obtenerUsuario);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar usuario
 * @access Privado - Requiere permiso UPDATE_USUARIO
 */
router.put('/:id', requirePermission('usuarios:editar'), actualizarUsuario);

/**
 * @route POST /api/usuarios/:id/cambiar-contraseña
 * @desc Cambiar contraseña
 * @access Privado
 */
router.post('/:id/cambiar-contraseña', cambiarContraseña);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar usuario
 * @access Privado - Requiere permiso DELETE_USUARIO
 */
router.delete('/:id', requirePermission('usuarios:eliminar'), eliminarUsuario);

/**
 * @route POST /api/usuarios/:id/roles
 * @desc Asignar roles a usuario
 * @access Privado - Requiere permiso MANAGE_USUARIO_ROLES
 */
router.post(
    '/:id/roles',
    requirePermission('usuarios:gestionar_roles'),
    asignarRolUsuario
);

/**
 * @route GET /api/usuarios/:id/roles
 * @desc Obtener roles de usuario
 * @access Privado
 */
router.get('/:id/roles', obtenerRolesUsuario);

/**
 * @route GET /api/usuarios/:id/sesiones
 * @desc Obtener sesiones de usuario
 * @access Privado
 */
router.get('/:id/sesiones', obtenerSesionesUsuario);

/**
 * @route PATCH /api/usuarios/:id/toggle-activo
 * @desc Alternar estado activo de usuario
 * @access Privado - Requiere permiso UPDATE_USUARIO
 */
router.patch(
    '/:id/toggle-activo',
    requirePermission('usuarios:editar'),
    toggleActivo
);

export default router;
