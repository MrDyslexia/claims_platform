import { DataTypes, Sequelize } from 'sequelize';

export const defineCanalDenuncia = (sequelize: Sequelize) => {
    return sequelize.define(
        'canal_denuncia',
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
            permite_anonimo: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                comment: 'Si FALSE (Ley Karim), la identidad es obligatoria',
            },
            requiere_identificacion: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                comment: 'Si TRUE, validación estricta de identidad',
            },
            activo: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'canal_denuncia',
            timestamps: false,
            indexes: [
                { fields: ['codigo'], unique: true },
                { fields: ['activo'] },
            ],
        }
    );
};
