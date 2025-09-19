"use client";
import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Divider,
} from "@heroui/react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Users,
  Globe,
  Clock,
  Building,
  MessageSquare,
  User,
  Send,
} from "lucide-react";
import { CategoryStep } from "./steps/category-step";
import { RelationshipStep } from "./steps/relationship-step";
import { LocationStep } from "./steps/location-step";
import { DetailsStep } from "./steps/details-step";
import { TimeStep } from "./steps/time-step";
import { InvolvedStep } from "./steps/involved-step";
import { DescriptionStep } from "./steps/description-step";
import { EvidenceStep } from "./steps/evidence-step";
import { IdentificationStep } from "./steps/identification-step";

const STEPS = [
  {
    id: 1,
    title: "Categoría",
    description: "Selecciona el tipo de reclamo",
    icon: FileText,
  },
  {
    id: 2,
    title: "Relación",
    description: "Tu relación con la empresa",
    icon: Users,
  },
  {
    id: 3,
    title: "Ubicación",
    description: "País donde ocurrió el hecho",
    icon: Globe,
  },
  {
    id: 4,
    title: "Detalles",
    description: "Información adicional",
    icon: MessageSquare,
  },
  { id: 5, title: "Tiempo", description: "Duración del problema", icon: Clock },
  {
    id: 6,
    title: "Involucrados",
    description: "Personas y entidades",
    icon: Building,
  },
  {
    id: 7,
    title: "Descripción",
    description: "Relato detallado del hecho",
    icon: MessageSquare,
  },
  {
    id: 8,
    title: "Evidencias",
    description: "Documentos y fotografías",
    icon: FileText,
  },
  {
    id: 9,
    title: "Identificación",
    description: "Datos personales o anónimo",
    icon: User,
  },
];

export function ClaimsWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS.find((step) => step.id === currentStep);
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleSubmit = () => {
    // Here you would typically submit the form data
    console.log("[v0] Form data to submit:", formData);
    alert(
      "Reclamo enviado exitosamente. Recibirás una confirmación por email."
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CategoryStep formData={formData} onUpdate={setFormData} />;
      case 2:
        return <RelationshipStep formData={formData} onUpdate={setFormData} />;
      case 3:
        return <LocationStep formData={formData} onUpdate={setFormData} />;
      case 4:
        return <DetailsStep formData={formData} onUpdate={setFormData} />;
      case 5:
        return <TimeStep formData={formData} onUpdate={setFormData} />;
      case 6:
        return <InvolvedStep formData={formData} onUpdate={setFormData} />;
      case 7:
        return <DescriptionStep formData={formData} onUpdate={setFormData} />;
      case 8:
        return <EvidenceStep formData={formData} onUpdate={setFormData} />;
      case 9:
        return (
          <IdentificationStep formData={formData} onUpdate={setFormData} />
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-accent/50" />
              <p className="text-lg font-medium">
                Formulario del Paso {currentStep}
              </p>
              <p className="text-sm">
                El contenido específico se implementará en el siguiente paso
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6">
          <div className="flex mb-4 gap-2">
            <div className="flex items-center space-x-2">
              {currentStepData?.icon && (
                <currentStepData.icon
                  className="h-8 w-8 text-accent"
                  color="#7828C8"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base mt-1">
                {currentStepData?.title}: {currentStepData?.description}
              </h1>
            </div>
            <Chip
              color="secondary"
              variant="faded"
              size="md"
              className="absolute top-4 right-4"
            >
              {currentStep} / {STEPS.length}
            </Chip>
          </div>
          <Progress
            value={progress}
            aria-label="Progreso del formulario"
            color="secondary"
          />
          <Divider className="my-4" />
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              let buttonClassName = "";
              if (isActive) {
                buttonClassName =
                  "border-purple-600 bg-purple-100 text-purple-700 font-semibold";
              } else if (isCompleted) {
                buttonClassName =
                  "border-green-600 bg-green-100 text-green-700 hover:bg-green-200 font-medium";
              } else {
                buttonClassName =
                  "border-gray-300 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700";
              }

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
                    ${buttonClassName}
                  `}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Main Content Area */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div>
            <h1 className="flex items-center space-x-2">
            {currentStepData?.icon && (
              <currentStepData.icon className="h-6 w-6 text-accent" />
            )}
            <span>{currentStepData?.title}</span>
          </h1>
          <h2 className="text-base mt-1">{currentStepData?.description}</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">{renderStepContent()}</CardBody>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardBody className="p-6">
          <div className="flex justify-between">
            <Button
              variant="bordered"
              onPress={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Información segura y confidencial</span>
            </div>

            {currentStep === STEPS.length ? (
              <Button
                onPress={handleSubmit}
                variant="solid"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                <span>Enviar Reclamo</span>
              </Button>
            ) : (
              <Button
                onPress={handleNext}
                className="flex items-center space-x-2"
                variant="solid"
                color="primary"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
