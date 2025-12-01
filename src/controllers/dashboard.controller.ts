import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op, fn, col, literal } from 'sequelize';

// ==========================================
// TYPES & DTOs
// ==========================================

type ReportPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

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
    reportPeriod: ReportPeriod;
    summary: ReportSummary;
    claimsByMonth: ClaimsByMonth[];
    claimsByType: ClaimsByType[];
    claimsByCompany: ClaimsByCompany[];
    resolutionTime: ResolutionTime[];
}

// Tipos para dashboard de analista
// Tipos para dashboard de analista
type EstadoAnalista = 'pendiente' | 'resuelto' | 'en_revision';

interface TrendData {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
}

interface GlobalKPIs {
    total_claims: TrendData;
    pending_claims: TrendData;
    resolved_claims: TrendData;
    resolution_rate: TrendData;
}

interface MonthlyDataAnalista {
    mes: string;
    reclamos: number;
    resueltos: number;
}

interface ClaimsByTypeAnalista {
    tipo: string;
    cantidad: number;
    color?: string;
}

interface ClaimsByStatus {
    estado: string;
    cantidad: number;
}

interface KeyMetrics {
    avg_resolution_time: TrendData;
    customer_satisfaction: TrendData;
    critical_claims: { value: number; description: string };
    recurrence_rate: TrendData;
}

interface CompanySummary {
    empresa_id: number;
    empresa_nombre: string;
    total_claims: number;
    pending_claims: number;
    resolved_claims: number;
    resolution_rate: number;
}

interface DashboardAnalistaResponse {
    global_kpis: GlobalKPIs;
    monthly_data: MonthlyDataAnalista[];
    claims_by_type: ClaimsByTypeAnalista[];
    claims_by_status: ClaimsByStatus[];
    key_metrics: KeyMetrics;
    companies_summary: CompanySummary[];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getPeriodDates(period: ReportPeriod): {
    startDate: Date;
    endDate: Date;
    previousStartDate: Date;
    previousEndDate: Date;
} {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let previousStartDate = new Date(now);
    let previousEndDate = new Date(now);

    switch (period) {
        case 'weekly':
            startDate.setDate(now.getDate() - 7);
            previousEndDate = new Date(startDate);
            previousStartDate.setDate(previousEndDate.getDate() - 7);
            break;
        case 'monthly':
            startDate.setMonth(now.getMonth() - 1);
            previousEndDate = new Date(startDate);
            previousStartDate.setMonth(previousEndDate.getMonth() - 1);
            break;
        case 'quarterly':
            startDate.setMonth(now.getMonth() - 3);
            previousEndDate = new Date(startDate);
            previousStartDate.setMonth(previousEndDate.getMonth() - 3);
            break;
        case 'yearly':
            startDate.setFullYear(now.getFullYear() - 1);
            previousEndDate = new Date(startDate);
            previousStartDate.setFullYear(previousEndDate.getFullYear() - 1);
            break;
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
}

function calculateVariation(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
}

function getMonthName(date: Date): string {
    const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Helper para mapear estados de BD a estados de analista
function mapEstadoToAnalista(estadoCodigo: string): EstadoAnalista {
    const upperCodigo = estadoCodigo.toUpperCase();
    if (upperCodigo === 'PENDIENTE') return 'pendiente';
    if (upperCodigo === 'RESUELTO' || upperCodigo === 'CERRADO')
        return 'resuelto';
    return 'en_revision';
}

// Helper para asignar colores a tipos de reclamos
function getColorForType(index: number): string {
    const colors = [
        '#8B5CF6', // purple
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // amber
        '#EF4444', // red
        '#EC4899', // pink
        '#6366F1', // indigo
        '#14B8A6', // teal
    ];
    return colors[index % colors.length];
}

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. STATS PRINCIPALES usando Sequelize count
        const totalDenuncias = await models.Denuncia.count();

        // Obtener todos los estados disponibles
        const estados = await models.EstadoDenuncia.findAll({
            attributes: ['id', 'codigo', 'nombre'],
        });

        // Mapear estados por código para facilitar el acceso
        const estadosMap = new Map();
        estados.forEach((estado: any) => {
            estadosMap.set(estado.codigo, estado.id);
        });

        // Contar denuncias "En Proceso" - buscar estados que no sean PENDIENTE ni finalizados
        const estadoProcesoId = estadosMap.get('PENDIENTE') || 1;
        const enProceso = await models.Denuncia.count({
            where: {
                estado_id: { [Op.ne]: estadoProcesoId },
            },
        });

        // Para "resueltas" usaremos las que tengan un estado específico (ajustar según tu lógica)
        // Por ahora, asumimos que son las que no están pendientes
        const resueltas = await models.Denuncia.count({
            where: {
                estado_id: estadosMap.get('RESUELTO') || 2,
            },
        }); // Ajustar cuando tengas más estados

        // Denuncias críticas - como no hay campo prioridad, usamos 0
        const criticas = 0;

        // 2. DISTRIBUCIÓN POR ESTADO
        // Obtener conteos por cada estado
        const estadosCount = await Promise.all(
            Array.from(estadosMap.values()).map((estadoId: any) =>
                models.Denuncia.count({ where: { estado_id: estadoId } })
            )
        );

        // Crear distribución (ajustar según tus estados reales)
        const distribucion_estados = {
            nuevos: estadosCount[0],
            en_proceso: estadosCount[1],
            resueltos: estadosCount[2],
            cerrados: estadosCount[3],
        };

        // 3. MÉTRICAS RÁPIDAS
        const usuariosActivos = await models.Usuario.count({
            where: { activo: 1 },
            distinct: true,
        });

        const totalEmpresas = await models.Empresa.count({
            where: { estado: 1 },
        });

        // Tiempo promedio de resolución usando created_at y updated_at
        const denunciasConFechas = await models.Denuncia.findAll({
            where: {
                updated_at: { [Op.ne]: null },
                created_at: { [Op.ne]: null },
            },
            attributes: ['created_at', 'updated_at'],
            raw: true,
        });

        // Calcular promedio de días
        let promedioDias = 0;
        if (denunciasConFechas.length > 0) {
            const totalDias = denunciasConFechas.reduce(
                (sum: number, denuncia: any) => {
                    const inicio = new Date(denuncia.created_at).getTime();
                    const fin = new Date(denuncia.updated_at).getTime();
                    const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
                    return sum + dias;
                },
                0
            );
            promedioDias = totalDias / denunciasConFechas.length;
        }

        const metricas_rapidas = {
            usuarios_activos: usuariosActivos,
            total_empresas: totalEmpresas,
            tiempo_promedio_resolucion: promedioDias.toFixed(1),
        };

        // 4. RECLAMOS RECIENTES usando Sequelize include
        const reclamosRecientes = await models.Denuncia.findAll({
            attributes: [
                'id',
                'numero',
                'estado_id',
                'tipo_id',
                'empresa_id',
                'denunciante_nombre',
                'denunciante_email',
                'es_anonima',
                'created_at',
                'asunto',
                'descripcion',
            ],
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['nombre'],
                    required: false,
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['nombre'],
                    required: false,
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['nombre'],
                    required: false,
                },
            ],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        // Transformar los reclamos al formato requerido
        const reclamos_recientes = reclamosRecientes.map((claim: any) => {
            const claimData = claim.get({ plain: true });

            return {
                id_denuncia: claimData.id,
                codigo_acceso: claimData.numero,
                descripcion: claimData.descripcion,
                prioridad: 'media', // Default ya que no existe en BD
                id_estado: claimData.estado_id,
                id_tipo: claimData.tipo_id,
                id_empresa: claimData.empresa_id,
                nombre_denunciante: claimData.denunciante_nombre,
                email_denunciante: claimData.denunciante_email,
                es_anonimo: claimData.es_anonima,
                fecha_creacion: claimData.created_at
                    ? new Date(claimData.created_at).toISOString().split('T')[0]
                    : null,
                tipo_nombre: claimData.tipo_denuncia?.nombre || 'Sin tipo',
                estado_nombre:
                    claimData.estado_denuncia?.nombre || 'Sin estado',
                empresa_nombre: claimData.empresa?.nombre || 'Sin empresa',
            };
        });

        // 5. RESPUESTA FINAL
        res.json({
            success: true,
            data: {
                stats: {
                    total_denuncias: totalDenuncias,
                    en_proceso: enProceso,
                    resueltas: resueltas,
                    criticas: criticas,
                },
                distribucion_estados,
                metricas_rapidas,
                reclamos_recientes,
            },
        });
    } catch (error) {
        console.error('❌ Error en getDashboardStats:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            stack:
                process.env.NODE_ENV === 'development'
                    ? (error as Error).stack
                    : undefined,
        });
    }
};

/**
 * Genera reportes de dashboard con métricas detalladas
 * POST /api/dashboard/reports?period=monthly
 */
export const generateReports = async (req: Request, res: Response) => {
    try {
        // Validar y obtener el período del query param
        const period = (req.query.period as ReportPeriod) || 'monthly';
        const validPeriods: ReportPeriod[] = [
            'weekly',
            'monthly',
            'quarterly',
            'yearly',
        ];

        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                error: `Período inválido. Debe ser uno de: ${validPeriods.join(
                    ', '
                )}`,
            });
        }

        // Obtener fechas del período actual y anterior
        const { startDate, endDate, previousStartDate, previousEndDate } =
            getPeriodDates(period);

        // Obtener estados
        const estados = await models.EstadoDenuncia.findAll({
            attributes: ['id', 'codigo', 'nombre'],
        });
        const estadosMap = new Map();
        estados.forEach((estado: any) => {
            estadosMap.set(estado.codigo, estado.id);
        });

        const estadoResueltoId =
            estadosMap.get('RESUELTO') || estadosMap.get('CERRADO');

        // ===== SUMMARY - Período actual =====
        const totalReclamosCurrent = await models.Denuncia.count({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        const reclamosResueltosCurrent = await models.Denuncia.count({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
                estado_id: estadoResueltoId,
            },
        });

        const tasaResolucionCurrent =
            totalReclamosCurrent > 0
                ? reclamosResueltosCurrent / totalReclamosCurrent
                : 0;

        // Tiempo promedio de resolución
        const denunciasResueltas = await models.Denuncia.findAll({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
                estado_id: estadoResueltoId,
                updated_at: { [Op.ne]: null },
            },
            attributes: ['created_at', 'updated_at'],
            raw: true,
        });

        let tiempoPromedioDias = 0;
        if (denunciasResueltas.length > 0) {
            const totalDias = denunciasResueltas.reduce(
                (sum: number, d: any) => {
                    const inicio = new Date(d.created_at).getTime();
                    const fin = new Date(d.updated_at).getTime();
                    return sum + (fin - inicio) / (1000 * 60 * 60 * 24);
                },
                0
            );
            tiempoPromedioDias = totalDias / denunciasResueltas.length;
        }

        // Empresas activas (con al menos un reclamo en el período)
        const empresasActivas = await models.Denuncia.count({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            distinct: true,
            col: 'empresa_id',
        });

        // Nuevas empresas (empresas que registraron su primer reclamo en este período)
        const empresasConPrimerReclamo = await models.Denuncia.findAll({
            attributes: [
                'empresa_id',
                [fn('MIN', col('created_at')), 'primer_reclamo'],
            ],
            group: ['empresa_id'],
            having: literal(
                `MIN(created_at) >= '${startDate.toISOString().split('T')[0]}'`
            ),
            raw: true,
        });
        const nuevasEmpresas = empresasConPrimerReclamo.length;

        // Satisfacción promedio (simulado, ajustar según tu modelo)
        const satisfaccionPromedio = 4.2 + (Math.random() * 0.6 - 0.3);

        // ===== SUMMARY - Período anterior (para variaciones) =====
        const totalReclamosPrevious = await models.Denuncia.count({
            where: {
                created_at: {
                    [Op.between]: [previousStartDate, previousEndDate],
                },
            },
        });

        const reclamosResueltosPrevious = await models.Denuncia.count({
            where: {
                created_at: {
                    [Op.between]: [previousStartDate, previousEndDate],
                },
                estado_id: estadoResueltoId,
            },
        });

        const tasaResolucionPrevious =
            totalReclamosPrevious > 0
                ? reclamosResueltosPrevious / totalReclamosPrevious
                : 0;

        const denunciasResueltasPrevious = await models.Denuncia.findAll({
            where: {
                created_at: {
                    [Op.between]: [previousStartDate, previousEndDate],
                },
                estado_id: estadoResueltoId,
                updated_at: { [Op.ne]: null },
            },
            attributes: ['created_at', 'updated_at'],
            raw: true,
        });

        let tiempoPromedioDiasPrevious = 0;
        if (denunciasResueltasPrevious.length > 0) {
            const totalDias = denunciasResueltasPrevious.reduce(
                (sum: number, d: any) => {
                    const inicio = new Date(d.created_at).getTime();
                    const fin = new Date(d.updated_at).getTime();
                    return sum + (fin - inicio) / (1000 * 60 * 60 * 24);
                },
                0
            );
            tiempoPromedioDiasPrevious =
                totalDias / denunciasResueltasPrevious.length;
        }

        // Calcular variaciones
        const variacionTotalReclamos = calculateVariation(
            totalReclamosCurrent,
            totalReclamosPrevious
        );
        const variacionTasaResolucion = calculateVariation(
            tasaResolucionCurrent,
            tasaResolucionPrevious
        );
        const variacionTiempoPromedioDias = calculateVariation(
            tiempoPromedioDias,
            tiempoPromedioDiasPrevious
        );

        // ===== CLAIMS BY MONTH =====
        const claimsByMonth: ClaimsByMonth[] = [];
        const monthsToShow =
            period === 'yearly'
                ? 12
                : period === 'quarterly'
                ? 3
                : period === 'monthly'
                ? 4
                : 4;

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const monthStart = new Date(endDate);
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);

            const total = await models.Denuncia.count({
                where: {
                    created_at: {
                        [Op.between]: [monthStart, monthEnd],
                    },
                },
            });

            const resueltos = await models.Denuncia.count({
                where: {
                    created_at: {
                        [Op.between]: [monthStart, monthEnd],
                    },
                    estado_id: estadoResueltoId,
                },
            });

            claimsByMonth.push({
                mes: getMonthName(monthStart),
                total,
                resueltos,
                pendientes: total - resueltos,
            });
        }

        // ===== CLAIMS BY TYPE =====
        const tiposResult = await models.Denuncia.findAll({
            attributes: [
                'tipo_id',
                [fn('COUNT', col('denuncia.id')), 'cantidad'],
            ],
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            group: ['tipo_id', 'tipo_denuncia.id', 'tipo_denuncia.nombre'],
            include: [
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['nombre'],
                    required: false,
                },
            ],
            raw: true,
        });

        const claimsByType: ClaimsByType[] = tiposResult.map((t: any) => {
            const cantidad = parseInt(t.cantidad);
            const porcentaje =
                totalReclamosCurrent > 0 ? cantidad / totalReclamosCurrent : 0;
            return {
                tipo: t['tipo_denuncia.nombre'] || 'Sin tipo',
                cantidad,
                porcentaje,
            };
        });

        // ===== CLAIMS BY COMPANY =====
        const empresasResult = await models.Denuncia.findAll({
            attributes: [
                'empresa_id',
                [fn('COUNT', col('denuncia.id')), 'cantidad'],
            ],
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            group: ['empresa_id', 'empresa.id', 'empresa.nombre'],
            include: [
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['nombre'],
                    required: false,
                },
            ],
            order: [[literal('cantidad'), 'DESC']],
            limit: 10,
            raw: true,
        });

        const claimsByCompany: ClaimsByCompany[] = empresasResult.map(
            (e: any) => ({
                empresa: e['empresa.nombre'] || 'Sin empresa',
                cantidad: parseInt(e.cantidad),
            })
        );

        // ===== RESOLUTION TIME =====
        const rangos = [
            { label: '0-7 días', min: 0, max: 7 },
            { label: '8-15 días', min: 8, max: 15 },
            { label: '16-30 días', min: 16, max: 30 },
            { label: '31-60 días', min: 31, max: 60 },
            { label: 'Más de 60 días', min: 61, max: Infinity },
        ];

        const resolutionTime: ResolutionTime[] = await Promise.all(
            rangos.map(async (rango) => {
                const denuncias = await models.Denuncia.findAll({
                    where: {
                        created_at: {
                            [Op.between]: [startDate, endDate],
                        },
                        estado_id: estadoResueltoId,
                        updated_at: { [Op.ne]: null },
                    },
                    attributes: ['created_at', 'updated_at'],
                    raw: true,
                });

                const cantidad = denuncias.filter((d: any) => {
                    const dias =
                        (new Date(d.updated_at).getTime() -
                            new Date(d.created_at).getTime()) /
                        (1000 * 60 * 60 * 24);
                    return dias >= rango.min && dias <= rango.max;
                }).length;

                return {
                    rango: rango.label,
                    cantidad,
                };
            })
        );

        // ===== RESPONSE =====
        const response: DashboardReportResponse = {
            reportPeriod: period,
            summary: {
                totalReclamos: totalReclamosCurrent,
                tasaResolucion: tasaResolucionCurrent,
                tiempoPromedioDias: Math.round(tiempoPromedioDias * 10) / 10,
                empresasActivas,
                variacionTotalReclamos:
                    Math.round(variacionTotalReclamos * 1000) / 1000,
                variacionTasaResolucion:
                    Math.round(variacionTasaResolucion * 1000) / 1000,
                variacionTiempoPromedioDias:
                    Math.round(variacionTiempoPromedioDias * 1000) / 1000,
                nuevasEmpresas,
                reclamosCriticos: 0, // Campo prioridad no existe en el modelo
                satisfaccionPromedio:
                    Math.round(satisfaccionPromedio * 10) / 10,
            },
            claimsByMonth,
            claimsByType,
            claimsByCompany,
            resolutionTime,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Error en generateReports:', error);
        res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : 'Error al generar reportes',
        });
    }
};

/**
 * Dashboard para analista - datos filtrados por empresa
 * GET /api/dashboard/analista
 */
export const getDashboardAnalista = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        // Helper para calcular tendencia
        const getTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
            if (current === previous) return 'neutral';
            return current > previous ? 'up' : 'down';
        };

        const getChangeStr = (current: number, previous: number, suffix: string = '%'): string => {
            if (previous === 0) return current === 0 ? '0%' : '+100%';
            const change = ((current - previous) / previous) * 100;
            const sign = change >= 0 ? '+' : '';
            return `${sign}${Math.round(change * 10) / 10}${suffix}`;
        };

        // Fechas para KPIs globales (Mes actual vs Mes anterior)
        const now = new Date();
        const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Obtener estados
        const estados = await models.EstadoDenuncia.findAll({
            attributes: ['id', 'codigo', 'nombre'],
        });
        const estadosMap = new Map();
        estados.forEach((estado: any) => {
            estadosMap.set(estado.codigo, estado.id);
        });

        const estadoResueltoId = estadosMap.get('RESUELTO') || 
            Array.from(estadosMap.entries()).find(([codigo, _]) => codigo.includes('RESUELTO'))?.[1];
        const estadoPendienteId = estadosMap.get('PENDIENTE') || 
            Array.from(estadosMap.entries()).find(([codigo, _]) => codigo.includes('PENDIENTE'))?.[1];

        // ===== GLOBAL KPIs =====
        // Current Month
        const totalClaimsCurrent = await models.Denuncia.count({
            where: { created_at: { [Op.between]: [startCurrentMonth, endCurrentMonth] } }
        });
        const pendingClaimsCurrent = await models.Denuncia.count({
            where: { 
                created_at: { [Op.between]: [startCurrentMonth, endCurrentMonth] },
                estado_id: estadoPendienteId
            }
        });
        const resolvedClaimsCurrent = await models.Denuncia.count({
            where: { 
                created_at: { [Op.between]: [startCurrentMonth, endCurrentMonth] },
                estado_id: estadoResueltoId
            }
        });
        const resolutionRateCurrent = totalClaimsCurrent > 0 ? (resolvedClaimsCurrent / totalClaimsCurrent) * 100 : 0;

        // Previous Month
        const totalClaimsPrev = await models.Denuncia.count({
            where: { created_at: { [Op.between]: [startPrevMonth, endPrevMonth] } }
        });
        const pendingClaimsPrev = await models.Denuncia.count({
            where: { 
                created_at: { [Op.between]: [startPrevMonth, endPrevMonth] },
                estado_id: estadoPendienteId
            }
        });
        const resolvedClaimsPrev = await models.Denuncia.count({
            where: { 
                created_at: { [Op.between]: [startPrevMonth, endPrevMonth] },
                estado_id: estadoResueltoId
            }
        });
        const resolutionRatePrev = totalClaimsPrev > 0 ? (resolvedClaimsPrev / totalClaimsPrev) * 100 : 0;

        const global_kpis: GlobalKPIs = {
            total_claims: {
                value: totalClaimsCurrent,
                change: getChangeStr(totalClaimsCurrent, totalClaimsPrev),
                trend: getTrend(totalClaimsCurrent, totalClaimsPrev)
            },
            pending_claims: {
                value: pendingClaimsCurrent,
                change: getChangeStr(pendingClaimsCurrent, pendingClaimsPrev),
                trend: getTrend(pendingClaimsCurrent, pendingClaimsPrev)
            },
            resolved_claims: {
                value: resolvedClaimsCurrent,
                change: getChangeStr(resolvedClaimsCurrent, resolvedClaimsPrev),
                trend: getTrend(resolvedClaimsCurrent, resolvedClaimsPrev)
            },
            resolution_rate: {
                value: Math.round(resolutionRateCurrent * 10) / 10,
                change: getChangeStr(resolutionRateCurrent, resolutionRatePrev),
                trend: getTrend(resolutionRateCurrent, resolutionRatePrev)
            }
        };

        // ===== MONTHLY DATA (Last 6 months) =====
        const monthlyData: MonthlyDataAnalista[] = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const total = await models.Denuncia.count({
                where: { created_at: { [Op.between]: [monthStart, monthEnd] } }
            });
            const resueltos = await models.Denuncia.count({
                where: { 
                    created_at: { [Op.between]: [monthStart, monthEnd] },
                    estado_id: estadoResueltoId
                }
            });

            monthlyData.push({
                mes: getMonthName(monthStart).split(' ')[0], // Solo el nombre del mes
                reclamos: total,
                resueltos: resueltos
            });
        }

        // ===== CLAIMS BY TYPE =====
        const tiposResult = await models.Denuncia.findAll({
            attributes: [
                'tipo_id',
                [fn('COUNT', col('denuncia.id')), 'cantidad'],
            ],
            group: ['tipo_id', 'tipo_denuncia.id', 'tipo_denuncia.nombre'],
            include: [{
                model: models.TipoDenuncia,
                as: 'tipo_denuncia',
                attributes: ['nombre'],
                required: false,
            }],
            raw: true,
        });

        const claims_by_type: ClaimsByTypeAnalista[] = tiposResult.map((t: any) => ({
            tipo: t['tipo_denuncia.nombre'] || 'Sin tipo',
            cantidad: parseInt(t.cantidad)
        })).sort((a, b) => b.cantidad - a.cantidad);

        // ===== CLAIMS BY STATUS =====
        const estadosResult = await models.Denuncia.findAll({
            attributes: [
                'estado_id',
                [fn('COUNT', col('denuncia.id')), 'cantidad'],
            ],
            group: ['estado_id', 'estado_denuncia.id', 'estado_denuncia.nombre'],
            include: [{
                model: models.EstadoDenuncia,
                as: 'estado_denuncia',
                attributes: ['nombre'],
                required: false,
            }],
            raw: true,
        });

        const claims_by_status: ClaimsByStatus[] = estadosResult.map((e: any) => ({
            estado: e['estado_denuncia.nombre'] || 'Sin estado',
            cantidad: parseInt(e.cantidad)
        })).sort((a, b) => b.cantidad - a.cantidad);

        // ===== KEY METRICS =====
        // Avg Resolution Time
        const getAvgResolutionTime = async (start: Date, end: Date) => {
            const resolved = await models.Denuncia.findAll({
                where: {
                    estado_id: estadoResueltoId,
                    updated_at: { [Op.ne]: null },
                    created_at: { [Op.between]: [start, end] }
                },
                attributes: ['created_at', 'updated_at'],
                raw: true
            });
            
            if (resolved.length === 0) return 0;
            
            const totalDays = resolved.reduce((sum: number, d: any) => {
                const diff = new Date(d.updated_at).getTime() - new Date(d.created_at).getTime();
                return sum + (diff / (1000 * 60 * 60 * 24));
            }, 0);
            
            return totalDays / resolved.length;
        };

        const avgTimeCurrent = await getAvgResolutionTime(startCurrentMonth, endCurrentMonth);
        const avgTimePrev = await getAvgResolutionTime(startPrevMonth, endPrevMonth);
        const avgTimeChange = avgTimeCurrent - avgTimePrev;

        // Recurrence Rate (Real calculation based on repeat emails)
        // Percentage of users who filed more than 1 claim in the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recurrenceQuery = await models.Denuncia.findAll({
            attributes: [
                'denunciante_email',
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: sixMonthsAgo },
                denunciante_email: { [Op.ne]: null }
            },
            group: ['denunciante_email'],
            having: literal('COUNT(id) > 1'),
            raw: true
        });

        const totalUniqueClaimants = await models.Denuncia.count({
            distinct: true,
            col: 'denunciante_email',
            where: {
                created_at: { [Op.gte]: sixMonthsAgo },
                denunciante_email: { [Op.ne]: null }
            }
        });

        const recurrenceRateCurrent = totalUniqueClaimants > 0 
            ? (recurrenceQuery.length / totalUniqueClaimants) * 100 
            : 0;
            
        // For trend, we'd need to calculate this for the previous period, but for now let's compare with a static baseline or previous month if needed.
        // Let's calculate for previous 6 months window shifted by 1 month for trend
        const sevenMonthsAgo = new Date(sixMonthsAgo);
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 1);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const recurrenceQueryPrev = await models.Denuncia.findAll({
            attributes: ['denunciante_email'],
            where: {
                created_at: { [Op.between]: [sevenMonthsAgo, oneMonthAgo] },
                denunciante_email: { [Op.ne]: null }
            },
            group: ['denunciante_email'],
            having: literal('COUNT(id) > 1'),
            raw: true
        });

        const totalUniqueClaimantsPrev = await models.Denuncia.count({
            distinct: true,
            col: 'denunciante_email',
            where: {
                created_at: { [Op.between]: [sevenMonthsAgo, oneMonthAgo] },
                denunciante_email: { [Op.ne]: null }
            }
        });

        const recurrenceRatePrev = totalUniqueClaimantsPrev > 0
            ? (recurrenceQueryPrev.length / totalUniqueClaimantsPrev) * 100
            : 0;

        // Customer Satisfaction (Derived from Resolution Time as proxy)
        // < 2 days = 5.0, < 5 days = 4.0, < 10 days = 3.0, < 20 days = 2.0, > 20 days = 1.0
        const calculateSatisfaction = (avgDays: number) => {
            if (avgDays === 0) return 0; // No data
            if (avgDays <= 2) return 5.0;
            if (avgDays <= 5) return 4.0;
            if (avgDays <= 10) return 3.0;
            if (avgDays <= 20) return 2.0;
            return 1.0;
        };

        const satisfactionCurrent = calculateSatisfaction(avgTimeCurrent);
        const satisfactionPrev = calculateSatisfaction(avgTimePrev);

        // Critical Claims (Real calculation based on keywords or specific types if priority doesn't exist)
        // Assuming 'critical' keywords in subject or description, or specific types
        const criticalKeywords = ['urgente', 'grave', 'peligro', 'robo', 'estafa'];
        const criticalClaimsCount = await models.Denuncia.count({
            where: {
                created_at: { [Op.between]: [startCurrentMonth, endCurrentMonth] },
                [Op.or]: [
                    { asunto: { [Op.regexp]: criticalKeywords.join('|') } },
                    // Add specific types if known, e.g. type_id: X
                ]
            }
        });
        
        const key_metrics: KeyMetrics = {
            avg_resolution_time: {
                value: Math.round(avgTimeCurrent * 10) / 10,
                change: `${avgTimeChange > 0 ? '+' : ''}${Math.round(avgTimeChange * 10) / 10} días vs mes anterior`,
                trend: getTrend(avgTimePrev, avgTimeCurrent)
            },
            customer_satisfaction: {
                value: satisfactionCurrent,
                change: `${satisfactionCurrent - satisfactionPrev > 0 ? '+' : ''}${Math.round((satisfactionCurrent - satisfactionPrev) * 10) / 10} vs mes anterior`,
                trend: getTrend(satisfactionCurrent, satisfactionPrev)
            },
            critical_claims: {
                value: criticalClaimsCount,
                description: 'Detectados por palabras clave urgentes'
            },
            recurrence_rate: {
                value: Math.round(recurrenceRateCurrent * 10) / 10,
                change: `${recurrenceRateCurrent - recurrenceRatePrev > 0 ? '+' : ''}${Math.round((recurrenceRateCurrent - recurrenceRatePrev) * 10) / 10}% vs mes anterior`,
                trend: getTrend(recurrenceRateCurrent, recurrenceRatePrev)
            }
        };

        // ===== COMPANIES SUMMARY =====
        const empresas = await models.Empresa.findAll({
            where: { estado: 1 },
            attributes: ['id', 'nombre'],
            raw: true
        });

        const companies_summary: CompanySummary[] = await Promise.all(empresas.map(async (empresa: any) => {
            const total = await models.Denuncia.count({ where: { empresa_id: empresa.id } });
            const pending = await models.Denuncia.count({ 
                where: { empresa_id: empresa.id, estado_id: estadoPendienteId } 
            });
            const resolved = await models.Denuncia.count({ 
                where: { empresa_id: empresa.id, estado_id: estadoResueltoId } 
            });
            
            return {
                empresa_id: empresa.id,
                empresa_nombre: empresa.nombre,
                total_claims: total,
                pending_claims: pending,
                resolved_claims: resolved,
                resolution_rate: total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0
            };
        }));

        // Sort companies by total claims desc
        companies_summary.sort((a, b) => b.total_claims - a.total_claims);

        const response: DashboardAnalistaResponse = {
            global_kpis,
            monthly_data: monthlyData,
            claims_by_type,
            claims_by_status,
            key_metrics,
            companies_summary
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Error en getDashboardAnalista:', error);
        res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : 'Error al obtener dashboard de analista',
        });
    }
};

/**
 * Dashboard para supervisor - reclamos asignados y métricas
 * GET /api/dashboard/supervisor
 */
export const getDashboardSupervisor = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');
        const empresaId = req.user?.get('empresa_id') || 1; // Fallback to 1 if not set, similar to other endpoints
        
        const whereClause: any = { empresa_id: empresaId , asignado_a: userId};


        const denuncias = await models.Denuncia.findAll({
            where: whereClause,
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'rut'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        // 2. Calculate Metrics
        let pending = 0;
        let inProgress = 0;
        let resolved = 0;
        let critical = 0;


        const formattedClaims = denuncias.map((d: any) => {
            const plain = d.get({ plain: true });
            
            // Derive priority (mock logic since column missing)
            let prioridad = 'media';
            const asunto = plain.asunto?.toLowerCase() || '';
            const desc = plain.descripcion?.toLowerCase() || '';
            
            if (asunto.includes('urgente') || asunto.includes('grave') || desc.includes('robo')) {
                prioridad = 'alta';
            } else if (asunto.includes('consulta') || asunto.includes('duda')) {
                prioridad = 'baja';
            }

            // Update metrics
            const estadoId = plain.estado_id;
            if (estadoId === 1) pending++; // Pendiente
            else if (estadoId === 2) inProgress++; // En Revision
            else if (estadoId === 4) resolved++; // Resuelto
            
            if (prioridad === 'alta' || prioridad === 'critica') critical++;



            return {
                id_denuncia: plain.id,
                numero: plain.numero,
                codigo_acceso: plain.numero,
                id_empresa: plain.empresa_id,
                empresa_id: plain.empresa_id,
                id_estado: plain.estado_id,
                estado_id: plain.estado_id,
                id_tipo: plain.tipo_id,
                tipo_id: plain.tipo_id,
                asunto: plain.asunto,
                descripcion: plain.descripcion,
                prioridad: prioridad,
                asignado_a: plain.asignado_a || userId, // Fallback to current user if null
                nombre_denunciante: plain.denunciante_nombre,
                denunciante_nombre: plain.denunciante_nombre,
                email_denunciante: plain.denunciante_email,
                denunciante_email: plain.denunciante_email,
                denunciante_fono: plain.denunciante_fono,
                es_anonima: plain.es_anonima,
                anonimo: plain.es_anonima === 1,
                canal_origen: plain.canal_origen,
                fecha_creacion: plain.created_at,
                created_at: plain.created_at,
                updated_at: plain.updated_at,
                estadoObj: plain.estado_denuncia,
                estado_denuncia: plain.estado_denuncia,
                tipo: plain.tipo_denuncia,
                tipo_denuncia: plain.tipo_denuncia,
                empresa: plain.empresa
            };
        });

        const response = {
            data: formattedClaims,
            metrics: {
                total_claims: formattedClaims.length,
                pending_claims: pending,
                in_progress_claims: inProgress,
                resolved_claims: resolved,
                critical_claims: critical,
            }
        };

        res.json(response);

    } catch (error) {
        console.error('❌ Error en getDashboardSupervisor:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener dashboard supervisor'
        });
    }
};

/**
 * Obtener todas las denuncias asignadas al supervisor
 * GET /api/dashboard/supervisor/claims
 */
export const getAllSupervisorClaims = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');
        const empresaId = req.user?.get('empresa_id') || 1;
        
        const whereClause: any = { empresa_id: empresaId, asignado_a: userId };

        const denuncias = await models.Denuncia.findAll({
            where: whereClause,
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'rut'],
                },
            ],
            order: [['created_at', 'DESC']],
        });



        const formattedClaims = denuncias.map((d: any) => {
            const plain = d.get({ plain: true });
            
            // Derive priority
            let prioridad = 'media';
            const asunto = plain.asunto?.toLowerCase() || '';
            const desc = plain.descripcion?.toLowerCase() || '';
            
            if (asunto.includes('urgente') || asunto.includes('grave') || desc.includes('robo')) {
                prioridad = 'alta';
            } else if (asunto.includes('consulta') || asunto.includes('duda')) {
                prioridad = 'baja';
            }



            return {
                id_denuncia: plain.id,
                codigo_acceso: plain.numero,
                id_empresa: plain.empresa_id,
                empresa_id: plain.empresa_id,
                id_estado: plain.estado_id,
                estado_id: plain.estado_id,
                id_tipo: plain.tipo_id,
                tipo_id: plain.tipo_id,
                descripcion: plain.descripcion,
                prioridad: prioridad,
                asignado_a: plain.asignado_a || userId,
                fecha_creacion: plain.created_at,
                created_at: plain.created_at,
                tipo: plain.tipo_denuncia,
                estadoObj: plain.estado_denuncia
            };
        });

        const response = {
            data: formattedClaims,

        };

        res.json(response);

    } catch (error) {
        console.error('❌ Error en getAllSupervisorClaims:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener reclamos del supervisor'
        });
    }
};

/**
 * Obtener denuncias pendientes del supervisor
 * GET /api/dashboard/supervisor/pending
 */
export const getPendingSupervisorClaims = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');
        const empresaId = req.user?.get('empresa_id') || 1;
        
        // Filter by company, assigned to user, AND pending status (estado_id = 1)
        const whereClause: any = { 
            empresa_id: empresaId, 
            asignado_a: userId,
            estado_id: 1  // Pendiente
        };

        const denuncias = await models.Denuncia.findAll({
            where: whereClause,
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'rut'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        const formattedClaims = denuncias.map((d: any) => {
            const plain = d.get({ plain: true });
            
            // Derive priority
            let prioridad = 'media';
            const asunto = plain.asunto?.toLowerCase() || '';
            const desc = plain.descripcion?.toLowerCase() || '';
            
            if (asunto.includes('urgente') || asunto.includes('grave') || desc.includes('robo')) {
                prioridad = 'alta';
            } else if (asunto.includes('consulta') || asunto.includes('duda')) {
                prioridad = 'baja';
            }

            return {
                id_denuncia: plain.id,
                codigo_acceso: plain.numero,
                id_empresa: plain.empresa_id,
                empresa_id: plain.empresa_id,
                id_estado: plain.estado_id,
                estado_id: plain.estado_id,
                id_tipo: plain.tipo_id,
                tipo_id: plain.tipo_id,
                descripcion: plain.descripcion,
                prioridad: prioridad,
                asignado_a: plain.asignado_a || userId,
                fecha_creacion: plain.created_at,
                created_at: plain.created_at,
                tipo: plain.tipo_denuncia,
                estadoObj: plain.estado_denuncia
            };
        });

        const response = {
            data: formattedClaims
        };

        res.json(response);

    } catch (error) {
        console.error('❌ Error en getPendingSupervisorClaims:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener reclamos pendientes'
        });
    }
};


/**
 * Obtener denuncias resueltas del supervisor
 * GET /api/dashboard/supervisor/resolved
 */
export const getResolvedSupervisorClaims = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');
        const empresaId = req.user?.get('empresa_id') || 1;
        
        // Filter by company, assigned to user, AND resolved status (estado_id = 4)
        const whereClause: any = { 
            empresa_id: empresaId, 
            asignado_a: userId,
            estado_id: 4  // Resuelto
        };

        const denuncias = await models.Denuncia.findAll({
            where: whereClause,
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['id', 'nombre', 'codigo'],
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'rut'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        const formattedClaims = denuncias.map((d: any) => {
            const plain = d.get({ plain: true });
            
            // Derive priority
            let prioridad = 'media';
            const asunto = plain.asunto?.toLowerCase() || '';
            const desc = plain.descripcion?.toLowerCase() || '';
            
            if (asunto.includes('urgente') || asunto.includes('grave') || desc.includes('robo')) {
                prioridad = 'alta';
            } else if (asunto.includes('consulta') || asunto.includes('duda')) {
                prioridad = 'baja';
            }

            return {
                id_denuncia: plain.id,
                codigo_acceso: plain.numero,
                id_empresa: plain.empresa_id,
                empresa_id: plain.empresa_id,
                id_estado: plain.estado_id,
                estado_id: plain.estado_id,
                id_tipo: plain.tipo_id,
                tipo_id: plain.tipo_id,
                descripcion: plain.descripcion,
                prioridad: prioridad,
                asignado_a: plain.asignado_a || userId,
                fecha_creacion: plain.created_at,
                created_at: plain.created_at,
                tipo: plain.tipo_denuncia,
                estadoObj: plain.estado_denuncia
            };
        });

        const response = {
            data: formattedClaims
        };

        res.json(response);

    } catch (error) {
        console.error('❌ Error en getResolvedSupervisorClaims:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener reclamos resueltos'
        });
    }
};



