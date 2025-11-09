import { DataTypes, Sequelize } from 'sequelize';

export const defineAdjunto = (sequelize: Sequelize) => {
    return sequelize.define(
        'adjunto',
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
            tipo_vinculo: {
                type: DataTypes.ENUM(
                    'DENUNCIA',
                    'COMENTARIO',
                    'RESOLUCION',
                    'EXPORT',
                    'OTRO'
                ),
                allowNull: false,
                validate: {
                    isIn: [
                        [
                            'DENUNCIA',
                            'COMENTARIO',
                            'RESOLUCION',
                            'EXPORT',
                            'OTRO',
                        ],
                    ],
                },
            },
            nombre_archivo: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 300],
                },
            },
            ruta: {
                type: DataTypes.STRING(600),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 600],
                },
            },
            mime_type: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [3, 150],
                },
            },
            tamano_bytes: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
            checksum_sha256: { type: DataTypes.BLOB, allowNull: true },
            subref_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            subref_tabla: {
                type: DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    len: [0, 50],
                },
            },
            subido_por: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'adjunto',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['tipo_vinculo'] },
                { fields: ['created_at'] },
                { fields: ['subref_id', 'subref_tabla'] },
            ],
        }
    );
};
