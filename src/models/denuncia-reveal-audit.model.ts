import { DataTypes, Sequelize } from 'sequelize';

export const defineDenunciaRevealAudit = (sequelize: Sequelize) => {
    return sequelize.define(
        'denuncia_reveal_audit',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            denuncia_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'denuncia',
                    key: 'id',
                },
            },
            requested_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: 'usuario',
                    key: 'id',
                },
                comment:
                    'Usuario que solicitó el reveal (NULL si fue con recovery code)',
            },
            method: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    isIn: [['recovery_code', 'forced_override']],
                },
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Justificación para reveal forzado',
            },
            remote_ip: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'denuncia_reveal_audit',
            timestamps: false,
            indexes: [
                { fields: ['denuncia_id'] },
                { fields: ['requested_by'] },
                { fields: ['created_at'] },
            ],
        }
    );
};
