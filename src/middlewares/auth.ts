import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { env } from '../config/env';
import { sequelize, models } from '../db/sequelize';

export interface JwtPayload {
    sub: string;
    jti: string;
    exp: number;
}

export function signJwt(userId: string, jti: string, ttlSeconds: number) {
    return jwt.sign({ sub: userId, jti }, env.jwt.secret, {
        expiresIn: ttlSeconds,
    });
}

export async function authMiddleware(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ error: 'missing token' });
    const token = auth.slice(7);
    try {
        const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
        const session = await models.UsuarioSesion.findOne({
            where: {
                jti: decoded.jti,
                revocado_at: null,
                expira_at: {
                    [Op.gt]: sequelize.fn('NOW'),
                },
            },
        });
        if (!session) return res.status(401).json({ error: 'invalid session' });
        
        // Cargar usuario con sus roles para que estén disponibles en controladores
        const user = await models.Usuario.findByPk(decoded.sub, {
            include: [
                {
                    association: 'roles',
                    attributes: ['id', 'codigo', 'nombre', 'arquetipo_id'],
                    through: { attributes: [] },
                    include: [
                        {
                            association: 'arquetipo',
                            attributes: ['id', 'codigo', 'nombre'],
                        },
                    ],
                },
            ],
        });
        if (!user) return res.status(401).json({ error: 'user not found' });
        req.user = user;
        return next();
    } catch (_e) {
        return res.status(401).json({ error: 'invalid token' });
    }
}

export function requirePermission(codigo: string) {
    return async (
        req: Request & { user?: any },
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) return res.status(401).json({ error: 'unauthorized' });

        try {
            const permiso = await models.Permiso.findOne({
                where: { codigo },
                include: [
                    {
                        association: 'roles',
                        through: { attributes: [] },
                        include: [
                            {
                                association: 'usuarios',
                                where: { id: req.user.get('id') },
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            if (!permiso) return res.status(403).json({ error: 'forbidden' });

            next();
        } catch (_e) {
            return res.status(403).json({ error: 'forbidden' });
        }
    };
}

export function requireRoles(...rolesRequeridos: string[]) {
    return async (
        req: Request & { user?: any },
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) return res.status(401).json({ error: 'unauthorized' });

        try {
            const usuarioId = req.user.get('id');

            // Obtener el usuario con sus roles y arquetipos asociados
            const usuario = await models.Usuario.findByPk(usuarioId, {
                include: [
                    {
                        association: 'roles',
                        attributes: ['codigo', 'nombre', 'arquetipo_id'],
                        through: { attributes: [] },
                        include: [
                            {
                                association: 'arquetipo',
                                attributes: ['codigo', 'nombre'],
                            },
                        ],
                    },
                ],
            });

            if (!usuario) {
                return res.status(403).json({ error: 'forbidden' });
            }

            const rolesUsuario: any = usuario.get('roles');

            if (!rolesUsuario || rolesUsuario.length === 0) {
                return res.status(403).json({ error: 'forbidden' });
            }

            // Obtener códigos de arquetipos (no de roles)
            const arquetiposCodigos = rolesUsuario
                .map((rol: any) => rol.get('arquetipo')?.get('codigo'))
                .filter(Boolean);

            const tieneRol = rolesRequeridos.some((rol) =>
                arquetiposCodigos.includes(rol)
            );

            if (!tieneRol) {
                return res.status(403).json({ error: 'forbidden' });
            }

            next();
        } catch (e: any) {
            console.error('Error in requireRoles:', e);
            return res.status(403).json({ error: 'forbidden' });
        }
    };
}
