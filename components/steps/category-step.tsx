"use client";

import { useEffect, useState } from "react";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { Headphones, Package, Settings, ArrowLeft, Scale } from "lucide-react";

import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  "Servicio al Cliente": Headphones,
  "Productos y Servicios": Package,
  "Procesos Internos": Settings,
  "Ley Karin": Scale,
} as const;

const CATEGORIES = {
  "Ley Karin": {
    description: "Problemas relacionados con la atención al cliente",
    categories: [
      "Atención deficiente",
      "Demoras en respuesta",
      "Información incorrecta",
      "Falta de seguimiento",
      "Personal no capacitado",
      "Horarios de atención",
      "Canales de comunicación",
      "Resolución de problemas",
      "Tiempo de espera",
      "Calidad del servicio",
    ],
  },
  "Servicio al Cliente": {
    description: "Problemas relacionados con la atención al cliente",
    categories: [
      "Atención deficiente",
      "Demoras en respuesta",
      "Información incorrecta",
      "Falta de seguimiento",
      "Personal no capacitado",
      "Horarios de atención",
      "Canales de comunicación",
      "Resolución de problemas",
      "Tiempo de espera",
      "Calidad del servicio",
    ],
  },
  "Productos y Servicios": {
    description: "Problemas relacionados con productos y servicios",
    categories: [
      "Calidad del producto",
      "Defectos de fabricación",
      "Garantías y devoluciones",
      "Precios y facturación",
      "Disponibilidad",
      "Entrega y logística",
      "Instalación y configuración",
      "Mantenimiento",
      "Actualizaciones",
      "Compatibilidad",
    ],
  },
  "Procesos Internos": {
    description: "Problemas relacionados con procesos internos",
    categories: [
      "Políticas y procedimientos",
      "Sistemas informáticos",
      "Gestión de datos",
      "Seguridad y privacidad",
      "Cumplimiento normativo",
      "Recursos humanos",
      "Capacitación",
      "Comunicación interna",
      "Gestión de calidad",
      "Mejora continua",
    ],
  },
};

type CategoryKey = keyof typeof CATEGORIES;

interface CategoryStepProps {
  readonly formData: any;
  readonly onUpdate: (data: any) => void;
}

export function CategoryStep({ formData, onUpdate }: CategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    formData.category || "",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    formData.subcategory || "",
  );
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(
    null,
  );

  useEffect(() => {
    if (formData.category !== selectedCategory) {
      setSelectedCategory(formData.category || "");
    }
    if (formData.subcategory !== selectedSubcategory) {
      setSelectedSubcategory(formData.subcategory || "");
    }
  }, [formData]);

  const handleCategoryClick = (category: CategoryKey) => {
    setExpandedCategory(category);
    setSelectedCategory(category);
    setSelectedSubcategory("");
    onUpdate({ category, subcategory: "" });
  };

  const handleBack = () => {
    setExpandedCategory(null);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    onUpdate({ category: selectedCategory, subcategory });
  };

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  const renderIcon = (categoryKey: CategoryKey, className: string) => {
    const Icon = CATEGORY_ICONS[categoryKey];

    return <Icon className={className} />;
  };

  return (
    <div className="space-y-6">
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-4">
          Selecciona la categoría principal
        </h3>

        <div className="relative min-h-[280px]">
          {/* Grid of category buttons */}
          <div
            className={cn(
              "grid grid-cols-2 gap-3 transition-all duration-300 ease-in-out",
              expandedCategory
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100 scale-100",
            )}
          >
            {categoryKeys.map((categoryKey) => {
              const isSelected = selectedCategory === categoryKey;

              return (
                <button
                  key={categoryKey}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2",
                    "transition-all duration-200 ease-in-out",
                    "hover:border-primary hover:bg-primary/5 hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "min-h-[130px]",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-default-200 bg-default-50",
                  )}
                  type="button"
                  onClick={() => handleCategoryClick(categoryKey)}
                >
                  {renderIcon(
                    categoryKey,
                    cn(
                      "h-10 w-10 transition-colors",
                      isSelected ? "text-primary" : "text-default-500",
                    ),
                  )}
                  <span
                    className={cn(
                      "font-semibold text-sm text-center leading-tight",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {categoryKey}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded category view */}
          {expandedCategory && (
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 ease-in-out",
                "opacity-100 scale-100",
              )}
            >
              <div className="h-full border-2 border-primary rounded-xl bg-background overflow-hidden flex flex-col">
                {/* Header with back button */}
                <div className="p-4 border-b border-default-200 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <button
                      className="p-1.5 rounded-lg hover:bg-default-200 transition-colors"
                      type="button"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-5 w-5 text-default-600" />
                    </button>
                    <div className="flex items-center gap-3">
                      {renderIcon(expandedCategory, "h-6 w-6 text-primary")}
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {expandedCategory}
                        </h4>
                        <p className="text-xs text-default-500">
                          {CATEGORIES[expandedCategory].description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="flex-1 overflow-y-auto p-4">
                  <CheckboxGroup
                    classNames={{
                      wrapper: "gap-4",
                    }}
                    value={[selectedSubcategory]}
                  >
                    {CATEGORIES[expandedCategory].categories.map(
                      (subcategory) => (
                        <Checkbox
                          key={subcategory}
                          classNames={{
                            base: cn(
                              "inline-flex w-full max-w-full",
                              "hover:bg-default-100 rounded-lg p-2 -ml-2",
                              "cursor-pointer transition-colors",
                            ),
                            label: "text-sm",
                          }}
                          value={subcategory}
                          onChange={() => handleSubcategorySelect(subcategory)}
                        >
                          {subcategory}
                        </Checkbox>
                      ),
                    )}
                  </CheckboxGroup>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
