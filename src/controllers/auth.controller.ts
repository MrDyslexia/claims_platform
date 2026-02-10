import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { signJwt } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { emailService } from '../utils/email.service';
import { Op } from 'sequelize';

export const register = async (req: Request, res: Response) => {
    const { rut, nombre_completo, email, password } = req.body;
    if (!rut || !nombre_completo || !email || !password)
        return res.status(400).json({ error: 'missing fields' });
    const pass_hash = await bcrypt.hash(password, 10);
    try {
        const user = await models.Usuario.create({
            rut,
            nombre_completo,
            email,
            pass_hash,
        });
        return res.status(201).json({ id: user.get('id'), email });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'missing fields' });
    // console.log(email, password);
    const user = await models.Usuario.findOne({
        where: { email },
        include: [
            {
                model: models.Rol,
                as: 'roles',
                through: { attributes: [] },
                attributes: ['id', 'codigo', 'nombre', 'arquetipo_id'],
                include: [
                    {
                        model: models.Permiso,
                        as: 'permisos',
                        through: { attributes: [] },
                        attributes: ['codigo', 'nombre'],
                    },
                    {
                        model: models.Arquetipo,
                        as: 'arquetipo',
                        attributes: ['id', 'codigo', 'nombre'],
                    },
                ],
            },
        ],
    });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    
    // Verificar si el usuario está activo
    if (user.get('activo') === 0) {
        return res.status(401).json({ error: 'User is inactive' });
    }

    const ok = await bcrypt.compare(password, String(user.get('pass_hash')));
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const jti = uuidv4();
    const ttl = env.jwt.ttlSeconds;
    const token = signJwt(String(user.get('id')), jti, ttl);
    const emitido_at = new Date();
    const expira_at = new Date(Date.now() + ttl * 1000);
    const ip =
        req.headers['x-forwarded-for']?.toString().split(',')[0] ||
        req.socket.remoteAddress ||
        '';
    const user_agent = req.headers['user-agent'] || '';
    await models.UsuarioSesion.create({
        usuario_id: user.get('id'),
        jti,
        emitido_at,
        expira_at,
        ip,
        user_agent,
    });
    await user.update({ last_login_at: new Date() });

    // Obtener roles y permisos del usuario
    const userRoles = user.get('roles') as any[];
    const permisos = new Set<string>();

    const roles = userRoles.map((rol) => {
        // Recolectar permisos únicos
        if (rol.permisos && rol.permisos.length > 0) {
            rol.permisos.forEach((permiso: any) => {
                permisos.add(permiso.codigo);
            });
        }

        return {
            id: rol.id,
            codigo: rol.codigo,
            nombre: rol.nombre,
            arquetipo_id: rol.arquetipo_id,
            arquetipo: rol.arquetipo ? {
                id: rol.arquetipo.id,
                codigo: rol.arquetipo.codigo,
                nombre: rol.arquetipo.nombre,
            } : null,
        };
    });

    return res.json({
        token,
        exp: Math.floor(expira_at.getTime() / 1000),
        user: {
            id: user.get('id'),
            email: user.get('email'),
            nombre_completo: user.get('nombre_completo'),
            roles,
            permisos: Array.from(permisos),
        },
    });
};

export const logout = async (req: Request & { user?: any }, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ error: 'missing token' });
    const token = auth.slice(7);
    try {
        const payload: any = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString('utf8')
        );
        if (payload?.jti) {
            await models.UsuarioSesion.update(
                { revocado_at: new Date() },
                { where: { jti: payload.jti } }
            );
        }
    } catch {
        // Ignore error if session doesn't exist
    }
    return res.json({ ok: true });
};

export const me = async (req: Request & { user?: any }, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const user = await models.Usuario.findByPk(userId, {
            attributes: [
                'id',
                'rut',
                'nombre_completo',
                'email',
                'activo',
                'last_login_at',
            ],
            include: [
                {
                    model: models.Rol,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['id', 'nombre', 'descripcion', 'arquetipo_id'],
                    include: [
                        {
                            model: models.Permiso,
                            as: 'permisos',
                            through: { attributes: [] },
                            attributes: ['codigo', 'nombre'],
                        },
                        {
                            model: models.Arquetipo,
                            as: 'arquetipo',
                            attributes: ['id', 'codigo', 'nombre'],
                        },
                    ],
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'rut', 'razon_social'],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        // Extraer permisos únicos de todos los roles
        const userRoles = user.get('roles') as any[];
        const permisos = new Set<string>();

        if (userRoles && userRoles.length > 0) {
            userRoles.forEach((rol) => {
                if (rol.permisos && rol.permisos.length > 0) {
                    rol.permisos.forEach((permiso: any) => {
                        permisos.add(permiso.codigo);
                    });
                }
            });
        }

        return res.json({
            id: user.get('id'),
            rut: user.get('rut'),
            nombre_completo: user.get('nombre_completo'),
            email: user.get('email'),
            activo: user.get('activo'),
            last_login_at: user.get('last_login_at'),
            roles: userRoles.map((rol) => ({
                id: rol.id,
                nombre: rol.nombre,
                descripcion: rol.descripcion,
                arquetipo_id: rol.arquetipo_id,
                arquetipo: rol.arquetipo ? {
                    id: rol.arquetipo.id,
                    codigo: rol.arquetipo.codigo,
                    nombre: rol.arquetipo.nombre,
                } : null,
            })),
            empresa: user.get('empresa'),
            permisos: Array.from(permisos),
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: 'missing email' });

    try {
        const user = await models.Usuario.findOne({ where: { email } });

        if (user && user.get('activo') === 1) {
            // Generate a 6-digit code
            const code = String(randomInt(100000, 999999));
            const codeHash = await bcrypt.hash(code, 10);
            const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            await user.update({
                reset_code_hash: codeHash,
                reset_code_expires: expires,
            });

            // Send email (fire-and-forget, don't block response)
            emailService.sendPasswordResetCode(
                String(user.get('email')),
                {
                    code,
                    nombreUsuario: String(user.get('nombre_completo')),
                }
            );
        }

        // Always respond success to prevent email enumeration
        return res.json({
            message: 'Si el email existe, se enviará un código de verificación.',
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
        return res.status(400).json({ error: 'missing fields' });

    if (newPassword.length < 6)
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

    try {
        const user = await models.Usuario.findOne({
            where: {
                email,
                reset_code_hash: { [Op.ne]: null },
                reset_code_expires: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ error: 'Código inválido o expirado.' });
        }

        const codeValid = await bcrypt.compare(code, String(user.get('reset_code_hash')));
        if (!codeValid) {
            return res.status(400).json({ error: 'Código inválido o expirado.' });
        }

        const passHash = await bcrypt.hash(newPassword, 10);
        await user.update({
            pass_hash: passHash,
            reset_code_hash: null,
            reset_code_expires: null,
        });

        return res.json({ message: 'Contraseña restablecida exitosamente.' });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};
