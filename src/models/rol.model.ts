import { DataTypes, Sequelize } from 'sequelize';

export const defineRol = (sequelize: Sequelize) => {
    return sequelize.define(
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
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'rol',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );
};
