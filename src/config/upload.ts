/**
 * Configuración del sistema de upload de archivos adjuntos
 */

export const UPLOAD_CONFIG = {
    // Límites
    MAX_FILES_PER_DENUNCIA: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB por archivo
    MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50 MB total por denuncia

    // Tipos de archivo permitidos
    ALLOWED_MIME_TYPES: [
        // PDFs
        'application/pdf',

        // Documentos Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',

        // Hojas de cálculo (opcional)
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        // Texto plano
        'text/plain',
    ],

    // Extensiones permitidas (validación adicional)
    ALLOWED_EXTENSIONS: [
        '.pdf',
        '.doc',
        '.docx',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.bmp',
        '.xls',
        '.xlsx',
        '.txt',
    ],

    // Directorio de almacenamiento
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    TEMP_DIR: process.env.TEMP_DIR || './uploads/temp',

    // Configuración de limpieza
    TEMP_FILE_MAX_AGE_HOURS: 24, // Eliminar archivos temporales después de 24 horas
    CLEANUP_INTERVAL_MINUTES: 60, // Ejecutar limpieza cada hora

    // Virus scan (opcional - requiere ClamAV)
    ENABLE_VIRUS_SCAN: process.env.ENABLE_VIRUS_SCAN === 'true',
    CLAMAV_HOST: process.env.CLAMAV_HOST || 'localhost',
    CLAMAV_PORT: parseInt(process.env.CLAMAV_PORT || '3310'),
};

/**
 * Obtener mensaje de error amigable según tipo de validación
 */
export function getUploadErrorMessage(errorType: string): string {
    const messages: Record<string, string> = {
        FILE_TOO_LARGE: `El archivo excede el tamaño máximo permitido (${
            UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024
        }MB)`,
        INVALID_FILE_TYPE:
            'Tipo de archivo no permitido. Solo se aceptan: PDF, Word, imágenes (JPG, PNG, GIF)',
        TOO_MANY_FILES: `Se excedió el límite de ${UPLOAD_CONFIG.MAX_FILES_PER_DENUNCIA} archivos por denuncia`,
        TOTAL_SIZE_EXCEEDED: `El tamaño total de archivos excede el límite de ${
            UPLOAD_CONFIG.MAX_TOTAL_SIZE / 1024 / 1024
        }MB`,
        VIRUS_DETECTED:
            'El archivo contiene contenido malicioso y fue rechazado',
        INVALID_EXTENSION: 'Extensión de archivo no permitida',
    };

    return messages[errorType] || 'Error al subir archivo';
}

/**
 * Validar extensión de archivo
 */
export function isValidExtension(filename: string): boolean {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    return UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validar MIME type
 */
export function isValidMimeType(mimeType: string): boolean {
    return UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Obtener extensión desde MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            '.docx',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            '.xlsx',
        'text/plain': '.txt',
    };

    return mimeToExt[mimeType.toLowerCase()] || '';
}
