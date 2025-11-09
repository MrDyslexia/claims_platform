import { Router } from 'express';
import {
    crearComentario,
    obtenerComentario,
    listarComentarios,
    actualizarComentario,
    eliminarComentario,
} from '../controllers/comentario.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/comentarios
 * @desc Crear nuevo comentario
 * @access Privado
 */
router.post('/', crearComentario);

/**
 * @route GET /api/comentarios/:id
 * @desc Obtener comentario por ID
 * @access Privado
 */
router.get('/:id', obtenerComentario);

/**
 * @route GET /api/comentarios
 * @desc Listar comentarios
 * @access Privado
 */
router.get('/', listarComentarios);

/**
 * @route PUT /api/comentarios/:id
 * @desc Actualizar comentario
 * @access Privado
 */
router.put('/:id', actualizarComentario);

/**
 * @route DELETE /api/comentarios/:id
 * @desc Eliminar comentario
 * @access Privado
 */
router.delete('/:id', eliminarComentario);

export default router;
