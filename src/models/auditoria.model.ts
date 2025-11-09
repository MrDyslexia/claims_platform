import { DataTypes, Sequelize } from 'sequelize';

export const defineAuditoria = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
