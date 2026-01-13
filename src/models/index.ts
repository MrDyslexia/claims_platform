import { Sequelize } from 'sequelize';

// Importar definiciones de modelos
import { defineEmpresa } from './empresa.model';
import { defineTipoDenuncia } from './tipo-denuncia.model';
import { defineCategoriaDenuncia } from './categoria-denuncia.model';
import { defineEstadoDenuncia } from './estado-denuncia.model';
import { defineArquetipo } from './arquetipo.model';
import { defineArquetipoPermiso } from './arquetipo-permiso.model';
import { defineRol } from './rol.model';
import { definePermiso } from './permiso.model';
import { defineRolPermiso } from './rol-permiso.model';
import { defineUsuario } from './usuario.model';
import { defineUsuarioRol } from './usuario-rol.model';
import { defineUsuarioSesion } from './usuario-sesion.model';
import { defineDenuncia } from './denuncia.model';
import { defineDenunciaAsignacion } from './denuncia-asignacion.model';
import { defineDenunciaHistorialEstado } from './denuncia-historial-estado.model';
import { defineComentario } from './comentario.model';
import { defineResolucion } from './resolucion.model';
import { defineAdjunto } from './adjunto.model';
import { defineReasignacion } from './reasignacion.model';
import { defineAPIRequestLog } from './api-request-log.model';
import { defineKPIDenunciasDiario } from './kpi-denuncias-diario.model';
import { defineSeqDenuncia } from './seq-denuncia.model';
import { defineVDenunciaLookup } from './v-denuncia-lookup.model';
import { defineUsuarioCategoria } from './usuario-categoria.model';
import { defineRolCategoria } from './rol-categoria.model';

/**
 * Inicializa todos los modelos y sus asociaciones
 * Siguiendo principios SOLID - cada modelo en su propio archivo
 */
export const initModels = (sequelize: Sequelize) => {
    // Definir todos los modelos
    const Empresa = defineEmpresa(sequelize);
    const TipoDenuncia = defineTipoDenuncia(sequelize);
    const CategoriaDenuncia = defineCategoriaDenuncia(sequelize);
    const EstadoDenuncia = defineEstadoDenuncia(sequelize);
    const Arquetipo = defineArquetipo(sequelize);
    const ArquetipoPermiso = defineArquetipoPermiso(sequelize);
    const Rol = defineRol(sequelize);
    const Permiso = definePermiso(sequelize);
    const RolPermiso = defineRolPermiso(sequelize);
    const Usuario = defineUsuario(sequelize);
    const UsuarioRol = defineUsuarioRol(sequelize);
    const UsuarioSesion = defineUsuarioSesion(sequelize);
    const Denuncia = defineDenuncia(sequelize);
    const DenunciaAsignacion = defineDenunciaAsignacion(sequelize);
    const DenunciaHistorialEstado = defineDenunciaHistorialEstado(sequelize);
    const Comentario = defineComentario(sequelize);
    const Resolucion = defineResolucion(sequelize);
    const Adjunto = defineAdjunto(sequelize);
    const Reasignacion = defineReasignacion(sequelize);
    const APIRequestLog = defineAPIRequestLog(sequelize);
    const KPIDenunciasDiario = defineKPIDenunciasDiario(sequelize);
    const SeqDenuncia = defineSeqDenuncia(sequelize);
    const VDenunciaLookup = defineVDenunciaLookup(sequelize);
    const UsuarioCategoria = defineUsuarioCategoria(sequelize);
    const RolCategoria = defineRolCategoria(sequelize);

    // ==========================================
    // ASOCIACIONES / RELATIONSHIPS
    // ==========================================

    // Denuncia associations
    Denuncia.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
    Denuncia.belongsTo(TipoDenuncia, {
        foreignKey: 'tipo_id',
        as: 'tipo_denuncia',
    });
    Denuncia.belongsTo(EstadoDenuncia, {
        foreignKey: 'estado_id',
        as: 'estado_denuncia',
    });
    Denuncia.belongsTo(Usuario, { as: 'creador', foreignKey: 'created_by' });

    Empresa.hasMany(Denuncia, { foreignKey: 'empresa_id' });
    TipoDenuncia.hasMany(Denuncia, { foreignKey: 'tipo_id' });
    
    // CategoriaDenuncia associations
    CategoriaDenuncia.hasMany(TipoDenuncia, { foreignKey: 'categoria_id', as: 'tipos' });
    TipoDenuncia.belongsTo(CategoriaDenuncia, { foreignKey: 'categoria_id', as: 'categoria' });
    EstadoDenuncia.hasMany(Denuncia, { foreignKey: 'estado_id' });

    // Usuario <-> Rol (many-to-many)
    Usuario.belongsToMany(Rol, {
        through: UsuarioRol,
        foreignKey: 'usuario_id',
        otherKey: 'rol_id',
        as: 'roles',
    });
    Rol.belongsToMany(Usuario, {
        through: UsuarioRol,
        foreignKey: 'rol_id',
        otherKey: 'usuario_id',
        as: 'usuarios',
    });

    // Usuario <-> CategoriaDenuncia (many-to-many) - Categorías asignadas a admins
    Usuario.belongsToMany(CategoriaDenuncia, {
        through: UsuarioCategoria,
        foreignKey: 'usuario_id',
        otherKey: 'categoria_id',
        as: 'categorias',
    });
    CategoriaDenuncia.belongsToMany(Usuario, {
        through: UsuarioCategoria,
        foreignKey: 'categoria_id',
        otherKey: 'usuario_id',
        as: 'usuarios',
    });

    // Arquetipo <-> Permiso (many-to-many) - Permisos base del arquetipo
    Arquetipo.belongsToMany(Permiso, {
        through: ArquetipoPermiso,
        foreignKey: 'arquetipo_id',
        otherKey: 'permiso_id',
        as: 'permisos',
    });
    Permiso.belongsToMany(Arquetipo, {
        through: ArquetipoPermiso,
        foreignKey: 'permiso_id',
        otherKey: 'arquetipo_id',
        as: 'arquetipos',
    });

    // Arquetipo -> Rol (one-to-many)
    Arquetipo.hasMany(Rol, { foreignKey: 'arquetipo_id', as: 'roles' });
    Rol.belongsTo(Arquetipo, { foreignKey: 'arquetipo_id', as: 'arquetipo' });

    // Rol <-> Permiso (many-to-many) - Permisos personalizados del rol
    Rol.belongsToMany(Permiso, {
        through: RolPermiso,
        foreignKey: 'rol_id',
        otherKey: 'permiso_id',
        as: 'permisos',
    });
    Permiso.belongsToMany(Rol, {
        through: RolPermiso,
        foreignKey: 'permiso_id',
        otherKey: 'rol_id',
        as: 'roles',
    });

    // Rol <-> CategoriaDenuncia (many-to-many) - Categorías asignadas a roles
    Rol.belongsToMany(CategoriaDenuncia, {
        through: RolCategoria,
        foreignKey: 'rol_id',
        otherKey: 'categoria_id',
        as: 'categorias',
    });
    CategoriaDenuncia.belongsToMany(Rol, {
        through: RolCategoria,
        foreignKey: 'categoria_id',
        otherKey: 'rol_id',
        as: 'roles',
    });

    // DenunciaAsignacion associations
    DenunciaAsignacion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    DenunciaAsignacion.belongsTo(Usuario, {
        foreignKey: 'usuario_id',
        as: 'asignado',
    });
    DenunciaAsignacion.belongsTo(Usuario, {
        foreignKey: 'asignado_por',
        as: 'asignador',
    });
    Denuncia.hasMany(DenunciaAsignacion, { foreignKey: 'denuncia_id' });

    // DenunciaHistorialEstado associations
    DenunciaHistorialEstado.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    DenunciaHistorialEstado.belongsTo(EstadoDenuncia, {
        foreignKey: 'de_estado_id',
        as: 'de_estado',
    });
    DenunciaHistorialEstado.belongsTo(EstadoDenuncia, {
        foreignKey: 'a_estado_id',
        as: 'a_estado',
    });
    DenunciaHistorialEstado.belongsTo(Usuario, {
        foreignKey: 'cambiado_por',
        as: 'cambiador',
    });
    Denuncia.hasMany(DenunciaHistorialEstado, { foreignKey: 'denuncia_id' });
    Usuario.hasMany(DenunciaHistorialEstado, {
        foreignKey: 'cambiado_por',
        as: 'historialesEstadoCambiados',
    });

    // UsuarioSesion associations
    UsuarioSesion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
    Usuario.hasMany(UsuarioSesion, { foreignKey: 'usuario_id' });

    // Comentario associations
    Comentario.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'autor' });
    Denuncia.hasMany(Comentario, { foreignKey: 'denuncia_id' });
    Usuario.hasMany(Comentario, {
        foreignKey: 'usuario_id',
        as: 'comentarios',
    });

    // Resolucion associations
    Resolucion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Resolucion.belongsTo(Usuario, {
        foreignKey: 'resuelto_por',
        as: 'resolutor',
    });
    Denuncia.hasMany(Resolucion, { foreignKey: 'denuncia_id' });
    Usuario.hasMany(Resolucion, {
        foreignKey: 'resuelto_por',
        as: 'resoluciones',
    });

    // Adjunto associations
    Adjunto.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Adjunto.belongsTo(Usuario, { foreignKey: 'subido_por', as: 'uploader' });
    Denuncia.hasMany(Adjunto, { foreignKey: 'denuncia_id' });
    Usuario.hasMany(Adjunto, {
        foreignKey: 'subido_por',
        as: 'archivosSubidos',
    });

    // Reasignacion associations
    Reasignacion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Reasignacion.belongsTo(Usuario, {
        foreignKey: 'de_usuario_id',
        as: 'reasignado_de',
    });
    Reasignacion.belongsTo(Usuario, {
        foreignKey: 'a_usuario_id',
        as: 'reasignado_a',
    });
    Reasignacion.belongsTo(Usuario, {
        foreignKey: 'reasignado_por',
        as: 'reasignador',
    });
    Denuncia.hasMany(Reasignacion, { foreignKey: 'denuncia_id' });



    // APIRequestLog associations
    APIRequestLog.belongsTo(Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario',
    });
    Usuario.hasMany(APIRequestLog, {
        foreignKey: 'usuario_id',
        as: 'request_logs',
    });



    // Retornar todos los modelos
    return {
        Empresa,
        TipoDenuncia,
        CategoriaDenuncia,
        EstadoDenuncia,
        Arquetipo,
        ArquetipoPermiso,
        Rol,
        Permiso,
        RolPermiso,
        Usuario,
        UsuarioRol,
        UsuarioSesion,
        Denuncia,
        DenunciaAsignacion,
        DenunciaHistorialEstado,
        Comentario,
        Resolucion,
        Adjunto,
        Reasignacion,
        APIRequestLog,
        SeqDenuncia,
        UsuarioCategoria,
        RolCategoria,
    } as const;
};

export type DbModels = ReturnType<typeof initModels>;
