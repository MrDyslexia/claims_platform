import { DataTypes, Sequelize } from 'sequelize';

export const defineUsuarioRol = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
