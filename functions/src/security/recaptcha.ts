import fetch from "node-fetch";
import { Config } from "../config.js";

export async function verifyRecaptcha(token?: string) {
  if (!Config.recaptchaSecret) return true; // deshabilitado si no hay secret
  if (!token) return false;
  const params = new URLSearchParams();
  params.set("secret", Config.recaptchaSecret);
  params.set("response", token);
  const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body: params });
  const data = (await resp.json()) as any;
  return Boolean(data.success) && (data.score == null || data.score >= 0.3);
}

