import { DataTypes, Sequelize } from 'sequelize';

export const defineAPIRequestLog = (sequelize: Sequelize) => {
    return sequelize.define(
        'api_request_log',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            usuario_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 1,
                },
            },
            metodo: {
                type: DataTypes.STRING(10),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isIn: [
                        [
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE',
                            'OPTIONS',
                            'HEAD',
                        ],
                    ],
                },
            },
            ruta: {
                type: DataTypes.STRING(300),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 300],
                },
            },
            modulo: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    len: [0, 100],
                },
                comment:
                    'Módulo o recurso afectado (auth, users, claims, companies, reports, etc.)',
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 100,
                    max: 599,
                },
            },
            duracion_ms: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
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
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'api_request_log',
            timestamps: false,
            indexes: [
                { fields: ['usuario_id'] },
                { fields: ['metodo'] },
                { fields: ['modulo'] },
                { fields: ['status'] },
                { fields: ['created_at'] },
                { fields: ['ruta'] },
                { fields: ['usuario_id', 'created_at'] },
                { fields: ['modulo', 'created_at'] },
            ],
        }
    );
};
