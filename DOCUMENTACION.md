# DOCUMENTACION

Este archivo está destinado a documentar el funcionamiento, estructura y consideraciones técnicas del sistema ERP web.

Puedes agregar aquí instrucciones de uso, descripciones de módulos, flujos de trabajo, ejemplos de endpoints, convenciones de desarrollo, y cualquier información relevante para usuarios y desarrolladores.

---

## Secciones sugeridas
- Introducción
- Estructura del proyecto
- Instalación y despliegue
- Uso de módulos principales
- Flujos de negocio
- Consideraciones técnicas
- Preguntas frecuentes
- Contacto y soporte

---

## Instalación y despliegue en HOSTINGER (producción)

A continuación se describen los pasos para instalar y publicar este sistema ERP web (React/Node/Prisma/PostgreSQL) en un hosting de Hostinger para que funcione en internet.

### 1. Requisitos previos
- Un plan de hosting con soporte para Node.js (por ejemplo, Hosting Cloud o VPS en Hostinger).
- Acceso al panel de control hPanel de Hostinger o acceso SSH (recomendado para VPS).
- Acceso a una base de datos PostgreSQL (puedes crearla desde hPanel o usar un servicio externo).
- (Opcional) Un dominio configurado en Hostinger.

### 2. Subir el proyecto al servidor
- Puedes subir los archivos usando el Administrador de Archivos de hPanel, SFTP o Git (si tienes VPS).
- Ubica el proyecto en una carpeta, por ejemplo: `/home/usuario/sistema-armaq`.

### 3. Configurar variables de entorno
- Crea un archivo `.env` en la raíz del proyecto (o en cada paquete si usas monorepo).
- Ejemplo de variables necesarias:

```
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db
PORT=3000
# Otras variables según tu configuración
```

### 4. Instalar dependencias
En la raíz del proyecto ejecuta:

```
npm install
```

Si usas workspaces/monorepo, también ejecuta:
```
npm install --workspaces
```

### 5. Configurar la base de datos
- Desde hPanel, crea una base de datos PostgreSQL y toma nota de los datos de acceso.
- Ejecuta las migraciones de Prisma para crear las tablas:

```
npx prisma migrate deploy --schema=packages/db/schema.prisma
```

- (Opcional) Ejecuta el seed si tienes datos de ejemplo:
```
npx ts-node packages/db/seed-generico.ts
```

### 6. Construir el frontend
- Ve a la carpeta del frontend (por ejemplo, `apps/web/frontweb`):
```
cd apps/web/frontweb
npm install
npm run build
```
- Esto generará una carpeta `dist` lista para producción.

### 7. Iniciar el backend y servir el frontend
- Ve a la carpeta del backend (por ejemplo, `packages/api`):
```
cd packages/api
npm install
npm run build # si tienes build step
node dist/index.js # o el archivo principal de tu backend
```
- Si usas VPS, puedes usar PM2 para mantener el backend corriendo:
```
npm install -g pm2
pm2 start dist/index.js --name sistema-armaq
pm2 save
pm2 startup
```
- Si usas hosting compartido Node.js (sin VPS), usa el Administrador de Node.js de hPanel para seleccionar la carpeta y archivo de inicio (`dist/index.js` o `index.js`).

### 8. Servir el frontend
- Puedes servir la carpeta `dist` del frontend como archivos estáticos desde el backend (Express.static) o configurar un subdominio en hPanel para apuntar a la carpeta `dist`.

### 9. Configurar el dominio y HTTPS
- En hPanel, apunta tu dominio al servidor (configuración DNS).
- Usa la opción de SSL gratuita de Hostinger para activar HTTPS.
- Si usas VPS, puedes instalar y configurar Nginx como proxy reverso y obtener certificados SSL con Certbot.

### 10. Verificar funcionamiento
- Accede a tu dominio o IP pública y verifica que la app carga y puedes iniciar sesión.
- Revisa los logs del backend y frontend ante cualquier error (en VPS puedes usar `pm2 logs`).

---

Si tienes dudas o necesitas ayuda con un paso específico en Hostinger, consulta la documentación oficial de Hostinger o contacta a soporte técnico.

---

## Instalación y despliegue en HOSTINGER (solo acceso a public_html)

Si tu plan de Hostinger solo te da acceso a la carpeta `public_html` (hosting compartido tradicional, sin Node.js), solo podrás desplegar el frontend (React) como sitio estático. No podrás correr el backend Node.js ni la base de datos PostgreSQL en este entorno. Aquí tienes los pasos para publicar el frontend:

### 1. Construir el frontend en tu computadora local
- Ve a la carpeta del frontend (por ejemplo, `apps/web/frontweb`):
```
cd apps/web/frontweb
npm install
npm run build
```
- Esto generará una carpeta `dist` (o `build`) con los archivos estáticos listos para producción.

### 2. Subir los archivos al hosting
- Borra o respalda el contenido actual de `public_html` si es necesario.
- Sube el contenido de la carpeta `dist` (NO la carpeta, solo su contenido) a `public_html` usando el Administrador de Archivos de hPanel o FTP.

### 3. Configurar rutas (opcional)
- Si usas React Router, asegúrate de tener un archivo `public_html/.htaccess` con la siguiente configuración para que todas las rutas apunten a `index.html`:

```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 4. Acceder a tu sitio
- Accede a tu dominio y deberías ver la aplicación React funcionando.

### 5. ¿Y el backend?
- Para que el sistema funcione completo (con backend y base de datos), necesitas un servidor con Node.js y PostgreSQL (VPS, cloud, o un backend externo).
- Puedes consumir una API alojada en otro servidor desde tu frontend en Hostinger, configurando la URL de la API en las variables de entorno del frontend (`VITE_API_URL` o similar).

---

**Importante:**
- En hosting compartido tradicional (solo public_html), no puedes ejecutar Node.js ni bases de datos PostgreSQL propias.
- Si necesitas backend, considera migrar a un VPS o usar servicios externos para la API y la base de datos.

¿Dudas? Consulta al soporte de Hostinger o al responsable técnico del sistema.
