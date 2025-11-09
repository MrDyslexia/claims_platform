import { DataTypes, Sequelize } from 'sequelize';

export const defineExportAuditoria = (sequelize: Sequelize) => {
    return sequelize.define(
        'export_auditoria',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            tipo: {
                type: DataTypes.ENUM('LISTADO', 'DETALLE'),
                allowNull: false,
                validate: {
                    isIn: [['LISTADO', 'DETALLE']],
                },
            },
            formato: {
                type: DataTypes.ENUM('CSV', 'XLSX', 'PDF'),
                allowNull: false,
                validate: {
                    isIn: [['CSV', 'XLSX', 'PDF']],
                },
            },
            filtros_json: { type: DataTypes.JSON, allowNull: true },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            archivo_path: {
                type: DataTypes.STRING(600),
                allowNull: true,
                validate: {
                    len: [0, 600],
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'export_auditoria',
            timestamps: false,
            indexes: [
                { fields: ['usuario_id'] },
                { fields: ['tipo'] },
                { fields: ['created_at'] },
                { fields: ['usuario_id', 'created_at'] },
            ],
        }
    );
};
