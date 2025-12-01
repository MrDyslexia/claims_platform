import { Router } from 'express';
import {
    asignarDenuncia,
    crearDenuncia,
    crearDenunciaPublica,
    lookupDenuncia,
    obtenerTodosLosReclamos,
    revealEmail,
    autorizarContacto,
} from '../controllers/denuncia.controller';
import {
    crearComentario,
    crearComentarioDenuncia,
} from '../controllers/comentario.controller';
import { crearResolucion } from '../controllers/resolucion.controller';
import {
    authMiddleware,
    requirePermission,
    requireRoles,
} from '../middlewares/auth';

const router = Router();

// Public lookup by numero + clave
router.post('/lookup', lookupDenuncia);

// Autorizar contacto público (denunciante revela su correo con recovery code)
router.post('/:numero/autorizar-contacto', autorizarContacto);

// Crear denuncia autenticado (se setea created_by)
router.post(
    '/',
    authMiddleware,
    requirePermission('DENUNCIA_CREAR'),
    crearDenuncia
);

// Crear denuncia pública (created_by = null)
router.post('/public', crearDenunciaPublica);

// Obtener todos los reclamos - requiere rol Admin o Analista
router.get(
    '/all',
    authMiddleware,
    requireRoles('ADMIN', 'ANALISTA'),
    obtenerTodosLosReclamos
);

// Crear comentario en una denuncia específica - requiere autenticación
router.post('/:id/comentarios', authMiddleware, crearComentarioDenuncia);

// Comment (denunciante) - public endpoint
router.post('/comentario', crearComentario);

// Resolucion (requires auth + permission)
router.post(
    '/resolucion',
    authMiddleware,
    requirePermission('DENUNCIA_RESOLVER'),
    crearResolucion
);

// Asignar (requires auth + permission)
router.post(
    '/asignar',
    authMiddleware,
    requirePermission('DENUNCIA_REASIGNAR'),
    asignarDenuncia
);

// Revelar correo encriptado (requiere auth - permiso verificado dentro del controlador)
router.post('/:id/reveal-email', authMiddleware, revealEmail);

export default router;
