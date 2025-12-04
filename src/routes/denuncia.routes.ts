import { Router } from 'express';
import {
    asignarDenuncia,
    crearDenuncia,
    crearDenunciaPublica,
    lookupDenuncia,
    obtenerTodosLosReclamos,
    obtenerReclamosAsignados,
    revealEmail,
    autorizarContacto,
    actualizarPrioridad,
} from '../controllers/denuncia.controller';
import {
    crearComentario,
    crearComentarioDenuncia,
} from '../controllers/comentario.controller';
import { uploadMiddleware } from '../controllers/adjunto.controller';
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
router.post('/public', uploadMiddleware, crearDenunciaPublica);

// Obtener reclamos asignados al usuario actual
router.get(
    '/assigned',
    authMiddleware,
    obtenerReclamosAsignados
);

// Obtener todos los reclamos - requiere rol Admin, Analista o Supervisor
router.get(
    '/all',
    authMiddleware,
    requireRoles('ADMIN', 'ANALISTA', 'SUPERVISOR', 'AUDITOR'),
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
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    crearResolucion
);

// Asignar (requires auth + permission)
router.post(
    '/asignar',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    asignarDenuncia
);

// Actualizar prioridad (requires auth + permission)
router.post(
    '/:id/prioridad',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    actualizarPrioridad
);

// Revelar correo encriptado (requiere auth - permiso verificado dentro del controlador)
router.post('/:id/reveal-email', authMiddleware, revealEmail);

export default router;
