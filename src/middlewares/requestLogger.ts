import onFinished from 'on-finished';
import type { Request, Response, NextFunction } from 'express';
import { sequelize } from '../db/sequelize';

export function requestLogger() {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const start = Date.now();
    onFinished(res, async () => {
      try {
        const endpoint = req.originalUrl.split('?')[0];
        const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
        const status = res.statusCode;
        const usuario_id = req.user?.get?.('id') ?? null;
        await sequelize.query(
          `INSERT INTO api_request_log (endpoint, ip, usuario_id, status_code) VALUES (?, ?, ?, ?)`,
          { replacements: [endpoint, ip, usuario_id, status] }
        );
      } catch (e) {
        // swallow logging errors
      }
    });
    next();
  };
}

