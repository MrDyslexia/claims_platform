import { DataTypes, Sequelize } from 'sequelize';

/**
 * IMPORTANTE: Este modelo representa una VISTA SQL de la base de datos (v_denuncia_lookup).
 * Las vistas no deben usarse para crear, actualizar o eliminar registros.
 * Solo para lectura (SELECT).
 *
 * Si necesitas usar esta vista, asegúrate de:
 * 1. Solo hacer consultas SELECT
 * 2. No intentar crear, actualizar o eliminar registros
 * 3. Considerar usar una query cruda si necesitas más control
 */
export const defineVDenunciaLookup = (sequelize: Sequelize) => {
    return sequelize.define(
        'v_denuncia_lookup',
        {
            id: { type: DataTypes.BIGINT, primaryKey: true },
            numero: { type: DataTypes.STRING(20) },
            estado_id: { type: DataTypes.BIGINT },
            empresa_id: { type: DataTypes.BIGINT },
            tipo_id: { type: DataTypes.BIGINT },
            created_at: { type: DataTypes.DATE },
            updated_at: { type: DataTypes.DATE },
            clave_hash: { type: DataTypes.BLOB },
            clave_salt: { type: DataTypes.BLOB },
        },
        {
            tableName: 'v_denuncia_lookup',
            timestamps: false,
        }
    );
};
