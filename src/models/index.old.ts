import { DataTypes, Model, Sequelize } from 'sequelize';

export const initModels = (sequelize: Sequelize) => {
    // Empresa
    const Empresa = sequelize.define(
        'empresa',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            rut: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [8, 20],
                },
            },
            nombre: {
                type: DataTypes.STRING(200),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 200],
                },
            },
            estado: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'empresa',
            timestamps: false,
            indexes: [
                { fields: ['rut'], unique: true },
                { fields: ['estado'] },
            ],
        }
    );

    // Tipo denuncia
    const TipoDenuncia = sequelize.define(
        'tipo_denuncia',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            codigo: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                    isUppercase: true,
                },
            },
            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
        },
        {
            tableName: 'tipo_denuncia',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );

    // Estado denuncia
    const EstadoDenuncia = sequelize.define(
        'estado_denuncia',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            codigo: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                    isUppercase: true,
                },
            },
            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
        },
        {
            tableName: 'estado_denuncia',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );

    // Rol
    const Rol = sequelize.define(
        'rol',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            codigo: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                    isUppercase: true,
                },
            },
            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
        },
        {
            tableName: 'rol',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );

    // Permiso
    const Permiso = sequelize.define(
        'permiso',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            codigo: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [3, 100],
                },
            },
            nombre: {
                type: DataTypes.STRING(200),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 200],
                },
            },
        },
        {
            tableName: 'permiso',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );

    // rol_permiso join
    const RolPermiso = sequelize.define(
        'rol_permiso',
        {
            rol_id: { type: DataTypes.BIGINT, primaryKey: true },
            permiso_id: { type: DataTypes.BIGINT, primaryKey: true },
        },
        {
            tableName: 'rol_permiso',
            timestamps: false,
            indexes: [{ fields: ['rol_id'] }, { fields: ['permiso_id'] }],
        }
    );

    // Usuario
    const Usuario = sequelize.define(
        'usuario',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            rut: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [8, 20],
                },
            },
            nombre_completo: {
                type: DataTypes.STRING(200),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 200],
                },
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true,
                },
            },
            pass_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            must_change_password: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1]],
                },
            },
            activo: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            last_login_at: { type: DataTypes.DATE, allowNull: true },
        },
        {
            tableName: 'usuario',
            timestamps: false,
            indexes: [
                { fields: ['rut'], unique: true },
                { fields: ['email'], unique: true },
                { fields: ['activo'] },
                { fields: ['last_login_at'] },
            ],
        }
    );

    // usuario_rol join
    const UsuarioRol = sequelize.define(
        'usuario_rol',
        {
            usuario_id: { type: DataTypes.BIGINT, primaryKey: true },
            rol_id: { type: DataTypes.BIGINT, primaryKey: true },
        },
        {
            tableName: 'usuario_rol',
            timestamps: false,
            indexes: [{ fields: ['usuario_id'] }, { fields: ['rol_id'] }],
        }
    );

    // usuario_sesion
    const UsuarioSesion = sequelize.define(
        'usuario_sesion',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            jti: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [36, 36],
                },
            },
            emitido_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            expira_at: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    isAfterEmitido(value: Date) {
                        if (this.emitido_at && value <= this.emitido_at) {
                            throw new Error(
                                'expira_at debe ser posterior a emitido_at'
                            );
                        }
                    },
                },
            },
            revocado_at: { type: DataTypes.DATE, allowNull: true },
            ip: {
                type: DataTypes.STRING(45),
                allowNull: true,
                validate: {
                    isIP: true,
                },
            },
            user_agent: {
                type: DataTypes.STRING(300),
                allowNull: true,
                validate: {
                    len: [0, 300],
                },
            },
        },
        {
            tableName: 'usuario_sesion',
            timestamps: false,
            indexes: [
                { fields: ['jti'], unique: true },
                { fields: ['usuario_id'] },
                { fields: ['expira_at'] },
                { fields: ['revocado_at'] },
                { fields: ['usuario_id', 'expira_at', 'revocado_at'] },
            ],
        }
    );

    // Denuncia
    const Denuncia = sequelize.define(
        'denuncia',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            numero: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [5, 20],
                },
            },
            clave_hash: {
                type: DataTypes.BLOB,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            clave_salt: {
                type: DataTypes.BLOB,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            empresa_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            tipo_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            estado_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            asunto: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [5, 300],
                },
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [10, 65535],
                },
            },
            canal_origen: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'WEB',
                validate: {
                    isIn: [['WEB', 'EMAIL', 'TELEFONO', 'PRESENCIAL', 'OTRO']],
                },
            },
            denunciante_nombre: {
                type: DataTypes.STRING(200),
                allowNull: true,
                validate: {
                    len: [0, 200],
                },
            },
            denunciante_email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            denunciante_fono: {
                type: DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    len: [0, 50],
                },
            },
            es_anonima: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1]],
                },
            },
            created_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'denuncia',
            timestamps: false,
            indexes: [
                { fields: ['numero'], unique: true },
                { fields: ['empresa_id'] },
                { fields: ['tipo_id'] },
                { fields: ['estado_id'] },
                { fields: ['created_at'] },
                { fields: ['es_anonima'] },
                { fields: ['empresa_id', 'estado_id'] },
                { fields: ['empresa_id', 'tipo_id'] },
                { fields: ['empresa_id', 'created_at'] },
            ],
        }
    );

    // Denuncia asignacion
    const DenunciaAsignacion = sequelize.define(
        'denuncia_asignacion',
        {
            denuncia_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            asignado_por: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            activo: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]],
                },
            },
            asignado_at: {
                type: DataTypes.DATE,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'denuncia_asignacion',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['usuario_id'] },
                { fields: ['activo'] },
                { fields: ['denuncia_id', 'activo'] },
            ],
        }
    );

    // Denuncia historial estado
    const DenunciaHistorialEstado = sequelize.define(
        'denuncia_historial_estado',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            de_estado_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            a_estado_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            cambiado_por: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            motivo: {
                type: DataTypes.STRING(500),
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'denuncia_historial_estado',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['a_estado_id'] },
                { fields: ['created_at'] },
                { fields: ['denuncia_id', 'created_at'] },
            ],
        }
    );

    // Comentario (único por denuncia)
    const Comentario = sequelize.define(
        'comentario',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            contenido: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 65535],
                },
            },
            autor_nombre: {
                type: DataTypes.STRING(200),
                allowNull: true,
                validate: {
                    len: [0, 200],
                },
            },
            autor_email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'comentario',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'], unique: true },
                { fields: ['created_at'] },
            ],
        }
    );

    // Resolucion
    const Resolucion = sequelize.define(
        'resolucion',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            contenido: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 65535],
                },
            },
            resuelto_por: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            resuelto_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            pdf_path: {
                type: DataTypes.STRING(500),
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            firma_hash: { type: DataTypes.BLOB, allowNull: true },
        },
        {
            tableName: 'resolucion',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'], unique: true },
                { fields: ['resuelto_at'] },
                { fields: ['resuelto_por'] },
            ],
        }
    );

    // Adjunto
    const Adjunto = sequelize.define(
        'adjunto',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            tipo_vinculo: {
                type: DataTypes.ENUM(
                    'DENUNCIA',
                    'COMENTARIO',
                    'RESOLUCION',
                    'EXPORT',
                    'OTRO'
                ),
                allowNull: false,
                validate: {
                    isIn: [
                        [
                            'DENUNCIA',
                            'COMENTARIO',
                            'RESOLUCION',
                            'EXPORT',
                            'OTRO',
                        ],
                    ],
                },
            },
            nombre_archivo: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 300],
                },
            },
            ruta: {
                type: DataTypes.STRING(600),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 600],
                },
            },
            mime_type: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
            tamano_bytes: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            checksum_sha256: { type: DataTypes.BLOB, allowNull: true },
            subref_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            subref_tabla: {
                type: DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    len: [0, 50],
                },
            },
            subido_por: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'adjunto',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['tipo_vinculo'] },
                { fields: ['created_at'] },
                { fields: ['subref_id', 'subref_tabla'] },
            ],
        }
    );

    // Reasignacion
    const Reasignacion = sequelize.define(
        'reasignacion',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            de_usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            a_usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            reasignado_por: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'reasignacion',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['a_usuario_id'] },
                { fields: ['created_at'] },
                { fields: ['denuncia_id', 'created_at'] },
            ],
        }
    );

    // export_auditoria
    const ExportAuditoria = sequelize.define(
        'export_auditoria',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            tipo: {
                type: DataTypes.ENUM('LISTADO', 'DETALLE'),
                allowNull: false,
                validate: {
                    isIn: [['LISTADO', 'DETALLE']],
                },
            },
            formato: {
                type: DataTypes.ENUM('CSV', 'XLSX', 'PDF'),
                allowNull: false,
                validate: {
                    isIn: [['CSV', 'XLSX', 'PDF']],
                },
            },
            filtros_json: { type: DataTypes.JSON, allowNull: true },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            archivo_path: {
                type: DataTypes.STRING(600),
                allowNull: true,
                validate: {
                    len: [0, 600],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'export_auditoria',
            timestamps: false,
            indexes: [
                { fields: ['usuario_id'] },
                { fields: ['tipo'] },
                { fields: ['created_at'] },
                { fields: ['usuario_id', 'created_at'] },
            ],
        }
    );

    // auditoria
    const Auditoria = sequelize.define(
        'auditoria',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            actor_usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            actor_email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            entidad: {
                type: DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                },
            },
            entidad_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            accion: {
                type: DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                },
            },
            valores_antes: { type: DataTypes.JSON, allowNull: true },
            valores_despues: { type: DataTypes.JSON, allowNull: true },
            ip: {
                type: DataTypes.STRING(45),
                allowNull: true,
                validate: {
                    isIP: true,
                },
            },
            user_agent: {
                type: DataTypes.STRING(300),
                allowNull: true,
                validate: {
                    len: [0, 300],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'auditoria',
            timestamps: false,
            indexes: [
                { fields: ['actor_usuario_id'] },
                { fields: ['entidad'] },
                { fields: ['entidad_id'] },
                { fields: ['accion'] },
                { fields: ['created_at'] },
                { fields: ['entidad', 'entidad_id'] },
                { fields: ['actor_usuario_id', 'created_at'] },
            ],
        }
    );

    // email_queue
    const EmailQueue = sequelize.define(
        'email_queue',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            to_email: { type: DataTypes.STRING(255), allowNull: false },
            subject: { type: DataTypes.STRING(300), allowNull: false },
            template_code: { type: DataTypes.STRING(100), allowNull: false },
            payload_json: { type: DataTypes.JSON, allowNull: true },
            intento_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            ultimo_error: { type: DataTypes.STRING(500), allowNull: true },
            status: {
                type: DataTypes.ENUM('PENDIENTE', 'ENVIADO', 'ERROR'),
                allowNull: false,
                defaultValue: 'PENDIENTE',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            sent_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: 'email_queue', timestamps: false }
    );

    // api_request_log
    const APIRequestLog = sequelize.define(
        'api_request_log',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            metodo: {
                type: DataTypes.STRING(10),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isIn: [
                        [
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE',
                            'OPTIONS',
                            'HEAD',
                        ],
                    ],
                },
            },
            ruta: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 300],
                },
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 100,
                    max: 599,
                },
            },
            duracion_ms: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            ip: {
                type: DataTypes.STRING(45),
                allowNull: true,
                validate: {
                    isIP: true,
                },
            },
            user_agent: {
                type: DataTypes.STRING(300),
                allowNull: true,
                validate: {
                    len: [0, 300],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'api_request_log',
            timestamps: false,
            indexes: [
                { fields: ['usuario_id'] },
                { fields: ['metodo'] },
                { fields: ['status'] },
                { fields: ['created_at'] },
                { fields: ['ruta'] },
                { fields: ['usuario_id', 'created_at'] },
            ],
        }
    );

    // KPI
    // kpi_denuncias_diario
    const KPIDenunciasDiario = sequelize.define(
        'kpi_denuncias_diario',
        {
            fecha: {
                type: DataTypes.DATEONLY,
                primaryKey: true,
                validate: {
                    isDate: true,
                },
            },
            empresa_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            total_recibidas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_resueltas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_pendientes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_anonimas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
        },
        {
            tableName: 'kpi_denuncias_diario',
            timestamps: false,
            indexes: [
                { fields: ['fecha'] },
                { fields: ['empresa_id'] },
                { fields: ['fecha', 'empresa_id'] },
            ],
        }
    );

    // Secuencia
    const SeqDenuncia = sequelize.define(
        'seq_denuncia',
        {
            anio: { type: DataTypes.INTEGER, primaryKey: true },
            correlativo: { type: DataTypes.BIGINT, allowNull: false },
        },
        { tableName: 'seq_denuncia', timestamps: false }
    );

    // View: v_denuncia_lookup (read-only)
    const VDenunciaLookup = sequelize.define(
        'v_denuncia_lookup',
        {
            id: { type: DataTypes.BIGINT, primaryKey: true },
            numero: { type: DataTypes.STRING(20) },
            estado_id: { type: DataTypes.BIGINT },
            empresa_id: { type: DataTypes.BIGINT },
            tipo_id: { type: DataTypes.BIGINT },
            created_at: { type: DataTypes.DATE },
            updated_at: { type: DataTypes.DATE },
            clave_hash: { type: DataTypes.BLOB },
            clave_salt: { type: DataTypes.BLOB },
        },
        { tableName: 'v_denuncia_lookup', timestamps: false }
    );

    // Associations
    Denuncia.belongsTo(Empresa, { foreignKey: 'empresa_id' });
    Denuncia.belongsTo(TipoDenuncia, { foreignKey: 'tipo_id' });
    Denuncia.belongsTo(EstadoDenuncia, { foreignKey: 'estado_id' });
    Denuncia.belongsTo(Usuario, { as: 'creador', foreignKey: 'created_by' });
    Empresa.hasMany(Denuncia, { foreignKey: 'empresa_id' });
    TipoDenuncia.hasMany(Denuncia, { foreignKey: 'tipo_id' });
    EstadoDenuncia.hasMany(Denuncia, { foreignKey: 'estado_id' });

    Usuario.belongsToMany(Rol, {
        through: UsuarioRol,
        foreignKey: 'usuario_id',
        otherKey: 'rol_id',
    });
    Rol.belongsToMany(Usuario, {
        through: UsuarioRol,
        foreignKey: 'rol_id',
        otherKey: 'usuario_id',
    });
    Rol.belongsToMany(Permiso, {
        through: RolPermiso,
        foreignKey: 'rol_id',
        otherKey: 'permiso_id',
    });
    Permiso.belongsToMany(Rol, {
        through: RolPermiso,
        foreignKey: 'permiso_id',
        otherKey: 'rol_id',
    });

    DenunciaAsignacion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    DenunciaAsignacion.belongsTo(Usuario, {
        foreignKey: 'usuario_id',
        as: 'asignado',
    });
    DenunciaAsignacion.belongsTo(Usuario, {
        foreignKey: 'asignado_por',
        as: 'asignador',
    });

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

    Comentario.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });

    Resolucion.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Resolucion.belongsTo(Usuario, {
        foreignKey: 'resuelto_por',
        as: 'resolutor',
    });

    Adjunto.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
    Adjunto.belongsTo(Usuario, { foreignKey: 'subido_por', as: 'uploader' });

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

    ExportAuditoria.belongsTo(Usuario, { foreignKey: 'usuario_id' });
    ExportAuditoria.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });

    Auditoria.belongsTo(Usuario, {
        foreignKey: 'actor_usuario_id',
        as: 'actor',
    });

    APIRequestLog.belongsTo(Usuario, { foreignKey: 'usuario_id' });

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
        APIRequestLog,
        KPIDenunciasDiario,
        SeqDenuncia,
        VDenunciaLookup,
    } as const;
};

export type DbModels = ReturnType<typeof initModels>;
