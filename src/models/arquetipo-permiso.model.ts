import { DataTypes, Sequelize } from 'sequelize';

/**
 * Tabla pivote Arquetipo-Permiso
 * Define los permisos base de cada arquetipo (plantilla)
 */
export const defineArquetipoPermiso = (sequelize: Sequelize) => {
    return sequelize.define(
        'arquetipo_permiso',
        {
            arquetipo_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                references: {
                    model: 'arquetipo',
                    key: 'id',
                },
            },
            permiso_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                references: {
                    model: 'permiso',
                    key: 'id',
                },
            },
        },
        {
            tableName: 'arquetipo_permiso',
            timestamps: false,
            indexes: [
                { fields: ['arquetipo_id'] },
                { fields: ['permiso_id'] },
            ],
        }
    );
};
