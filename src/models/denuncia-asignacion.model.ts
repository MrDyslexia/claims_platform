import { DataTypes, Sequelize } from 'sequelize';

export const defineDenunciaAsignacion = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
