import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env';

class EmailService {
    private transporter: Transporter | null = null;

    private async getTransporter(): Promise<Transporter> {
        if (this.transporter) {
            return this.transporter;
        }

        this.transporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            secure: env.email.secure,
            auth: {
                user: env.email.user,
                pass: env.email.password,
            },
        });

        return this.transporter;
    }

    async sendDenunciaConfirmation(
        to: string,
        data: {
            numero: string;
            clave: string;
            asunto: string;
            nombreDenunciante?: string;
        }
    ): Promise<boolean> {
        try {
            const transporter = await this.getTransporter();

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a5568; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f7fafc; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .info-box { background-color: white; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0; }
        .credentials { background-color: #fff5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #2d3748; }
        .credential-value { font-size: 18px; color: #e53e3e; font-family: monospace; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
        .warning { background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Denuncia Registrada</h1>
        </div>
        
        <div class="content">
            ${
                data.nombreDenunciante
                    ? `<p>Estimado/a ${data.nombreDenunciante},</p>`
                    : '<p>Estimado/a denunciante,</p>'
            }
            
            <p>Su denuncia ha sido registrada exitosamente en nuestro sistema.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Detalles de la denuncia</h3>
                <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>

            <div class="credentials">
                <h3 style="margin-top: 0; color: #e53e3e;">Credenciales de seguimiento</h3>
                <p>Guarde esta información de forma segura. La necesitará para hacer seguimiento de su denuncia:</p>
                
                <div class="credential-item">
                    <div class="credential-label">Número de denuncia:</div>
                    <div class="credential-value">${data.numero}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">Clave de acceso:</div>
                    <div class="credential-value">${data.clave}</div>
                </div>
            </div>

            <div class="warning">
                <strong>⚠️ Importante:</strong> Esta es la única vez que recibirá su clave de acceso. 
                Guárdela en un lugar seguro. Sin ella no podrá acceder al seguimiento de su denuncia.
            </div>

            <p>Su denuncia será revisada por nuestro equipo y recibirá actualizaciones sobre su estado.</p>
            
            <p>Para consultar el estado de su denuncia, ingrese a nuestro portal de seguimiento utilizando 
            el número de denuncia y la clave de acceso proporcionados.</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            const textContent = `
Denuncia Registrada

${
    data.nombreDenunciante
        ? `Estimado/a ${data.nombreDenunciante},`
        : 'Estimado/a denunciante,'
}

Su denuncia ha sido registrada exitosamente en nuestro sistema.

DETALLES DE LA DENUNCIA
Asunto: ${data.asunto}

CREDENCIALES DE SEGUIMIENTO
Guarde esta información de forma segura:

Número de denuncia: ${data.numero}
Clave de acceso: ${data.clave}

⚠️ IMPORTANTE: Esta es la única vez que recibirá su clave de acceso. 
Guárdela en un lugar seguro. Sin ella no podrá acceder al seguimiento de su denuncia.

Su denuncia será revisada por nuestro equipo y recibirá actualizaciones sobre su estado.

Para consultar el estado de su denuncia, ingrese a nuestro portal de seguimiento 
utilizando el número de denuncia y la clave de acceso proporcionados.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `Confirmación de Denuncia - ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    async sendRecoveryCode(
        to: string,
        data: {
            numero: string;
            recoveryCode: string;
            asunto: string;
            isAnonymous: boolean;
        }
    ): Promise<boolean> {
        try {
            const transporter = await this.getTransporter();

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a5568; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f7fafc; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .code-box { background-color: #fef5e7; padding: 25px; border-radius: 5px; margin: 20px 0; border: 2px solid #f59e0b; text-align: center; }
        .recovery-code { font-size: 32px; font-weight: bold; color: #d97706; font-family: monospace; letter-spacing: 5px; margin: 20px 0; }
        .info-box { background-color: white; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0; }
        .warning { background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Revelado de Identidad</h1>
        </div>
        
        <div class="content">
            <p>Estimado/a denunciante,</p>
            
            ${
                data.isAnonymous
                    ? `
            <p>Su denuncia fue registrada como <strong>ANÓNIMA</strong>. Su dirección de correo electrónico 
            ha sido encriptada y no será visible para el personal administrativo.</p>
            `
                    : ''
            }
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Información de la denuncia</h3>
                <p><strong>Número:</strong> ${data.numero}</p>
                <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>

            <div class="code-box">
                <h3 style="margin-top: 0; color: #d97706;">Código de Revelado</h3>
                <p>Este código permite revelar su identidad si usted decide compartirla:</p>
                <div class="recovery-code">${data.recoveryCode}</div>
                <p style="color: #78350f; margin-bottom: 0;">Guarde este código en un lugar seguro</p>
            </div>

            <div class="warning">
                <strong>⚠️ MUY IMPORTANTE:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Solo comparta este código si desea revelar su identidad a un supervisor o administrador.</li>
                    <li>El personal administrativo puede solicitarle este código para contactarlo directamente.</li>
                    <li>Una vez revelada su identidad, la acción NO puede deshacerse.</li>
                    <li>Este código es de un solo uso. Una vez utilizado, se invalidará.</li>
                    <li>Mantenga este código confidencial y seguro.</li>
                </ul>
            </div>

            <h3>¿Cuándo usar este código?</h3>
            <p>Un supervisor o administrador puede pedirle este código si:</p>
            <ul>
                <li>Necesitan contactarlo para obtener más información sobre su denuncia</li>
                <li>Requieren su consentimiento para avanzar con investigaciones</li>
                <li>Deben notificarle sobre el progreso de su caso</li>
            </ul>

            <p><strong>Importante:</strong> Usted tiene el control total sobre si desea revelar su identidad o no. 
            Nadie puede forzarle a compartir este código.</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            const textContent = `
🔐 CÓDIGO DE REVELADO DE IDENTIDAD

Estimado/a denunciante,

${
    data.isAnonymous
        ? 'Su denuncia fue registrada como ANÓNIMA. Su dirección de correo ha sido encriptada.\n'
        : ''
}

INFORMACIÓN DE LA DENUNCIA
Número: ${data.numero}
Asunto: ${data.asunto}

CÓDIGO DE REVELADO
${data.recoveryCode}

⚠️ MUY IMPORTANTE:
- Solo comparta este código si desea revelar su identidad a un supervisor.
- El personal administrativo puede solicitarle este código para contactarlo.
- Una vez revelada su identidad, la acción NO puede deshacerse.
- Este código es de un solo uso.
- Mantenga este código confidencial y seguro.

¿CUÁNDO USAR ESTE CÓDIGO?
Un supervisor puede pedirle este código si:
- Necesitan contactarlo para obtener más información
- Requieren su consentimiento para investigaciones
- Deben notificarle sobre el progreso de su caso

Usted tiene el control total sobre si desea revelar su identidad o no.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `🔐 Código de Revelado - Denuncia ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending recovery code email:', error);
            return false;
        }
    }

    async sendEmailRevealedNotification(
        to: string,
        data: {
            numero: string;
            revealedBy: string;
            reason?: string;
            revealedAt: Date;
        }
    ): Promise<boolean> {
        try {
            const transporter = await this.getTransporter();

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f7fafc; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .alert-box { background-color: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .info-item { margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Notificación de Revelado de Identidad</h1>
        </div>
        
        <div class="content">
            <p>Estimado/a denunciante,</p>
            
            <div class="alert-box">
                <h3 style="margin-top: 0; color: #dc2626;">Su identidad ha sido revelada</h3>
                <p>Le informamos que su dirección de correo electrónico ha sido desencriptada y revelada 
                al personal autorizado del sistema.</p>
            </div>

            <h3>Detalles del Revelado:</h3>
            <div class="info-item">
                <strong>Denuncia:</strong> ${data.numero}
            </div>
            <div class="info-item">
                <strong>Revelado por:</strong> ${data.revealedBy}
            </div>
            <div class="info-item">
                <strong>Fecha y hora:</strong> ${data.revealedAt.toLocaleString(
                    'es-CL'
                )}
            </div>
            ${
                data.reason
                    ? `
            <div class="info-item">
                <strong>Motivo:</strong> ${data.reason}
            </div>
            `
                    : ''
            }

            <p style="margin-top: 30px;">Esta acción ha sido registrada en nuestro sistema de auditoría 
            para garantizar la transparencia y seguridad del proceso.</p>

            <p>Si tiene alguna pregunta o inquietud sobre este revelado, por favor contacte con 
            nuestro equipo de administración.</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            const textContent = `
⚠️ NOTIFICACIÓN DE REVELADO DE IDENTIDAD

Estimado/a denunciante,

Su identidad ha sido revelada. Su dirección de correo ha sido desencriptada y 
revelada al personal autorizado.

DETALLES DEL REVELADO:
Denuncia: ${data.numero}
Revelado por: ${data.revealedBy}
Fecha y hora: ${data.revealedAt.toLocaleString('es-CL')}
${data.reason ? `Motivo: ${data.reason}` : ''}

Esta acción ha sido registrada en nuestro sistema de auditoría.

Si tiene alguna pregunta, contacte con nuestro equipo de administración.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `⚠️ Identidad Revelada - Denuncia ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending reveal notification email:', error);
            return false;
        }
    }

    async queueEmail(emailData: {
        to: string;
        subject: string;
        templateCode: string;
        payload: any;
    }) {
        // Este método puede ser usado para agregar emails a la cola
        // en lugar de enviarlos directamente
        const { models } = await import('../db/sequelize');

        await models.EmailQueue.create({
            to_email: emailData.to,
            subject: emailData.subject,
            template_code: emailData.templateCode,
            payload_json: JSON.stringify(emailData.payload),
        });
    }
}

export const emailService = new EmailService();
