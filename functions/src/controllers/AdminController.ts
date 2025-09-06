import type { Request, Response } from "express";
import { admin, db } from "../config/firebase.js";
import { UpdateReportSchema } from "../validators.js";

export async function listReports(req: Request, res: Response) {
  const status = (req.query.status as string) || undefined;
  const limit = Math.min(parseInt((req.query.limit as string) || "50", 10), 200);
  let q = db.collection("reports").orderBy("createdAt", "desc").limit(limit);
  if (status) q = q.where("status", "==", status) as any;
  const snap = await q.get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json({ items });
}

export async function getReport(req: Request, res: Response) {
  const id = (req.query.id as string) || "";
  if (!id) { res.status(400).json({ error: "missing_id" }); return; }
  const doc = await db.collection("reports").doc(id).get();
  if (!doc.exists) { res.status(404).json({ error: "not_found" }); return; }
  res.json({ id: doc.id, ...doc.data() });
}

export async function updateReport(req: Request, res: Response) {
  const id = (req.query.id as string) || "";
  if (!id) { res.status(400).json({ error: "missing_id" }); return; }
  const parsed = UpdateReportSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() }); return; }
  const updates: any = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.assignedTo !== undefined) updates["admin.assignedTo"] = parsed.data.assignedTo;
  updates["admin.lastUpdateAt"] = admin.firestore.FieldValue.serverTimestamp();
  await db.collection("reports").doc(id).update(updates);
  if (parsed.data.note) {
    await db.collection("reports").doc(id).collection("updates").add({
      at: admin.firestore.FieldValue.serverTimestamp(),
      by: (req as any).user?.uid || null,
      note: parsed.data.note,
      statusChange: parsed.data.status || null
    });
  }
  res.json({ ok: true });
}

