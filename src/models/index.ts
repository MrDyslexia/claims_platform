import { DataTypes, Model, Sequelize } from 'sequelize';

export const initModels = (sequelize: Sequelize) => {
  // Empresa
  const Empresa = sequelize.define('empresa', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    estado: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'empresa', timestamps: false });

  // Tipo denuncia
  const TipoDenuncia = sequelize.define('tipo_denuncia', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false }
  }, { tableName: 'tipo_denuncia', timestamps: false });

  // Estado denuncia
  const EstadoDenuncia = sequelize.define('estado_denuncia', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false }
  }, { tableName: 'estado_denuncia', timestamps: false });

  // Rol
  const Rol = sequelize.define('rol', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false }
  }, { tableName: 'rol', timestamps: false });

  // Permiso
  const Permiso = sequelize.define('permiso', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false }
  }, { tableName: 'permiso', timestamps: false });

  // rol_permiso join
  const RolPermiso = sequelize.define('rol_permiso', {
    rol_id: { type: DataTypes.BIGINT, primaryKey: true },
    permiso_id: { type: DataTypes.BIGINT, primaryKey: true }
  }, { tableName: 'rol_permiso', timestamps: false });

  // Usuario
  const Usuario = sequelize.define('usuario', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombre_completo: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    pass_hash: { type: DataTypes.STRING(255), allowNull: false },
    must_change_password: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    activo: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    last_login_at: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'usuario', timestamps: false });

  // usuario_rol join
  const UsuarioRol = sequelize.define('usuario_rol', {
    usuario_id: { type: DataTypes.BIGINT, primaryKey: true },
    rol_id: { type: DataTypes.BIGINT, primaryKey: true }
  }, { tableName: 'usuario_rol', timestamps: false });

  // usuario_sesion
  const UsuarioSesion = sequelize.define('usuario_sesion', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.BIGINT, allowNull: false },
    jti: { type: DataTypes.CHAR(36), allowNull: false, unique: true },
    emitido_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    expira_at: { type: DataTypes.DATE, allowNull: false },
    revocado_at: { type: DataTypes.DATE, allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(300), allowNull: true }
  }, { tableName: 'usuario_sesion', timestamps: false });

  // Denuncia
  const Denuncia = sequelize.define('denuncia', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    clave_hash: { type: DataTypes.BLOB, allowNull: false },
    clave_salt: { type: DataTypes.BLOB, allowNull: false },
    empresa_id: { type: DataTypes.BIGINT, allowNull: false },
    tipo_id: { type: DataTypes.BIGINT, allowNull: false },
    estado_id: { type: DataTypes.BIGINT, allowNull: false },
    asunto: { type: DataTypes.STRING(300), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    canal_origen: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'WEB' },
    denunciante_nombre: { type: DataTypes.STRING(200), allowNull: true },
    denunciante_email: { type: DataTypes.STRING(255), allowNull: true },
    denunciante_fono: { type: DataTypes.STRING(50), allowNull: true },
    es_anonima: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.BIGINT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'denuncia', timestamps: false });

  // Denuncia asignacion
  const DenunciaAsignacion = sequelize.define('denuncia_asignacion', {
    denuncia_id: { type: DataTypes.BIGINT, primaryKey: true },
    usuario_id: { type: DataTypes.BIGINT, primaryKey: true },
    asignado_por: { type: DataTypes.BIGINT, allowNull: false },
    activo: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    asignado_at: { type: DataTypes.DATE, primaryKey: true, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'denuncia_asignacion', timestamps: false });

  // Denuncia historial estado
  const DenunciaHistorialEstado = sequelize.define('denuncia_historial_estado', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: false },
    de_estado_id: { type: DataTypes.BIGINT, allowNull: true },
    a_estado_id: { type: DataTypes.BIGINT, allowNull: false },
    cambiado_por: { type: DataTypes.BIGINT, allowNull: true },
    motivo: { type: DataTypes.STRING(500), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'denuncia_historial_estado', timestamps: false });

  // Comentario (único por denuncia)
  const Comentario = sequelize.define('comentario', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    autor_nombre: { type: DataTypes.STRING(200), allowNull: true },
    autor_email: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'comentario', timestamps: false });

  // Resolucion
  const Resolucion = sequelize.define('resolucion', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    resuelto_por: { type: DataTypes.BIGINT, allowNull: false },
    resuelto_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    pdf_path: { type: DataTypes.STRING(500), allowNull: true },
    firma_hash: { type: DataTypes.BLOB, allowNull: true }
  }, { tableName: 'resolucion', timestamps: false });

  // Adjunto
  const Adjunto = sequelize.define('adjunto', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: false },
    tipo_vinculo: { type: DataTypes.ENUM('DENUNCIA','COMENTARIO','RESOLUCION','EXPORT','OTRO'), allowNull: false },
    nombre_archivo: { type: DataTypes.STRING(300), allowNull: false },
    ruta: { type: DataTypes.STRING(600), allowNull: false },
    mime_type: { type: DataTypes.STRING(150), allowNull: false },
    tamano_bytes: { type: DataTypes.BIGINT, allowNull: false },
    checksum_sha256: { type: DataTypes.BLOB, allowNull: true },
    subref_id: { type: DataTypes.BIGINT, allowNull: true },
    subref_tabla: { type: DataTypes.STRING(50), allowNull: true },
    subido_por: { type: DataTypes.BIGINT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'adjunto', timestamps: false });

  // Reasignacion
  const Reasignacion = sequelize.define('reasignacion', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: false },
    de_usuario_id: { type: DataTypes.BIGINT, allowNull: true },
    a_usuario_id: { type: DataTypes.BIGINT, allowNull: false },
    reasignado_por: { type: DataTypes.BIGINT, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'reasignacion', timestamps: false });

  // export_auditoria
  const ExportAuditoria = sequelize.define('export_auditoria', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.BIGINT, allowNull: false },
    tipo: { type: DataTypes.ENUM('LISTADO','DETALLE'), allowNull: false },
    formato: { type: DataTypes.ENUM('CSV','XLSX','PDF'), allowNull: false },
    filtros_json: { type: DataTypes.JSON, allowNull: true },
    denuncia_id: { type: DataTypes.BIGINT, allowNull: true },
    archivo_path: { type: DataTypes.STRING(600), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'export_auditoria', timestamps: false });

  // auditoria
  const Auditoria = sequelize.define('auditoria', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    actor_usuario_id: { type: DataTypes.BIGINT, allowNull: true },
    actor_email: { type: DataTypes.STRING(255), allowNull: true },
    entidad: { type: DataTypes.STRING(50), allowNull: false },
    entidad_id: { type: DataTypes.BIGINT, allowNull: true },
    accion: { type: DataTypes.STRING(50), allowNull: false },
    valores_antes: { type: DataTypes.JSON, allowNull: true },
    valores_despues: { type: DataTypes.JSON, allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(300), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'auditoria', timestamps: false });

  // email_queue
  const EmailQueue = sequelize.define('email_queue', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    to_email: { type: DataTypes.STRING(255), allowNull: false },
    subject: { type: DataTypes.STRING(300), allowNull: false },
    template_code: { type: DataTypes.STRING(100), allowNull: false },
    payload_json: { type: DataTypes.JSON, allowNull: true },
    intento_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ultimo_error: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.ENUM('PENDIENTE','ENVIADO','ERROR'), allowNull: false, defaultValue: 'PENDIENTE' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    sent_at: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'email_queue', timestamps: false });

  // api_request_log
  const ApiRequestLog = sequelize.define('api_request_log', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    endpoint: { type: DataTypes.STRING(200), allowNull: false },
    ip: { type: DataTypes.STRING(45), allowNull: false },
    usuario_id: { type: DataTypes.BIGINT, allowNull: true },
    status_code: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'api_request_log', timestamps: false });

  // KPI
  const KpiDenunciasDiario = sequelize.define('kpi_denuncias_diario', {
    fecha: { type: DataTypes.DATEONLY, primaryKey: true },
    empresa_id: { type: DataTypes.BIGINT, primaryKey: true },
    tipo_id: { type: DataTypes.BIGINT, primaryKey: true },
    estado_id: { type: DataTypes.BIGINT, primaryKey: true },
    total: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'kpi_denuncias_diario', timestamps: false });

  // Secuencia
  const SeqDenuncia = sequelize.define('seq_denuncia', {
    anio: { type: DataTypes.INTEGER, primaryKey: true },
    correlativo: { type: DataTypes.BIGINT, allowNull: false }
  }, { tableName: 'seq_denuncia', timestamps: false });

  // View: v_denuncia_lookup (read-only)
  const VDenunciaLookup = sequelize.define('v_denuncia_lookup', {
    id: { type: DataTypes.BIGINT, primaryKey: true },
    numero: { type: DataTypes.STRING(20) },
    estado_id: { type: DataTypes.BIGINT },
    empresa_id: { type: DataTypes.BIGINT },
    tipo_id: { type: DataTypes.BIGINT },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    clave_hash: { type: DataTypes.BLOB },
    clave_salt: { type: DataTypes.BLOB }
  }, { tableName: 'v_denuncia_lookup', timestamps: false });

  // Associations
  Denuncia.belongsTo(Empresa, { foreignKey: 'empresa_id' });
  Denuncia.belongsTo(TipoDenuncia, { foreignKey: 'tipo_id' });
  Denuncia.belongsTo(EstadoDenuncia, { foreignKey: 'estado_id' });
  Denuncia.belongsTo(Usuario, { as: 'creador', foreignKey: 'created_by' });
  Empresa.hasMany(Denuncia, { foreignKey: 'empresa_id' });
  TipoDenuncia.hasMany(Denuncia, { foreignKey: 'tipo_id' });
  EstadoDenuncia.hasMany(Denuncia, { foreignKey: 'estado_id' });

  Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id', otherKey: 'rol_id' });
  Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id', otherKey: 'usuario_id' });
  Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id', otherKey: 'permiso_id' });
  Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id', otherKey: 'rol_id' });

  DenunciaAsignacion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
  DenunciaAsignacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'asignado' });
  DenunciaAsignacion.belongsTo(Usuario, { foreignKey: 'asignado_por', as: 'asignador' });

  DenunciaHistorialEstado.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
  DenunciaHistorialEstado.belongsTo(EstadoDenuncia, { foreignKey: 'de_estado_id', as: 'de_estado' });
  DenunciaHistorialEstado.belongsTo(EstadoDenuncia, { foreignKey: 'a_estado_id', as: 'a_estado' });
  DenunciaHistorialEstado.belongsTo(Usuario, { foreignKey: 'cambiado_por', as: 'cambiador' });

  Comentario.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });

  Resolucion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
  Resolucion.belongsTo(Usuario, { foreignKey: 'resuelto_por', as: 'resolutor' });

  Adjunto.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
  Adjunto.belongsTo(Usuario, { foreignKey: 'subido_por', as: 'uploader' });

  Reasignacion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
  Reasignacion.belongsTo(Usuario, { foreignKey: 'de_usuario_id', as: 'reasignado_de' });
  Reasignacion.belongsTo(Usuario, { foreignKey: 'a_usuario_id', as: 'reasignado_a' });
  Reasignacion.belongsTo(Usuario, { foreignKey: 'reasignado_por', as: 'reasignador' });

  ExportAuditoria.belongsTo(Usuario, { foreignKey: 'usuario_id' });
  ExportAuditoria.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });

  Auditoria.belongsTo(Usuario, { foreignKey: 'actor_usuario_id', as: 'actor' });

  ApiRequestLog.belongsTo(Usuario, { foreignKey: 'usuario_id' });

  return {
    Empresa,
    TipoDenuncia,
    EstadoDenuncia,
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
    ExportAuditoria,
    Auditoria,
    EmailQueue,
    ApiRequestLog,
    KpiDenunciasDiario,
    SeqDenuncia,
    VDenunciaLookup
  } as const;
};

export type DbModels = ReturnType<typeof initModels>;

