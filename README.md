# Guía de Despliegue en Webempresa (cPanel)

Esta guía detalla los pasos para desplegar la plataforma (Frontend Next.js + Backend Express) en un hosting compartido con cPanel (como Webempresa).

## Prerrequisitos
- Acceso a cPanel.
- Una base de datos MySQL creada en cPanel.
- Dominio o subdominio apuntando a `public_html/carpeta_destino`.

---

## 1. Preparación del Backyard (Backend)

### 1.1. Compilación
En tu entorno local, navega a `back/claims_platform` y ejecuta:
```bash
bun run build
```
Esto generará una carpeta `dist` con un archivo `app.js`.

### 1.2. Archivos a Subir
Crea una carpeta en tu servidor (fuera de `public_html` si es posible, por seguridad, por ejemplo en `/home/usuario/backend_denuncias`) y sube lo siguiente:
- Carpeta `dist/` (con `app.js` dentro).
- Archivo `package.json`.
- Archivo `.env` (basado en `.env.example`, configurado con los datos reales de tu BD de producción).

### 1.3. Setup Node.js App (cPanel)
1. En cPanel, busca "Setup Node.js App".
2. Crea una nueva aplicación ("Create Application").
   - **Node.js version**: Selecciona la versión recomendada (v18, v20, etc.).
   - **Application mode**: `Production`.
   - **Application root**: La ruta donde subiste los archivos (ej: `backend_denuncias`).
   - **Application URL**: `dominio.com/api` (o un subdominio `api.dominio.com` es mejor).
   - **Application startup file**: `dist/app.js`.
3. Haz clic en **Create**.
4. Una vez creada, entra a la configuración de la app y haz clic en **Run NPM Install** para instalar las dependencias (Express, MySQL2, etc.).
5. Haz clic en **Restart** para iniciar el servidor.

---

## 2. Preparación del Frontend

### 2.1. Configuración de Entorno
En `front/claims_platform`, crea o edita `.env.production.local`:
```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
# O la URL completa que configuraste en el paso anterior
```

### 2.2. Construcción (Exportación Estática)
Ejecuta:
```bash
bun run build
```
Esto creará una carpeta `out`. Esta carpeta contiene todo tu sitio web estático.

### 2.3. Subida
1. Sube el **contenido** de la carpeta `out` a la carpeta `public_html` (o `public_html/subdominio`) de tu hosting.

### 2.4. Configuración SPA (.htaccess)
Para que las rutas de React funcionen al recargar la página (por ejemplo, si entras directo a `/login`), necesitas redireccionar todo a `index.html`.
Crea o edita el archivo `.htaccess` en la carpeta donde subiste el frontend:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 3. Base de Datos

1. Usa **phpMyAdmin** en cPanel para importar el esquema inicial si no lo has hecho.
2. Si tienes scripts de migración, puedes intentar ejecutarlos vía consola SSH si tienes acceso, o configurar una ruta temporal en el backend para correrlos (no recomendado en producción definitivo, pero útil para el setup inicial).
