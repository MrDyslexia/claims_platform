import { DataTypes, Sequelize } from 'sequelize';

export const definePermiso = (sequelize: Sequelize) => {
    return sequelize.define(
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
};
