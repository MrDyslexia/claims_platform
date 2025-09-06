import { Timestamp } from "firebase-admin/firestore";

export type ReportStatus = "new" | "triage" | "in_progress" | "closed";

export interface Contact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ReportAttachment {
  filename: string;
  contentType: string;
  size: number;
  storagePath: string;
}

export interface ReportAdminMeta {
  assignedTo: string | null;
  lastUpdateAt: Timestamp; // serverTimestamp()
}

// Documento principal en Firestore: reports/{reportId}
export interface ReportDoc {
  type: string; // categoría/tipo de denuncia
  details: string; // descripción de la denuncia
  isAnonymous: boolean;
  contact: Contact | null; // null cuando es anónima
  status: ReportStatus; // flujo de gestión
  createdAt: Timestamp; // serverTimestamp()
  admin: ReportAdminMeta;
  attachments: ReportAttachment[]; // ubicaciones en Storage
}

// Subcolección: reports/{reportId}/updates/{updateId}
export interface ReportUpdateDoc {
  at: Timestamp; // serverTimestamp()
  by: string | null; // uid de admin que actualiza (o null si no aplica)
  note?: string; // comentario interno opcional
  statusChange?: ReportStatus | null; // cambio de estado opcional
}

// Colección auxiliar para rate limit: rateLimits/{window_ip}
export interface RateLimitDoc {
  count: number;
  createdAt: Timestamp; // serverTimestamp()
}

// Formatos “DTO” para exponer por HTTP (timestamps como ISO)
export interface ReportDTO extends Omit<ReportDoc, "createdAt" | "admin"> {
  id: string;
  createdAt: string; // ISO
  admin: Omit<ReportAdminMeta, "lastUpdateAt"> & { lastUpdateAt: string };
}

export function toReportDTO(id: string, doc: ReportDoc): ReportDTO {
  return {
    id,
    type: doc.type,
    details: doc.details,
    isAnonymous: doc.isAnonymous,
    contact: doc.contact,
    status: doc.status,
    attachments: doc.attachments,
    createdAt: doc.createdAt.toDate().toISOString(),
    admin: {
      assignedTo: doc.admin.assignedTo,
      lastUpdateAt: doc.admin.lastUpdateAt.toDate().toISOString()
    }
  };
}

