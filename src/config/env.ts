import 'dotenv/config';

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3003),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'denuncias_app',
    },
    cors: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    jwt: {
        secret: process.env.JWT_SECRET || 'change_this_secret',
        ttlSeconds: Number(process.env.JWT_TTL || 3600),
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'noreply@denuncias.com',
    },
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',
    },
};
