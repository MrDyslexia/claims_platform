import { Router } from 'express';
import {
    listarEmailQueue,
    obtenerEmailQueue,
    crearEmailQueue,
    actualizarEmailQueue,
    marcarComoEnviado,
    marcarComoError,
    obtenerEmailsPendientes,
    eliminarEmailQueue,
} from '../controllers/email-queue.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/email-queue
 * @desc Crear email en cola
 * @access Privado
 */
router.post('/', crearEmailQueue);

/**
 * @route GET /api/email-queue/:id
 * @desc Obtener email en cola por ID
 * @access Privado
 */
router.get('/:id', obtenerEmailQueue);

/**
 * @route GET /api/email-queue
 * @desc Listar emails en cola
 * @access Privado
 */
router.get('/', listarEmailQueue);

/**
 * @route PUT /api/email-queue/:id
 * @desc Actualizar email en cola
 * @access Privado
 */
router.put('/:id', actualizarEmailQueue);

/**
 * @route POST /api/email-queue/:id/enviar
 * @desc Marcar email como enviado
 * @access Privado
 */
router.post('/:id/enviar', marcarComoEnviado);

/**
 * @route POST /api/email-queue/:id/error
 * @desc Marcar email como error
 * @access Privado
 */
router.post('/:id/error', marcarComoError);

/**
 * @route GET /api/email-queue/pendientes/listar
 * @desc Obtener emails pendientes de enviar
 * @access Privado
 */
router.get('/pendientes/listar', obtenerEmailsPendientes);

/**
 * @route DELETE /api/email-queue/:id
 * @desc Eliminar email en cola
 * @access Privado
 */
router.delete('/:id', eliminarEmailQueue);

export default router;
