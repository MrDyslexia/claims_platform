import { DataTypes, Sequelize } from 'sequelize';

export const defineDenuncia = (sequelize: Sequelize) => {
    return sequelize.define(
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
            pais: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    len: [0, 100],
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
            prioridad_id: {
                type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA'),
                allowNull: true,
                validate: {
                    isIn: [['BAJA', 'MEDIA', 'ALTA', 'CRITICA']],
                },
            },
            nota_satisfaccion: {
                type: DataTypes.TINYINT,
                allowNull: true,
                validate: {
                    min: 1,
                    max: 5,
                },
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
};
