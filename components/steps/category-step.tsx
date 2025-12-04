"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";

const CATEGORIES = {
  "Servicio al Cliente": [
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
  "Productos y Servicios": [
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
  "Procesos Internos": [
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
};

interface CategoryStepProps {
  readonly formData: any;
  readonly onUpdate: (data: any) => void;
}

export function CategoryStep({ formData, onUpdate }: CategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    formData.category || "",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    formData.subcategory || "",
  );

  // 🔄 sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    if (formData.category !== selectedCategory) {
      setSelectedCategory(formData.category || "");
    }
    if (formData.subcategory !== selectedSubcategory) {
      setSelectedSubcategory(formData.subcategory || "");
    }
  }, [formData]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    onUpdate({ ...formData, category, subcategory: "" });
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    onUpdate({ ...formData, category: selectedCategory, subcategory });
    console.log("[v0] Selected subcategory:", subcategory);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="px-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">
          Selecciona la categoría principal
        </h3>
        <Accordion variant="bordered">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(
            (category) => (
              <AccordionItem
                key={category}
                title={category}
                value={category}
                onPress={() => handleCategorySelect(category)}
              >
                <CheckboxGroup
                  value={
                    selectedCategory === category ? [selectedSubcategory] : []
                  }
                >
                  {CATEGORIES[category].map((subcategory) => (
                    <Checkbox
                      key={subcategory}
                      disabled={selectedCategory !== category}
                      value={subcategory}
                      onChange={() => handleSubcategorySelect(subcategory)}
                    >
                      {subcategory}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </AccordionItem>
            ),
          )}
        </Accordion>
      </div>
    </div>
  );
}
