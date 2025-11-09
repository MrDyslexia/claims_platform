import { Router } from 'express';
import {
    listarAsignaciones,
    obtenerAsignacion,
    actualizarAsignacion,
    eliminarAsignacion,
    obtenerAsignacionesUsuario,
} from '../controllers/denuncia-asignacion.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route GET /api/asignaciones
 * @desc Listar asignaciones
 * @access Privado
 */
router.get('/', listarAsignaciones);

/**
 * @route GET /api/asignaciones/:denuncia_id/:usuario_id
 * @desc Obtener asignación específica
 * @access Privado
 */
router.get('/:denuncia_id/:usuario_id', obtenerAsignacion);

/**
 * @route PUT /api/asignaciones/:denuncia_id/:usuario_id
 * @desc Actualizar asignación
 * @access Privado
 */
router.put('/:denuncia_id/:usuario_id', actualizarAsignacion);

/**
 * @route DELETE /api/asignaciones/:denuncia_id/:usuario_id
 * @desc Eliminar asignación
 * @access Privado
 */
router.delete('/:denuncia_id/:usuario_id', eliminarAsignacion);

/**
 * @route GET /api/asignaciones/usuario/:usuario_id
 * @desc Obtener asignaciones de un usuario
 * @access Privado
 */
router.get('/usuario/:usuario_id', obtenerAsignacionesUsuario);

export default router;
