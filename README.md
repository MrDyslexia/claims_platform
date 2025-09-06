Backend de Denuncias (Firebase)

Resumen
- API en Cloud Functions (Node 20, TypeScript).
- Base de datos en Firestore, adjuntos en Storage.
- Seguridad: App Check (opcional), reCAPTCHA v3, rate limit, reglas estrictas.
- Notificaciones por email (SendGrid opcional).

Estructura
- `firebase.json`: configuración de funciones y reglas.
- `firestore.rules`: solo admins pueden leer/escribir `reports/**`.
- `storage.rules`: bloqueo total; descargas/subidas vía URLs firmadas.
- `functions/src/index.ts`: endpoints públicos y de admin.
- `functions/src/validators.ts`: validaciones con Zod.
- `functions/src/services/uploads.ts`: firmado y movimiento de archivos.
- `functions/src/services/email.ts`: integración SendGrid.
- `functions/src/config.ts`: lectura de variables de entorno (Functions Config).

Endpoints
- `POST /signUploads` (Functions): solicita URLs firmadas para subir archivos.
  - Body: `{ recaptchaToken, files: [{ filename, contentType, size }] }`
  - Resp: `{ uploadId, signed: [{ filename, contentType, storagePath, url, expires }] }`
- `POST /createReport` (Functions): registra denuncia y mueve adjuntos al caso.
  - Body: `{ uploadId, type, details, isAnonymous, contact?, attachments: [{ filename, contentType, size, storagePath }], recaptchaToken? }`
  - Resp: `{ caseId }`
- `GET /adminListReports` (Admin, Bearer token con claim `admin: true`) – filtros: `status`, `limit`.
- `GET /adminGetReport?id={id}` (Admin).
- `PATCH /adminUpdateReport?id={id}` (Admin) – Body: `{ status?, assignedTo?, note? }`.
- `GET /adminGetAttachmentUrl?path=reports/{reportId}/attachments/{file}` (Admin).

Modelos de datos (Firestore / Storage)
- Colección `reports/{reportId}` (ver `functions/src/models.ts:1`):
  - `type` (string): categoría de la denuncia.
  - `details` (string): descripción de los hechos.
  - `isAnonymous` (bool): si el denunciante es anónimo.
  - `contact` (obj|null): `{ name?, email?, phone? }` si no es anónimo.
  - `status` (enum): `new | triage | in_progress | closed`.
  - `createdAt` (Timestamp): fecha de creación (serverTimestamp).
  - `admin` (obj): `{ assignedTo: string|null, lastUpdateAt: Timestamp }`.
  - `attachments` (array): `[{ filename, contentType, size, storagePath }]` (rutas en Storage).
- Subcolección `reports/{reportId}/updates/{updateId}`:
  - `at` (Timestamp), `by` (string|null uid), `note` (string opcional), `statusChange` (enum opcional).
- Colección `rateLimits/{window_ip}`:
  - `count` (number), `createdAt` (Timestamp).
- Storage:
  - Final: `reports/{reportId}/attachments/{filename}` (lectura mediante URL firmada por endpoint admin).
  - Temporal: `uploads/{uploadId}/{filename}` (se mueve al crear la denuncia).

Interfaces de API (requests/responses)
- Archivo: `functions/src/api-interfaces.ts:1`
  - `ISignUploadsRequest`, `ISignUploadsResponse`, `ISignedUploadEntry`, `IFileMeta`.
  - `ICreateReportRequest`, `ICreateReportResponse`, `IContact`, `ICreateReportAttachment`.
  - `IUpdateReportRequest`, `IListReportsResponse`, `IGetReportResponse`, `IAdminAttachmentUrlResponse`.
  - Utiliza `ReportDTO`/`ReportAttachment` desde `models.ts` para items de admin.

Importante
- Los nombres exportados son funciones HTTP. Sus URLs dependen del deploy: `https://<region>-<project>.cloudfunctions.net/<nombre>` o conforme a Functions v2: `https://<region>-<project>.cloudfunctions.net/<functionName>`.
- Integra App Check en el frontend y envía el header `X-Firebase-AppCheck` para reforzar seguridad (si `appcheck.enforce=true`).

Configuración
1) Instala herramientas:
   - Node 20 LTS y Bun 1.1+
   - Firebase CLI (opcional si no usas bunx): `bun add -g firebase-tools` o `npm i -g firebase-tools`
2) Ingresa a Firebase:
   - `firebase login`
   - Edita `.firebaserc` y pon tu proyecto en `default`.
3) Dependencias (Bun):
   - `cd functions && bun install`
4) Variables de entorno (Functions Config):
   - `firebase functions:config:set recaptcha.secret="<reCAPTCHA_v3_secret>"`
   - `firebase functions:config:set appcheck.enforce="true"` (opcional en dev: `false`)
   - `firebase functions:config:set cors.allowed_origins="https://tusitio.com,https://admin.tusitio.com"`
   - Email (opcional):
     - `firebase functions:config:set sendgrid.key="<SENDGRID_API_KEY>"`
     - `firebase functions:config:set notify.enabled="true" notify.to="equipo@tudominio.com" notify.from="denuncias@tudominio.com" notify.subject_prefix="[Nueva Denuncia]"`
   - Rate limit (opcional):
     - `firebase functions:config:set ratelimit.window_sec="60" ratelimit.max="10"`
   - Signed URLs (opcional):
     - `firebase functions:config:set signedurl.expires_min="15"`

Reglas
- Firestore: `firestore.rules` deja inaccesible `reports/**` a usuarios no-admin (clientes). El panel admin debe usar Auth con claim `admin: true` o consumir estos endpoints.
- Storage: todo bloqueado; las subidas y descargas se hacen con URLs firmadas desde el backend.

Despliegue
- `cd functions && bun run build`
- `bunx firebase deploy --only functions,firestore:rules,storage:rules`

Emuladores locales
- `cd functions && bun run serve` (construye y levanta emuladores de Functions, Firestore y Storage; requiere Java 11/17 en PATH)

Probar con Swagger
- Arranca emuladores: `cd functions && bun run serve`
- Abre Swagger UI en tu navegador:
  - `http://127.0.0.1:5001/<your-project-id>/us-central1/swagger`
- El documento OpenAPI dinámico está en:
  - `http://127.0.0.1:5001/<your-project-id>/us-central1/openapi`
- Notas:
  - Los endpoints admin requieren un `Authorization: Bearer <ID_TOKEN>` (JWT de Firebase con claim `admin: true`). En Swagger, usa el botón “Authorize” y pega el token.
  - En emulador, las Signed URLs no funcionan; prueba `createReport` sin adjuntos.

Swagger/OpenAPI: instalación y generación automática
- Requisitos previos:
  - Java JDK 11/17 en PATH (`java -version`).
  - Bun 1.1+ instalado (`bun --version`).
  - Firebase CLI accesible con `bunx` (`bunx firebase --version`).
- Instalar dependencias:
  - `cd functions && bun install`
- Generar OpenAPI desde Zod:
  - `bun run openapi:gen`
  - Esto produce/actualiza `functions/src/openapi.json` a partir de `validators.ts` y los modelos definidos en `tools/generate-openapi.ts`.
- Levantar Swagger UI (usando el endpoint embebido):
  - `bun run serve`
  - Abre `http://127.0.0.1:5001/<your-project-id>/us-central1/swagger`
- Desplegar a producción:
  - `bun run build && bunx firebase deploy --only functions`
  - Swagger quedará en: `https://<region>-<project>.cloudfunctions.net/swagger`

Editar/Ampliar la documentación
- Esquemas de entrada (requests):
  - Edita `functions/src/validators.ts` (Zod). Tras cambios, ejecuta `bun run openapi:gen`.
- Modelos y respuestas:
  - Edita `functions/tools/generate-openapi.ts` para ajustar modelos (`Report`, `ReportAttachment`, etc.) y responses.
  - Puedes añadir nuevos paths usando `registry.registerPath({ ... })` y zod para schemas.
- Regenerar el documento:
  - `bun run openapi:gen` y luego reinicia emuladores si estaban corriendo.

Alternativa: self-hosted Swagger UI (opcional)
- Nuestra función `swagger` usa CDN (`unpkg.com`). Si prefieres assets locales:
  - `cd functions && bun add -d swagger-ui-dist`
  - Crea un HTML que referencie `node_modules/swagger-ui-dist/swagger-ui.css` y `swagger-ui-bundle.js`.
  - Sirve ese HTML desde una Function HTTP o desde Firebase Hosting (si habilitas Hosting) y apunta la opción `url` a `/openapi`.

Uso desde Frontend (flujo recomendado)
1) Obtener token App Check (recomendado) y ejecutar reCAPTCHA v3 (obtener `recaptchaToken`).
2) Llamar `POST signUploads` con `{ recaptchaToken, files: [...] }` para recibir URLs firmadas.
3) Subir archivos directamente a GCS usando `PUT` a cada URL con header `Content-Type` correcto.
4) Llamar `POST createReport` con los metadatos, `uploadId` y la lista `attachments` (incluye `storagePath` devuelto en el paso 2). Devuelve `caseId`.

Admin
- Para proteger endpoints de admin, autentícate en Firebase Auth y añade el claim `admin: true` al usuario: 
  - Ejemplo con Admin SDK (fuera de funciones): `admin.auth().setCustomUserClaims(uid, { admin: true })` o usa una Function de provisionamiento manual.

Notas de Seguridad
- No loguear PII sensible en consola.
- Mantener límites de tamaño de archivos en frontend y backend.
- Considerar CSP y cabeceras en Hosting del frontend.

Estructura (modular, similar a anp_firebase)
- `functions/src/config/firebase.ts`: inicialización de Admin SDK y helpers (`db`, `storage`).
- `functions/src/controllers/PublicController.ts`: handlers `handleSignUploads`, `handleCreateReport`.
- `functions/src/controllers/AdminController.ts`: handlers `listReports`, `getReport`, `updateReport`.
- `functions/src/middleware.ts`: CORS, verificación App Check y auth admin (Bearer + claim `admin`).
- `functions/src/services/*`: servicios (uploads, email).
- `functions/src/security/recaptcha.ts`: verificación de reCAPTCHA v3.
- `functions/src/models.ts`: modelos Firestore/Storage + DTOs.
- `functions/src/api-interfaces.ts`: interfaces de API (requests/responses).
- `functions/tools/generate-openapi.ts`: generación OpenAPI desde Zod.
