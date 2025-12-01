/**
 * Servicio de upload de archivos adjuntos
 * Maneja validación, almacenamiento y limpieza de archivos
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
    UPLOAD_CONFIG,
    isValidExtension,
    isValidMimeType,
    getExtensionFromMimeType,
} from '../config/upload';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
    path?: string;
}

export interface UploadResult {
    success: boolean;
    fileId?: number;
    filename?: string;
    size?: number;
    path?: string;
    error?: string;
    errorCode?: string;
}

/**
 * Generar nombre único para archivo
 */
function generateUniqueFilename(
    originalName: string,
    mimeType: string
): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension =
        path.extname(originalName) || getExtensionFromMimeType(mimeType);

    return `${timestamp}-${randomBytes}${extension}`;
}

/**
 * Calcular SHA256 del archivo
 */
async function calculateSHA256(filePath: string): Promise<Buffer> {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest();
}

/**
 * Validar tipo de archivo
 */
function validateFileType(file: UploadedFile): {
    valid: boolean;
    error?: string;
} {
    // Validar MIME type
    if (!isValidMimeType(file.mimetype)) {
        return { valid: false, error: 'INVALID_FILE_TYPE' };
    }

    // Validar extensión
    if (!isValidExtension(file.originalname)) {
        return { valid: false, error: 'INVALID_EXTENSION' };
    }

    return { valid: true };
}

/**
 * Validar tamaño de archivo
 */
function validateFileSize(file: UploadedFile): {
    valid: boolean;
    error?: string;
} {
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return { valid: false, error: 'FILE_TOO_LARGE' };
    }

    return { valid: true };
}

/**
 * Validar límite de archivos por denuncia
 */
async function validateFileCount(
    denunciaId: number
): Promise<{ valid: boolean; error?: string }> {
    const count = await models.Adjunto.count({
        where: { denuncia_id: denunciaId },
    });

    if (count >= UPLOAD_CONFIG.MAX_FILES_PER_DENUNCIA) {
        return { valid: false, error: 'TOO_MANY_FILES' };
    }

    return { valid: true };
}

/**
 * Validar tamaño total de archivos por denuncia
 */
async function validateTotalSize(
    denunciaId: number,
    newFileSize: number
): Promise<{ valid: boolean; error?: string }> {
    const adjuntos = await models.Adjunto.findAll({
        where: { denuncia_id: denunciaId },
        attributes: ['tamano_bytes'],
    });

    const totalSize = adjuntos.reduce(
        (sum, adj) => sum + Number(adj.get('tamano_bytes')),
        0
    );

    if (totalSize + newFileSize > UPLOAD_CONFIG.MAX_TOTAL_SIZE) {
        return { valid: false, error: 'TOTAL_SIZE_EXCEEDED' };
    }

    return { valid: true };
}

/**
 * Escanear archivo en busca de virus (opcional)
 * Requiere ClamAV instalado y configurado
 */
async function scanFileForVirus(
    filePath: string
): Promise<{ clean: boolean; error?: string }> {
    if (!UPLOAD_CONFIG.ENABLE_VIRUS_SCAN) {
        return { clean: true }; // Skip si está deshabilitado
    }

    try {
        // TODO: Implementar integración con ClamAV
        // Ejemplo: usar node-clamscan o llamar a clamdscan directamente
        console.log('[Virus Scan] Skipped for:', filePath);
        return { clean: true };
    } catch (error: any) {
        console.error('[Virus Scan] Error:', error.message);
        return { clean: false, error: 'VIRUS_SCAN_ERROR' };
    }
}

/**
 * Asegurar que existan los directorios necesarios
 */
async function ensureDirectories(): Promise<void> {
    await fs.mkdir(UPLOAD_CONFIG.UPLOAD_DIR, { recursive: true });
    await fs.mkdir(UPLOAD_CONFIG.TEMP_DIR, { recursive: true });
}

/**
 * Subir archivo y guardar metadata en BD
 */
export async function uploadFile(
    file: UploadedFile,
    denunciaId: number,
    userId: number | null,
    tipoVinculo: 'DENUNCIA' | 'COMENTARIO' | 'RESOLUCION' = 'DENUNCIA'
): Promise<UploadResult> {
    try {
        // 1. Validar tipo de archivo
        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
            return {
                success: false,
                error: typeValidation.error,
                errorCode: typeValidation.error,
            };
        }

        // 2. Validar tamaño
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
            return {
                success: false,
                error: sizeValidation.error,
                errorCode: sizeValidation.error,
            };
        }

        // 3. Validar límite de archivos
        const countValidation = await validateFileCount(denunciaId);
        if (!countValidation.valid) {
            return {
                success: false,
                error: countValidation.error,
                errorCode: countValidation.error,
            };
        }

        // 4. Validar tamaño total
        const totalSizeValidation = await validateTotalSize(
            denunciaId,
            file.size
        );
        if (!totalSizeValidation.valid) {
            return {
                success: false,
                error: totalSizeValidation.error,
                errorCode: totalSizeValidation.error,
            };
        }

        // 5. Asegurar directorios
        await ensureDirectories();

        // 6. Generar nombre único
        const uniqueFilename = generateUniqueFilename(
            file.originalname,
            file.mimetype
        );
        const relativePath = `adjuntos/${denunciaId}/${uniqueFilename}`;
        const absolutePath = path.join(UPLOAD_CONFIG.UPLOAD_DIR, relativePath);

        // 7. Crear directorio si no existe
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });

        // 8. Guardar archivo
        if (file.buffer) {
            await fs.writeFile(absolutePath, file.buffer);
        } else if (file.path) {
            await fs.copyFile(file.path, absolutePath);
            await fs.unlink(file.path); // Eliminar temporal
        } else {
            return {
                success: false,
                error: 'No file data provided',
                errorCode: 'NO_FILE_DATA',
            };
        }

        // 9. Escanear virus (opcional)
        if (UPLOAD_CONFIG.ENABLE_VIRUS_SCAN) {
            const virusScan = await scanFileForVirus(absolutePath);
            if (!virusScan.clean) {
                await fs.unlink(absolutePath); // Eliminar archivo infectado
                return {
                    success: false,
                    error: 'VIRUS_DETECTED',
                    errorCode: 'VIRUS_DETECTED',
                };
            }
        }

        // 10. Calcular checksum
        const checksum = await calculateSHA256(absolutePath);

        // 11. Guardar metadata en BD
        const adjunto = await models.Adjunto.create({
            denuncia_id: denunciaId,
            tipo_vinculo: tipoVinculo,
            nombre_archivo: file.originalname,
            ruta: relativePath,
            mime_type: file.mimetype,
            tamano_bytes: file.size,
            checksum_sha256: checksum,
            subido_por: userId,
        });

        return {
            success: true,
            fileId: Number(adjunto.get('id')),
            filename: file.originalname,
            size: file.size,
            path: relativePath,
        };
    } catch (error: any) {
        console.error('[Upload Error]:', error);
        return {
            success: false,
            error: error.message,
            errorCode: 'UPLOAD_ERROR',
        };
    }
}

/**
 * Eliminar archivo físico y metadata de BD
 */
export async function deleteFile(
    adjuntoId: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const adjunto = await models.Adjunto.findByPk(adjuntoId);
        if (!adjunto) {
            return { success: false, error: 'Archivo no encontrado' };
        }

        const filePath = path.join(
            UPLOAD_CONFIG.UPLOAD_DIR,
            adjunto.get('ruta') as string
        );

        // Eliminar archivo físico
        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            console.error('[Delete Error] Archivo no existe:', filePath);
            // Continuar para eliminar metadata
        }

        // Eliminar metadata
        await adjunto.destroy();

        return { success: true };
    } catch (error: any) {
        console.error('[Delete Error]:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limpiar archivos temporales antiguos
 */
export async function cleanupTempFiles(): Promise<void> {
    try {
        const files = await fs.readdir(UPLOAD_CONFIG.TEMP_DIR);
        const now = Date.now();
        const maxAge = UPLOAD_CONFIG.TEMP_FILE_MAX_AGE_HOURS * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(UPLOAD_CONFIG.TEMP_DIR, file);
            const stats = await fs.stat(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                await fs.unlink(filePath);
                console.log(`[Cleanup] Eliminado archivo temporal: ${file}`);
            }
        }
    } catch (error: any) {
        console.error('[Cleanup Error]:', error.message);
    }
}

/**
 * Iniciar limpieza automática de archivos temporales
 */
export function startCleanupScheduler(): void {
    const intervalMs = UPLOAD_CONFIG.CLEANUP_INTERVAL_MINUTES * 60 * 1000;

    setInterval(async () => {
        console.log('[Cleanup] Ejecutando limpieza de archivos temporales...');
        await cleanupTempFiles();
    }, intervalMs);

    // Ejecutar una vez al iniciar
    cleanupTempFiles().catch(console.error);
}

/**
 * Obtener información de archivos de una denuncia
 */
export async function getFilesByDenuncia(denunciaId: number): Promise<any[]> {
    const adjuntos = await models.Adjunto.findAll({
        where: { denuncia_id: denunciaId },
        order: [['created_at', 'DESC']],
    });

    return adjuntos.map((adj: any) => ({
        id: adj.id,
        nombre: adj.nombre_archivo,
        tipo: adj.mime_type,
        tamano: adj.tamano_bytes,
        fecha: adj.created_at,
        ruta: adj.ruta,
    }));
}
