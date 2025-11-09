import { DataTypes, Sequelize } from 'sequelize';

export const defineReasignacion = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
