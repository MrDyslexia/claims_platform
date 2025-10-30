// Import all data
import { mockUsers, mockUserRoles, mockRoles, mockPermisos, mockRolePermisos } from "./users"
import { mockCompanies } from "./companies"
import { mockClaimTypes } from "./claim-types"
import { mockClaimStatuses } from "./claim-statuses"
import { mockClaims } from "./claims"
import { mockAuditLogs } from "./audit-logs"

// Re-export all data
export {
  mockUsers,
  mockUserRoles,
  mockRoles,
  mockPermisos,
  mockRolePermisos,
  mockCompanies,
  mockClaimTypes,
  mockClaimStatuses,
  mockClaims,
  mockAuditLogs,
}

// Helper functions to get data with relationships
export function getUserWithRoles(userId: number) {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) return null

  const userRoleIds = mockUserRoles.filter((ur) => ur.usuario_id === userId).map((ur) => ur.rol_id)

  const roles = mockRoles.filter((r) => userRoleIds.includes(r.id))

  return { ...user, roles }
}

export function getClaimWithDetails(claimId: number) {
  const claim = mockClaims.find((c) => c.id === claimId)
  if (!claim) return null

  const company = mockCompanies.find((c) => c.id === claim.empresa_id)
  const type = mockClaimTypes.find((t) => t.id === claim.tipo_denuncia_id)
  const status = mockClaimStatuses.find((s) => s.id === claim.estado_denuncia_id)

  return { ...claim, company, type, status }
}

export function getClaimWithRelations(claimId: number) {
  const claim = mockClaims.find((c) => c.id === claimId)
  if (!claim) return null

  const empresa = mockCompanies.find((c) => c.id === claim.empresa_id)
  const tipo = mockClaimTypes.find((t) => t.id === claim.tipo_denuncia_id)
  const estadoObj = mockClaimStatuses.find((s) => s.id === claim.estado_denuncia_id)
  const asignadoA = mockUsers.find((u) => u.id === claim.asignado_a)

  // Mock comments
  const comentarios = [
    {
      id: 1,
      denuncia_id: claimId,
      usuario_id: claim.asignado_a || 1,
      comentario: "Revisando el caso, necesitamos más información del cliente.",
      es_interno: true,
      fecha_creacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      usuario: asignadoA,
    },
    {
      id: 2,
      denuncia_id: claimId,
      usuario_id: claim.asignado_a || 1,
      comentario: "Cliente contactado, esperando respuesta.",
      es_interno: false,
      fecha_creacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      usuario: asignadoA,
    },
  ]

  // Mock history
  const historial = [
    {
      id: 1,
      denuncia_id: claimId,
      estado_anterior: "pendiente",
      estado_nuevo: "en_revision",
      usuario_id: claim.asignado_a || 1,
      comentario: "Caso asignado y en revisión",
      fecha_cambio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return {
    ...claim,
    empresa,
    tipo,
    estadoObj,
    asignadoA,
    comentarios,
    historial,
  }
}
