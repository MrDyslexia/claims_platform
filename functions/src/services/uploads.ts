import admin from "firebase-admin";
import crypto from "node:crypto";
import { Config } from "../config.js";

const bucket = () => admin.storage().bucket();

export function generateUploadId() {
  return crypto.randomBytes(16).toString("hex");
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

export async function createSignedUploadUrls(uploadId: string, files: { filename: string; contentType: string }[]) {
  const expires = Date.now() + Config.signedUrl.expiresMinutes * 60 * 1000;
  const entries = await Promise.all(
    files.map(async (f) => {
      const filename = sanitizeFilename(f.filename);
      const path = `uploads/${uploadId}/${filename}`;
      const [url] = await bucket()
        .file(path)
        .getSignedUrl({
          action: "write",
          expires,
          version: "v4",
          contentType: f.contentType
        });
      return { filename, contentType: f.contentType, storagePath: path, url, expires };
    })
  );
  return entries;
}

export async function moveUploadedFilesToReport(params: {
  uploadId: string;
  reportId: string;
  attachments: { filename: string; storagePath: string }[];
}) {
  const out: { filename: string; storagePath: string }[] = [];
  for (const a of params.attachments) {
    const src = bucket().file(a.storagePath);
    const destPath = `reports/${params.reportId}/attachments/${sanitizeFilename(a.filename)}`;
    await src.move(destPath);
    out.push({ filename: a.filename, storagePath: destPath });
  }
  return out;
}

export async function verifyObjectsExist(objs: { storagePath: string; size?: number }[]) {
  for (const o of objs) {
    const file = bucket().file(o.storagePath);
    const [exists] = await file.exists();
    if (!exists) return false;
    if (o.size != null) {
      const [meta] = await file.getMetadata();
      const gsSize = Number(meta.size || 0);
      if (gsSize !== o.size) return false;
    }
  }
  return true;
}

export async function getSignedDownloadUrl(storagePath: string) {
  const [url] = await bucket().file(storagePath).getSignedUrl({ action: "read", expires: Date.now() + 15 * 60 * 1000, version: "v4" });
  return url;
}

