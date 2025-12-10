"use client";
import type FormData from "@/types/interface";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Send,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
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
import { ConfirmationStep } from "./steps/confirmation-step"; // Added confirmation step

import STEPS from "@/config/steps";
import ClaimsData from "@/API/claims_data";

interface SubmissionResult {
  numero: string;
  clave: string;
}

const validateStep = (
  step: number,
  formData: FormData,
): { isValid: boolean; message: string } => {
  switch (step) {
    case 1: // CategoryStep
      if (!formData.category) {
        return { isValid: false, message: "Selecciona una categoría" };
      }
      if (!formData.subcategory) {
        return { isValid: false, message: "Selecciona una subcategoría" };
      }

      return { isValid: true, message: "" };

    case 2: // IdentificationStep (moved from 9)
      if (formData.isAnonymous === undefined) {
        return {
          isValid: false,
          message:
            "Selecciona si deseas enviar el reclamo de forma anónima o con tus datos",
        };
      }
      if (formData.isAnonymous === true) {
        return { isValid: true, message: "" };
      }
      if (!formData.fullName || formData.fullName.trim().length === 0) {
        return { isValid: false, message: "Ingresa tu nombre completo" };
      }
      if (!formData.rut || formData.rut.trim().length === 0) {
        return { isValid: false, message: "Ingresa tu RUT" };
      }
      if (!formData.email || formData.email.trim().length === 0) {
        return { isValid: false, message: "Ingresa tu correo electrónico" };
      }
      if (!formData.phone || formData.phone.trim().length === 0) {
        return { isValid: false, message: "Ingresa tu número de teléfono" };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        return {
          isValid: false,
          message: "El correo electrónico no es válido",
        };
      }

      return { isValid: true, message: "" };

    case 3: // RelationshipStep (moved from 2)
      if (!formData.relationship) {
        return {
          isValid: false,
          message: "Selecciona tu relación con la empresa",
        };
      }

      return { isValid: true, message: "" };

    case 4: // LocationStep (moved from 3)
      if (!formData.country) {
        return { isValid: false, message: "Selecciona un país" };
      }

      return { isValid: true, message: "" };

    case 5:
      if (formData.details && formData.details.trim().length > 0) {
        return { isValid: true, message: "" };
      }
      if (formData.skipDetailsWarning === true) {
        return { isValid: true, message: "" };
      }

      return { isValid: false, message: "" };

    case 6: // TimeStep (moved from 5)
      if (!formData.timeframe) {
        return { isValid: false, message: "Selecciona el tiempo del problema" };
      }

      return { isValid: true, message: "" };

    case 7: // InvolvedStep (moved from 6)
      if (!formData.involvedParties || formData.involvedParties.length === 0) {
        return {
          isValid: false,
          message: "Agrega al menos una parte involucrada",
        };
      }

      return { isValid: true, message: "" };

    case 8: // DescriptionStep (moved from 7)
      if (!formData.description || formData.description.length < 100) {
        return {
          isValid: false,
          message: "La descripción debe tener al menos 100 caracteres",
        };
      }

      return { isValid: true, message: "" };

    case 9: // EvidenceStep (moved from 8) - Optional
      return { isValid: true, message: "" };

    case 10: // ConfirmationStep
      return { isValid: true, message: "" };

    default:
      return { isValid: true, message: "" };
  }
};

const isStepCompleted = (step: number, formData: FormData): boolean => {
  return validateStep(step, formData).isValid;
};

export function ClaimsWizard() {
  const [categories, setCategories] = useState<
    Record<
      string,
      {
        description: string;
        categories: string[];
      }
    >
  >({});
  const [categoryIcons, setCategoryIcons] = useState<Record<string, any>>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enterprise, setEnterprise] = useState<
    { rut: string; nombre: string }[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsAlert, setShowDetailsAlert] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null); // Added submission result state

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await ClaimsData();

        setCategories(data.categories);
        setCategoryIcons(data.categoryIcons);
        setCountries(data.countries);
        setEnterprise(data.enterprise);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFormUpdate = useCallback((newData: Partial<FormData>) => {
    setFormData((prev) => {
      const merged = { ...prev, ...newData };

      return merged;
    });
  }, []);

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS.find((step) => step.id === currentStep);
  const currentValidation = validateStep(currentStep, formData);

  const handleNext = () => {
    if (currentStep === 5) {
      if (
        (!formData.details || formData.details.trim().length === 0) &&
        !formData.skipDetailsWarning
      ) {
        setShowDetailsAlert(true);

        return;
      }
    }

    const validation = validateStep(currentStep, formData);

    if (!validation.isValid) {
      setValidationError(validation.message);

      return;
    }

    setValidationError("");
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setValidationError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 10) {
      return;
    }

    if (stepId < currentStep) {
      setValidationError("");
      setCurrentStep(stepId);

      return;
    }

    if (stepId > currentStep) {
      for (let i = 1; i < stepId; i++) {
        if (!isStepCompleted(i, formData)) {
          setValidationError(`Debes completar el paso ${i} primero`);

          return;
        }
      }
      setValidationError("");
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async () => {
    for (let i = 1; i <= 9; i++) {
      const validation = validateStep(i, formData);

      if (!validation.isValid) {
        setValidationError(`Error en paso ${i}: ${validation.message}`);
        setCurrentStep(i);

        return;
      }
    }

    setIsSubmitting(true);
    setValidationError("");

    try {
      const submitData = new FormData();

      submitData.append("category", formData.category || "");
      submitData.append("subcategory", formData.subcategory || "");
      submitData.append("relationship", formData.relationship || "");
      submitData.append("relationshipLabel", formData.relationshipLabel || "");
      submitData.append("country", formData.country || "");
      submitData.append("details", formData.details || "");
      submitData.append("timeframe", formData.timeframe || "");
      submitData.append("timeframeLabel", formData.timeframeLabel || "");
      submitData.append("description", formData.description || "");
      submitData.append("isAnonymous", String(formData.isAnonymous || false));

      if (!formData.isAnonymous) {
        submitData.append("fullName", formData.fullName || "");
        submitData.append("rut", formData.rut || "");
        submitData.append("email", formData.email || "");
        submitData.append("phone", formData.phone || "");
      }
      submitData.append(
        "involvedParties",
        JSON.stringify(formData.involvedParties || []),
      );

      if (formData.evidence && formData.evidence.length > 0) {
        formData.evidence.forEach((file: any) => {
          if (file.file instanceof File) {
            submitData.append("files", file.file);
          }
        });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/denuncias/public`,
        {
          method: "POST",
          body: submitData,
        },
      );

      if (!response.ok) {
        setValidationError(
          "Error al enviar el reclamo. Por favor, intenta nuevamente.",
        );
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();

      setSubmissionResult({
        numero: result.numero,
        clave: result.clave,
      });
      setCurrentStep(10);
    } catch {
      alert(
        "Ocurrió un error al enviar el reclamo. Por favor, intenta nuevamente más tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueWithoutDetails = () => {
    setShowDetailsAlert(false);
    handleFormUpdate({ skipDetailsWarning: true });
    setValidationError("");
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReturnHome = () => {
    setFormData({});
    setCurrentStep(1);
    setSubmissionResult(null);
    setValidationError("");
  };

  const renderStepContent = () => {
    if (isLoading && currentStep === 1) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando categorías...</p>
          </div>
        </div>
      );
    }
    switch (currentStep) {
      case 1:
        return (
          <CategoryStep
            CATEGORIES={categories}
            CATEGORY_ICONS={categoryIcons}
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        );
      case 2:
        return (
          <IdentificationStep formData={formData} onUpdate={handleFormUpdate} />
        );
      case 3:
        return (
          <RelationshipStep formData={formData} onUpdate={handleFormUpdate} />
        );
      case 4:
        return (
          <LocationStep
            countries={countries}
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        );
      case 5:
        return <DetailsStep formData={formData} onUpdate={handleFormUpdate} />;
      case 6:
        return <TimeStep formData={formData} onUpdate={handleFormUpdate} />;
      case 7:
        return (
          <InvolvedStep
            enterprises={enterprise}
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        );
      case 8:
        return (
          <DescriptionStep formData={formData} onUpdate={handleFormUpdate} />
        );
      case 9:
        return <EvidenceStep formData={formData} onUpdate={handleFormUpdate} />;
      case 10:
        return submissionResult ? (
          <ConfirmationStep
            claimNumber={submissionResult.numero}
            hasEmail={
              formData.isAnonymous
                ? !!(formData.email && formData.email.trim().length > 0)
                : !!(formData.email && formData.email.trim().length > 0)
            }
            isAnonymous={formData.isAnonymous || false}
            trackingKey={submissionResult.clave}
            onReturnHome={handleReturnHome}
          />
        ) : null;
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
      <Modal
        isOpen={showDetailsAlert}
        placement="center"
        onClose={() => setShowDetailsAlert(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Campo opcional sin completar</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              No has proporcionado detalles adicionales sobre tu reclamo o
              denuncia.
            </p>
            <p className="text-gray-600 mt-2">
              Para una <strong>mejor atención y seguimiento</strong> de tu caso,
              te recomendamos agregar información adicional que pueda ser
              relevante, como nombres, fechas, lugares o cualquier otro detalle
              que consideres importante.
            </p>
            <p className="text-gray-500 text-sm mt-3 italic">
              Este campo es opcional, puedes continuar sin completarlo si lo
              prefieres.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowDetailsAlert(false)}>
              Volver y agregar detalles
            </Button>
            <Button
              color="warning"
              variant="flat"
              onPress={handleContinueWithoutDetails}
            >
              Continuar sin detalles
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {currentStep !== 10 && (
        <>
          <Card>
            <CardBody className="p-6">
              <div className="flex mb-4 gap-2">
                <div className="flex items-center space-x-2">
                  {currentStepData?.icon && (
                    <currentStepData.icon
                      className="h-8 w-8 text-accent"
                      color="#2A53CB"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base mt-1">
                    {currentStepData?.title}: {currentStepData?.description}
                  </h1>
                </div>
                <Chip
                  className="absolute top-4 right-4"
                  color="primary"
                  size="md"
                  variant="faded"
                >
                  {currentStep} / {STEPS.length}
                </Chip>
              </div>
              <Progress
                aria-label="Progreso del formulario"
                classNames={{
                  track: "drop-shadow-md border border-default",
                  indicator: "bg-linear-to-r from-blue-400 to-blue-800",
                  label: "tracking-wider font-medium text-default-600",
                  value: "text-foreground/60",
                }}
                value={progress}
              />
              <Divider className="my-4" />
              <div className="grid grid-cols-3 md:grid-cols-10 gap-2">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted =
                    step.id < currentStep && isStepCompleted(step.id, formData);
                  const isAccessible =
                    step.id <= currentStep ||
                    isStepCompleted(step.id - 1, formData);
                  let buttonClassName = "";

                  if (isActive) {
                    buttonClassName =
                      "border-blue-600 bg-blue-100 text-blue-700 font-semibold";
                  } else if (isCompleted) {
                    buttonClassName =
                      "border-green-600 bg-green-100 text-green-700 hover:bg-green-200 font-medium";
                  } else if (!isAccessible) {
                    buttonClassName =
                      "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50";
                  } else {
                    buttonClassName =
                      "border-gray-300 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700";
                  }

                  return (
                    <button
                      key={step.id}
                      className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
                    ${buttonClassName}
                  `}
                      disabled={!isAccessible}
                      onClick={() => handleStepClick(step.id)}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 mb-1 text-green-600" />
                      ) : (
                        <Icon className="h-5 w-5 mb-1" />
                      )}
                      <span className="text-xs font-medium text-center leading-tight">
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
              <div className="flex-1">
                <h1 className="flex items-center space-x-2">
                  {currentStepData?.icon && (
                    <currentStepData.icon className="h-6 w-6 text-accent" />
                  )}
                  <span className="text-xl font-bold">
                    {currentStepData?.title}
                  </span>
                  {currentValidation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500 ml-2" />
                  )}
                </h1>
                <h2 className="text-base mt-1 text-gray-500">
                  {currentStepData?.description}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">{renderStepContent()}</CardBody>
          </Card>
        </>
      )}

      {currentStep === 10 && (
        <Card>
          <CardBody className="p-8">{renderStepContent()}</CardBody>
        </Card>
      )}

      {validationError && (
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">{validationError}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {currentStep !== 10 && (
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-between">
              <Button
                className="flex items-center space-x-2"
                disabled={currentStep === 1}
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

              {currentStep === 9 ? (
                <Button
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                  disabled={!currentValidation.isValid || isSubmitting}
                  isLoading={isSubmitting}
                  variant="solid"
                  onPress={handleSubmit}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar Reclamo"}
                </Button>
              ) : (
                <Button
                  className="bg-[#202e5e] hover:bg-[#1a2550] text-white font-medium"
                  disabled={
                    currentStep === 5 ? false : !currentValidation.isValid
                  }
                  variant="solid"
                  onPress={handleNext}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
