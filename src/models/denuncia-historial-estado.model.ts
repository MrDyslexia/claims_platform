import { DataTypes, Sequelize } from 'sequelize';

export const defineDenunciaHistorialEstado = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
