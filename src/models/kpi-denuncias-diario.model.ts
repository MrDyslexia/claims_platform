import { DataTypes, Sequelize } from 'sequelize';

export const defineKPIDenunciasDiario = (sequelize: Sequelize) => {
    return sequelize.define(
        'kpi_denuncias_diario',
        {
            fecha: {
                type: DataTypes.DATEONLY,
                primaryKey: true,
                validate: {
                    isDate: true,
                },
            },
            empresa_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            total_recibidas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_resueltas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_pendientes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            total_anonimas: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
        },
        {
            tableName: 'kpi_denuncias_diario',
            timestamps: false,
            indexes: [
                { fields: ['fecha'] },
                { fields: ['empresa_id'] },
                { fields: ['fecha', 'empresa_id'] },
            ],
        }
    );
};
