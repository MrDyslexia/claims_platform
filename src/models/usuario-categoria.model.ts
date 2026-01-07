import { DataTypes, Sequelize } from 'sequelize';

/**
 * Tabla de unión para asociar usuarios (admin) con categorías de denuncia.
 * Un admin con categorías asignadas solo puede ver denuncias de esas categorías.
 * Un admin sin categorías asignadas puede ver todas las denuncias.
 */
export const defineUsuarioCategoria = (sequelize: Sequelize) => {
    return sequelize.define(
        'usuario_categoria',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'usuario',
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
            tableName: 'usuario_categoria',
            timestamps: false,
            indexes: [
                { fields: ['usuario_id'] },
                { fields: ['categoria_id'] },
                { fields: ['usuario_id', 'categoria_id'], unique: true },
            ],
        }
    );
};
