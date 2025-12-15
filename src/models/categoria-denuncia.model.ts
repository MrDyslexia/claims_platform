import { DataTypes, Sequelize } from 'sequelize';

export const defineCategoriaDenuncia = (sequelize: Sequelize) => {
    return sequelize.define(
        'categoria_denuncia',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            nombre: {
                type: DataTypes.STRING(150),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            icono: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            activo: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
            },
        },
        {
            tableName: 'categoria_denuncia',
            timestamps: false,
        }
    );
};
