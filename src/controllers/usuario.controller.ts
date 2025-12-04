import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

/**
 * Crear nuevo usuario
 * POST /api/usuarios
 */
export const crearUsuario = async (req: Request, res: Response) => {
    try {
        const { rut, nombre_completo, email, password, telefono, activo } =
            req.body;

        if (!rut || !nombre_completo || !email || !password) {
            return res.status(400).json({
                error: 'missing fields: rut, nombre_completo, email, password',
            });
        }

        const pass_hash = await bcrypt.hash(password, 10);

        const usuario = await models.Usuario.create({
            rut,
            nombre_completo,
            email,
            pass_hash,
            telefono: telefono || null,
            activo: activo ?? 1,
            must_change_password: 0,
        });

        return res.status(201).json({
            id: usuario.get('id'),
            rut: usuario.get('rut'),
            email: usuario.get('email'),
            nombre_completo: usuario.get('nombre_completo'),
            telefono: usuario.get('telefono'),
            activo: usuario.get('activo'),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener usuario por ID
 * GET /api/usuarios/:id
 */
export const obtenerUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuario = await models.Usuario.findByPk(id, {
            attributes: { exclude: ['pass_hash'] },
            include: [{ association: 'roles' }],
        });

        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        return res.json(usuario.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los usuarios con paginación
 * GET /api/usuarios?page=1&limit=10&activo=1&email=test
 */
export const listarUsuarios = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const activo = req.query.activo
            ? parseInt(req.query.activo as string)
            : undefined;
        const email = req.query.email as string;
        const nombre_completo = req.query.nombre_completo as string;

        const where: any = {};
        if (activo !== undefined) where.activo = activo;
        if (email) where.email = { [Op.like]: `%${email}%` };
        if (nombre_completo)
            where.nombre_completo = { [Op.like]: `%${nombre_completo}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Usuario.findAndCountAll({
            where,
            offset,
            limit,
            attributes: { exclude: ['pass_hash'] },
            order: [['id', 'DESC']],
        });

        return res.json({
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit),
            data: rows.map((r) => r.toJSON()),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Actualizar usuario
 * PUT /api/usuarios/:id
 */
export const actualizarUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            nombre_completo,
            email,
            telefono,
            activo,
            must_change_password,
        } = req.body;

        const usuario = await models.Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        await usuario.update({
            nombre_completo: nombre_completo ?? usuario.get('nombre_completo'),
            email: email ?? usuario.get('email'),
            telefono:
                telefono !== undefined ? telefono : usuario.get('telefono'),
            activo: activo !== undefined ? activo : usuario.get('activo'),
            must_change_password:
                must_change_password !== undefined
                    ? must_change_password
                    : usuario.get('must_change_password'),
            updated_at: new Date(),
        });

        return res.json({
            id: usuario.get('id'),
            rut: usuario.get('rut'),
            email: usuario.get('email'),
            nombre_completo: usuario.get('nombre_completo'),
            telefono: usuario.get('telefono'),
            activo: usuario.get('activo'),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Cambiar contraseña de usuario
 * POST /api/usuarios/:id/cambiar-contraseña
 */
export const cambiarContraseña = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { password_actual, password_nuevo } = req.body;

        if (!password_actual || !password_nuevo) {
            return res.status(400).json({
                error: 'missing fields: password_actual, password_nuevo',
            });
        }

        const usuario = await models.Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        const ok = await bcrypt.compare(
            password_actual,
            String(usuario.get('pass_hash'))
        );
        if (!ok) {
            return res
                .status(401)
                .json({ error: 'current password is incorrect' });
        }

        const pass_hash = await bcrypt.hash(password_nuevo, 10);
        await usuario.update({
            pass_hash,
            must_change_password: 0,
            updated_at: new Date(),
        });

        return res.json({ ok: true, message: 'password changed successfully' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar usuario (soft delete - cambiar estado a 0)
 * DELETE /api/usuarios/:id
 */
export const eliminarUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const usuario = await models.Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        await usuario.update({ activo: 0, updated_at: new Date() });

        return res.json({ ok: true, message: 'usuario deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Asignar rol a usuario
 * POST /api/usuarios/:id/roles
 */
export const asignarRolUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rol_ids } = req.body;

        if (!Array.isArray(rol_ids)) {
            return res.status(400).json({ error: 'rol_ids must be an array' });
        }

        const usuario = await models.Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        await (usuario as any).setRoles(rol_ids);

        return res.json({ ok: true, message: 'roles assigned' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener roles de un usuario
 * GET /api/usuarios/:id/roles
 */
export const obtenerRolesUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const usuario = await models.Usuario.findByPk(id, {
            include: [
                {
                    association: 'Rol',
                    through: { attributes: [] },
                },
            ],
        });

        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        return res.json(usuario.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener sesiones de un usuario
 * GET /api/usuarios/:id/sesiones
 */
export const obtenerSesionesUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const sesiones = await models.UsuarioSesion.findAll({
            where: { usuario_id: id },
            order: [['emitido_at', 'DESC']],
        });

        return res.json(sesiones.map((s) => s.toJSON()));
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener todos los usuarios con información completa para el frontend
 * GET /api/usuarios/admin/lista-completa?page=1&limit=10
 */
export const obtenerListaCompletaUsuarios = async (
    req: Request,
    res: Response
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Obtener usuarios con roles y permisos
        const { count, rows } = await models.Usuario.findAndCountAll({
            offset,
            limit,
            attributes: {
                exclude: ['pass_hash', 'must_change_password'],
            },
            include: [
                {
                    model: models.Rol,
                    as: 'roles',
                    through: { attributes: [] },
                    include: [
                        {
                            model: models.Permiso,
                            as: 'permisos',
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        // Obtener todos los roles disponibles con sus permisos
        const todosLosRoles = await models.Rol.findAll({
            include: [
                {
                    model: models.Permiso,
                    as: 'permisos',
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        // Obtener todos los permisos disponibles
        const todosLosPermisos = await models.Permiso.findAll({
            order: [['id', 'ASC']],
        });

        // Formatear usuarios con información completa
        const usuariosFormateados = rows.map((usuario: any) => {
            const usuarioJSON = usuario.toJSON() as any;

            return {
                id_usuario: usuarioJSON.id,
                nombre: usuarioJSON.nombre_completo?.split(' ')[0] || '',
                apellido:
                    usuarioJSON.nombre_completo
                        ?.split(' ')
                        .slice(1)
                        .join(' ') || '',
                email: usuarioJSON.email,
                telefono: usuarioJSON.telefono || null,
                activo: usuarioJSON.activo === 1,
                fecha_creacion: usuarioJSON.created_at,
                fecha_actualizacion: usuarioJSON.updated_at,
                roles:
                    usuarioJSON.roles?.map((rol: any) => ({
                        id_rol: rol.id,
                        nombre: rol.nombre,
                        descripcion: rol.descripcion,
                        fecha_creacion: rol.createdAt,
                    })) || [],
                permisos:
                    usuarioJSON.roles?.flatMap(
                        (rol: any) =>
                            rol.permisos?.map((permiso: any) => ({
                                id_permiso: permiso.id,
                                codigo: permiso.codigo,
                                nombre: permiso.nombre,
                                descripcion: permiso.descripcion || '',
                            })) || []
                    ) || [],
                estadisticas: {
                    denuncias_creadas: 0,
                    denuncias_resueltas: 0,
                    comentarios_realizados: 0,
                    ultimo_acceso: null,
                },
            };
        });

        // Formatear roles disponibles
        const rolesFormateados = todosLosRoles.map((rol: any) => {
            const rolJSON = rol.toJSON() as any;

            return {
                id_rol: rolJSON.id,
                nombre: rolJSON.nombre,
                descripcion: rolJSON.descripcion,
                activo: rolJSON.activo === 1,
                fecha_creacion: rolJSON.createdAt,
                permisos:
                    rolJSON.permisos?.map((permiso: any) => ({
                        id_permiso: permiso.id,
                        codigo: permiso.codigo,
                        nombre: permiso.nombre,
                    })) || [],
            };
        });

        // Formatear permisos disponibles
        const permisosFormateados = todosLosPermisos.map((permiso: any) => {
            const permisoJSON = permiso.toJSON() as any;

            return {
                id_permiso: permisoJSON.id,
                codigo: permisoJSON.codigo,
                nombre: permisoJSON.nombre,
                descripcion: permisoJSON.descripcion || '',
                categoria: permisoJSON.categoria || 'General',
            };
        });

        return res.json({
            total: count,
            usuarios: usuariosFormateados,
            roles_disponibles: rolesFormateados,
            permisos_disponibles: permisosFormateados,
            metadata: {
                pagina_actual: page,
                total_paginas: Math.ceil(count / limit),
                registros_por_pagina: limit,
                total_registros: count,
                ordenado_por: 'fecha_creacion',
                orden: 'desc',
            },
        });
    } catch (e: any) {
        console.error('Error en obtenerListaCompletaUsuarios:', e);
        return res.status(500).json({
            error: 'Error al obtener lista de usuarios',
            detalles: e.message,
        });
    }
};

/**
 * Alternar estado activo de usuario
 * PATCH /api/usuarios/:id/toggle-activo
 */
export const toggleActivo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const usuario = await models.Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        const nuevoEstado = usuario.get('activo') === 1 ? 0 : 1;

        await usuario.update({
            activo: nuevoEstado,
            updated_at: new Date(),
        });

        return res.json({
            ok: true,
            message: `usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'}`,
            activo: nuevoEstado,
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
