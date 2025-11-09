import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { initModels } from '../models';

export const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.password,
    {
        host: env.db.host,
        port: env.db.port,
        dialect: 'mysql',
        logging: false, // Desactivar logs SQL de Sequelize
        dialectOptions: {
            multipleStatements: true,
        },
        // Performance optimizations
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        // Disable timestamps for faster queries by default
        define: {
            timestamps: false,
        },
    }
);

// Initialize models once and export them
export const models = initModels(sequelize);

export async function testConnection() {
    await sequelize.authenticate();
}

/**
 * Synchronize database schema with models (Development only)
 * Use this for development to auto-create tables.
 * For production, use SQL migrations instead.
 */
export async function syncDatabase(
    options: { force?: boolean; alter?: boolean } = {}
) {
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync(options);
    console.log('✅ Base de datos sincronizada correctamente');
}
