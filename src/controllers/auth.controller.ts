import type { Request, Response } from 'express';
import { sequelize } from '../db/sequelize';
import { initModels } from '../models';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { signJwt } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const models = initModels(sequelize);

export const register = async (req: Request, res: Response) => {
  const { rut, nombre_completo, email, password } = req.body;
  if (!rut || !nombre_completo || !email || !password) return res.status(400).json({ error: 'missing fields' });
  const pass_hash = await bcrypt.hash(password, 10);
  try {
    const user = await models.Usuario.create({ rut, nombre_completo, email, pass_hash });
    return res.status(201).json({ id: user.get('id'), email });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  const user = await models.Usuario.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, String(user.get('pass_hash')));
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const jti = uuidv4();
  const ttl = env.jwt.ttlSeconds;
  const token = signJwt(String(user.get('id')), jti, ttl);
  const emitido_at = new Date();
  const expira_at = new Date(Date.now() + ttl * 1000);
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
  const user_agent = req.headers['user-agent'] || '';
  await models.UsuarioSesion.create({ usuario_id: user.get('id'), jti, emitido_at, expira_at, ip, user_agent });
  await user.update({ last_login_at: new Date() });
  return res.json({ token, exp: Math.floor(expira_at.getTime() / 1000) });
};

export const logout = async (req: Request & { user?: any }, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice(7);
  try {
    const payload: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    if (payload?.jti) {
      await sequelize.query(`UPDATE usuario_sesion SET revocado_at = NOW() WHERE jti = ?`, { replacements: [payload.jti] });
    }
  } catch {}
  return res.json({ ok: true });
};

