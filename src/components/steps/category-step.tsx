"use client"

import { useState } from "react"
import { Card, CardBody, CardHeader, Button, Badge} from "@heroui/react";
import { ChevronRight } from "lucide-react"

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
}

interface CategoryStepProps {
  formData: any
  onUpdate: (data: any) => void
}

export function CategoryStep({ formData, onUpdate }: CategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(formData.category || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState(formData.subcategory || "")

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubcategory("")
    onUpdate({ ...formData, category, subcategory: "" })
  }

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    onUpdate({ ...formData, category: selectedCategory, subcategory })
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecciona la categoría principal</h3>
        <div className="grid gap-3">
          {Object.keys(CATEGORIES).map((category) => (
            <Card
              key={category}
              className={`cursor-pointer transition-all duration-200 ${
                selectedCategory === category
                  ? "border-accent bg-accent/10 shadow-md"
                  : "hover:border-accent/50 hover:bg-accent/5"
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORIES[category as keyof typeof CATEGORIES].length} subcategorías disponibles
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Subcategory Selection */}
      {selectedCategory && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Selecciona la subcategoría específica</h3>
          <Card>
            <CardHeader>
              <h1 className="text-base">{selectedCategory}</h1>
              <h2 className="text-sm text-muted-foreground">Elige la opción que mejor describa tu reclamo</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CATEGORIES[selectedCategory as keyof typeof CATEGORIES].map((subcategory) => (
                  <Button
                    key={subcategory}
                    variant={selectedSubcategory === subcategory ? "solid" : "bordered"}
                    className="justify-start h-auto p-3 text-left"
                    onPress={() => handleSubcategorySelect(subcategory)}
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCategory && selectedSubcategory && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant="flat">{selectedCategory}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="flat">{selectedSubcategory}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Has seleccionado esta categoría para tu reclamo</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
