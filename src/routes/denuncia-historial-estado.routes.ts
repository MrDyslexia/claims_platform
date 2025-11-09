import { Router } from 'express';
import {
    crearHistorialEstado,
    obtenerHistorialEstado,
    listarHistorialEstado,
    obtenerHistorialDenuncia,
    actualizarHistorialEstado,
    eliminarHistorialEstado,
} from '../controllers/denuncia-historial-estado.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/historial-estado
 * @desc Crear registro de historial
 * @access Privado
 */
router.post('/', crearHistorialEstado);

/**
 * @route GET /api/historial-estado/:id
 * @desc Obtener historial por ID
 * @access Privado
 */
router.get('/:id', obtenerHistorialEstado);

/**
 * @route GET /api/historial-estado
 * @desc Listar historial de estados
 * @access Privado
 */
router.get('/', listarHistorialEstado);

/**
 * @route GET /api/historial-estado/denuncia/:denuncia_id
 * @desc Obtener historial completo de una denuncia
 * @access Privado
 */
router.get('/denuncia/:denuncia_id', obtenerHistorialDenuncia);

/**
 * @route PUT /api/historial-estado/:id
 * @desc Actualizar historial
 * @access Privado
 */
router.put('/:id', actualizarHistorialEstado);

/**
 * @route DELETE /api/historial-estado/:id
 * @desc Eliminar historial
 * @access Privado
 */
router.delete('/:id', eliminarHistorialEstado);

export default router;
