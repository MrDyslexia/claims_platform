import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { Config } from "./config.js";

export async function verifyAppCheck(req: Request, res: Response, next: NextFunction) {
  if (!Config.appCheckEnforce) return next();
  try {
    const token = req.header("X-Firebase-AppCheck") || req.header("x-firebase-appcheck");
    if (!token) return res.status(401).json({ error: "missing_app_check" });
    await admin.appCheck().verifyToken(token);
    return next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_app_check", msg: e });
  }
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    if (!token) return res.status(401).json({ error: "missing_auth" });
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.admin) return res.status(403).json({ error: "forbidden" });
    (req as any).user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_auth", msg: e });
  }
}

export function allowCors(allowedOrigins: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin || "";
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin || "*");
      res.set("Vary", "Origin");
    }
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Firebase-AppCheck");
    res.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).send("");
    next();
  };
}

export function getClientIp(req: Request): string {
  const xff = (req.headers["x-forwarded-for"] as string) || "";
  return (xff.split(",")[0] || (req as any).ip || "").trim();
}
