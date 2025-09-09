import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { sequelize, testConnection } from './db/sequelize';
import { initModels } from './models';
import routes from './routes';
import { requestLogger } from './middlewares/requestLogger';

async function bootstrap() {
  await testConnection();
  // Initialize models (associations)
  initModels(sequelize);

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.cors.length ? env.cors : true, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger());

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/api', routes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  });

  app.listen(env.port, () => console.log(`API listening on :${env.port}`));
}

bootstrap().catch((e) => { console.error('Bootstrap error', e); process.exit(1); });

