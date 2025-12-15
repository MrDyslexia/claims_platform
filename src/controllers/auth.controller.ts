import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { signJwt } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

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
                attributes: ['id', 'codigo', 'nombre'],
                include: [
                    {
                        model: models.Permiso,
                        as: 'permisos',
                        through: { attributes: [] },
                        attributes: ['codigo', 'nombre'],
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
                    attributes: ['id', 'nombre', 'descripcion'],
                    include: [
                        {
                            model: models.Permiso,
                            as: 'permisos',
                            through: { attributes: [] },
                            attributes: ['codigo', 'nombre'],
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
            })),
            empresa: user.get('empresa'),
            permisos: Array.from(permisos),
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};
