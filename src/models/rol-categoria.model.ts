import { DataTypes, Sequelize } from 'sequelize';

/**
 * Tabla de unión para asociar roles con categorías de denuncia.
 * Un rol con categorías asignadas solo puede ver denuncias de esas categorías.
 * Un rol sin categorías asignadas puede ver todas las denuncias.
 */
export const defineRolCategoria = (sequelize: Sequelize) => {
    return sequelize.define(
        'rol_categoria',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            rol_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'rol',
                    key: 'id',
                },
            },
            categoria_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'categoria_denuncia',
                    key: 'id',
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'rol_categoria',
            timestamps: false,
            indexes: [
                { fields: ['rol_id'] },
                { fields: ['categoria_id'] },
                { fields: ['rol_id', 'categoria_id'], unique: true },
            ],
        }
    );
};
