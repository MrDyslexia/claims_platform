import { DataTypes, Sequelize } from 'sequelize';

/**
 * Cola de emails para envío asincrónico.
 *
 * Nota: Actualmente no tiene FK a usuario_id ni denuncia_id.
 * Si necesitas rastrear quién disparó un email o a qué denuncia pertenece,
 * considera agregar estos campos al payload_json o como propiedades.
 *
 * El payload_json contiene toda la información contextual necesaria.
 */
export const defineEmailQueue = (sequelize: Sequelize) => {
    return sequelize.define(
        'email_queue',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            to_email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    isEmail: true,
                    notEmpty: true,
                },
            },
            subject: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 300],
                },
            },
            template_code: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 100],
                },
            },
            payload_json: { type: DataTypes.JSON, allowNull: true },
            intento_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            ultimo_error: {
                type: DataTypes.STRING(500),
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            status: {
                type: DataTypes.ENUM('PENDIENTE', 'ENVIADO', 'ERROR'),
                allowNull: false,
                defaultValue: 'PENDIENTE',
                validate: {
                    isIn: [['PENDIENTE', 'ENVIADO', 'ERROR']],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            sent_at: { type: DataTypes.DATE, allowNull: true },
        },
        {
            tableName: 'email_queue',
            timestamps: false,
            indexes: [
                { fields: ['status'] },
                { fields: ['created_at'] },
                { fields: ['status', 'created_at'] },
            ],
        }
    );
};
