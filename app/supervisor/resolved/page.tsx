"use client"

import { Card, CardBody, Chip } from "@heroui/react"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { mockClaims, getClaimWithRelations } from "@/lib/data"

export default function SupervisorResolved() {
  const { user } = useAuth()

  const resolvedClaims = mockClaims
    .filter((c) => c.empresa_id === user?.empresa_id && c.asignado_a === user?.id && c.estado === "resuelto")
    .map((claim) => getClaimWithRelations(claim.id))

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reclamos Resueltos</h1>
          <p className="text-default-500">{resolvedClaims.length} reclamos completados</p>
        </div>
      </div>

      {/* Resolved Claims */}
      <div className="grid grid-cols-1 gap-4">
        {resolvedClaims.map((claim) => (
          <Link key={claim.id} href={`/supervisor/claims/${claim.id}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-default-500">{claim.codigo}</span>
                      <Chip size="sm" color="success" variant="flat">
                        Resuelto
                      </Chip>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{claim.tipo?.nombre}</h3>
                    <p className="text-sm text-default-500 mb-3 line-clamp-2">{claim.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-default-400">
                      <span>Denunciante: {claim.denunciante_nombre}</span>
                      <span>•</span>
                      <span>Resuelto: {new Date(claim.fecha_actualizacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
