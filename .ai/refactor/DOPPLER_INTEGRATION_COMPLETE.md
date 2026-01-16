# ✅ Doppler Integration Complete

**Fecha:** 2026-01-16  
**Proyecto:** Panama Stopover SvelteKit Site  
**Status:** ✅ Configured and Ready

---

## 📦 Archivos Creados/Modificados

### Configuración Doppler
- ✅ `doppler.yaml` - Configuración de Doppler
- ✅ `package.json` - Scripts actualizados con Doppler

### Scripts
- ✅ `scripts/doppler-run.sh` - Script wrapper bash
- ✅ `scripts/load-doppler.js` - Script Node.js para inyectar secrets

### Documentación
- ✅ `.ai/guides/DOPPLER_SETUP.md` - Guía técnica completa
- ✅ `.ai/guides/DOPPLER_QUICKSTART.md` - Guía de inicio rápido
- ✅ `.github/workflows/build-doppler.yml` - GitHub Actions CI/CD
- ✅ `.gitlab-ci.yml` - GitLab CI/CD

---

## 🚀 Quick Start

### 1️⃣ Configuración Inicial (Una sola vez)

```bash
# Login a Doppler
doppler login

# Verificar que esté autenticado
pnpm run doppler:status
```

### 2️⃣ Ver tus Secrets

```bash
# Ver todos los secrets
pnpm run doppler:secrets

# Ver config específico
DOPPLER_CONFIG=staging doppler secrets get

# Descargar .env local (NO commitar)
pnpm run doppler:download
```

### 3️⃣ Ejecutar Comandos

```bash
# Desarrollo (usa config: dev)
pnpm dev

# Build para producción (usa config: prod)
pnpm build

# Tests
pnpm test

# Sin Doppler (fallback)
pnpm dev:no-doppler
```

---

## 📊 Opciones de Integración

### Opción 1: Doppler Directo (Recomendado)
✅ **Ventaja:** Simple, integrado en `doppler run`  
✅ **Uso:** `pnpm dev` automáticamente inyecta secrets  
❌ **Desventaja:** Requiere Doppler CLI instalado

```bash
pnpm dev  # Usa doppler run automáticamente
```

### Opción 2: Script Wrapper Bash
✅ **Ventaja:** Control total, ofrece opciones avanzadas  
✅ **Uso:** `./scripts/doppler-run.sh -e staging pnpm dev`  
✅ **Features:** Save .env, environment selection

```bash
./scripts/doppler-run.sh -e staging pnpm build
./scripts/doppler-run.sh --save-env pnpm dev
```

### Opción 3: Script Node.js (CI/CD)
✅ **Ventaja:** Cross-platform, útil en CI/CD  
✅ **Uso:** `DOPPLER_CONFIG=prod node scripts/load-doppler.js -- pnpm build`

```bash
DOPPLER_CONFIG=prod node scripts/load-doppler.js -- pnpm build
```

---

## 🔐 Seguridad

### Para Desarrollo Local

✅ **Instala Doppler CLI:**
```bash
curl -Ls https://cli.doppler.com/install.sh | sh
```

✅ **Login:**
```bash
doppler login
```

✅ **Secrets seguros:**
- Nunca se guardan en disco (excepto si usas `--save-env`)
- Se inyectan en memoria durante ejecución
- Requiere autenticación local

### Para CI/CD

✅ **Setup de Doppler Token:**

1. En Doppler Dashboard → Settings → Access → Create Service Token
2. En tu repo (GitHub/GitLab) → Settings → Secrets → Add `DOPPLER_TOKEN`
3. En workflows, usar: `env.DOPPLER_TOKEN` o `$DOPPLER_TOKEN`

```yaml
# GitHub Actions
env:
  DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
run: doppler run -p panama-stopover-site -c prod -- pnpm build
```

```yaml
# GitLab CI
script:
  - doppler run -t $DOPPLER_TOKEN -p panama-stopover-site -c prod -- pnpm build
```

---

## 📋 Comandos Disponibles

### Doppler Utilities
```bash
pnpm run doppler:login      # Autenticarse
pnpm run doppler:status     # Ver status
pnpm run doppler:secrets    # Ver secrets
pnpm run doppler:download   # Descargar .env local
```

### Desarrollo
```bash
pnpm dev                    # Dev con Doppler (config: dev)
pnpm build                  # Build con Doppler (config: prod)
pnpm preview                # Preview con Doppler
pnpm test                   # Tests con Doppler
pnpm check                  # Type check con Doppler
pnpm lint                   # Lint con Doppler
pnpm format                 # Format con Doppler
```

### Sin Doppler (Fallback)
```bash
pnpm dev:no-doppler         # Dev sin Doppler
pnpm build:no-doppler       # Build sin Doppler
pnpm preview:no-doppler     # Preview sin Doppler
```

---

## 🔧 Configuración en Doppler Dashboard

Asegúrate de que tu proyecto tenga estos configs:

```
Project: panama-stopover-site
├── dev
│   ├── DIRECTUS_REST_URL
│   ├── DIRECTUS_TOKEN
│   ├── DIRECTUS_PREVIEW_TOKEN
│   └── ... (otros secrets de desarrollo)
├── staging
│   ├── DIRECTUS_REST_URL
│   ├── DIRECTUS_TOKEN
│   └── ... (secrets de staging)
└── prod
    ├── DIRECTUS_REST_URL
    ├── DIRECTUS_TOKEN
    └── ... (secrets de producción)
```

### Variables Requeridas

```
# Directus
DIRECTUS_REST_URL
DIRECTUS_TOKEN
DIRECTUS_PREVIEW_TOKEN

# Application
BASE_URL
PUBLIC_SUPPORTED_LANGUAGES
SITE_ID

# Security
PREVIEW_SECRET
IP_HASH_SALT

# Database
DATABASE_URL

# Mapas
GOOGLE_MAPS_API_KEY (opcional)
```

---

## 🐳 Docker

### Build con Doppler en Docker

```dockerfile
FROM node:18-alpine

# Install Doppler
RUN curl -Ls https://cli.doppler.com/install.sh | sh

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install -g pnpm@10.17.1
RUN pnpm install --frozen-lockfile

# Build
RUN doppler run -t $DOPPLER_TOKEN -c prod -- pnpm build

# Runtime
ENV NODE_ENV=production
CMD ["doppler", "run", "-t", "$DOPPLER_TOKEN", "-c", "prod", "--", "node", "build/index.js"]
```

### Ejecutar Docker

```bash
# Build con Doppler token
docker build --build-arg DOPPLER_TOKEN=$DOPPLER_TOKEN -t panama-stopover .

# Run
docker run -e DOPPLER_TOKEN=$DOPPLER_TOKEN panama-stopover
```

---

## 🚨 Troubleshooting

### Error: "not authenticated"
```bash
doppler login
```

### Error: "config not found"
```bash
# Verificar configs
doppler configs --project panama-stopover-site

# O verifica en el Dashboard de Doppler
```

### Error: "forbidden / 403"
- Asegúrate de tener acceso al proyecto en Doppler
- En CI/CD, verifica que `DOPPLER_TOKEN` es válido
- Regenera el token si es necesario

### Secrets no se cargan
```bash
# Debug
doppler secrets get
doppler secrets get DIRECTUS_TOKEN

# O ver en archivo .env local
cat .env.doppler.local
```

### En CI/CD: Token no reconocido
- En GitHub: Settings → Secrets → Verifica que `DOPPLER_TOKEN` está ahí
- En GitLab: Settings → CI/CD → Variables → Verifica que `DOPPLER_TOKEN` es protegido
- Regenera token en Doppler Dashboard si es necesario

---

## 📚 Documentación

- 📖 [`.ai/guides/DOPPLER_SETUP.md`](./DOPPLER_SETUP.md) - Guía técnica completa
- 🚀 [`.ai/guides/DOPPLER_QUICKSTART.md`](./DOPPLER_QUICKSTART.md) - Quick start guide
- 🔗 [Doppler Official Docs](https://docs.doppler.com)

---

## ✅ Verificación

Para verificar que todo está configurado correctamente:

```bash
# 1. Autenticarse
doppler login

# 2. Ver status
pnpm run doppler:status

# 3. Ver un secret
pnpm run doppler:secrets

# 4. Ejecutar comando
pnpm dev

# 5. En otra terminal, verifica que se conecta
curl http://localhost:1614/
```

---

## 🎯 Próximos Pasos

1. ✅ **Doppler Setup** - COMPLETADO
2. ⏭️ **GitHub Actions** - Configurado (.github/workflows/build-doppler.yml)
3. ⏭️ **GitLab CI** - Configurado (.gitlab-ci.yml)
4. ⏭️ **Docker** - Usar ejemplos de Dockerfile
5. ⏭️ **Cloudflare Pages** - Deploy con secrets

---

## 💡 Tips & Tricks

### Desarrollo Local sin Doppler
Si Doppler falla, los scripts fallback a `.env` local:
```bash
pnpm dev:no-doppler
```

### Debug: Ver qué secrets se están usando
```bash
doppler run -- env | grep DIRECTUS
doppler run -- env | grep DATABASE
```

### Cambiar temporalmente de config
```bash
DOPPLER_CONFIG=staging pnpm dev
```

### Crear .env local para debugging
```bash
doppler secrets download --format env > .env.local
# Luego usa .env.local (NO commitar)
```

---

**Configuración completada exitosamente** ✅  
**Listo para desarrollo y deployment** 🚀
