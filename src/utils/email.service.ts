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
        .button-container { text-align: center; margin: 25px 0; }
        .track-button { display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
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
            
            <div class="button-container">
                <a href="${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}&clave=${encodeURIComponent(data.clave)}" class="track-button">
                    📋 Ir al Portal de Seguimiento
                </a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Este enlace incluye sus credenciales para acceso directo.
            </p>
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

PORTAL DE SEGUIMIENTO
Ingrese al siguiente enlace para consultar el estado de su denuncia:
${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}&clave=${encodeURIComponent(data.clave)}

Este enlace incluye sus credenciales para acceso directo.

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

    async sendCommentNotification(
        to: string,
        data: {
            numero: string;
            asunto: string;
            nombreDenunciante?: string;
            comentarioContenido: string;
            autorNombre: string;
            fechaComentario: Date;
        }
    ): Promise<boolean> {
        try {
            const transporter = await this.getTransporter();

            // Truncate comment content if too long
            const maxLength = 500;
            const contenidoTruncado = data.comentarioContenido.length > maxLength
                ? data.comentarioContenido.substring(0, maxLength) + '...'
                : data.comentarioContenido;

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
        .comment-box { background-color: #edf2f7; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #48bb78; }
        .comment-author { font-weight: bold; color: #2d3748; margin-bottom: 10px; }
        .comment-date { font-size: 12px; color: #718096; margin-bottom: 10px; }
        .comment-content { color: #4a5568; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
        .button-container { text-align: center; margin: 25px 0; }
        .track-button { display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Nuevo Comentario en su Denuncia</h1>
        </div>
        
        <div class="content">
            ${
                data.nombreDenunciante
                    ? `<p>Estimado/a ${data.nombreDenunciante},</p>`
                    : '<p>Estimado/a denunciante,</p>'
            }
            
            <p>Se ha agregado un nuevo comentario a su denuncia.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Información de la denuncia</h3>
                <p><strong>Número:</strong> ${data.numero}</p>
                <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>

            <div class="comment-box">
                <div class="comment-author">De: ${data.autorNombre}</div>
                <div class="comment-date">${data.fechaComentario.toLocaleString('es-CL')}</div>
                <div class="comment-content">${contenidoTruncado}</div>
            </div>

            <div class="button-container">
                <a href="${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}" class="track-button">
                    💬 Ver Todos los Comentarios
                </a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Ingrese con su número de denuncia y clave de acceso.
            </p>
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
💬 NUEVO COMENTARIO EN SU DENUNCIA

${
    data.nombreDenunciante
        ? `Estimado/a ${data.nombreDenunciante},`
        : 'Estimado/a denunciante,'
}

Se ha agregado un nuevo comentario a su denuncia.

INFORMACIÓN DE LA DENUNCIA
Número: ${data.numero}
Asunto: ${data.asunto}

COMENTARIO
De: ${data.autorNombre}
Fecha: ${data.fechaComentario.toLocaleString('es-CL')}

${contenidoTruncado}

VER TODOS LOS COMENTARIOS
Ingrese al siguiente enlace:
${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}

Use su número de denuncia y clave de acceso para ingresar.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `💬 Nuevo Comentario - Denuncia ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending comment notification email:', error);
            return false;
        }
    }

    async sendStatusChangeNotification(
        to: string,
        data: {
            numero: string;
            asunto: string;
            nombreDenunciante?: string;
            estadoAnterior: string;
            estadoNuevo: string;
            motivo?: string;
            fechaCambio: Date;
            cambiadoPor?: string;
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
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f7fafc; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .info-box { background-color: white; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0; }
        .status-change { background-color: #dbeafe; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .status-arrow { font-size: 24px; margin: 0 15px; color: #6b7280; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        .status-old { background-color: #e5e7eb; color: #4b5563; }
        .status-new { background-color: #10b981; color: white; }
        .motivo-box { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
        .button-container { text-align: center; margin: 25px 0; }
        .track-button { display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Actualización de Estado</h1>
        </div>
        
        <div class="content">
            ${
                data.nombreDenunciante
                    ? `<p>Estimado/a ${data.nombreDenunciante},</p>`
                    : '<p>Estimado/a denunciante,</p>'
            }
            
            <p>Le informamos que el estado de su denuncia ha sido actualizado.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Información de la denuncia</h3>
                <p><strong>Número:</strong> ${data.numero}</p>
                <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>

            <div class="status-change">
                <h3 style="margin-top: 0; color: #1e40af;">Cambio de Estado</h3>
                <div style="margin: 20px 0;">
                    <span class="status-badge status-old">${data.estadoAnterior}</span>
                    <span class="status-arrow">→</span>
                    <span class="status-badge status-new">${data.estadoNuevo}</span>
                </div>
                <p style="margin-bottom: 0; color: #6b7280; font-size: 12px;">
                    ${data.fechaCambio.toLocaleString('es-CL')}
                </p>
            </div>

            ${
                data.motivo
                    ? `
            <div class="motivo-box">
                <h4 style="margin-top: 0; color: #92400e;">📝 Motivo del cambio:</h4>
                <p style="margin-bottom: 0;">${data.motivo}</p>
            </div>
            `
                    : ''
            }

            <div class="button-container">
                <a href="${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}" class="track-button">
                    📋 Ver Estado de mi Denuncia
                </a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Ingrese con su número de denuncia y clave de acceso.
            </p>
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
📋 ACTUALIZACIÓN DE ESTADO DE SU DENUNCIA

${
    data.nombreDenunciante
        ? `Estimado/a ${data.nombreDenunciante},`
        : 'Estimado/a denunciante,'
}

Le informamos que el estado de su denuncia ha sido actualizado.

INFORMACIÓN DE LA DENUNCIA
Número: ${data.numero}
Asunto: ${data.asunto}

CAMBIO DE ESTADO
${data.estadoAnterior} → ${data.estadoNuevo}
Fecha: ${data.fechaCambio.toLocaleString('es-CL')}

${data.motivo ? `MOTIVO DEL CAMBIO:\n${data.motivo}\n` : ''}

VER ESTADO DE SU DENUNCIA
Ingrese al siguiente enlace:
${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}

Use su número de denuncia y clave de acceso para ingresar.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `📋 Actualización de Estado - Denuncia ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending status change notification email:', error);
            return false;
        }
    }

    async sendAssignmentNotification(
        to: string,
        data: {
            numero: string;
            asunto: string;
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
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f7fafc; padding: 30px; border-radius: 5px; margin-top: 20px; }
        .info-box { background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
        .success-box { background-color: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
        .button-container { text-align: center; margin: 25px 0; }
        .track-button { display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Denuncia Asignada</h1>
        </div>
        
        <div class="content">
            <p>Estimado/a denunciante,</p>
            
            <div class="success-box">
                <h3 style="margin-top: 0; color: #047857;">¡Buenas noticias!</h3>
                <p style="margin-bottom: 0;">Su denuncia ha sido asignada a un miembro de nuestro equipo para su gestión.</p>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Información de la denuncia</h3>
                <p><strong>Número:</strong> ${data.numero}</p>
                <p><strong>Asunto:</strong> ${data.asunto}</p>
            </div>

            <p>Nuestro equipo revisará su caso y le hará llegar detalles sobre los avances de la denuncia a la brevedad.</p>
            
            <p>Puede consultar el estado de su denuncia en cualquier momento a través de nuestro portal de seguimiento.</p>

            <div class="button-container">
                <a href="${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}" class="track-button">
                    📋 Seguimiento de mi Denuncia
                </a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Ingrese con su número de denuncia y clave de acceso.
            </p>
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
✅ DENUNCIA ASIGNADA

Estimado/a denunciante,

¡Buenas noticias! Su denuncia ha sido asignada a un miembro de nuestro equipo para su gestión.

INFORMACIÓN DE LA DENUNCIA
Número: ${data.numero}
Asunto: ${data.asunto}

Nuestro equipo revisará su caso y le hará llegar detalles sobre los avances de la denuncia a la brevedad.

Puede consultar el estado de su denuncia en cualquier momento a través de nuestro portal de seguimiento.

SEGUIMIENTO DE SU DENUNCIA
Ingrese al siguiente enlace:
${env.frontendUrl}/track?numero=${encodeURIComponent(data.numero)}

Use su número de denuncia y clave de acceso para ingresar.

---
Este es un correo automático, por favor no responda a este mensaje.
© ${new Date().getFullYear()} Sistema de Denuncias. Todos los derechos reservados.
            `;

            await transporter.sendMail({
                from: env.email.from,
                to,
                subject: `✅ Denuncia Asignada - ${data.numero}`,
                text: textContent,
                html: htmlContent,
            });

            return true;
        } catch (error) {
            console.error('Error sending assignment notification email:', error);
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
