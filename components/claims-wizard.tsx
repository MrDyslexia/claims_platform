"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Divider,
  Spinner,
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

import {
  FALLBACK_FORM_METADATA,
  fetchFormMetadata,
  type FormMetadataResponse,
} from "@/lib/form-metadata";

type SubmissionResult = {
  id: number;
  numero: string;
  clave: string;
  estado?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const STEPS = [
  {
    id: 1,
    title: "Identificación",
    description: "Datos personales o anónimo",
    icon: User,
  },
  {
    id: 2,
    title: "Categoría",
    description: "Selecciona el tipo de reclamo",
    icon: FileText,
  },
  {
    id: 3,
    title: "Relación",
    description: "Tu relación con la empresa",
    icon: Users,
  },
  {
    id: 4,
    title: "Ubicación",
    description: "País donde ocurrió el hecho",
    icon: Globe,
  },
  {
    id: 5,
    title: "Detalles",
    description: "Información adicional",
    icon: MessageSquare,
  },
  {
    id: 6,
    title: "Tiempo",
    description: "Duración del problema",
    icon: Clock,
  },
  {
    id: 7,
    title: "Involucrados",
    description: "Personas y entidades",
    icon: Building,
  },
  {
    id: 8,
    title: "Descripción",
    description: "Relato detallado del hecho",
    icon: MessageSquare,
  },
  {
    id: 9,
    title: "Evidencias",
    description: "Documentos y fotografías",
    icon: FileText,
  },
];

export function ClaimsWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  // Regla de negocio: mínimo de caracteres para la descripción
  const MIN_DESCRIPTION_LENGTH = 100;
  const [metadata, setMetadata] = useState<FormMetadataResponse>(
    FALLBACK_FORM_METADATA,
  );
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchFormMetadata(controller.signal)
      .then((data) => {
        setMetadata(data);
        setMetadataError(null);
      })
      .catch((error: unknown) => {
        const errMsg =
          error instanceof Error
            ? error.message
            : String(error ?? "unknown error");

        setMetadataError(
          `No se pudo sincronizar catálogos desde el backend. Se utilizarán valores por defecto. (${errMsg})`,
        );
      })
      .finally(() => setMetadataLoading(false));

    return () => controller.abort();
  }, []);

  const progress = useMemo(
    () => (currentStep / STEPS.length) * 100,
    [currentStep],
  );
  const currentStepData = useMemo(
    () => STEPS.find((step) => step.id === currentStep),
    [currentStep],
  );

  // Validez de la descripción (se usa para bloquear el avance al paso 9)
  const isDescriptionValid = useMemo(() => {
    const value = String(formData.description ?? "").trim();

    return value.length >= MIN_DESCRIPTION_LENGTH;
  }, [formData.description]);

  // Validez de identificación: anónimo o datos completos
  const isIdentificationValid = useMemo(() => {
    const isAnonymous = Boolean(formData.isAnonymous);

    if (isAnonymous) return true;
    const fullName = String(formData.fullName ?? "").trim();
    const rut = String(formData.rut ?? "").trim();
    const email = String(formData.email ?? "").trim();
    const phone = String(formData.phone ?? "").trim();

    return fullName !== "" && rut !== "" && email !== "" && phone !== "";
  }, [
    formData.isAnonymous,
    formData.fullName,
    formData.rut,
    formData.email,
    formData.phone,
  ]);

  // Validez por paso (excepto Detalles que es opcional)
  const isCategoryValid = useMemo(() => {
    return Boolean(formData.category) && Boolean(formData.subcategory);
  }, [formData.category, formData.subcategory]);

  const isRelationshipValid = useMemo(() => {
    return Boolean((formData as any).relationship);
  }, [formData.relationship]);

  const isLocationValid = useMemo(() => {
    return Boolean((formData as any).country);
  }, [formData.country]);

  const isTimeframeValid = useMemo(() => {
    return Boolean((formData as any).timeframe);
  }, [formData.timeframe]);

  const isInvolvedValid = useMemo(() => {
    const arr = (formData as any).involvedParties;

    return Array.isArray(arr) && arr.length > 0;
  }, [formData.involvedParties]);

  // Paso opcional: 5 (Detalles). Asumo Evidencias (9) opcional para no contradecir UI.
  const isStepRequired = (stepId: number) => stepId !== 5;

  const isStepValid = (stepId: number) => {
    switch (stepId) {
      case 1:
        return isIdentificationValid;
      case 2:
        return isCategoryValid;
      case 3:
        return isRelationshipValid;
      case 4:
        return isLocationValid;
      case 5:
        return true; // Detalles opcional
      case 6:
        return isTimeframeValid;
      case 7:
        return isInvolvedValid;
      case 8:
        return isDescriptionValid;
      case 9:
        return true; // Evidencias opcional (asunción)
      default:
        return true;
    }
  };

  const canProceedFrom = (stepId: number) => {
    // Si el paso es requerido, debe ser válido para avanzar
    return !isStepRequired(stepId) || isStepValid(stepId);
  };

  const isStepAccessible = (stepId: number) => {
    // Puedes ir al paso 1 siempre
    if (stepId === 1) return true;
    // Para ir a un paso N, todos los pasos requeridos previos deben ser válidos
    for (let i = 1; i < stepId; i++) {
      if (isStepRequired(i) && !isStepValid(i)) {
        return false;
      }
    }

    return true;
  };

  const getValidationMessage = () => {
    if (!isStepRequired(currentStep)) return "";

    switch (currentStep) {
      case 1:
        if (!isIdentificationValid) {
          return formData.isAnonymous === false
            ? "Completa todos los datos personales o activa el modo anónimo"
            : "Completa la identificación para continuar";
        }
        break;
      case 2:
        if (!isCategoryValid) {
          return "Selecciona una categoría y subcategoría";
        }
        break;
      case 3:
        if (!isRelationshipValid) {
          return "Selecciona tu relación con la empresa";
        }
        break;
      case 4:
        if (!isLocationValid) {
          return "Selecciona el país donde ocurrió el hecho";
        }
        break;
      case 6:
        if (!isTimeframeValid) {
          return "Selecciona la duración del problema";
        }
        break;
      case 7:
        if (!isInvolvedValid) {
          return "Agrega al menos una persona o entidad involucrada";
        }
        break;
      case 8:
        if (!isDescriptionValid) {
          const current = String(formData.description ?? "").trim().length;
          const remaining = MIN_DESCRIPTION_LENGTH - current;

          return `Completa la descripción (faltan ${remaining} caracteres)`;
        }
        break;
    }

    return "";
  };

  const handleNext = () => {
    // Bloquear avance si el paso actual requerido no es válido
    if (!canProceedFrom(currentStep)) {
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Solo permitir pasos accesibles (todos los previos requeridos válidos)
    if (!isStepAccessible(stepId)) return;
    setCurrentStep(stepId);
  };

  const handleFormUpdate = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const buildSubmissionPayload = () => {
    const description = String(formData.description ?? "").trim();

    if (description.length < 20) {
      setSubmissionError("La descripción debe tener al menos 20 caracteres.");
      setCurrentStep(7);

      return null;
    }

    if (!formData.category || !formData.subcategory) {
      setSubmissionError("Selecciona la categoría y subcategoría del reclamo.");
      setCurrentStep(1);

      return null;
    }

    if (!formData.isAnonymous) {
      const missingPersonalData = ["fullName", "email", "phone"].filter(
        (field) => !String(formData[field] ?? "").trim(),
      );

      if (missingPersonalData.length) {
        setSubmissionError(
          "Completa tus datos personales o marca el reclamo como anónimo.",
        );
        setCurrentStep(9);

        return null;
      }
    }

    const payload = {
      category: formData.category,
      categoryName: formData.categoryName,
      subcategory: formData.subcategory,
      subcategoryName: formData.subcategoryName,
      relationship: formData.relationship,
      relationshipLabel: formData.relationshipLabel,
      country: formData.country ?? null,
      details: formData.details ?? "",
      timeframe: formData.timeframe,
      timeframeLabel: formData.timeframeLabel,
      description,
      involvedParties: Array.isArray(formData.involvedParties)
        ? formData.involvedParties.map((party: any) => ({
            name: party.name,
            type: party.type,
          }))
        : [],
      evidence: Array.isArray(formData.evidence)
        ? formData.evidence.map((file: any) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          }))
        : [],
      isAnonymous: Boolean(formData.isAnonymous),
      fullName: formData.fullName ?? "",
      rut: formData.rut ?? "",
      email: formData.email ?? "",
      phone: formData.phone ?? "",
      metadataVersion: metadata.generatedAt ?? null,
    };

    return payload;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const payload = buildSubmissionPayload();

    if (!payload) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/denuncias/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(errorText || `Error ${response.status}`);
      }

      const data = (await response.json()) as SubmissionResult;

      setSubmissionResult(data);
      setCurrentStep(STEPS.length);
      setFormData((prev) => ({
        ...prev,
        numero: data.numero,
        clave: data.clave,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible enviar el reclamo.";

      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (metadataLoading) {
      return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Spinner color="secondary" />
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <IdentificationStep formData={formData} onUpdate={handleFormUpdate} />
        );
      case 2:
        return (
          <CategoryStep
            categories={metadata.categories}
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        );
      case 3:
        return (
          <RelationshipStep
            formData={formData}
            relationships={metadata.relationships}
            onUpdate={handleFormUpdate}
          />
        );
      case 4:
        return (
          <LocationStep
            countries={metadata.countries}
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        );
      case 5:
        return <DetailsStep formData={formData} onUpdate={handleFormUpdate} />;
      case 6:
        return (
          <TimeStep
            formData={formData}
            timeframes={metadata.timeframes}
            onUpdate={handleFormUpdate}
          />
        );
      case 7:
        return <InvolvedStep formData={formData} onUpdate={handleFormUpdate} />;
      case 8:
        return (
          <DescriptionStep formData={formData} onUpdate={handleFormUpdate} />
        );
      case 9:
        return <EvidenceStep formData={formData} onUpdate={handleFormUpdate} />;
      default:
        return (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-16 w-16 text-accent/50" />
              <p className="text-lg font-medium">Paso {currentStep}</p>
              <p className="text-sm">Contenido en construcción.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {metadataError && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardBody className="text-sm text-yellow-800">
            {metadataError}
          </CardBody>
        </Card>
      )}

      {submissionError && (
        <Card className="border-red-300 bg-red-50">
          <CardBody className="text-sm text-red-700">
            {submissionError}
          </CardBody>
        </Card>
      )}

      {submissionResult && (
        <Card className="border-green-300 bg-green-50">
          <CardBody>
            <h3 className="mb-2 font-semibold text-green-700">
              Reclamo registrado correctamente
            </h3>
            <p className="text-sm text-green-700">
              Número de seguimiento: <strong>{submissionResult.numero}</strong>
            </p>
            <p className="text-sm text-green-700">
              Clave de verificación: <strong>{submissionResult.clave}</strong>
            </p>
            <p className="mt-2 text-xs text-green-700">
              Conserva estos datos para consultar el estado de tu reclamo.
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="p-6">
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              {currentStepData?.icon && (
                <currentStepData.icon
                  className="h-8 w-8 text-accent"
                  color="#7828C8"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="mt-1 text-base">
                {currentStepData?.title}: {currentStepData?.description}
              </h1>
            </div>
            <Chip
              className="absolute right-4 top-4"
              color="secondary"
              size="md"
              variant="faded"
            >
              {currentStep} / {STEPS.length}
            </Chip>
          </div>
          <Progress
            aria-label="Progreso del formulario"
            color="secondary"
            value={progress}
          />
          <Divider className="my-4" />
          <div className="grid grid-cols-3 gap-2 md:grid-cols-9">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isDisabled = !isStepAccessible(step.id);
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
                  className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all duration-200 ${buttonClassName} ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                  onClick={() => {
                    if (!isDisabled) handleStepClick(step.id);
                  }}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  <span className="text-xs font-medium leading-tight text-center">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="min-h-[400px]">
        <CardHeader>
          <div>
            <h1 className="flex items-center space-x-2">
              {currentStepData?.icon && (
                <currentStepData.icon className="h-6 w-6 text-accent" />
              )}
              <span>{currentStepData?.title}</span>
            </h1>
            <h2 className="mt-1 text-base">{currentStepData?.description}</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">{renderStepContent()}</CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <div className="flex justify-between">
            <Button
              className="flex items-center space-x-2"
              disabled={currentStep === 1 || isSubmitting}
              variant="bordered"
              onPress={handlePrevious}
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
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
                variant="solid"
                onPress={handleSubmit}
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Enviando..." : "Enviar Reclamo"}</span>
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <Button
                  className={`flex items-center space-x-2 ${
                    !canProceedFrom(currentStep)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                      : ""
                  }`}
                  color={canProceedFrom(currentStep) ? "primary" : "default"}
                  disabled={metadataLoading || !canProceedFrom(currentStep)}
                  variant="solid"
                  onPress={handleNext}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!canProceedFrom(currentStep) && (
                  <span className="text-xs text-orange-600 font-medium">
                    {getValidationMessage()}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
