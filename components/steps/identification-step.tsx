"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Input, Switch } from "@heroui/react";
import {
  UserX,
  User,
  Shield,
  Phone,
  Mail,
  CreditCard,
  UserCheck,
} from "lucide-react";

interface IdentificationStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function IdentificationStep({
  formData,
  onUpdate,
}: IdentificationStepProps) {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    formData.isAnonymous ?? false,
  );
  const [personalData, setPersonalData] = useState({
    fullName: formData.fullName || "",
    rut: formData.rut || "",
    email: formData.email || "",
    phone: formData.phone || "",
  });
  const [validationErrors, setValidationErrors] = useState({
    rut: "",
    email: "",
    phone: "",
  });
  const [validationSuccess, setValidationSuccess] = useState({
    rut: false,
    email: false,
    phone: false,
  });

  useEffect(() => {
    setIsAnonymous(formData.isAnonymous ?? false);
    setPersonalData({
      fullName: formData.fullName || "",
      rut: formData.rut || "",
      email: formData.email || "",
      phone: formData.phone || "",
    });
  }, [
    formData.isAnonymous,
    formData.fullName,
    formData.rut,
    formData.email,
    formData.phone,
  ]);

  const handleAnonymousToggle = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      setPersonalData({ fullName: "", rut: "", email: "", phone: "" });
      onUpdate({
        isAnonymous: true,
        fullName: "",
        rut: "",
        email: "",
        phone: "",
      });
    } else {
      onUpdate({ isAnonymous: false });
    }
  };

  const handlePersonalDataChange = (field: string, value: string) => {
    const updatedPersonalData = { ...personalData, [field]: value };

    setPersonalData(updatedPersonalData);
    onUpdate({ ...updatedPersonalData, isAnonymous });
  };

  const formatRut = (value: string) => {
    // Remove all non-numeric characters except 'k' or 'K'
    const cleaned = value.replace(/[^0-9kK]/g, "");

    if (cleaned.length <= 1) return cleaned;

    // Add dots and dash formatting
    const rut = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    if (rut.length <= 3) return `${rut}-${dv}`;
    if (rut.length <= 6) return `${rut.slice(0, -3)}.${rut.slice(-3)}-${dv}`;

    return `${rut.slice(0, -6)}.${rut.slice(-6, -3)}.${rut.slice(-3)}-${dv}`;
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);

    handlePersonalDataChange("rut", formatted);

    // Validate RUT in real-time
    if (formatted.length >= 3) {
      const isValid = validateRut(formatted);

      setValidationErrors((prev) => ({
        ...prev,
        rut: isValid ? "" : "RUT inválido. Verifica el número ingresado",
      }));
      setValidationSuccess((prev) => ({
        ...prev,
        rut: isValid,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        rut: "",
      }));
      setValidationSuccess((prev) => ({
        ...prev,
        rut: false,
      }));
    }
  };

  const validateRut = (rut: string): boolean => {
    // Remove formatting
    const cleaned = rut.replace(/[^0-9kK]/g, "");

    if (cleaned.length < 2) return false;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toLowerCase();

    // Calculate verification digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number.parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv =
      expectedDv === 11 ? "0" : expectedDv === 10 ? "k" : expectedDv.toString();

    return dv === calculatedDv;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Chilean phone format: +56 9 XXXX XXXX or variations
    const cleaned = phone.replace(/\s+/g, "");
    const phoneRegex = /^(\+?56)?9\d{8}$/;

    return phoneRegex.test(cleaned);
  };

  const handleFieldBlur = (field: string, value: string) => {
    const errors = { ...validationErrors };
    const success = { ...validationSuccess };

    if (field === "rut" && value.trim()) {
      const isValid = validateRut(value);

      errors.rut = isValid ? "" : "RUT inválido. Verifica el número ingresado";
      success.rut = isValid;
    }
    if (field === "email" && value.trim()) {
      const isValid = validateEmail(value);

      errors.email = isValid ? "" : "Correo electrónico inválido";
      success.email = isValid;
    }
    if (field === "phone" && value.trim()) {
      const isValid = validatePhone(value);

      errors.phone = isValid
        ? ""
        : "Formato de teléfono inválido. Ej: +56 9 1234 5678";
      success.phone = isValid;
    }

    setValidationErrors(errors);
    setValidationSuccess(success);
  };

  const isFormValid =
    isAnonymous ||
    (personalData.fullName.trim() !== "" &&
      personalData.rut.trim() !== "" &&
      personalData.email.trim() !== "" &&
      personalData.phone.trim() !== "" &&
      !validationErrors.rut &&
      !validationErrors.email &&
      !validationErrors.phone &&
      validateRut(personalData.rut) &&
      validateEmail(personalData.email) &&
      validatePhone(personalData.phone));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Identificación del reclamante
        </h3>
        <p className="text-muted-foreground mb-6">
          Elige si deseas realizar el reclamo de forma anónima o proporcionar
          tus datos personales
        </p>
      </div>

      {/* Anonymous Toggle */}
      <Card>
        <CardHeader>
          <h1 className="text-base">Tipo de reclamo</h1>
          <h2>Selecciona si deseas mantener tu identidad en reserva</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <UserX className="h-6 w-6 text-muted-foreground" />
              <div>
                <h1 className="text-base font-medium">Reclamo anónimo</h1>
                <p className="text-sm text-muted-foreground">
                  Tu identidad se mantendrá confidencial
                </p>
              </div>
            </div>
            <Switch
              checked={isAnonymous}
              id="anonymous-mode"
              onChange={(e) => handleAnonymousToggle(e.target.checked)}
            />
          </div>

          {isAnonymous && (
            <Card className="bg-orange-50/50 border-orange-200">
              <CardBody className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-700 mb-1">
                      Reclamo anónimo activado
                    </p>
                    <p className="text-orange-600">
                      Tu reclamo será procesado sin revelar tu identidad. Ten en
                      cuenta que esto puede limitar las opciones de seguimiento
                      y comunicación directa sobre el caso.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>

      {/* Personal Data Form */}
      {!isAnonymous && (
        <Card>
          <CardHeader>
            <h1 className="text-base flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Datos personales</span>
            </h1>
            <h2>
              Completa todos los campos para identificarte como reclamante
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <h1 className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Nombre completo *</span>
                </h1>
                <Input
                  id="fullName"
                  placeholder="Ingresa tu nombre completo"
                  value={personalData.fullName}
                  onChange={(e) =>
                    handlePersonalDataChange("fullName", e.target.value)
                  }
                />
              </div>

              {/* RUT */}
              <div className="space-y-2">
                <h1 className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>RUT *</span>
                </h1>
                <Input
                  classNames={{
                    description: "text-green-600 font-medium text-xs",
                  }}
                  description={validationSuccess.rut ? "✓ RUT válido" : ""}
                  errorMessage={validationErrors.rut}
                  id="rut"
                  isInvalid={!!validationErrors.rut}
                  maxLength={12}
                  placeholder="12.345.678-9"
                  value={personalData.rut}
                  onChange={(e) => handleRutChange(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <h1 className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Correo electrónico *</span>
                </h1>
                <Input
                  classNames={{
                    description: "text-green-600 font-medium text-xs",
                  }}
                  description={validationSuccess.email ? "✓ Correo válido" : ""}
                  errorMessage={validationErrors.email}
                  id="email"
                  isInvalid={!!validationErrors.email}
                  placeholder="tu@email.com"
                  type="email"
                  value={personalData.email}
                  onBlur={(e) => handleFieldBlur("email", e.target.value)}
                  onChange={(e) =>
                    handlePersonalDataChange("email", e.target.value)
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <h1 className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Número de teléfono *</span>
                </h1>
                <Input
                  classNames={{
                    description: "text-green-600 font-medium text-xs",
                  }}
                  description={
                    validationSuccess.phone ? "✓ Teléfono válido" : ""
                  }
                  errorMessage={validationErrors.phone}
                  id="phone"
                  isInvalid={!!validationErrors.phone}
                  placeholder="+56 9 1234 5678"
                  type="tel"
                  value={personalData.phone}
                  onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                  onChange={(e) =>
                    handlePersonalDataChange("phone", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">* Campos obligatorios</p>
              <p>
                Estos datos serán utilizados únicamente para el procesamiento de
                tu reclamo y comunicaciones relacionadas. Tu información está
                protegida según nuestras políticas de privacidad.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Form Status */}
      <Card
        className={`${isFormValid ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"}`}
      >
        <CardBody className="p-4">
          <div className="flex items-center space-x-3">
            {isFormValid ? (
              <>
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">
                    {isAnonymous
                      ? "Configurado como reclamo anónimo"
                      : "Datos personales completos"}
                  </p>
                  <p className="text-sm text-green-600">
                    {isAnonymous
                      ? "Tu reclamo será procesado de forma confidencial"
                      : "Todos los campos requeridos han sido completados"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">
                    Información incompleta
                  </p>
                  <p className="text-sm text-red-600">
                    Completa todos los campos obligatorios o activa el modo
                    anónimo
                  </p>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      {!isAnonymous && personalData.fullName && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Reclamante identificado</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <p>
                    <strong>Nombre:</strong> {personalData.fullName}
                  </p>
                  <p>
                    <strong>RUT:</strong> {personalData.rut}
                  </p>
                  <p>
                    <strong>Email:</strong> {personalData.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {personalData.phone}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
