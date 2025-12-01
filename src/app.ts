import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { sequelize, testConnection } from './db/sequelize';
import routes from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { startCleanupScheduler } from './services/upload.service';

async function bootstrap() {
    // Test connection first
    await testConnection();

    // Initialize app immediately (don't wait for sync in development)
    const app = express();
    app.use(helmet());

    // Configure CORS: use env.cors as a whitelist array. If empty, allow all origins.
    const allowedOrigins: string[] = env.cors || [];
    const corsOptions = {
        origin: function (incomingOrigin: any, callback: any) {
            // If no origin (e.g. server-to-server or curl), allow}
            if (!incomingOrigin) return callback(null, true);
            // If no whitelist provided, allow all origins
            if (!allowedOrigins || allowedOrigins.length === 0)
                return callback(null, true);
            if (allowedOrigins.includes(incomingOrigin))
                return callback(null, true);
            return callback(
                new Error(
                    `Not allowed by CORS, origin denied ${incomingOrigin}`
                )
            );
        },
        credentials: true,
    };

    // Enable CORS for all routes and handle preflight requests globally
    app.use(cors(corsOptions));
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            res.header(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, OPTIONS'
            );
            res.sendStatus(204);
        } else {
            next();
        }
    });
    app.use(express.json({ limit: '5mb' }));
    app.use(requestLogger());

    app.get('/', (req, res) => res.json({ ok: true }));
    app.use('/api', routes);

    app.use((err: any, _req: any, res: any, _next: any) => {
        console.error(err);
        res.status(500).json({ error: 'internal_error' });
    });

    app.listen(env.port, () => console.log(`API listening on :${env.port}`));

    // Iniciar scheduler de limpieza automática de archivos temporales
    startCleanupScheduler();
    console.log('📁 Upload cleanup scheduler iniciado');

    // Sync database in background (development only)
    // DISABLED: Causing "Too many keys" error. Use migrations instead.
    // if (env.nodeEnv === 'development') {
    //     const { syncDatabase } = await import('./db/sequelize');
    //     syncDatabase({ alter: true }).catch((e) =>
    //         console.error('Database sync error:', e)
    //     );
    // }
}

bootstrap().catch((e) => {
    console.error('Bootstrap error', e);
    process.exit(1);
});
