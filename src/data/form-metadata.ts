import type { Transaction } from 'sequelize';
import type { DbModels } from '../models';
import { sequelize } from '../db/sequelize';

export interface SubcategoryMetadata {
    code: string;
    name: string;
    description?: string;
}

export interface CategoryMetadata {
    id: string;
    name: string;
    description?: string;
    subcategories: SubcategoryMetadata[];
}

export interface RelationshipMetadata {
    id: string;
    title: string;
    description: string;
}

export interface TimeframeMetadata {
    id: string;
    title: string;
    description: string;
}

export interface DefaultEmpresaMetadata {
    rut: string;
    name: string;
}

export interface DefaultEstadoMetadata {
    code: string;
    name: string;
}

export interface FormMetadata {
    categories: CategoryMetadata[];
    relationships: RelationshipMetadata[];
    countries: string[];
    timeframes: TimeframeMetadata[];
    defaults: {
        estado: DefaultEstadoMetadata;
        empresa: DefaultEmpresaMetadata;
    };
}

export const FORM_CATEGORIES: CategoryMetadata[] = [
    {
        id: 'SERVICIO_CLIENTE',
        name: 'Servicio al Cliente',
        subcategories: [
            { code: 'SERVICIO_ATENCION_DEFICIENTE', name: 'Atención deficiente' },
            { code: 'SERVICIO_DEMORAS_RESPUESTA', name: 'Demoras en respuesta' },
            { code: 'SERVICIO_INFORMACION_INCORRECTA', name: 'Información incorrecta' },
            { code: 'SERVICIO_FALTA_SEGUIMIENTO', name: 'Falta de seguimiento' },
            { code: 'SERVICIO_PERSONAL_NO_CAPACITADO', name: 'Personal no capacitado' },
            { code: 'SERVICIO_HORARIOS_ATENCION', name: 'Horarios de atención' },
            { code: 'SERVICIO_CANALES_COMUNICACION', name: 'Canales de comunicación' },
            { code: 'SERVICIO_RESOLUCION_PROBLEMAS', name: 'Resolución de problemas' },
            { code: 'SERVICIO_TIEMPO_ESPERA', name: 'Tiempo de espera' },
            { code: 'SERVICIO_CALIDAD', name: 'Calidad del servicio' },
        ],
    },
    {
        id: 'PRODUCTOS_SERVICIOS',
        name: 'Productos y Servicios',
        subcategories: [
            { code: 'PRODUCTO_CALIDAD', name: 'Calidad del producto' },
            { code: 'PRODUCTO_DEFECTOS_FABRICACION', name: 'Defectos de fabricación' },
            { code: 'PRODUCTO_GARANTIAS_DEVOLUCIONES', name: 'Garantías y devoluciones' },
            { code: 'PRODUCTO_PRECIOS_FACTURACION', name: 'Precios y facturación' },
            { code: 'PRODUCTO_DISPONIBILIDAD', name: 'Disponibilidad' },
            { code: 'PRODUCTO_ENTREGA_LOGISTICA', name: 'Entrega y logística' },
            { code: 'PRODUCTO_INSTALACION_CONFIGURACION', name: 'Instalación y configuración' },
            { code: 'PRODUCTO_MANTENCION', name: 'Mantenimiento' },
            { code: 'PRODUCTO_ACTUALIZACIONES', name: 'Actualizaciones' },
            { code: 'PRODUCTO_COMPATIBILIDAD', name: 'Compatibilidad' },
        ],
    },
    {
        id: 'PROCESOS_INTERNOS',
        name: 'Procesos Internos',
        subcategories: [
            { code: 'PROCESO_POLITICAS_PROCEDIMIENTOS', name: 'Políticas y procedimientos' },
            { code: 'PROCESO_SISTEMAS_INFORMATICOS', name: 'Sistemas informáticos' },
            { code: 'PROCESO_GESTION_DATOS', name: 'Gestión de datos' },
            { code: 'PROCESO_SEGURIDAD_PRIVACIDAD', name: 'Seguridad y privacidad' },
            { code: 'PROCESO_CUMPLIMIENTO_NORMATIVO', name: 'Cumplimiento normativo' },
            { code: 'PROCESO_RECURSOS_HUMANOS', name: 'Recursos humanos' },
            { code: 'PROCESO_CAPACITACION', name: 'Capacitación' },
            { code: 'PROCESO_COMUNICACION_INTERNA', name: 'Comunicación interna' },
            { code: 'PROCESO_GESTION_CALIDAD', name: 'Gestión de calidad' },
            { code: 'PROCESO_MEJORA_CONTINUA', name: 'Mejora continua' },
        ],
    },
];

export const FORM_RELATIONSHIPS: RelationshipMetadata[] = [
    {
        id: 'cliente',
        title: 'Cliente',
        description: 'Soy cliente de la empresa',
    },
    {
        id: 'empleado',
        title: 'Empleado',
        description: 'Trabajo en la empresa',
    },
    {
        id: 'proveedor',
        title: 'Proveedor',
        description: 'Soy proveedor de la empresa',
    },
    {
        id: 'administrador',
        title: 'Administrador',
        description: 'Tengo rol administrativo',
    },
    {
        id: 'gerente',
        title: 'Gerente',
        description: 'Soy gerente o supervisor',
    },
    {
        id: 'tercero',
        title: 'Tercero',
        description: 'No tengo relación directa',
    },
];

export const FORM_COUNTRIES: string[] = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'España',
    'Guatemala',
    'Honduras',
    'México',
    'Nicaragua',
    'Panamá',
    'Paraguay',
    'Perú',
    'Puerto Rico',
    'República Dominicana',
    'Uruguay',
    'Venezuela',
    'Estados Unidos',
    'Canadá',
    'Francia',
    'Alemania',
    'Italia',
    'Reino Unido',
    'Portugal',
    'Países Bajos',
    'Bélgica',
    'Suiza',
    'Austria',
    'Suecia',
    'Noruega',
    'Dinamarca',
    'Australia',
    'Nueva Zelanda',
    'Japón',
    'Corea del Sur',
    'China',
    'India',
    'Singapur',
];

export const FORM_TIMEFRAMES: TimeframeMetadata[] = [
    {
        id: 'reciente',
        title: 'Menos de 1 semana',
        description: 'El problema ocurrió recientemente',
    },
    {
        id: 'semanas',
        title: '1-4 semanas',
        description: 'Algunas semanas atrás',
    },
    {
        id: 'meses',
        title: '1-3 meses',
        description: 'Hace algunos meses',
    },
    {
        id: 'trimestre',
        title: '3-6 meses',
        description: 'Hace un trimestre aproximadamente',
    },
    {
        id: 'semestre',
        title: '6-12 meses',
        description: 'Hace más de medio año',
    },
    {
        id: 'anual',
        title: 'Más de 1 año',
        description: 'Problema de larga duración',
    },
];

export const DEFAULT_ESTADO: DefaultEstadoMetadata = {
    code: 'PENDIENTE',
    name: 'Pendiente de revisión',
};

export const DEFAULT_EMPRESA: DefaultEmpresaMetadata = {
    rut: '76.000.000-0',
    name: 'Corporación Ejemplo S.A.',
};

export const FORM_METADATA: FormMetadata = {
    categories: FORM_CATEGORIES,
    relationships: FORM_RELATIONSHIPS,
    countries: FORM_COUNTRIES,
    timeframes: FORM_TIMEFRAMES,
    defaults: {
        estado: DEFAULT_ESTADO,
        empresa: DEFAULT_EMPRESA,
    },
};

let metadataSeeded = false;

async function ensureTipoDenunciaSeeded(
    models: DbModels,
    transaction: Transaction
) {
    for (const category of FORM_CATEGORIES) {
        for (const subcategory of category.subcategories) {
            const codigo = subcategory.code.toUpperCase();
            await models.TipoDenuncia.findOrCreate({
                where: { codigo },
                defaults: {
                    nombre: subcategory.name,
                },
                transaction,
            });
        }
    }
}

async function ensureEstadoSeeded(models: DbModels, transaction: Transaction) {
    await models.EstadoDenuncia.findOrCreate({
        where: { codigo: DEFAULT_ESTADO.code.toUpperCase() },
        defaults: { nombre: DEFAULT_ESTADO.name },
        transaction,
    });
}

async function ensureEmpresaSeeded(models: DbModels, transaction: Transaction) {
    await models.Empresa.findOrCreate({
        where: { rut: DEFAULT_EMPRESA.rut },
        defaults: {
            nombre: DEFAULT_EMPRESA.name,
            estado: 1,
        },
        transaction,
    });
}

export async function ensureFormMetadataSeeded(models: DbModels) {
    if (metadataSeeded) return;
    await sequelize.transaction(async (transaction) => {
        await ensureEstadoSeeded(models, transaction);
        await ensureEmpresaSeeded(models, transaction);
        await ensureTipoDenunciaSeeded(models, transaction);
    });
    metadataSeeded = true;
}
