import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError } from "firebase-functions/v2/https";
import { admin, db } from "./config/firebase.js";
import fetch from "node-fetch";
import { Config } from "./config.js";
import { allowCors, requireAdminAuth, verifyAppCheck } from "./middleware.js";
import { getSignedDownloadUrl } from "./services/uploads.js";
import { initEmail } from "./services/email.js";
import { handleCreateReport, handleSignUploads } from "./controllers/PublicController.js";
import { getReport, listReports, updateReport } from "./controllers/AdminController.js";
import { readFileSync, existsSync } from "node:fs";

setGlobalOptions({ region: Config.region as any, maxInstances: 100, memory: "512MiB", timeoutSeconds: 60 });

initEmail();

// Mantengo la lógica de rate limit y recaptcha movida a controladores/seguridad para parecerse a tu repo modular.

// Middleware manual para CORS y App Check (simple)
import type { Request, Response } from "express";

const withCommon = (handler: (req: Request, res: Response) => Promise<void> | void) => onRequest({ cors: false }, async (req: Request, res: Response) => {
  const corsMw = allowCors(Config.corsAllowedOrigins);
  await new Promise<void>((resolve) => corsMw(req as any, res as any, () => resolve()));
  if (req.method === "OPTIONS") {
    return; // 204 ya enviado por CORS
  }
  const appCheckMw = verifyAppCheck as any;
  await new Promise<void>((resolve) => appCheckMw(req as any, res as any, () => resolve()));
  if (res.headersSent) return;
  try {
    await handler(req, res);
  } catch (e: any) {
    console.error("handler_error", e);
    res.status(500).json({ error: "internal" });
  }
});

// OpenAPI JSON
export const openapi = onRequest({ cors: false }, async (req: Request, res: Response) => {
  const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
  // base = host + path sin el nombre de función actual (p.ej., .../us-central1)
  const base = url.href.replace(/\/?openapi.*$/i, "");
  // Intentar cargar desde lib/openapi.json o desde src/openapi.json en desarrollo
  let raw: string;
  try {
    const specLib = new URL("./openapi.json", import.meta.url);
    if (existsSync(specLib)) {
      raw = readFileSync(specLib, "utf8");
    } else {
      const specSrc = new URL("../src/openapi.json", import.meta.url);
      raw = readFileSync(specSrc, "utf8");
    }
  } catch (e) {
    res.status(500).json({ error: "openapi_not_found" });
    return;
  }
  const spec = JSON.parse(raw);
  spec.servers = [{ url: base }];
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(spec));
});

// Swagger UI (HTML)
export const swagger = onRequest({ cors: false }, async (req: Request, res: Response) => {
  const here = req.protocol + "://" + req.get("host") + req.originalUrl;
  const docUrl = here.replace(/\/?swagger.*$/i, "/openapi");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>body { margin: 0; } #swagger-ui { height: 100vh; }</style>
 </head>
 <body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: ${JSON.stringify(docUrl)},
      dom_id: '#swagger-ui'
    });
  </script>
 </body>
 </html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

// POST /api/attachments/sign
export const signUploads = withCommon(async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }
  await handleSignUploads(req as any, res as any);
});

// POST /api/report
export const createReport = withCommon(async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }
  await handleCreateReport(req as any, res as any);
});

// Admin: lista de denuncias
export const adminListReports = onRequest({ cors: false }, async (req, res) => {
  const corsMw = allowCors(Config.corsAllowedOrigins);
  await new Promise<void>((resolve) => corsMw(req as any, res as any, () => resolve()));
  if (req.method === "OPTIONS") return; 
  const authMw = requireAdminAuth as any;
  await new Promise<void>((resolve) => authMw(req as any, res as any, () => resolve()));
  if (res.headersSent) return;
  await listReports(req as any, res as any);
});

// Admin: detalle de denuncia
export const adminGetReport = onRequest({ cors: false }, async (req, res) => {
  const corsMw = allowCors(Config.corsAllowedOrigins);
  await new Promise<void>((resolve) => corsMw(req as any, res as any, () => resolve()));
  if (req.method === "OPTIONS") return; 
  const authMw = requireAdminAuth as any;
  await new Promise<void>((resolve) => authMw(req as any, res as any, () => resolve()));
  if (res.headersSent) return;
  await getReport(req as any, res as any);
});

// Admin: actualizar estado/asignación/nota
export const adminUpdateReport = onRequest({ cors: false }, async (req, res) => {
  const corsMw = allowCors(Config.corsAllowedOrigins);
  await new Promise<void>((resolve) => corsMw(req as any, res as any, () => resolve()));
  if (req.method === "OPTIONS") return; 
  const authMw = requireAdminAuth as any;
  await new Promise<void>((resolve) => authMw(req as any, res as any, () => resolve()));
  if (res.headersSent) return;
  if (req.method !== "PATCH") { res.status(405).json({ error: "method_not_allowed" }); return; }
  await updateReport(req as any, res as any);
});

// Admin: URL firmada para descargar adjunto
export const adminGetAttachmentUrl = onRequest({ cors: false }, async (req, res) => {
  const corsMw = allowCors(Config.corsAllowedOrigins);
  await new Promise<void>((resolve) => corsMw(req as any, res as any, () => resolve()));
  if (req.method === "OPTIONS") return; 
  const authMw = requireAdminAuth as any;
  await new Promise<void>((resolve) => authMw(req as any, res as any, () => resolve()));
  if (res.headersSent) return;
  const storagePath = (req.query.path as string) || "";
  if (!storagePath.startsWith("reports/")) { res.status(400).json({ error: "invalid_path" }); return; }
  const url = await getSignedDownloadUrl(storagePath);
  res.json({ url });
});
