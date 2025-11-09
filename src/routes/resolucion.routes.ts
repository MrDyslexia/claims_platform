import { Router } from 'express';
import {
    crearResolucion,
    obtenerResolucion,
    obtenerResolucionDenuncia,
    listarResoluciones,
    actualizarResolucion,
    eliminarResolucion,
} from '../controllers/resolucion.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/resoluciones
 * @desc Crear nueva resolución
 * @access Privado
 */
router.post('/', crearResolucion);

/**
 * @route GET /api/resoluciones/:id
 * @desc Obtener resolución por ID
 * @access Privado
 */
router.get('/:id', obtenerResolucion);

/**
 * @route GET /api/resoluciones
 * @desc Listar resoluciones
 * @access Privado
 */
router.get('/', listarResoluciones);

/**
 * @route GET /api/resoluciones/denuncia/:denuncia_id
 * @desc Obtener resolución de una denuncia
 * @access Privado
 */
router.get('/denuncia/:denuncia_id', obtenerResolucionDenuncia);

/**
 * @route PUT /api/resoluciones/:id
 * @desc Actualizar resolución
 * @access Privado
 */
router.put('/:id', actualizarResolucion);

/**
 * @route DELETE /api/resoluciones/:id
 * @desc Eliminar resolución
 * @access Privado
 */
router.delete('/:id', eliminarResolucion);

export default router;
