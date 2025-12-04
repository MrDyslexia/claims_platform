"use client";

import { type TimeframeMetadata, FALLBACK_TIMEFRAMES } from "@/lib/form-metadata";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";

const TIMEFRAME_STYLES: Record<string, { icon: LucideIcon; color: string }> = {
  reciente: {
    icon: Clock,
    color: "bg-red-500/10 text-red-700 border-red-200",
  },
  semanas: {
    icon: Calendar,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  meses: {
    icon: Calendar,
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  },
  trimestre: {
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  semestre: {
    icon: Calendar,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  anual: {
    icon: AlertTriangle,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
  },
};

const DEFAULT_STYLE = {
  icon: Clock,
  color: "bg-gray-500/10 text-gray-700 border-gray-200",
};

interface TimeStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function TimeStep({ formData, onUpdate }: TimeStepProps) {
  const [selectedTime, setSelectedTime] = useState<string>(
    formData.timeframe || "",
  );

  // 🔄 Sincronizar cuando formData cambie desde afuera

  // 🔄 Sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    setSelectedTime(formData.timeframe || "");
  }, [formData.timeframe]);

  const handleTimeSelect = (timeframe: TimeframeMetadata) => {
    setSelectedTime(timeframe.id);
    onUpdate({
      ...formData,
      timeframe: timeframe.id,
      timeframeLabel: timeframe.title,
    });
  };

  const selectedTimeData = FALLBACK_TIMEFRAMES.find(
    (timeframe) => timeframe.id === selectedTime,
  );
  const selectedStyle =
    (selectedTimeData &&
      (TIMEFRAME_STYLES[selectedTimeData.id] ?? DEFAULT_STYLE)) ||
    null;
  const SelectedIcon = selectedStyle?.icon;

  return (
    <div className="space-y-6">
      <div className="p-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">
          ¿Cuánto tiempo lleva ocurriendo este problema?
        </h3>
        <p className="text-muted-foreground">
          Selecciona el período que mejor describa la duración del inconveniente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FALLBACK_TIMEFRAMES.map((timeframe) => {
          const style = TIMEFRAME_STYLES[timeframe.id] ?? DEFAULT_STYLE;
          const Icon = style.icon;
          const isSelected = selectedTime === timeframe.id;

          return (
            <Card
              key={timeframe.id}
              isPressable
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-md scale-105"
                  : "hover:border-accent/50 hover:bg-accent/5 hover:scale-102"
              }`}
              onPress={() => handleTimeSelect(timeframe)}
            >
              <CardBody className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${style.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{timeframe.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {timeframe.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <Chip
                        color="primary"
                        startContent={<CircleCheck className="h-4 w-4" />}
                        variant="flat"
                      >
                        Seleccionado
                      </Chip>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {selectedTimeData && SelectedIcon && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <SelectedIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  Duración seleccionada: {selectedTimeData.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTimeData.description}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
