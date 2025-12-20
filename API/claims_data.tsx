import * as LucideIcons from "lucide-react";

interface BackendSubcategory {
  code: string;
  name: string;
}

interface BackendCategory {
  id: string;
  icon: string;
  name: string;
  description: string | null;
  subcategories: BackendSubcategory[];
}

interface BackendResponse {
  countries: string[];
  categories: BackendCategory[];
  generatedAt: string;
  enterprise?: { rut: string; nombre: string }[];
}

interface TransformedData {
  categories: Record<
    string,
    {
      description: string;
      categories: string[];
    }
  >;
  categoryIcons: Record<string, any>;
  countries: string[];
  enterprise?: { rut: string; nombre: string }[];
}

// Datos por defecto
const DEFAULT_DATA: TransformedData = {
  categories: {
    "Respeto y seguridad en el trabajo": {
      description: "Problemas relacionados con respeto y seguridad laboral",
      categories: [
        "Acoso laboral",
        "Acoso sexual",
        "Comportamiento inadecuado",
        "Discriminación",
        "Represalias",
        "Salud y seguridad",
        "Violencia en el lugar de trabajo",
      ],
    },
    "Ley Karin": {
      description: "Problemas relacionados con respeto y seguridad laboral",
      categories: [
        "Acoso laboral",
        "Acoso sexual",
        "Comportamiento inadecuado",
        "Discriminación",
        "Represalias",
        "Salud y seguridad",
        "Violencia en el lugar de trabajo",
      ],
    },
    "Integridad en los negocios": {
      description: "Problemas relacionados con integridad empresarial",
      categories: [
        "Apropiación o uso indebido de recursos de la compañía",
        "Conflicto de intereses",
        "Fraude contable o tributario",
        "Lavado de activos / Financiamiento del terrorismo",
        "Libre competencia",
        "Privacidad y protección de datos personales",
        "Receptación",
        "Soborno y corrupción",
        "Uso indebido de propiedad intelectual o industrial",
        "Uso información privilegiada",
      ],
    },
    "Sostenibilidad y medio ambiente": {
      description: "Problemas relacionados con sostenibilidad y medio ambiente",
      categories: [
        "Medio ambiente",
        "Trabajo infantil o forzoso",
        "Vecinos y comunidades",
      ],
    },
  },
  categoryIcons: {
    "Respeto y seguridad en el trabajo": (LucideIcons as any).Headset,
    "Integridad en los negocios": (LucideIcons as any).Headset,
    "Sostenibilidad y medio ambiente": (LucideIcons as any).Headset,
  },
  countries: ["Argentina", "Chile", "Perú", "Francia", "Mexico"],
};

// Función para transformar los datos
function transformBackendData(backendData: BackendResponse): TransformedData {
  if (!backendData || !backendData.categories || !backendData.countries) {
    return DEFAULT_DATA;
  }

  const transformedCategories: Record<
    string,
    {
      description: string;
      categories: string[];
      enterprise: [{ rut: string; nombre: string }];
    }
  > = {};

  const transformedIcons: Record<string, any> = {};

  // Transformar categorías
  backendData.categories.forEach((category) => {
    const subcategoryNames = category.subcategories.map((sub) => sub.name);

    transformedCategories[category.name] = {
      description: category.description || "Sin descripción disponible",
      categories: subcategoryNames,
      enterprise: [{ rut: "", nombre: "" }],
    };

    // Mapear iconos
    // Buscar el icono en el objeto de Lucide
    // Si no existe, usar Headset como fallback
    const iconName = category.icon;
    const IconComponent =
      (LucideIcons as any)[iconName] || (LucideIcons as any).Headset;

    transformedIcons[category.name] = IconComponent;
  });

  return {
    categories: transformedCategories,
    categoryIcons: transformedIcons,
    countries: backendData.countries,
    enterprise: backendData.enterprise,
  };
}

export default async function ClaimsData(): Promise<TransformedData> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/form-metadata`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const backendData: BackendResponse = await response.json();

    // Transformar y devolver los datos
    return transformBackendData(backendData);
  } catch {
    // Devolver datos por defecto en caso de error
    return DEFAULT_DATA;
  }
}
