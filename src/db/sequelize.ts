import { Sequelize } from 'sequelize';
import { env } from '../config/env';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.nodeEnv === 'development' ? console.log : false,
  timezone: env.db.timezone,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function testConnection() {
  await sequelize.authenticate();
}

