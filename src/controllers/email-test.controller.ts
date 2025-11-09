import type { Request, Response } from 'express';
import { emailService } from '../utils/email.service';

/**
 * Enviar correo de prueba
 * POST /api/email-test/send
 * Body: { "to": "destinatario@example.com", "nombre": "Juan Pérez" }
 */
export const enviarCorreoPrueba = async (req: Request, res: Response) => {
    try {
        const { to, nombre } = req.body;

        if (!to) {
            return res
                .status(400)
                .json({ error: 'El campo "to" es requerido' });
        }

        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        const resultado = await emailService.sendDenunciaConfirmation(to, {
            numero: '2025-000001',
            clave: 'ABC123XY',
            asunto: 'Prueba de envío de correo desde el sistema',
            nombreDenunciante: nombre || 'Usuario de Prueba',
        });

        if (resultado) {
            return res.json({
                success: true,
                message: `Correo de prueba enviado exitosamente a ${to}`,
                timestamp: new Date().toISOString(),
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Error al enviar el correo. Revisa la configuración SMTP.',
            });
        }
    } catch (error: any) {
        console.error('Error en enviarCorreoPrueba:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error desconocido',
            details: error.stack,
        });
    }
};

/**
 * Verificar configuración SMTP
 * GET /api/email-test/config
 */
export const verificarConfiguracion = async (req: Request, res: Response) => {
    try {
        const { env } = await import('../config/env');

        const config = {
            host: env.email.host,
            port: env.email.port,
            secure: env.email.secure,
            user: env.email.user,
            from: env.email.from,
            passwordConfigured: !!env.email.password,
        };

        return res.json({
            configured: !!env.email.user && !!env.email.password,
            config,
            warning:
                !env.email.user || !env.email.password
                    ? 'Faltan credenciales SMTP en las variables de entorno'
                    : null,
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message,
        });
    }
};
