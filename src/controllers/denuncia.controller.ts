import type { Request, Response } from 'express';
import { sequelize } from '../db/sequelize';
import { initModels } from '../models';
import { verifyClaveWithSalt } from '../utils/crypto';

const models = initModels(sequelize);

export const crearDenuncia = async (req: Request & { user?: any }, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.empresa_id || !payload.tipo_id || !payload.estado_id || !payload.asunto || !payload.descripcion) {
      return res.status(400).json({ error: 'missing fields' });
    }
    const created_by = req.user?.get?.('id') ?? null;
    const d = await models.Denuncia.create({ ...payload, created_by });
    // numero/clave are triggered in DB; we can return numero
    return res.status(201).json({ id: d.get('id'), numero: d.get('numero') });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const lookupDenuncia = async (req: Request, res: Response) => {
  const { numero, clave } = req.query as any;
  if (!numero || !clave) return res.status(400).json({ error: 'numero and clave required' });
  const row = await models.VDenunciaLookup.findOne({ where: { numero } });
  if (!row) return res.status(404).json({ error: 'not found' });
  const ok = verifyClaveWithSalt(String(clave), row.get('clave_salt') as Buffer, row.get('clave_hash') as Buffer);
  if (!ok) return res.status(401).json({ error: 'clave invalida' });
  return res.json({ id: row.get('id'), estado_id: row.get('estado_id'), empresa_id: row.get('empresa_id'), tipo_id: row.get('tipo_id'), numero });
};

export const crearComentario = async (req: Request, res: Response) => {
  const { denuncia_id, contenido, autor_nombre, autor_email } = req.body;
  if (!denuncia_id || !contenido) return res.status(400).json({ error: 'missing fields' });
  try {
    const c = await models.Comentario.create({ denuncia_id, contenido, autor_nombre, autor_email });
    return res.status(201).json({ id: c.get('id') });
  } catch (e: any) {
    // surface trigger messages
    return res.status(400).json({ error: e.message });
  }
};

export const crearResolucion = async (req: Request & { user?: any }, res: Response) => {
  const { denuncia_id, contenido, pdf_path } = req.body;
  if (!denuncia_id || !contenido) return res.status(400).json({ error: 'missing fields' });
  const resuelto_por = req.user?.get?.('id');
  if (!resuelto_por) return res.status(401).json({ error: 'unauthorized' });
  try {
    const r = await models.Resolucion.create({ denuncia_id, contenido, resuelto_por, pdf_path });
    return res.status(201).json({ id: r.get('id') });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const asignarDenuncia = async (req: Request & { user?: any }, res: Response) => {
  const { denuncia_id, usuario_id } = req.body;
  if (!denuncia_id || !usuario_id) return res.status(400).json({ error: 'missing fields' });
  const asignado_por = req.user?.get?.('id');
  if (!asignado_por) return res.status(401).json({ error: 'unauthorized' });
  try {
    await models.DenunciaAsignacion.create({ denuncia_id, usuario_id, asignado_por, activo: 1 });
    await models.Reasignacion.create({ denuncia_id, de_usuario_id: null, a_usuario_id: usuario_id, reasignado_por: asignado_por });
    return res.status(201).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

