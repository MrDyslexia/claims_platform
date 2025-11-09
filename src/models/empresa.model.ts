import { DataTypes, Model, Sequelize } from 'sequelize';

export const defineEmpresa = (sequelize: Sequelize) => {
    return sequelize.define(
        'empresa',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            rut: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [8, 20],
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
            direccion: {
                type: DataTypes.STRING(300),
                allowNull: true,
                validate: {
                    len: [0, 300],
                },
            },
            telefono: {
                type: DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    len: [0, 50],
                },
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    isEmail: true,
                    len: [0, 100],
                },
            },
            estado: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]],
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
        },
        {
            tableName: 'empresa',
            timestamps: false,
            indexes: [
                { fields: ['rut'], unique: true },
                { fields: ['estado'] },
            ],
        }
    );
};
