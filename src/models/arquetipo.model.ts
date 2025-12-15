import { DataTypes, Sequelize } from 'sequelize';

/**
 * Modelo Arquetipo - Define los 5 tipos base de roles
 * ADMIN, SUPERVISOR, AUDITOR, ANALISTA, SUPERSU
 * Cada arquetipo tiene permisos base que sirven como plantilla
 */
export const defineArquetipo = (sequelize: Sequelize) => {
    return sequelize.define(
        'arquetipo',
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
                comment: 'Código único del arquetipo: ADMIN, ANALISTA, SUPERVISOR, AUDITOR',
            },
            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
                comment: 'Nombre descriptivo del arquetipo',
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Descripción detallada de las responsabilidades del arquetipo',
            },
        },
        {
            tableName: 'arquetipo',
            timestamps: false,
            indexes: [{ fields: ['codigo'], unique: true }],
        }
    );
};
