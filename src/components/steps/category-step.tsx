"use client"

import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Button, Badge } from "@heroui/react"
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
  readonly formData: any
  readonly onUpdate: (data: any) => void
}

export function CategoryStep({ formData, onUpdate }: CategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(formData.category || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState(formData.subcategory || "")

  // 🔄 sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    if (formData.category !== selectedCategory) {
      setSelectedCategory(formData.category || "")
    }
    if (formData.subcategory !== selectedSubcategory) {
      setSelectedSubcategory(formData.subcategory || "")
    }
  }, [formData])

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
                  ? "border-purple-600 bg-purple-100 shadow-md"
                  : "hover:border-purple-400 hover:bg-purple-50"
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
              <h2 className="text-sm text-muted-foreground">
                Elige la opción que mejor describa tu reclamo
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CATEGORIES[selectedCategory as keyof typeof CATEGORIES].map((subcategory) => (
                  <Button
                    key={subcategory}
                    color={selectedSubcategory === subcategory ? "primary" : "default"}
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
        <Card className="bg-purple-50 border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant="flat" color="secondary">
                {selectedCategory}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="flat" color="primary">
                {selectedSubcategory}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Has seleccionado esta categoría para tu reclamo
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
