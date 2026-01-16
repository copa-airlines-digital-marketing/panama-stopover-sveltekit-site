# 🔐 Guía de Configuración de Variables de Entorno

**Fecha:** 2026-01-16  
**Estado:** Guía completa para configurar `.env`

---

## 📋 Pasos Rápidos

```bash
# 1. Copiar el archivo ejemplo
cp .env.example .env

# 2. Editar .env con tus valores
nano .env  # o tu editor favorito

# 3. Verificar que funcione
pnpm dev
```

---

## 🔑 Variables Requeridas

### Directus CMS

#### `DIRECTUS_REST_URL`
**Descripción:** URL de tu instancia de Directus  
**Formato:** `https://cms.example.com` (sin trailing slash)  
**Ejemplo:** `https://directus.copa.com`

**Dónde obtenerlo:**
- Es la URL donde está desplegado tu Directus
- En desarrollo local: `http://localhost:8055`

#### `DIRECTUS_TOKEN`
**Descripción:** Token de acceso para producción  
**Formato:** String largo alfanumérico  
**Ejemplo:** `abc123def456ghi789jkl012mno345pqr678stu901vwx234`

**Dónde obtenerlo:**
1. Ir a Directus Admin Panel
2. Settings → Access Tokens
3. Crear nuevo token o usar uno existente
4. Dar permisos de lectura a las colecciones necesarias

#### `DIRECTUS_PREVIEW_TOKEN` (Opcional)
**Descripción:** Token separado para preview/staging  
**Formato:** String largo alfanumérico  
**Ejemplo:** Similar a `DIRECTUS_TOKEN`

**Uso:**
- Si quieres tener un entorno de preview separado
- Si no lo necesitas, usa el mismo valor que `DIRECTUS_TOKEN`

#### `PREVIEW_SECRET`
**Descripción:** Secret para activar modo preview  
**Formato:** Cualquier string secreto  
**Ejemplo:** `my-super-secret-preview-key-2024`

**Uso:**
- Para activar preview: añadir `?preview=my-super-secret-preview-key-2024` a la URL

#### `SITE_ID`
**Descripción:** ID del sitio en Directus  
**Formato:** Número o UUID  
**Ejemplo:** `1` o `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Dónde obtenerlo:**
1. Ir a Directus Admin Panel
2. Content → Sites
3. Ver el ID del site que quieres usar

---

### Aplicación

#### `BASE_URL`
**Descripción:** URL base de tu aplicación  
**Formato:** `https://domain.com` (sin trailing slash)  
**Ejemplos:**
- Producción: `https://stopover.copa.com`
- Desarrollo: `http://localhost:5173`

**Uso:**
- Generación de QR codes
- Links absolutos en emails
- Redirects

#### `CATEGORIES_MAP`
**Descripción:** Mapeo de categorías a colecciones de Directus  
**Formato:** JSON string  
**Valor por defecto:**
```json
{
  "hotels": "stopover_hotels",
  "restaurants": "stopover_restaurants",
  "activities": "stopover_place_to_visit",
  "tours": "stopover_tour",
  "packages": "stopover_package",
  "transportation": "stopover_transportation"
}
```

**Nota:** Usar como una sola línea en el `.env`

---

### Seguridad

#### `IP_HASH_SALT`
**Descripción:** Salt para hashear IPs en logs  
**Formato:** String aleatorio largo  
**Ejemplo:** `a9f7e2d5c4b8a1f3e6d9c2b5a8f1e4d7c0b3a6f9e2d5c8b1a4f7e0d3c6b9`

**Cómo generarlo:**
```bash
# Opción 1: openssl
openssl rand -hex 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 3: Online
# https://www.random.org/strings/
```

**Uso:**
- Hashear IPs antes de guardarlas en logs
- Para cumplir con GDPR/privacidad

---

### Base de Datos

#### `DATABASE_URL`
**Descripción:** Connection string para PostgreSQL  
**Formato:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`  
**Ejemplos:**

**Desarrollo local:**
```
postgresql://postgres:password@localhost:5432/stopover_dev
```

**Producción (ejemplo con parámetros SSL):**
```
postgresql://user:pass@db.example.com:5432/stopover_prod?sslmode=require
```

**Dónde obtenerlo:**
- Si usas servicio managed: En el dashboard de tu provider (AWS RDS, Heroku, etc.)
- Si es local: Configurar PostgreSQL localmente

**Setup local de PostgreSQL:**
```bash
# 1. Instalar PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# 2. Crear base de datos
sudo -u postgres psql
CREATE DATABASE stopover_dev;
CREATE USER stopover_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stopover_dev TO stopover_user;
\q

# 3. Usar en .env
DATABASE_URL=postgresql://stopover_user:your_password@localhost:5432/stopover_dev
```

**Después de configurar:**
```bash
# Generar cliente Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate deploy

# O hacer push del schema
pnpm prisma db push
```

---

### Internacionalización

#### `PUBLIC_SUPPORTED_LANGUAGES`
**Descripción:** Idiomas soportados por el sitio  
**Formato:** Códigos de idioma separados por coma  
**Ejemplo:** `es,en,pt`

**Nota:** Variable pública (accesible en cliente)

---

## 📝 Ejemplo Completo de `.env`

```bash
# DIRECTUS
DIRECTUS_REST_URL=https://cms.copa.com
DIRECTUS_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234
DIRECTUS_PREVIEW_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234
PREVIEW_SECRET=my-super-secret-preview-key-2024
SITE_ID=1

# APPLICATION
BASE_URL=https://stopover.copa.com
CATEGORIES_MAP={"hotels":"stopover_hotels","restaurants":"stopover_restaurants","activities":"stopover_place_to_visit","tours":"stopover_tour","packages":"stopover_package","transportation":"stopover_transportation"}

# SECURITY
IP_HASH_SALT=a9f7e2d5c4b8a1f3e6d9c2b5a8f1e4d7c0b3a6f9e2d5c8b1a4f7e0d3c6b9

# DATABASE
DATABASE_URL=postgresql://stopover_user:password@localhost:5432/stopover_dev

# I18N
PUBLIC_SUPPORTED_LANGUAGES=es,en,pt
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE

1. **NUNCA** commitear el archivo `.env` con valores reales
2. `.env` debe estar en `.gitignore` (ya lo está)
3. Usar valores diferentes para dev/staging/prod
4. Rotar tokens periódicamente
5. No compartir `.env` por email/slack

### ✅ Buenas Prácticas

**Para desarrollo:**
- Usar valores de prueba o desarrollo
- Tener un `.env.local` que override `.env` si necesitas

**Para staging:**
- Usar tokens de preview separados
- Base de datos separada de producción

**Para producción:**
- Usar variables de entorno del servidor (no archivo .env)
- Configurar en Cloudflare Pages / Variables de entorno
- Usar secrets management si es posible

---

## 🚀 Despliegue en Cloudflare Pages

En Cloudflare Pages, no uses archivo `.env`. En su lugar:

1. Ir a tu proyecto en Cloudflare Pages
2. Settings → Environment Variables
3. Agregar cada variable:
   - Name: `DIRECTUS_REST_URL`
   - Value: `https://cms.copa.com`
   - Environment: Production / Preview

**Variables que DEBES configurar en Cloudflare:**
- `DIRECTUS_REST_URL`
- `DIRECTUS_TOKEN`
- `DIRECTUS_PREVIEW_TOKEN`
- `PREVIEW_SECRET`
- `SITE_ID`
- `BASE_URL`
- `CATEGORIES_MAP`
- `IP_HASH_SALT`
- `DATABASE_URL`
- `PUBLIC_SUPPORTED_LANGUAGES`

---

## 🐛 Troubleshooting

### Error: "Module has no exported member"
**Solución:** La variable no está definida en `.env`
```bash
# Verificar que la variable existe en .env
cat .env | grep VARIABLE_NAME

# Si no existe, agregarla
echo "VARIABLE_NAME=value" >> .env

# Reiniciar dev server
pnpm dev
```

### Error: "Cannot connect to Directus"
**Solución:** Verificar `DIRECTUS_REST_URL` y `DIRECTUS_TOKEN`
```bash
# Test con curl
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-directus.com/items/pages

# Debe retornar JSON, no error 401
```

### Error: "Cannot connect to database"
**Solución:** Verificar `DATABASE_URL`
```bash
# Test con psql
psql "postgresql://user:pass@host:5432/db" -c "\dt"

# Debe mostrar las tablas
```

### Variables no se cargan
**Solución:** Reiniciar dev server
```bash
# Ctrl+C para detener
# Luego iniciar de nuevo
pnpm dev
```

---

## 📚 Referencias

- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-private)
- [Directus Access Tokens](https://docs.directus.io/reference/authentication.html)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)

---

## ✅ Checklist de Configuración

- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar `DIRECTUS_REST_URL`
- [ ] Configurar `DIRECTUS_TOKEN`
- [ ] Configurar `SITE_ID`
- [ ] Configurar `BASE_URL`
- [ ] Configurar `DATABASE_URL`
- [ ] Generar `IP_HASH_SALT`
- [ ] Configurar `PUBLIC_SUPPORTED_LANGUAGES`
- [ ] Ejecutar `pnpm prisma generate`
- [ ] Ejecutar `pnpm dev` y verificar que funcione
- [ ] No commitear `.env` real

---

**¡Listo! Tu proyecto debería funcionar ahora.** 🚀
