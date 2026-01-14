"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Tabs,
  Tab,
  Textarea,
} from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  MapPin,
  FileText,
  Mail,
  Phone,
  Send,
  Upload,
  AlertTriangle,
  Star,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { ClaimTimeline } from "./claim-timeline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ClaimDetailProps {
  claim: any;
  onBack: () => void;
  credentials?: { numero: string; clave: string } | null;
  onRefresh?: () => void;
}

const STATUS_COLORS: Record<string, any> = {
  Nuevo: "primary",
  "En Revisión": "warning",
  "En Investigación": "warning",
  Resuelto: "success",
  Cerrado: "default",
  Rechazado: "danger",
};

// Estado INFO = 5
const INFO_STATE_ID = 3;

export function ClaimDetail({
  claim,
  onBack,
  credentials,
  onRefresh,
}: ClaimDetailProps) {
  const comments = claim?.comments || [];

  // Estado para formulario de respuesta
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Helper para agregar archivos (evita duplicados por nombre)
  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const filesArray = Array.from(newFiles);

    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const uniqueNewFiles = filesArray.filter(
        (f) => !existingNames.has(f.name),
      );

      return [...prev, ...uniqueNewFiles];
    });
  };

  // Función para remover un archivo específico
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers para drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmittingInfoResponse) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isSubmittingInfoResponse) return;

    addFiles(e.dataTransfer.files);
  };

  // Estado para calificación de satisfacción
  const [satisfactionRating, setSatisfactionRating] = useState<number>(
    claim?.nota_satisfaccion || 0,
  );
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingComment, setRatingComment] = useState("");
  const hasExistingRating =
    claim?.nota_satisfaccion !== null && claim?.nota_satisfaccion !== undefined;

  // Verificar si la denuncia está en estado INFO (5)
  const isInfoState =
    claim?.estado_id === INFO_STATE_ID ||
    claim?.estadoObj?.id === INFO_STATE_ID;

  // Verificar si la denuncia está en estado RESUELTO o CERRADO
  const isResolvedOrClosed = claim?.estado_id === 4 || claim?.estado_id === 5;

  const getStatusIcon = (estado_id: number) => {
    if (estado_id === 4 || estado_id === 5) {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  };

  // Handler unificado para enviar comentario Y/O archivos en estado INFO
  const [isSubmittingInfoResponse, setIsSubmittingInfoResponse] =
    useState(false);
  const [infoResponseError, setInfoResponseError] = useState<string | null>(
    null,
  );
  const [infoResponseSuccess, setInfoResponseSuccess] = useState(false);

  const handleSubmitInfoResponse = async () => {
    if (!credentials) return;

    const hasComment = newComment.trim().length > 0;
    const hasFiles = selectedFiles && selectedFiles.length > 0;

    if (!hasComment && !hasFiles) return;

    setIsSubmittingInfoResponse(true);
    setInfoResponseError(null);
    setInfoResponseSuccess(false);

    try {
      // Enviar comentario si existe
      if (hasComment) {
        const commentResponse = await fetch(
          `${API_BASE_URL}/denuncias/public/comentario`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              numero: credentials.numero,
              clave: credentials.clave,
              contenido: newComment.trim(),
            }),
          },
        );

        if (!commentResponse.ok) {
          const errorData = await commentResponse.json();

          throw new Error(errorData.error || "Error al enviar el comentario");
        }
      }

      // Subir archivos si existen
      if (hasFiles && selectedFiles) {
        const formData = new FormData();

        formData.append("numero", credentials.numero);
        formData.append("clave", credentials.clave);

        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }

        const fileResponse = await fetch(
          `${API_BASE_URL}/denuncias/public/adjuntos`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!fileResponse.ok) {
          const errorData = await fileResponse.json();

          throw new Error(errorData.error || "Error al subir los archivos");
        }
      }

      // Limpiar formularios
      setNewComment("");
      setSelectedFiles([]);

      // Reset file input
      const fileInput = document.getElementById(
        "public-file-upload",
      ) as HTMLInputElement;

      if (fileInput) fileInput.value = "";

      setInfoResponseSuccess(true);
      onRefresh?.();

      setTimeout(() => setInfoResponseSuccess(false), 3000);
    } catch (err) {
      setInfoResponseError(
        err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setIsSubmittingInfoResponse(false);
    }
  };

  const handleSubmitRating = async () => {
    if (satisfactionRating < 1 || satisfactionRating > 5 || !credentials)
      return;

    setIsSubmittingRating(true);
    setRatingError(null);
    setRatingSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/denuncias/public/satisfaccion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            numero: credentials.numero,
            clave: credentials.clave,
            nota: satisfactionRating,
            comentario: ratingComment.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Error al enviar la calificación");
      }

      setRatingSuccess(true);
      setRatingComment("");
      onRefresh?.();

      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        className="mb-6 hover:scale-105 transition-transform"
        startContent={<ArrowLeft className="w-4 h-4" />}
        variant="flat"
        onPress={onBack}
      >
        Volver a Búsqueda
      </Button>

      {/* Hero Header with gradient */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#202e5e] via-[#1a2550] to-[#141d42] p-8 shadow-2xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">{claim.numero}</h1>
            </div>
            <p className="text-blue-100 text-lg">
              {claim.tipo || "Tipo desconocido"}
            </p>
          </div>
          <Chip
            classNames={{
              base: "bg-white/90 backdrop-blur-sm shadow-lg",
              content: "font-bold text-base",
            }}
            color={STATUS_COLORS[claim.estado || "Desconocido"]}
            size="lg"
            startContent={getStatusIcon(claim.estado || "Desconocido")}
            variant="flat"
          >
            {claim.estado || "Desconocido"}
          </Chip>
        </div>
      </div>
      {/* Sección de Calificación de Satisfacción - Solo visible en estado RESUELTO o CERRADO */}
      {isResolvedOrClosed && credentials && (
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-xl mb-8">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {hasExistingRating
                    ? "Tu Calificación"
                    : "Califica la Atención"}
                </h3>
                <p className="text-sm text-slate-600">
                  {hasExistingRating
                    ? "Gracias por tu calificación"
                    : "¿Cómo fue tu experiencia con la resolución de tu reclamo?"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md">
              {/* Estrellas de calificación */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`transition-all duration-200 ${
                        hasExistingRating
                          ? "cursor-default"
                          : "cursor-pointer hover:scale-110"
                      }`}
                      disabled={hasExistingRating || isSubmittingRating}
                      type="button"
                      onClick={() =>
                        !hasExistingRating && setSatisfactionRating(star)
                      }
                      onMouseEnter={() =>
                        !hasExistingRating && setHoverRating(star)
                      }
                      onMouseLeave={() =>
                        !hasExistingRating && setHoverRating(0)
                      }
                    >
                      <Star
                        className={`w-10 h-10 transition-colors duration-200 ${
                          star <= (hoverRating || satisfactionRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <p className="text-sm text-slate-600">
                  {satisfactionRating === 0 &&
                    !hasExistingRating &&
                    "Selecciona una calificación"}
                  {satisfactionRating === 1 && "Muy insatisfecho"}
                  {satisfactionRating === 2 && "Insatisfecho"}
                  {satisfactionRating === 3 && "Neutral"}
                  {satisfactionRating === 4 && "Satisfecho"}
                  {satisfactionRating === 5 && "Muy satisfecho"}
                </p>

                {ratingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                    <p className="text-sm text-red-700 text-center">
                      {ratingError}
                    </p>
                  </div>
                )}

                {ratingSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                    <p className="text-sm text-green-700 text-center">
                      ¡Gracias por tu calificación!
                    </p>
                  </div>
                )}

                {/* Mostrar comentario existente si ya calificó */}
                {hasExistingRating && claim?.comentario_satisfaccion && (
                  <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      Tu comentario:
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      "{claim.comentario_satisfaccion}"
                    </p>
                  </div>
                )}

                {!hasExistingRating && (
                  <>
                    {/* Campo de comentario opcional */}
                    <div className="w-full mt-4">
                      <Textarea
                        isDisabled={isSubmittingRating}
                        maxLength={500}
                        minRows={3}
                        placeholder="Cuéntanos más sobre tu experiencia (opcional, máx. 500 caracteres)..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 text-right mt-1">
                        {ratingComment.length}/500
                      </p>
                    </div>

                    <Button
                      className="mt-4 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-emerald-500 to-green-600"
                      isDisabled={
                        satisfactionRating === 0 || isSubmittingRating
                      }
                      isLoading={isSubmittingRating}
                      size="lg"
                      startContent={<Star className="w-5 h-5" />}
                      onPress={handleSubmitRating}
                    >
                      Enviar Calificación
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Info Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Empresa
                </p>
                <p className="font-bold text-slate-800 text-lg">
                  {claim.empresa?.nombre || "No disponible"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Fecha de Envío
                </p>
                <p className="font-bold text-slate-800 text-lg">
                  {format(new Date(claim.fecha_creacion), "dd MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Ubicación
                </p>
                <p className="font-bold text-slate-800 text-base line-clamp-2">
                  {claim.pais || "No especificada"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs with improved styling */}
      <Tabs
        aria-label="Claim details"
        classNames={{
          tabList:
            "bg-white p-2 rounded-2xl shadow-lg border-2 border-slate-200",
          tab: "font-semibold",
          tabContent: "group-data-[selected=true]:text-white",
          cursor: "bg-gradient-to-r from-[#202e5e] to-[#1a2550] shadow-md",
        }}
        size="lg"
      >
        <Tab key="timeline" title="Línea de Tiempo">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Historial de Estados
                </h3>
              </div>
              <ClaimTimeline statusHistory={claim?.statusHistory || []} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="details" title="Detalles">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Descripción del Reclamo
                </h3>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md">
                <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                  {claim.descripcion}
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
        \
        <Tab key="comments" title={`Comentarios (${comments.length})`}>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Comentarios del Equipo
                </h3>
              </div>
              {comments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg font-medium">
                    No hay comentarios disponibles
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Los comentarios aparecerán aquí cuando el equipo actualice
                    tu caso
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <Card
                      key={comment.id}
                      className="bg-white border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-slate-800">
                                {comment.autor_nombre || "Equipo de Soporte"}
                              </span>
                              <span className="text-sm text-slate-500">
                                {format(
                                  new Date(comment.fecha_creacion),
                                  "dd MMM yyyy, HH:mm",
                                  { locale: es },
                                )}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {comment.contenido}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Sección de Respuesta del Denunciante - Solo visible en estado INFO (5) */}
      {isInfoState && credentials && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl mb-8">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Se Requiere Información Adicional
                </h3>
                <p className="text-sm text-slate-600">
                  El equipo necesita más información para procesar tu reclamo
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md">
              {/* Comentario */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-slate-800">
                    Comentario (opcional)
                  </h4>
                </div>

                <Textarea
                  isDisabled={isSubmittingInfoResponse}
                  maxLength={1000}
                  minRows={4}
                  placeholder="Escribe tu respuesta o información adicional..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>

              {/* Archivos Adjuntos */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-slate-800">
                    Adjuntar Documentos (opcional)
                  </h4>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                      {selectedFiles.length}
                    </span>
                  )}
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-amber-500 bg-amber-50 scale-[1.02]"
                      : "border-slate-300 hover:border-amber-400 hover:bg-amber-50/50"
                  }`}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    disabled={isSubmittingInfoResponse}
                    id="public-file-upload"
                    type="file"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <label
                    className="cursor-pointer flex flex-col items-center gap-2"
                    htmlFor="public-file-upload"
                  >
                    <Upload
                      className={`w-10 h-10 transition-colors duration-200 ${isDragging ? "text-amber-500" : "text-slate-400"}`}
                    />
                    <span className="text-sm text-slate-600">
                      {isDragging
                        ? "Suelta los archivos aquí"
                        : selectedFiles && selectedFiles.length > 0
                          ? `${selectedFiles.length} archivo(s) seleccionado(s)`
                          : "Haz clic o arrastra archivos aquí"}
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, Word, Imágenes (máx. 10MB)
                    </span>
                  </label>
                </div>

                {/* Lista de archivos seleccionados */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          className="p-1 hover:bg-amber-200 rounded transition-colors flex-shrink-0"
                          disabled={isSubmittingInfoResponse}
                          type="button"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mensajes de error/éxito */}
              {infoResponseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{infoResponseError}</p>
                </div>
              )}

              {infoResponseSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700">
                    ¡Información enviada exitosamente!
                  </p>
                </div>
              )}

              {/* Botón único de envío */}
              <Button
                className="w-full"
                color="warning"
                isDisabled={
                  (!newComment.trim() &&
                    (!selectedFiles || selectedFiles.length === 0)) ||
                  isSubmittingInfoResponse
                }
                isLoading={isSubmittingInfoResponse}
                size="lg"
                startContent={<Send className="w-5 h-5" />}
                onPress={handleSubmitInfoResponse}
              >
                Enviar Respuesta
                {(newComment.trim() ||
                  (selectedFiles && selectedFiles.length > 0)) && (
                  <span className="ml-2 text-xs opacity-80">
                    ({newComment.trim() ? "comentario" : ""}
                    {newComment.trim() &&
                    selectedFiles &&
                    selectedFiles.length > 0
                      ? " + "
                      : ""}
                    {selectedFiles && selectedFiles.length > 0
                      ? `${selectedFiles.length} archivo(s)`
                      : ""}
                    )
                  </span>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contact Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
        <CardBody className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            ¿Necesitas más información?
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Si tienes preguntas adicionales o necesitas proporcionar más
            información, contacta directamente con la empresa:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Email</p>
                <p className="font-bold text-slate-800">
                  {claim.empresa?.email_contacto || "No disponible"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Teléfono</p>
                <p className="font-bold text-slate-800">
                  {claim.empresa?.telefono_contacto || "No disponible"}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
