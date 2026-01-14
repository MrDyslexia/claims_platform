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
    let errorMessage = errorText || `Error uploading file: ${response.status}`;

    switch (response.status) {
      case 400:
        errorMessage =
          "Archivo inválido. Verifique el formato y tamaño del archivo.";
        break;
      case 401:
        errorMessage =
          "Su sesión ha expirado. Por favor inicie sesión nuevamente.";
        break;
      case 403:
        errorMessage = "No tiene permisos para subir archivos a este reclamo.";
        break;
      case 404:
        errorMessage = "El reclamo no fue encontrado.";
        break;
      case 413:
        errorMessage =
          "El archivo es demasiado grande. El tamaño máximo es 10MB.";
        break;
      case 415:
        errorMessage = "Tipo de archivo no soportado.";
        break;
      case 500:
        errorMessage =
          "Error interno del servidor. Por favor intente más tarde.";
        break;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
