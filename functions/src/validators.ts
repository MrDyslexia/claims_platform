import { z } from "zod";

export const FileMetaSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(200),
  size: z.number().int().nonnegative().max(20 * 1024 * 1024)
});

export const SignUploadsRequestSchema = z.object({
  recaptchaToken: z.string().min(10),
  files: z.array(FileMetaSchema).min(1).max(10)
});

export const CreateReportRequestSchema = z.object({
  recaptchaToken: z.string().min(10).optional(),
  uploadId: z.string().min(10),
  type: z.string().min(2).max(100),
  details: z.string().min(10).max(10000),
  isAnonymous: z.boolean(),
  contact: z
    .object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(6).max(30).optional()
    })
    .optional(),
  attachments: z.array(
    z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1),
      size: z.number().int().nonnegative(),
      storagePath: z.string().min(1)
    })
  ).max(10)
});

export type FileMeta = z.infer<typeof FileMetaSchema>;
export type SignUploadsRequest = z.infer<typeof SignUploadsRequestSchema>;
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;

export const UpdateReportSchema = z.object({
  status: z.enum(["new", "triage", "in_progress", "closed"]).optional(),
  assignedTo: z.string().min(2).max(100).optional(),
  note: z.string().min(1).max(2000).optional()
});

