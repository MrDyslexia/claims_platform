import { params } from "firebase-functions";

// Configuración leída desde variables de entorno de Firebase Functions
// Configura con: firebase functions:config:set key=value

export const Config = {
  projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "",
  region: process.env.FUNCTIONS_REGION || "us-central1",
  corsAllowedOrigins:
    (process.env.CORS_ALLOWED_ORIGINS?.split(",") || (params as any).cors?.allowed_origins?.split(",") || ["*"]),
  recaptchaSecret: process.env.RECAPTCHA_SECRET || (params as any).recaptcha?.secret || "",
  appCheckEnforce: ((process.env.APPCHECK_ENFORCE || (params as any).appcheck?.enforce || "false").toString() === "true"),
  notify: {
    enabled: ((process.env.NOTIFY_ENABLED || (params as any).notify?.enabled || "false").toString() === "true"),
    sendgridKey: process.env.SENDGRID_KEY || (params as any).sendgrid?.key || "",
    to: process.env.NOTIFY_TO || (params as any).notify?.to || "",
    from: process.env.NOTIFY_FROM || (params as any).notify?.from || "noreply@example.com",
    subjectPrefix: process.env.NOTIFY_SUBJECT_PREFIX || (params as any).notify?.subject_prefix || "[Nueva Denuncia]"
  },
  rateLimit: {
    windowSec: parseInt((process.env.RATELIMIT_WINDOW_SEC || (params as any).ratelimit?.window_sec || "60") as string, 10),
    max: parseInt((process.env.RATELIMIT_MAX || (params as any).ratelimit?.max || "10") as string, 10)
  },
  signedUrl: {
    expiresMinutes: parseInt((process.env.SIGNEDURL_EXPIRES_MIN || (params as any).signedurl?.expires_min || "15") as string, 10)
  }
};
