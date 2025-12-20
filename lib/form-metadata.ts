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

export interface DefaultEstadoMetadata {
  code: string;
  name: string;
}

export interface DefaultEmpresaMetadata {
  rut: string;
  name: string;
}

export interface FormMetadataResponse {
  categories: CategoryMetadata[];
  relationships: RelationshipMetadata[];
  countries: string[];
  timeframes: TimeframeMetadata[];
  defaults: {
    estado: DefaultEstadoMetadata;
    empresa: DefaultEmpresaMetadata;
  };
  generatedAt?: string;
}

const FALLBACK_CATEGORIES: CategoryMetadata[] = [
  {
    id: "SERVICIO_CLIENTE",
    name: "Servicio al Cliente",
    subcategories: [
      { code: "SERVICIO_ATENCION_DEFICIENTE", name: "Atención deficiente" },
      { code: "SERVICIO_DEMORAS_RESPUESTA", name: "Demoras en respuesta" },
      {
        code: "SERVICIO_INFORMACION_INCORRECTA",
        name: "Información incorrecta",
      },
      { code: "SERVICIO_FALTA_SEGUIMIENTO", name: "Falta de seguimiento" },
      {
        code: "SERVICIO_PERSONAL_NO_CAPACITADO",
        name: "Personal no capacitado",
      },
      { code: "SERVICIO_HORARIOS_ATENCION", name: "Horarios de atención" },
      {
        code: "SERVICIO_CANALES_COMUNICACION",
        name: "Canales de comunicación",
      },
      {
        code: "SERVICIO_RESOLUCION_PROBLEMAS",
        name: "Resolución de problemas",
      },
      { code: "SERVICIO_TIEMPO_ESPERA", name: "Tiempo de espera" },
      { code: "SERVICIO_CALIDAD", name: "Calidad del servicio" },
    ],
  },
  {
    id: "PRODUCTOS_SERVICIOS",
    name: "Productos y Servicios",
    subcategories: [
      { code: "PRODUCTO_CALIDAD", name: "Calidad del producto" },
      {
        code: "PRODUCTO_DEFECTOS_FABRICACION",
        name: "Defectos de fabricación",
      },
      {
        code: "PRODUCTO_GARANTIAS_DEVOLUCIONES",
        name: "Garantías y devoluciones",
      },
      { code: "PRODUCTO_PRECIOS_FACTURACION", name: "Precios y facturación" },
      { code: "PRODUCTO_DISPONIBILIDAD", name: "Disponibilidad" },
      { code: "PRODUCTO_ENTREGA_LOGISTICA", name: "Entrega y logística" },
      {
        code: "PRODUCTO_INSTALACION_CONFIGURACION",
        name: "Instalación y configuración",
      },
      { code: "PRODUCTO_MANTENCION", name: "Mantenimiento" },
      { code: "PRODUCTO_ACTUALIZACIONES", name: "Actualizaciones" },
      { code: "PRODUCTO_COMPATIBILIDAD", name: "Compatibilidad" },
    ],
  },
  {
    id: "PROCESOS_INTERNOS",
    name: "Procesos Internos",
    subcategories: [
      {
        code: "PROCESO_POLITICAS_PROCEDIMIENTOS",
        name: "Políticas y procedimientos",
      },
      { code: "PROCESO_SISTEMAS_INFORMATICOS", name: "Sistemas informáticos" },
      { code: "PROCESO_GESTION_DATOS", name: "Gestión de datos" },
      { code: "PROCESO_SEGURIDAD_PRIVACIDAD", name: "Seguridad y privacidad" },
      {
        code: "PROCESO_CUMPLIMIENTO_NORMATIVO",
        name: "Cumplimiento normativo",
      },
      { code: "PROCESO_RECURSOS_HUMANOS", name: "Recursos humanos" },
      { code: "PROCESO_CAPACITACION", name: "Capacitación" },
      { code: "PROCESO_COMUNICACION_INTERNA", name: "Comunicación interna" },
      { code: "PROCESO_GESTION_CALIDAD", name: "Gestión de calidad" },
      { code: "PROCESO_MEJORA_CONTINUA", name: "Mejora continua" },
    ],
  },
];

export const FALLBACK_RELATIONSHIPS: RelationshipMetadata[] = [
  { id: "cliente", title: "Cliente", description: "Soy cliente de la empresa" },
  {
    id: "colaborador_security",
    title: "Colaborador SECURITY",
    description: "Trabajo en SECURITY",
  },
  {
    id: "colaborador_belator",
    title: "Colaborador GRUPO BELATOR",
    description: "Trabajo en GRUPO BELATOR",
  },
  {
    id: "proveedor_visita",
    title: "Proveedor - Visita",
    description: "Soy proveedor o visitante",
  },
  { id: "vecino", title: "Vecino", description: "Soy vecino del lugar" },
  {
    id: "tercero_transeunte",
    title: "Tercero - Transeúnte",
    description: "Soy un tercero o transeúnte",
  },
  {
    id: "autoridades",
    title: "Autoridades",
    description: "Represento a una autoridad",
  },
  {
    id: "organizaciones_afines",
    title: "Organizaciones afines",
    description: "Represento una organización afín",
  },
];

const FALLBACK_COUNTRIES: string[] = [
  "Argentina",
  "Chile",
  "Perú",
  "Francia",
  "Mexico",
];

export const FALLBACK_TIMEFRAMES: TimeframeMetadata[] = [
  {
    id: "reciente",
    title: "Menos de 1 semana",
    description: "El problema ocurrió recientemente",
  },
  { id: "semanas", title: "1-4 semanas", description: "Algunas semanas atrás" },
  { id: "meses", title: "1-3 meses", description: "Hace algunos meses" },
  {
    id: "trimestre",
    title: "3-6 meses",
    description: "Hace un trimestre aproximadamente",
  },
  { id: "semestre", title: "6-12 meses", description: "Hace más de medio año" },
  {
    id: "anual",
    title: "Más de 1 año",
    description: "Problema de larga duración",
  },
];

export const FALLBACK_FORM_METADATA: FormMetadataResponse = {
  categories: FALLBACK_CATEGORIES,
  relationships: FALLBACK_RELATIONSHIPS,
  countries: FALLBACK_COUNTRIES,
  timeframes: FALLBACK_TIMEFRAMES,
  defaults: {
    estado: { code: "PENDIENTE", name: "Pendiente de revisión" },
    empresa: { rut: "76.000.000-0", name: "Corporación Ejemplo S.A." },
  },
};

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export async function fetchFormMetadata(
  signal?: AbortSignal,
): Promise<FormMetadataResponse> {
  const response = await fetch(`${DEFAULT_API_BASE}/public/form-metadata`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error al obtener metadata (${response.status})`);
  }

  return response.json();
}
