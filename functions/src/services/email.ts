import sgMail from "@sendgrid/mail";
import { Config } from "../config.js";

export function initEmail() {
  if (Config.notify.enabled && Config.notify.sendgridKey) {
    sgMail.setApiKey(Config.notify.sendgridKey);
  }
}

export async function sendNewReportEmail(params: {
  caseId: string;
  type: string;
  createdAt: string;
  preview: string;
}) {
  if (!Config.notify.enabled) return;
  const { caseId, type, createdAt, preview } = params;
  const to = Config.notify.to;
  if (!to) return;
  const subject = `${Config.notify.subjectPrefix} ${caseId}`;
  const text = `Nueva denuncia recibida\n\nCaso: ${caseId}\nTipo: ${type}\nFecha: ${createdAt}\n\nResumen:\n${preview}\n`;
  await sgMail.send({
    to,
    from: Config.notify.from,
    subject,
    text
  });
}

