import { DataTypes, Sequelize } from 'sequelize';

export const defineResolucion = (sequelize: Sequelize) => {
    return sequelize.define(
        'resolucion',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            contenido: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 65535],
                },
            },
            resuelto_por: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            resuelto_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            pdf_path: {
                type: DataTypes.STRING(500),
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            firma_hash: { type: DataTypes.BLOB, allowNull: true },
        },
        {
            tableName: 'resolucion',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'], unique: true },
                { fields: ['resuelto_at'] },
                { fields: ['resuelto_por'] },
            ],
        }
    );
};
