import { Router } from 'express';
import {
    enviarCorreoPrueba,
    verificarConfiguracion,
} from '../controllers/email-test.controller';

const router = Router();

/**
 * @route GET /api/email-test/config
 * @desc Verificar configuración SMTP
 * @access Public (en desarrollo - proteger en producción)
 */
router.get('/config', verificarConfiguracion);

/**
 * @route POST /api/email-test/send
 * @desc Enviar correo de prueba
 * @access Public (en desarrollo - proteger en producción)
 */
router.post('/send', enviarCorreoPrueba);

export default router;
