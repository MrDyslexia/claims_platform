"use client"

import { Card, CardBody, CardHeader, Chip, Progress } from "@heroui/react"
import { FileText, Clock, CheckCircle2, TrendingUp, AlertTriangle, Users, Building2 } from "lucide-react"

// Mock data for dashboard
const stats = [
  {
    title: "Total Reclamos",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "En Proceso",
    value: "45",
    change: "+5%",
    trend: "up",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "Resueltos",
    value: "1,089",
    change: "+18%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Críticos",
    value: "8",
    change: "-3%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
]

const recentClaims = [
  { id: "RC-2024-001", type: "Acoso Laboral", status: "En Proceso", priority: "alta", date: "2024-10-07" },
  { id: "RC-2024-002", type: "Discriminación", status: "Nuevo", priority: "critica", date: "2024-10-07" },
  { id: "RC-2024-003", type: "Fraude", status: "En Revisión", priority: "media", date: "2024-10-06" },
  { id: "RC-2024-004", type: "Conflicto de Interés", status: "Resuelto", priority: "baja", date: "2024-10-06" },
  { id: "RC-2024-005", type: "Acoso Laboral", status: "En Proceso", priority: "alta", date: "2024-10-05" },
]

const priorityColors = {
  baja: "default",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del sistema de reclamos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`h-3 w-3 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                      <span className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {stat.change} vs mes anterior
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Claims */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold">Reclamos Recientes</h2>
                <p className="text-sm text-muted-foreground">Últimos reclamos ingresados al sistema</p>
              </div>
              <Chip color="primary" variant="flat">
                5 nuevos
              </Chip>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100/50 rounded-lg hover:bg-default-100 dark:hover:bg-default-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{claim.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{claim.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={priorityColors[claim.priority as keyof typeof priorityColors]}
                      variant="flat"
                    >
                      {claim.priority}
                    </Chip>
                    <Chip size="sm" variant="bordered">
                      {claim.status}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Distribución por Estado</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Nuevos</span>
                  <span className="font-medium">15%</span>
                </div>
                <Progress value={15} color="primary" size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>En Proceso</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress value={35} color="warning" size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resueltos</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} color="success" size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cerrados</span>
                  <span className="font-medium">5%</span>
                </div>
                <Progress value={5} color="default" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Métricas Rápidas</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Usuarios Activos</span>
                </div>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Empresas</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tiempo Prom. Resolución</span>
                </div>
                <span className="font-semibold">5.2 días</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
