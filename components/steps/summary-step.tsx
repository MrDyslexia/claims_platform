"use client";

import { Card, CardBody, Button } from "@heroui/react";
import {
  FileText,
  User,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  Paperclip,
  Edit2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SummaryStepProps {
  readonly formData: any;
  readonly onEdit: (step: number) => void;
  readonly onSubmit: () => void;
  readonly isSubmitting: boolean;
  readonly categories: Record<string, { description: string; categories: string[] }>;
}

export function SummaryStep({
  formData,
  onEdit,
  onSubmit,
  isSubmitting,
  categories,
}: SummaryStepProps) {
  const SummarySection = ({
    icon: Icon,
    title,
    children,
    step,
  }: {
    icon: React.ComponentType<any>;
    title: string;
    children: React.ReactNode;
    step: number;
  }) => (
    <Card className="mb-4">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="rounded-full bg-blue-100 p-2">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
              <div className="text-gray-600">{children}</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="light"
            color="primary"
            startContent={<Edit2 className="h-4 w-4" />}
            onPress={() => onEdit(step)}
          >
            Editar
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const getCategoryName = () => {
    if (!formData.category || !categories[formData.category]) {
      return formData.category || "No especificada";
    }
    return formData.category;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Resumen de tu denuncia
        </h3>
        <p className="text-gray-600 mt-2">
          Por favor revisa la información antes de enviar tu reclamo
        </p>
      </div>

      {/* Categoría */}
      <SummarySection icon={FileText} title="Categoría y Tipo" step={1}>
        <div className="space-y-1">
          <p><strong>Categoría:</strong> {getCategoryName()}</p>
          <p><strong>Tipo:</strong> {formData.subcategory || "No especificado"}</p>
        </div>
      </SummarySection>

      {/* Identificación */}
      <SummarySection icon={User} title="Identificación" step={2}>
        {formData.isAnonymous ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>Denuncia anónima</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p><strong>Nombre:</strong> {formData.fullName || "No especificado"}</p>
            <p><strong>RUT:</strong> {formData.rut || "No especificado"}</p>
            <p><strong>Email:</strong> {formData.email || "No especificado"}</p>
            <p><strong>Teléfono:</strong> {formData.phone || "No especificado"}</p>
          </div>
        )}
      </SummarySection>

      {/* Relación */}
      <SummarySection icon={Users} title="Relación con la Empresa" step={3}>
        <p>{formData.relationshipLabel || formData.relationship || "No especificada"}</p>
      </SummarySection>

      {/* Ubicación */}
      <SummarySection icon={MapPin} title="Ubicación" step={4}>
        <p>{formData.country || "No especificado"}</p>
      </SummarySection>

      {/* Detalles adicionales */}
      {formData.details && (
        <SummarySection icon={MessageSquare} title="Detalles Adicionales" step={5}>
          <p className="whitespace-pre-wrap">{formData.details}</p>
        </SummarySection>
      )}

      {/* Tiempo */}
      <SummarySection icon={Clock} title="Tiempo del Problema" step={6}>
        <p>{formData.timeframeLabel || formData.timeframe || "No especificado"}</p>
      </SummarySection>

      {/* Involucrados */}
      <SummarySection icon={Users} title="Personas/Entidades Involucradas" step={7}>
        {formData.involvedParties && formData.involvedParties.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {formData.involvedParties.map((party: any, index: number) => (
              <li key={index}>
                <strong>{party.name}</strong>
                {party.cargo && ` - ${party.cargo}`}
                {party.company && ` (${party.company})`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No se especificaron involucrados</p>
        )}
      </SummarySection>

      {/* Descripción */}
      <SummarySection icon={MessageSquare} title="Descripción del Hecho" step={8}>
        <p className="whitespace-pre-wrap line-clamp-6">
          {formData.description || "No especificada"}
        </p>
        {formData.description && formData.description.length > 500 && (
          <p className="text-sm text-gray-400 mt-2">
            ({formData.description.length} caracteres)
          </p>
        )}
      </SummarySection>

      {/* Evidencias */}
      <SummarySection icon={Paperclip} title="Evidencias Adjuntas" step={9}>
        {formData.evidence && formData.evidence.length > 0 ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              {formData.evidence.length} archivo(s) adjunto(s)
            </p>
            <ul className="list-disc list-inside text-sm">
              {formData.evidence.map((file: any, index: number) => (
                <li key={index}>{file.name || file.file?.name || `Archivo ${index + 1}`}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400">Sin evidencias adjuntas</p>
        )}
      </SummarySection>

      {/* Botón de envío */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardBody className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h4 className="font-bold text-blue-900 text-lg mb-2">
            ¿Todo está correcto?
          </h4>
          <p className="text-blue-700 mb-4">
            Al enviar tu reclamo, recibirás un número de seguimiento y una clave
            para consultar el estado de tu denuncia.
          </p>
          <Button
            color="primary"
            size="lg"
            className="bg-[#202e5e] hover:bg-[#1a2550] text-white font-medium"
            isLoading={isSubmitting}
            onPress={onSubmit}
          >
            {isSubmitting ? "Enviando..." : "Enviar Reclamo"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
