import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sequelize } from '../db/sequelize';
import { initModels } from '../models';

const models = initModels(sequelize);

export interface JwtPayload { sub: string; jti: string; exp: number; }

export function signJwt(userId: string, jti: string, ttlSeconds: number) {
  return jwt.sign({ sub: userId, jti }, env.jwt.secret, { expiresIn: ttlSeconds });
}

export async function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    const [rows] = await sequelize.query(`SELECT * FROM usuario_sesion WHERE jti = ? AND revocado_at IS NULL AND expira_at > NOW() LIMIT 1`, { replacements: [decoded.jti] });
    const session = (rows as any[])[0];
    if (!session) return res.status(401).json({ error: 'invalid session' });
    const user = await models.Usuario.findByPk(decoded.sub);
    if (!user) return res.status(401).json({ error: 'user not found' });
    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function requirePermission(codigo: string) {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    const sql = `
      SELECT p.codigo FROM usuario_rol ur
      JOIN rol r ON r.id = ur.rol_id
      JOIN rol_permiso rp ON rp.rol_id = r.id
      JOIN permiso p ON p.id = rp.permiso_id
      WHERE ur.usuario_id = ? AND p.codigo = ? LIMIT 1
    `;
    const [rows] = await sequelize.query(sql, { replacements: [req.user.get('id'), codigo] });
    if ((rows as any[]).length === 0) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

