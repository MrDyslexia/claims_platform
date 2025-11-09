import { DataTypes, Sequelize } from 'sequelize';

export const defineUsuario = (sequelize: Sequelize) => {
    return sequelize.define(
        'usuario',
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
            nombre_completo: {
                type: DataTypes.STRING(200),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 200],
                },
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true,
                },
            },
            pass_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            must_change_password: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1]],
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
            telefono: {
                type: DataTypes.STRING(20),
                allowNull: true,
                validate: {
                    len: [0, 20],
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
            last_login_at: { type: DataTypes.DATE, allowNull: true },
        },
        {
            tableName: 'usuario',
            timestamps: false,
            indexes: [
                { fields: ['rut'], unique: true },
                { fields: ['email'], unique: true },
                { fields: ['activo'] },
                { fields: ['last_login_at'] },
            ],
        }
    );
};
