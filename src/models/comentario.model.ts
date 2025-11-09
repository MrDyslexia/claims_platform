import { DataTypes, Sequelize } from 'sequelize';

export const defineComentario = (sequelize: Sequelize) => {
    return sequelize.define(
        'comentario',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
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
            es_interno: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            autor_nombre: {
                type: DataTypes.STRING(200),
                allowNull: true,
                validate: {
                    len: [0, 200],
                },
            },
            autor_email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            visibility: {
                type: DataTypes.ENUM('publico', 'interno', 'privado_analista'),
                allowNull: false,
                defaultValue: 'publico',
                comment: 'Nivel de visibilidad del comentario',
            },
            autor_rol: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Rol del autor en el momento de crear el comentario',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'comentario',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['usuario_id'] },
                { fields: ['created_at'] },
                { fields: ['denuncia_id', 'created_at'] },
            ],
        }
    );
};
