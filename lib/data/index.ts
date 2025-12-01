// Import all data
import {
  mockUsers,
  mockUserRoles,
  mockRoles,
  mockPermisos,
  mockRolePermisos,
} from "./users";
import { mockCompanies } from "./companies";
import { mockClaimTypes } from "./claim-types";
import { mockClaimStatuses } from "./claim-statuses";
import { mockClaims } from "./claims";
import { mockAuditLogs } from "./audit-logs";

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
};

// Helper functions to get data with relationships
export function getUserWithRoles(userId: number) {
  const user = mockUsers.find((u) => u.id_usuario === userId);

  if (!user) return null;

  const userRoleIds = mockUserRoles
    .filter((ur) => ur.usuario_id === userId)
    .map((ur) => ur.rol_id);

  const roles = mockRoles.filter((r) => userRoleIds.includes(r.id_rol));

  return { ...user, roles };
}

export function getClaimWithDetails(claimId: number) {
  const claim = mockClaims.find((c) => c.id_denuncia === claimId);

  if (!claim) return null;

  const company = mockCompanies.find((c) => c.id_empresa === claim.id_empresa);
  const type = mockClaimTypes.find((t) => t.id_tipo === claim.id_tipo);
  const status = mockClaimStatuses.find((s) => s.id_estado === claim.id_estado);

  // Mock status history
  const statusHistory = [
    {
      id: 1,
      denuncia_id: claimId,
      de_estado_id: 1,
      a_estado_id: 2,
      motivo: "Caso asignado y en revisión",
      fecha_cambio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      denuncia_id: claimId,
      de_estado_id: 2,
      a_estado_id: 3,
      motivo: "En investigación - solicitando información adicional",
      fecha_cambio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      denuncia_id: claimId,
      de_estado_id: 3,
      a_estado_id: claim.id_estado,
      motivo: "Estado actual del caso",
      fecha_cambio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  // Mock comments
  const comments = [
    {
      id: 1,
      contenido:
        "Revisando el caso, hemos identificado los puntos principales de la denuncia.",
      autor_nombre: "Equipo de Soporte",
      fecha_creacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      contenido:
        "Se ha contactado con el departamento correspondiente para obtener más información.",
      autor_nombre: "Equipo de Soporte",
      fecha_creacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      contenido:
        "Se espera recibir documentación adicional en los próximos días.",
      autor_nombre: "Equipo de Soporte",
      fecha_creacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ];

  return {
    ...claim,
    company: {
      nombre: company?.nombre || "Empresa Desconocida",
      email_contacto: company?.email,
      telefono_contacto: company?.telefono,
    },
    type,
    status,
    statusHistory,
    comments,
  };
}

export function getClaimWithRelations(claimId: number) {
  const claim = mockClaims.find((c) => c.id_denuncia === claimId);

  if (!claim) return null;

  const empresa = mockCompanies.find((c) => c.id_empresa === claim.id_empresa);
  const tipo = mockClaimTypes.find((t) => t.id_tipo === claim.id_tipo);
  const estadoObj = mockClaimStatuses.find(
    (s) => s.id_estado === claim.id_estado,
  );

  // Mock comments
  const comentarios = [
    {
      id: 1,
      denuncia_id: claimId,
      usuario_id: 1,
      comentario: "Revisando el caso, necesitamos más información del cliente.",
      es_interno: true,
      fecha_creacion: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: 2,
      denuncia_id: claimId,
      usuario_id: 1,
      comentario: "Cliente contactado, esperando respuesta.",
      es_interno: false,
      fecha_creacion: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  ];

  // Mock history
  const historial = [
    {
      id: 1,
      denuncia_id: claimId,
      estado_anterior: "pendiente",
      estado_nuevo: "en_revision",
      usuario_id: 1,
      comentario: "Caso asignado y en revisión",
      fecha_cambio: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  ];

  return {
    ...claim,
    empresa,
    tipo,
    estadoObj,
    comentarios,
    historial,
  };
}

// Helper to get company name by ID
export function getCompanyById(id: number) {
  return mockCompanies.find((c) => c.id_empresa === id);
}

// Helper to get claim type by ID
export function getClaimTypeById(id: number) {
  return mockClaimTypes.find((t) => t.id_tipo === id);
}

// Helper to get claim status by ID
export function getClaimStatusById(id: number) {
  return mockClaimStatuses.find((s) => s.id_estado === id);
}
