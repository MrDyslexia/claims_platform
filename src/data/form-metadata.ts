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
        empresa: DefaultEmpresaMetadata;
        estado: DefaultEstadoMetadata;
    };
}

export const FORM_CATEGORIES: CategoryMetadata[] = [
    {
        id: 'RESPETO_SEGURIDAD',
        name: 'Respeto y seguridad en el trabajo',
        subcategories: [
            { code: 'ACOSO_LABORAL', name: 'Acoso laboral' },
            { code: 'ACOSO_SEXUAL', name: 'Acoso sexual' },
            { code: 'COMPORTAMIENTO_INADECUADO', name: 'Comportamiento inadecuado' },
            { code: 'DISCRIMINACION', name: 'Discriminación' },
            { code: 'REPRESALIAS', name: 'Represalias' },
            { code: 'SALUD_SEGURIDAD', name: 'Salud y seguridad' },
            { code: 'VIOLENCIA_TRABAJO', name: 'Violencia en el lugar de trabajo' },
        ],
    },
    {
        id: 'INTEGRIDAD_NEGOCIOS',
        name: 'Integridad en los negocios',
        subcategories: [
            {
                code: 'USO_INDEBIDO_RECURSOS',
                name: 'Apropiación o uso indebido de recursos de la compañía',
            },
            { code: 'CONFLICTO_INTERESES', name: 'Conflicto de intereses' },
            { code: 'FRAUDE_CONTABLE', name: 'Fraude contable o tributario' },
            {
                code: 'LAVADO_ACTIVOS',
                name: 'Lavado de activos / Financiamiento del terrorismo',
            },
            { code: 'LIBRE_COMPETENCIA', name: 'Libre competencia' },
            {
                code: 'PRIVACIDAD_DATOS',
                name: 'Privacidad y protección de datos personales',
            },
            { code: 'RECEPTACION', name: 'Receptación' },
            { code: 'SOBORNO_CORRUPCION', name: 'Soborno y corrupción' },
            {
                code: 'PROPIEDAD_INTELECTUAL',
                name: 'Uso indebido de propiedad intelectual o industrial',
            },
            { code: 'INFORMACION_PRIVILEGIADA', name: 'Uso información privilegiada' },
        ],
    },
    {
        id: 'SOSTENIBILIDAD',
        name: 'Sostenibilidad, medio ambiente y vecinos',
        subcategories: [
            { code: 'MEDIO_AMBIENTE', name: 'Medio ambiente' },
            { code: 'TRABAJO_INFANTIL', name: 'Trabajo infantil o forzoso' },
            { code: 'VECINOS_COMUNIDADES', name: 'Vecinos y comunidades' },
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
  "Chile",
  "Argentina",
  "Perú",
  "Francia",
  "Mexico",
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
        // Asegurar que la categoría existe
        const [categoriaDb] = (await models.CategoriaDenuncia.findOrCreate({
            where: { nombre: category.name },
            defaults: {
                nombre: category.name,
                descripcion: category.description,
                activo: 1,
            },
            transaction,
        })) as any;

        for (const subcategory of category.subcategories) {
            const codigo = subcategory.code.toUpperCase();
            const [tipo, created] = (await models.TipoDenuncia.findOrCreate({
                where: { codigo },
                defaults: {
                    nombre: subcategory.name,
                    categoria_id: categoriaDb.id,
                },
                transaction,
            })) as any;

            // Si ya existía pero no tenía categoría asignada, actualizarla
            if (!created && !tipo.categoria_id) {
                tipo.categoria_id = categoriaDb.id;
                await tipo.save({ transaction });
            }
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
