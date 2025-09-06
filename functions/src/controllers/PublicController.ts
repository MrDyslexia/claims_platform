import type { Request, Response } from "express";
import { HttpsError } from "firebase-functions/v2/https";
import { getClientIp } from "../middleware.js";
import { CreateReportRequestSchema, SignUploadsRequestSchema } from "../validators.js";
import { createSignedUploadUrls, generateUploadId, moveUploadedFilesToReport, verifyObjectsExist } from "../services/uploads.js";
import { verifyRecaptcha } from "../security/recaptcha.js";
import { admin, db } from "../config/firebase.js";
import { sendNewReportEmail } from "../services/email.js";

export async function handleSignUploads(req: Request, res: Response) {
  const ip = getClientIp(req);
  await checkRateLimit(ip);
  const parsed = SignUploadsRequestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() }); return; }
  const ok = await verifyRecaptcha(parsed.data.recaptchaToken);
  if (!ok) { res.status(400).json({ error: "recaptcha_failed" }); return; }
  const uploadId = generateUploadId();
  const signed = await createSignedUploadUrls(uploadId, parsed.data.files);
  res.json({ uploadId, signed });
}

export async function handleCreateReport(req: Request, res: Response) {
  const ip = getClientIp(req);
  await checkRateLimit(ip);
  const parsed = CreateReportRequestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() }); return; }
  const body = parsed.data;
  const captchaOk = await verifyRecaptcha(body.recaptchaToken);
  if (!captchaOk) { res.status(400).json({ error: "recaptcha_failed" }); return; }

  const exist = await verifyObjectsExist(body.attachments.map(a => ({ storagePath: a.storagePath, size: a.size })));
  if (!exist) { res.status(400).json({ error: "attachments_missing" }); return; }

  const docRef = db.collection("reports").doc();
  const reportId = docRef.id;
  const now = admin.firestore.FieldValue.serverTimestamp();
  await docRef.set({
    type: body.type,
    details: body.details,
    isAnonymous: body.isAnonymous,
    contact: body.contact || null,
    status: "new",
    createdAt: now,
    admin: { assignedTo: null, lastUpdateAt: now },
    attachments: []
  });

  const moved = await moveUploadedFilesToReport({ uploadId: body.uploadId, reportId, attachments: body.attachments });
  await docRef.update({
    attachments: moved.map((m, i) => ({
      filename: m.filename,
      storagePath: m.storagePath,
      contentType: body.attachments[i].contentType,
      size: body.attachments[i].size
    }))
  });

  const createdSnap = await docRef.get();
  const createdAt = createdSnap.get("createdAt")?.toDate?.()?.toISOString?.() || new Date().toISOString();
  await sendNewReportEmail({ caseId: reportId, type: body.type, createdAt, preview: body.details.slice(0, 400) }).catch(() => {});
  res.json({ caseId: reportId });
}

// Simple rate limit using Firestore windowed counters (shared with index)
async function checkRateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 1000; // duplicated default; align with Config if needed
  const key = `${Math.floor(now / windowMs)}_${ip.replace(/[^a-zA-Z0-9:_-]/g, "_")}`;
  const ref = db.collection("rateLimits").doc(key);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      tx.set(ref, { count: 1, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      const count = (snap.get("count") as number) || 0;
      if (count >= 10) throw new HttpsError("resource-exhausted", "rate_limited");
      tx.update(ref, { count: admin.firestore.FieldValue.increment(1) });
    }
  });
}

