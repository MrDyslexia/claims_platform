import { DataTypes, Sequelize } from 'sequelize';

/**
 * Tabla de control de secuencias para números de denuncias.
 *
 * Esta tabla mantiene el correlativo de denuncias por año.
 * No tiene relaciones ORM porque es una tabla de control del sistema.
 *
 * Uso: Consultar y actualizar el contador anual de denuncias.
 * Ejemplo: seq_denuncia_2025 = { anio: 2025, correlativo: 1000 }
 */
export const defineSeqDenuncia = (sequelize: Sequelize) => {
    return sequelize.define(
        'seq_denuncia',
        {
            anio: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                validate: {
                    isInt: true,
                    min: 2000,
                    max: 2100,
                },
            },
            correlativo: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 0,
                },
            },
        },
        {
            tableName: 'seq_denuncia',
            timestamps: false,
            indexes: [{ fields: ['anio'], unique: true }],
        }
    );
};
