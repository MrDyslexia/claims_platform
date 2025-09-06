// Interfaces de API (requests/responses) y auxiliares
// Útiles para tipar integraciones en frontend o servicios externos.

import type { ReportDTO, ReportAttachment } from "./models.js";

// Auxiliares
export interface IFileMeta {
  filename: string;
  contentType: string;
  size: number; // bytes, límite recomendado 20MB por archivo
}

// Requests públicos
export interface ISignUploadsRequest {
  recaptchaToken: string;
  files: IFileMeta[]; // metadatos de los archivos a subir
}

export interface ISignedUploadEntry {
  filename: string;
  contentType: string;
  storagePath: string; // ruta temporal en GCS (uploads/{uploadId}/{filename})
  url: string; // URL firmada para PUT directo a GCS
  expires: number; // epoch millis
}

export interface ISignUploadsResponse {
  uploadId: string;
  signed: ISignedUploadEntry[];
}

export interface ICreateReportAttachment extends IFileMeta {
  storagePath: string; // ruta temporal devuelta por signUploads
}

export interface IContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ICreateReportRequest {
  recaptchaToken?: string; // puede omitirse si reCAPTCHA está deshabilitado en entorno
  uploadId: string;
  type: string;
  details: string;
  isAnonymous: boolean;
  contact?: IContact;
  attachments: ICreateReportAttachment[]; // puede ser [] si no hay adjuntos
}

export interface ICreateReportResponse {
  caseId: string;
}

// Admin
export interface IUpdateReportRequest {
  status?: "new" | "triage" | "in_progress" | "closed";
  assignedTo?: string;
  note?: string;
}

export interface IListReportsResponse {
  items: ReportDTO[];
}

export type IGetReportResponse = ReportDTO;

export interface IAdminAttachmentUrlResponse {
  url: string;
}

// Conversión de adjuntos si se requiere en integraciones
export type IReportAttachment = ReportAttachment;

