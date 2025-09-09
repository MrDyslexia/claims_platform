import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'denuncias_app',
    timezone: process.env.DB_TIMEZONE || 'Z'
  },
  cors: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    ttlSeconds: Number(process.env.JWT_TTL || 3600)
  }
};

