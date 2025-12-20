const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface UploadResult {
  uploaded: number;
  failed: number;
  files: Array<{
    id: number;
    filename: string;
    size: number;
    path: string;
  }>;
  errors: Array<{
    filename: string;
    error: string;
    code: string;
  }>;
}

export async function uploadEvidence(
  file: File,
  denunciaId: number,
  tipoVinculo: string = "DENUNCIA",
): Promise<UploadResult> {
  const formData = new FormData();

  formData.append("archivos", file);
  formData.append("denuncia_id", denunciaId.toString());
  formData.append("tipo_vinculo", tipoVinculo);

  const response = await fetch(`${API_BASE_URL}/adjuntos/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || `Error uploading file: ${response.status}`);
  }

  return response.json();
}
