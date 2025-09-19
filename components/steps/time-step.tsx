"use client"

import { useState } from "react"
import { Card, CardBody, Chip} from "@heroui/react";
import { Clock, Calendar, AlertTriangle, CircleCheck } from "lucide-react"

const TIME_OPTIONS = [
  {
    id: "reciente",
    title: "Menos de 1 semana",
    description: "El problema ocurrió recientemente",
    icon: Clock,
    color: "bg-red-500/10 text-red-700 border-red-200",
  },
  {
    id: "semanas",
    title: "1-4 semanas",
    description: "Algunas semanas atrás",
    icon: Calendar,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  {
    id: "meses",
    title: "1-3 meses",
    description: "Hace algunos meses",
    icon: Calendar,
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  },
  {
    id: "trimestre",
    title: "3-6 meses",
    description: "Hace un trimestre aproximadamente",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  {
    id: "semestre",
    title: "6-12 meses",
    description: "Hace más de medio año",
    icon: Calendar,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  {
    id: "anual",
    title: "Más de 1 año",
    description: "Problema de larga duración",
    icon: AlertTriangle,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
  },
]

interface TimeStepProps {
  readonly formData: any
  readonly onUpdate: (data: any) => void
}

export function TimeStep({ formData, onUpdate }: TimeStepProps) {
  const [selectedTime, setSelectedTime] = useState(formData.timeframe || "")

  const handleTimeSelect = (timeId: string) => {
    setSelectedTime(timeId)
    onUpdate({ ...formData, timeframe: timeId })
  }

  const selectedTimeData = TIME_OPTIONS.find((t) => t.id === selectedTime)

  return (
    <div className="space-y-6">
      <div className="p-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">¿Cuánto tiempo lleva ocurriendo este problema?</h3>
        <p className="text-muted-foreground">
          Selecciona el período de tiempo que mejor describa la duración del problema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TIME_OPTIONS.map((timeOption) => {
          const Icon = timeOption.icon
          const isSelected = selectedTime === timeOption.id

          return (
            <Card
              key={timeOption.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-md scale-105"
                  : "hover:border-accent/50 hover:bg-accent/5 hover:scale-102"
              }`}
              onClick={() => handleTimeSelect(timeOption.id)}
              isPressable
            >
              <CardBody className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${timeOption.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{timeOption.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{timeOption.description}</p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <Chip variant="flat" color="primary" startContent={<CircleCheck className="h-4 w-4" />}>
                        Seleccionado
                      </Chip>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {selectedTimeData && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <selectedTimeData.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Duración seleccionada: {selectedTimeData.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTimeData.description}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
