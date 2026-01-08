"use client"

import { useEffect, useState } from "react"
import { Card, CardBody, Button, Chip, Spinner } from "@heroui/react"
import { Clock, CheckCircle2, AlertCircle, TrendingUp, FileText, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"

export default function SupervisorDashboard() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/supervisor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Error al cargar datos del dashboard")
        }

        const result = await response.json()

        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token])

  // Validar que el usuario esté cargado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner label="Cargando..." />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner label="Cargando dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-danger">Error: {error}</p>
      </div>
    )
  }

  const { metrics, data: recentClaims } = data || { metrics: {}, data: [] }

  const getStatusColor = (estadoId: number) => {
    switch (estadoId) {
      case 1: // pendiente
        return "warning"
      case 2: // en_revision
        return "primary"
      case 4: // resuelto
        return "success"
      case 5: // cerrado
        return "default"
      default:
        return "default"
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case "alta":
      case "critica":
        return "danger"
      case "media":
        return "warning"
      case "baja":
        return "success"
      default:
        return "default"
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Supervisor</h1>
        <p className="text-default-500">
          Gestión de reclamos
          {user.empresa?.nombre ? ` de ${user.empresa.nombre}` : ""}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          isPressable
          onPress={() => router.push("/supervisor/claims?status=PENDIENTE")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-foreground">{metrics.pending_claims || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          onPress={() => router.push("/supervisor/claims?status=PROCESO")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">En Revisión</p>
              <p className="text-3xl font-bold text-foreground">{metrics.in_progress_claims || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          onPress={() => router.push("/supervisor/claims?status=RESUELTO")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Resueltos</p>
              <p className="text-3xl font-bold text-foreground">{metrics.resolved_claims || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          onPress={() => router.push("/supervisor/claims?priority=critica")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Críticos</p>
              <p className="text-3xl font-bold text-foreground">{metrics.critical_claims || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Reclamos Recientes</h3>
              <p className="text-sm text-default-500">Últimos reclamos asignados a ti</p>
            </div>
            <Button as={Link} color="primary" href="/supervisor/claims" variant="flat">
              Ver Todos
            </Button>
          </div>

          <div className="space-y-4">
            {recentClaims.length === 0 ? (
              <p className="text-center text-default-500 py-8">No hay reclamos asignados</p>
            ) : (
              recentClaims.map((claim: any) => (
                <Link
                  key={claim.id_denuncia}
                  className="block p-4 rounded-lg border border-divider hover:border-primary transition-colors"
                  href={`/supervisor/claims?search=${encodeURIComponent(claim.codigo_acceso)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-default-500">{claim.codigo_acceso}</span>
                        <Chip color={getStatusColor(claim.id_estado)} size="sm" variant="flat">
                          {claim.estadoObj?.nombre || "Pendiente"}
                        </Chip>
                        <Chip color={getPriorityColor(claim.prioridad)} size="sm" variant="flat">
                          {claim.prioridad}
                        </Chip>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{claim.tipo?.nombre || "Sin tipo"}</h4>
                      <p className="text-sm text-default-500 line-clamp-2">{claim.descripcion}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-default-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{claim.anonimo ? "Anónimo" : claim.nombre_denunciante || "Sin nombre"}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(claim.fecha_creacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-default-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
