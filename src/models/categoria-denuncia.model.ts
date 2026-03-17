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
            permite_anonimo: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: 'Indica si la categoría permite denuncias anónimas (0=No, 1=Sí). Ley Karin requiere identificación.',
            },
        },
        {
            tableName: 'categoria_denuncia',
            timestamps: false,
        }
    );
};
