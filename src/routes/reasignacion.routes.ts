import { Router } from 'express';
import {
    crearReasignacion,
    obtenerReasignacion,
    listarReasignaciones,
    obtenerReasignacionesDenuncia,
    eliminarReasignacion,
} from '../controllers/reasignacion.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/reasignaciones
 * @desc Crear reasignación
 * @access Privado
 */
router.post('/', crearReasignacion);

/**
 * @route GET /api/reasignaciones/:id
 * @desc Obtener reasignación por ID
 * @access Privado
 */
router.get('/:id', obtenerReasignacion);

/**
 * @route GET /api/reasignaciones
 * @desc Listar reasignaciones
 * @access Privado
 */
router.get('/', listarReasignaciones);

/**
 * @route GET /api/reasignaciones/denuncia/:denuncia_id
 * @desc Obtener reasignaciones de una denuncia
 * @access Privado
 */
router.get('/denuncia/:denuncia_id', obtenerReasignacionesDenuncia);

/**
 * @route DELETE /api/reasignaciones/:id
 * @desc Eliminar reasignación
 * @access Privado
 */
router.delete('/:id', eliminarReasignacion);

export default router;
