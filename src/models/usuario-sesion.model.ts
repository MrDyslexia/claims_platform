import { DataTypes, Sequelize } from 'sequelize';

export const defineUsuarioSesion = (sequelize: Sequelize) => {
    return sequelize.define(
        'usuario_sesion',
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
            jti: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [36, 36],
                },
            },
            emitido_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            expira_at: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    isAfterEmitido(value: Date) {
                        if (this.emitido_at && value <= this.emitido_at) {
                            throw new Error(
                                'expira_at debe ser posterior a emitido_at'
                            );
                        }
                    },
                },
            },
            revocado_at: { type: DataTypes.DATE, allowNull: true },
            ip: {
                type: DataTypes.STRING(45),
                allowNull: true,
                validate: {
                    isIP: true,
                },
            },
            user_agent: {
                type: DataTypes.STRING(300),
                allowNull: true,
                validate: {
                    len: [0, 300],
                },
            },
        },
        {
            tableName: 'usuario_sesion',
            timestamps: false,
            indexes: [
                { fields: ['jti'], unique: true },
                { fields: ['usuario_id'] },
                { fields: ['expira_at'] },
                { fields: ['revocado_at'] },
                { fields: ['usuario_id', 'expira_at', 'revocado_at'] },
            ],
        }
    );
};
