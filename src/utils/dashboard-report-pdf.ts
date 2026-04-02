interface ReportSummary {
    totalReclamos: number;
    tasaResolucion: number;
    tiempoPromedioDias: number;
    empresasActivas: number;
    variacionTotalReclamos: number;
    variacionTasaResolucion: number;
    variacionTiempoPromedioDias: number;
    nuevasEmpresas: number;
    reclamosCriticos: number;
    satisfaccionPromedio: number;
}

interface ClaimsByMonth {
    mes: string;
    total: number;
    resueltos: number;
    pendientes: number;
}

interface ClaimsByType {
    tipo: string;
    cantidad: number;
    porcentaje: number;
}

interface ClaimsByCompany {
    empresa: string;
    cantidad: number;
}

interface ResolutionTime {
    rango: string;
    cantidad: number;
}

interface DashboardReportResponse {
    reportPeriod: string;
    summary: ReportSummary;
    claimsByMonth: ClaimsByMonth[];
    claimsByType: ClaimsByType[];
    claimsByCompany: ClaimsByCompany[];
    resolutionTime: ResolutionTime[];
}

interface PdfLine {
    text: string;
    font: 'regular' | 'bold';
    size: number;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 48;
const START_Y = 752;
const BOTTOM_MARGIN = 48;

function pdfEscape(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars = 88): string[] {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return [''];

    const words = normalized.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    return lines;
}

function addWrappedLine(
    lines: PdfLine[],
    text: string,
    options?: { font?: 'regular' | 'bold'; size?: number; maxChars?: number }
) {
    const font = options?.font ?? 'regular';
    const size = options?.size ?? 11;
    const maxChars = options?.maxChars ?? 88;

    wrapText(text, maxChars).forEach((line) => {
        lines.push({ text: line, font, size });
    });
}

function buildReportLines(report: DashboardReportResponse): PdfLine[] {
    const generatedAt = new Date().toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
    });
    const periodLabels: Record<string, string> = {
        weekly: 'Semanal',
        monthly: 'Mensual',
        quarterly: 'Trimestral',
        yearly: 'Anual',
    };

    const lines: PdfLine[] = [];

    lines.push({ text: 'Reporte de Denuncias', font: 'bold', size: 20 });
    lines.push({
        text: `Periodo: ${periodLabels[report.reportPeriod] ?? report.reportPeriod}`,
        font: 'regular',
        size: 11,
    });
    lines.push({
        text: `Generado: ${generatedAt}`,
        font: 'regular',
        size: 11,
    });
    lines.push({ text: '', font: 'regular', size: 8 });

    lines.push({ text: 'Resumen Ejecutivo', font: 'bold', size: 15 });
    addWrappedLine(lines, `Total de reclamos: ${report.summary.totalReclamos}`);
    addWrappedLine(
        lines,
        `Tasa de resolucion: ${(report.summary.tasaResolucion * 100).toFixed(1)}%`
    );
    addWrappedLine(
        lines,
        `Tiempo promedio de resolucion: ${report.summary.tiempoPromedioDias} dias`
    );
    addWrappedLine(lines, `Empresas activas: ${report.summary.empresasActivas}`);
    addWrappedLine(lines, `Nuevas empresas: ${report.summary.nuevasEmpresas}`);
    addWrappedLine(
        lines,
        `Reclamos criticos: ${report.summary.reclamosCriticos}`
    );
    addWrappedLine(
        lines,
        `Satisfaccion promedio: ${report.summary.satisfaccionPromedio}/5`
    );
    lines.push({ text: '', font: 'regular', size: 8 });

    lines.push({ text: 'Reclamos por Mes', font: 'bold', size: 15 });
    lines.push({
        text: 'Mes                         Total   Resueltos   Pendientes',
        font: 'bold',
        size: 10,
    });
    report.claimsByMonth.forEach((item) => {
        addWrappedLine(
            lines,
            `${item.mes.padEnd(26, ' ')} ${String(item.total).padStart(5, ' ')} ${String(item.resueltos).padStart(11, ' ')} ${String(item.pendientes).padStart(12, ' ')}`,
            { size: 10, maxChars: 120 }
        );
    });
    lines.push({ text: '', font: 'regular', size: 8 });

    lines.push({ text: 'Distribucion por Tipo', font: 'bold', size: 15 });
    report.claimsByType.forEach((item) => {
        addWrappedLine(
            lines,
            `${item.tipo}: ${item.cantidad} reclamos (${(item.porcentaje * 100).toFixed(1)}%)`
        );
    });
    lines.push({ text: '', font: 'regular', size: 8 });

    lines.push({ text: 'Reclamos por Empresa', font: 'bold', size: 15 });
    report.claimsByCompany.forEach((item) => {
        addWrappedLine(lines, `${item.empresa}: ${item.cantidad}`);
    });
    lines.push({ text: '', font: 'regular', size: 8 });

    lines.push({ text: 'Tiempo de Resolucion', font: 'bold', size: 15 });
    report.resolutionTime.forEach((item) => {
        addWrappedLine(lines, `${item.rango}: ${item.cantidad}`);
    });

    return lines;
}

function paginateLines(lines: PdfLine[]) {
    const pages: PdfLine[][] = [];
    let currentPage: PdfLine[] = [];
    let currentY = START_Y;

    for (const line of lines) {
        const lineHeight = Math.max(14, line.size + 4);
        if (currentY - lineHeight < BOTTOM_MARGIN) {
            pages.push(currentPage);
            currentPage = [];
            currentY = START_Y;
        }
        currentPage.push(line);
        currentY -= lineHeight;
    }

    if (currentPage.length) {
        pages.push(currentPage);
    }

    return pages;
}

function buildContentStream(lines: PdfLine[], pageNumber: number, totalPages: number) {
    const commands: string[] = [];
    let currentY = START_Y;

    for (const line of lines) {
        const lineHeight = Math.max(14, line.size + 4);
        const fontName = line.font === 'bold' ? 'F2' : 'F1';
        commands.push(
            `BT /${fontName} ${line.size} Tf 1 0 0 1 ${MARGIN_X} ${currentY} Tm (${pdfEscape(line.text)}) Tj ET`
        );
        currentY -= lineHeight;
    }

    commands.push(
        `BT /F1 9 Tf 1 0 0 1 ${MARGIN_X} 24 Tm (Pagina ${pageNumber} de ${totalPages}) Tj ET`
    );

    return commands.join('\n');
}

function buildPdf(objects: string[]): Buffer {
    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';

    for (let i = 1; i < offsets.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
}

export function generateDashboardReportPdf(report: DashboardReportResponse): Buffer {
    const lines = buildReportLines(report);
    const pages = paginateLines(lines);

    const objects: string[] = [];
    objects.push('<< /Type /Catalog /Pages 2 0 R >>');

    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];
    const fontRegularId = 3;
    const fontBoldId = 4;

    pages.forEach((_, index) => {
        pageObjectIds.push(5 + index);
    });
    pages.forEach((_, index) => {
        contentObjectIds.push(5 + pages.length + index);
    });

    objects.push(
        `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
    );
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    pages.forEach((_, index) => {
        objects.push(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`
        );
    });

    pages.forEach((pageLines, index) => {
        const stream = buildContentStream(pageLines, index + 1, pages.length);
        objects.push(
            `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
        );
    });

    return buildPdf(objects);
}
