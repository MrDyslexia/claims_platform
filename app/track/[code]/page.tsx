"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { mockClaims, getClaimWithDetails } from "@/lib/data";

export default function TrackClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimCode = params.code as string;

  // Find claim by code
  const claim = mockClaims.find((c) => c.codigo === claimCode);

  if (!claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-default-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardBody className="text-center p-12">
              <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Reclamo No Encontrado</h2>
              <p className="text-default-600 mb-6">
                No se encontró ningún reclamo con el código:{" "}
                <strong>{claimCode}</strong>
              </p>
              <Button
                color="primary"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={() => router.push("/track")}
              >
                Volver a Buscar
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const claimDetails = getClaimWithDetails(claim.id);

  const getStatusColor = (estado: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "success" | "warning" | "danger"
    > = {
      Nuevo: "primary",
      "En Revisión": "warning",
      "En Investigación": "warning",
      Resuelto: "success",
      Cerrado: "default",
      Rechazado: "danger",
    };

    return colors[estado] || "default";
  };

  const getStatusIcon = (estado: string) => {
    if (estado === "Resuelto" || estado === "Cerrado") {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  };

  // Filter only public comments
  const publicComments = claimDetails.comments.filter((c) => c.es_publico);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-default-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          className="mb-6"
          startContent={<ArrowLeft className="w-4 h-4" />}
          variant="flat"
          onPress={() => router.push("/track")}
        >
          Volver a Búsqueda
        </Button>

        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="flex-col items-start gap-3 p-6">
            <div className="flex justify-between items-start w-full">
              <div>
                <h1 className="text-3xl font-bold mb-2">{claim.codigo}</h1>
                <p className="text-default-600">{claim.tipo}</p>
              </div>
              <Chip
                color={getStatusColor(claim.estado)}
                size="lg"
                startContent={getStatusIcon(claim.estado)}
                variant="flat"
              >
                {claim.estado}
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Empresa</p>
                  <p className="font-semibold">{claimDetails.company.nombre}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Fecha de Envío</p>
                  <p className="font-semibold">
                    {format(
                      new Date(claim.fecha_creacion),
                      "dd 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Prioridad</p>
                  <Chip
                    color={
                      claim.prioridad === "Alta"
                        ? "danger"
                        : claim.prioridad === "Media"
                          ? "warning"
                          : "default"
                    }
                    size="sm"
                  >
                    {claim.prioridad}
                  </Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs aria-label="Claim details" className="mb-6" size="lg">
          <Tab key="details" title="Detalles">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Descripción del Reclamo
                </h3>
                <p className="text-default-700 whitespace-pre-wrap mb-6">
                  {claim.descripcion}
                </p>

                {claim.ubicacion && (
                  <>
                    <Divider className="my-6" />
                    <h3 className="text-xl font-semibold mb-4">Ubicación</h3>
                    <p className="text-default-700">{claim.ubicacion}</p>
                  </>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="timeline" title="Historial">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Historial de Estados
                </h3>
                <div className="space-y-4">
                  {claimDetails.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? "bg-primary" : "bg-default-200"
                          }`}
                        >
                          {index === 0 ? (
                            <Clock className="w-5 h-5 text-white" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-default-600" />
                          )}
                        </div>
                        {index < claimDetails.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-default-200 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <Chip
                            color={getStatusColor(history.estado_nuevo)}
                            size="sm"
                          >
                            {history.estado_nuevo}
                          </Chip>
                          <span className="text-sm text-default-500">
                            {format(
                              new Date(history.fecha_cambio),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </span>
                        </div>
                        {history.comentario && (
                          <p className="text-sm text-default-600 mt-2">
                            {history.comentario}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="comments" title={`Comentarios (${publicComments.length})`}>
            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Comentarios Públicos
                </h3>
                {publicComments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-default-300 mx-auto mb-3" />
                    <p className="text-default-500">
                      No hay comentarios públicos aún
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publicComments.map((comment) => (
                      <Card key={comment.id} className="bg-default-50">
                        <CardBody className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">
                                  Equipo de Soporte
                                </span>
                                <span className="text-sm text-default-500">
                                  {format(
                                    new Date(comment.fecha_creacion),
                                    "dd/MM/yyyy HH:mm",
                                  )}
                                </span>
                              </div>
                              <p className="text-default-700">
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

        {/* Help Card */}
        <Card className="bg-default-50">
          <CardBody className="p-6">
            <h3 className="font-semibold mb-2">¿Necesitas más información?</h3>
            <p className="text-sm text-default-600 mb-4">
              Si tienes preguntas sobre tu reclamo o necesitas proporcionar
              información adicional, puedes contactar directamente con la
              empresa.
            </p>
            <div className="flex gap-3">
              <div className="text-sm">
                <p className="text-default-600">Email:</p>
                <p className="font-semibold">
                  {claimDetails.company.email_contacto}
                </p>
              </div>
              <Divider orientation="vertical" />
              <div className="text-sm">
                <p className="text-default-600">Teléfono:</p>
                <p className="font-semibold">
                  {claimDetails.company.telefono_contacto}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
