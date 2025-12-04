import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import { models } from '../db/sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '../../public/reports');

// Helper to ensure directory exists
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export const generateReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);

        // Fetch data (similar to dashboard controller)
        const denuncias = await models.Denuncia.findAll({
            where: {
                created_at: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    include: [{
                        model: models.CategoriaDenuncia,
                        as: 'categoria'
                    }]
                },
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia'
                }
            ]
        });

        // Generate CSV content
        const header = 'ID,Fecha,Tipo,Categoria,Estado,Prioridad\n';
        const rows = denuncias.map((d: any) => {
            const fecha = d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '';
            const tipo = d.tipo_denuncia?.nombre || 'N/A';
            const categoria = d.tipo_denuncia?.categoria?.nombre || 'N/A';
            const estado = d.estado_denuncia?.nombre || 'N/A';
            // Prioridad might be an ID or joined, assuming ID for now or checking model
            const prioridad = d.prioridad_id || 'N/A'; 
            
            return `${d.id},${fecha},"${tipo}","${categoria}","${estado}",${prioridad}`;
        }).join('\n');

        const csvContent = header + rows;
        const filename = `reporte_reclamos_${startDate}_${endDate}_${Date.now()}.csv`;
        const filePath = path.join(REPORTS_DIR, filename);

        fs.writeFileSync(filePath, csvContent);

        res.json({ message: 'Report generated successfully', filename });

    } catch (error: any) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const listReports = async (req: Request, res: Response) => {
    try {
        const files = fs.readdirSync(REPORTS_DIR);
        const reports = files
            .filter(file => file.endsWith('.csv'))
            .map(file => {
                const stats = fs.statSync(path.join(REPORTS_DIR, file));
                return {
                    name: file,
                    size: (stats.size / 1024).toFixed(2) + ' KB',
                    createdAt: stats.birthtime
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        res.json(reports);
    } catch (error: any) {
        console.error('Error listing reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const downloadReport = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(REPORTS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.download(filePath);
    } catch (error: any) {
        console.error('Error downloading report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
