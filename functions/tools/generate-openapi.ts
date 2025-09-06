import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Importar esquemas Zod existentes
import {
  FileMetaSchema,
  SignUploadsRequestSchema,
  CreateReportRequestSchema,
  UpdateReportSchema
} from "../src/validators.js";

// Definir esquemas adicionales para respuestas y modelos
const ReportAttachment = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number().int().nonnegative(),
  storagePath: z.string()
});

const Contact = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

const Report = z.object({
  id: z.string().optional(),
  type: z.string(),
  details: z.string(),
  isAnonymous: z.boolean(),
  contact: Contact.optional().nullable(),
  status: z.enum(["new", "triage", "in_progress", "closed"]).optional(),
  createdAt: z.string().optional(),
  admin: z.object({ assignedTo: z.string().nullable().optional(), lastUpdateAt: z.string().optional() }).optional(),
  attachments: z.array(ReportAttachment).optional()
});

const CreateReportResponse = z.object({ caseId: z.string() });
const OkResponse = z.object({ ok: z.boolean() });
const AdminAttachmentUrlResponse = z.object({ url: z.string() });

const SignUploadsResponse = z.object({
  uploadId: z.string(),
  signed: z.array(z.object({
    filename: z.string(),
    contentType: z.string(),
    storagePath: z.string(),
    url: z.string(),
    expires: z.number()
  }))
});

const ListReportsResponse = z.object({ items: z.array(Report) });
const GetReportResponse = Report;

async function main() {
  extendZodWithOpenApi(z);
  const registry = new OpenAPIRegistry();

  // Componentes y seguridad
  registry.registerComponent("securitySchemes", "bearerAuth", { type: "http", scheme: "bearer", bearerFormat: "JWT" });
  registry.registerComponent("securitySchemes", "appCheck", { type: "apiKey", name: "X-Firebase-AppCheck", in: "header" });

  // Registrar modelos
  registry.register("FileMeta", FileMetaSchema);
  registry.register("ReportAttachment", ReportAttachment);
  registry.register("Contact", Contact);
  registry.register("Report", Report);
  registry.register("SignUploadsRequest", SignUploadsRequestSchema);
  registry.register("SignUploadsResponse", SignUploadsResponse);
  registry.register("CreateReportRequest", CreateReportRequestSchema);
  registry.register("CreateReportResponse", CreateReportResponse);
  registry.register("UpdateReport", UpdateReportSchema);
  registry.register("OkResponse", OkResponse);
  registry.register("ListReportsResponse", ListReportsResponse);
  registry.register("GetReportResponse", GetReportResponse);
  registry.register("AdminAttachmentUrlResponse", AdminAttachmentUrlResponse);

  // Paths
  registry.registerPath({
    method: "post",
    path: "/signUploads",
    tags: ["Public"],
    summary: "Solicita URLs firmadas para adjuntos",
    request: {
      params: undefined,
      body: {
        required: true,
        content: { "application/json": { schema: SignUploadsRequestSchema } }
      }
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: SignUploadsResponse } } },
      400: { description: "Solicitud inválida" },
      429: { description: "Rate limited" }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/createReport",
    tags: ["Public"],
    summary: "Crear denuncia",
    request: {
      body: { required: true, content: { "application/json": { schema: CreateReportRequestSchema } } }
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: CreateReportResponse } } },
      400: { description: "Solicitud inválida" },
      429: { description: "Rate limited" }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/adminListReports",
    tags: ["Admin"],
    summary: "Listar denuncias (admin)",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({ status: z.string().optional(), limit: z.coerce.number().optional() }).partial()
    },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: ListReportsResponse } } },
      401: { description: "No autorizado" },
      403: { description: "Prohibido" }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/adminGetReport",
    tags: ["Admin"],
    summary: "Detalle denuncia (admin)",
    security: [{ bearerAuth: [] }],
    request: { query: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK", content: { "application/json": { schema: GetReportResponse } } },
      401: { description: "No autorizado" },
      403: { description: "Prohibido" },
      404: { description: "No encontrado" }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/adminUpdateReport",
    tags: ["Admin"],
    summary: "Actualizar denuncia (admin)",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({ id: z.string() }),
      body: { required: true, content: { "application/json": { schema: UpdateReportSchema } } }
    },
    responses: { 200: { description: "OK", content: { "application/json": { schema: OkResponse } } }, 401: { description: "No autorizado" }, 403: { description: "Prohibido" } }
  });

  registry.registerPath({
    method: "get",
    path: "/adminGetAttachmentUrl",
    tags: ["Admin"],
    summary: "URL firmada de adjunto (admin)",
    security: [{ bearerAuth: [] }],
    request: { query: z.object({ path: z.string() }) },
    responses: { 200: { description: "OK", content: { "application/json": { schema: AdminAttachmentUrlResponse } } }, 401: { description: "No autorizado" }, 403: { description: "Prohibido" } }
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Claims Backend API", version: "1.0.0", description: "API para recepción de denuncias y gestión interna." },
    servers: [{ url: "/" }],
    tags: [
      { name: "Public", description: "Endpoints públicos" },
      { name: "Admin", description: "Endpoints de administración (JWT con claim admin)" }
    ]
  });

  const outPath = resolve(process.cwd(), "src", "openapi.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(doc, null, 2));
  console.log("OpenAPI spec written to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
