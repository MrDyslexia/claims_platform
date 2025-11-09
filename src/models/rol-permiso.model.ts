import { DataTypes, Sequelize } from 'sequelize';

export const defineRolPermiso = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
