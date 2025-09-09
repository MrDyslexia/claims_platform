# Denuncias App Backend (Express + TypeScript + Sequelize + Bun)

- Stack: Express 5, TypeScript, Sequelize (MySQL), Bun-ready.
- Modelo MVC: rutas = vistas (puntos de entrada para el frontend).
- Triggers y vista SQL implementados vía migraciones SQL crudas.

## Requisitos
- Node 18+ (ó Bun 1+)
- MySQL 8+

## Configuración
1. Copia `.env.example` a `.env` y ajusta credenciales.
2. Inicializa DB y aplica esquema y datos base:
   - Con Node: `npm run db:init` y luego `npm run db:migrate`
   - O manualmente ejecuta los SQL en `sql/` en tu MySQL.

## Ejecutar
- Desarrollo (Node): `npm run dev`
- Producción: `npm run build && npm start`
- Con Bun (opcional): `bun run src/app.ts`

## Rutas clave (`/api`)
- `GET /health` – estado del servicio
- `POST /auth/register` – registro (básico)
- `POST /auth/login` – login (JWT + sesión con jti)
- `POST /auth/logout` – revoca sesión actual
- `GET /denuncias/lookup?numero=...&clave=...` – consulta pública
- `POST /denuncias` – crear (requiere `DENUNCIA_CREAR`)
- `POST /denuncias/comentario` – comentar (trigger valida estado)
- `POST /denuncias/resolucion` – crear (requiere `DENUNCIA_RESOLVER`)
- `POST /denuncias/asignar` – asignar (requiere `DENUNCIA_REASIGNAR`)
- `POST /export` – registra export (trigger audita) (requiere `EXPORTAR`)

## Notas técnicas
- Conexión Sequelize: `src/db/sequelize.ts` (multi-statements activado para migraciones).
- Modelos y asociaciones: `src/models/index.ts`.
- Migraciones SQL: `sql/001_schema.sql` (tablas, vista y triggers), `sql/002_seed_data.sql` (datos iniciales).
- Autenticación JWT + RBAC: `src/middlewares/auth.ts`.
- Log de requests en DB: `src/middlewares/requestLogger.ts` -> `api_request_log`.
- Verificación de clave (número + clave): `src/utils/crypto.ts` reproduce `UNHEX(SHA2(...))` del trigger.

## Importante
- Los triggers usan `RANDOM_BYTES()` (MySQL 8+). Asegura versión compatible.
- `DENUNCIA` genera `numero`, `clave_salt` y `clave_hash` vía trigger antes de insertar.
- `comentario` es único por denuncia y sólo permitido cuando `estado` = `NECESITA_DATOS` (trigger).
- `resolucion` mueve estado a `RESUELTA` y registra historial (trigger).
- `export_auditoria` genera auditoría al insert (trigger).

## Siguientes pasos sugeridos
- Añadir controladores CRUD para catálogos (empresa, tipo_denuncia, estados).
- Endpoints para bandejas filtradas y KPIs.
- Envío de emails a partir de `email_queue` (worker en background).
- Tests de integración (supertest) y CI.

