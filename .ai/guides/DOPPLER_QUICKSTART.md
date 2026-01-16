# 🔐 Doppler Setup - Quick Start Guide

## Paso 1: Verificar Instalación

```bash
doppler --version
# Deberías ver v3.75.1 o superior
```

## Paso 2: Autenticación Inicial

```bash
# Login a Doppler
doppler login

# Verificar status
pnpm run doppler:status
```

## Paso 3: Configurar Entornos en Doppler

Asegúrate de que en tu proyecto Doppler existan estos configs:
- `dev` - Para desarrollo local
- `staging` - Para testing/staging
- `prod` - Para producción

### Verificar que existen:
```bash
doppler configs --project panama-stopover-site
```

## Paso 4: Ver tus Secrets

```bash
# Ver secrets actuales
pnpm run doppler:secrets

# Ver secrets de un config específico
DOPPLER_CONFIG=staging doppler secrets get

# Descargar como archivo .env
pnpm run doppler:download
# Esto crea: .env.doppler.local (no commits esto!)
```

## Paso 5: Ejecutar Comandos con Doppler

### Opción A: Con Doppler automáticamente

```bash
# Dev con secrets de Doppler (config: dev)
pnpm dev

# Build con secrets de Doppler (config: prod)
pnpm build

# Tests
pnpm test

# Sin Doppler (fallback)
pnpm dev:no-doppler
```

### Opción B: Script wrapper personalizado

```bash
# Dev
./scripts/doppler-run.sh pnpm dev

# Build con config specific
./scripts/doppler-run.sh --environment prod pnpm build

# Guardar .env local
./scripts/doppler-run.sh --save-env pnpm dev
```

### Opción C: Script Node.js (para CI/CD)

```bash
# Dev
DOPPLER_CONFIG=dev node scripts/load-doppler.js -- pnpm dev

# Build
DOPPLER_CONFIG=prod node scripts/load-doppler.js -- pnpm build
```

## Uso en Desarrollo Local

### Setup inicial (una sola vez)

```bash
# 1. Clone el repo
git clone <repo>
cd panama-stopover-sveltekit-site

# 2. Install deps
pnpm install

# 3. Login a Doppler
doppler login

# 4. ¡Listo! Ahora puedes usar los comandos normales
```

### Desarrollo diario

```bash
# Desarrollo
pnpm dev

# Tests
pnpm test

# Build
pnpm build

# Lint/Format
pnpm lint
pnpm format
```

## Uso en CI/CD

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build & Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install Doppler CLI
        run: curl -Ls https://cli.doppler.com/install.sh | sh
      
      - name: Install Dependencies
        run: pnpm install
      
      - name: Check Types
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: doppler run -p panama-stopover-site -c prod -- pnpm check
      
      - name: Lint
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: doppler run -p panama-stopover-site -c prod -- pnpm lint
      
      - name: Build
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: doppler run -p panama-stopover-site -c prod -- pnpm build
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build

build:
  stage: build
  image: node:18-alpine
  before_script:
    - curl -Ls https://cli.doppler.com/install.sh | sh
    - pnpm install
  script:
    - doppler run -p panama-stopover-site -c prod -- pnpm build
  artifacts:
    paths:
      - build/
  only:
    - main
```

### Docker

```dockerfile
FROM node:18-alpine

# Install Doppler
RUN curl -Ls https://cli.doppler.com/install.sh | sh

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build with Doppler secrets
RUN doppler run -t $DOPPLER_TOKEN -c prod -- pnpm build

# Runtime
ENV NODE_ENV=production
CMD ["doppler", "run", "-t", "$DOPPLER_TOKEN", "-c", "prod", "--", "node", "build/index.js"]
```

## Troubleshooting

### Error: "not authenticated"

```bash
# Solución: Login nuevamente
doppler login
```

### Error: "config not found"

```bash
# Verificar que el config existe
doppler configs --project panama-stopover-site

# O crea uno nuevo en el dashboard de Doppler
```

### Error: "forbidden / 403"

```bash
# Verifica permisos en Doppler dashboard
# - Asegúrate de que tu usuario tiene acceso al proyecto
# - Verifica que el token (en CI/CD) tiene permisos
```

### Secrets no se cargan

```bash
# Debug: Ver qué se está cargando
doppler secrets get --config dev

# O especifica verbosely
doppler run -p panama-stopover-site -c dev -- env | grep DIRECTUS
```

### En CI/CD: DOPPLER_TOKEN no válido

```bash
# En GitHub/GitLab, asegúrate de:
# 1. Crear un nuevo Access Token en Doppler (no es tu password)
# 2. Agregarlo como secret en tu repo: DOPPLER_TOKEN
# 3. Usar: env.DOPPLER_TOKEN o $DOPPLER_TOKEN en CI/CD config
```

## Comandos Útiles

```bash
# Ver status
pnpm run doppler:status

# Ver secrets
pnpm run doppler:secrets

# Descargar .env local
pnpm run doppler:download

# Login
pnpm run doppler:login

# Ver todos los secrets de un config
DOPPLER_CONFIG=staging doppler secrets get

# Un secret específico
doppler secrets get DIRECTUS_TOKEN

# Descargar en diferentes formatos
doppler secrets download --format json
doppler secrets download --format env
doppler secrets download --format yaml

# Ver projecto
doppler projects list
doppler configs --project panama-stopover-site
```

## Seguridad

⚠️ **IMPORTANTE:**

1. ❌ **NO** hagas commit de `.env` files
2. ❌ **NO** hagas commit de `.env.doppler.*` files
3. ✅ **SÍ** usa `.gitignore` para excluirlos
4. ✅ **SÍ** usa `DOPPLER_TOKEN` en CI/CD como secret
5. ✅ **SÍ** regenera tokens periódicamente en Doppler

### .gitignore

```
# Ya debería estar en .gitignore:
.env
.env.local
.env.*.local
.env.doppler*
.doppler.json
```

## Referencias

- 📚 [Doppler CLI Docs](https://docs.doppler.com/docs/cli)
- 🔐 [Doppler Security Best Practices](https://docs.doppler.com/docs/security-best-practices)
- 🚀 [Doppler with SvelteKit](https://docs.doppler.com/docs/framework-deploy-sveltekit)
- 🐳 [Doppler with Docker](https://docs.doppler.com/docs/docker)

---

**Última actualización:** 2026-01-16  
**Mantén esta guía actualizada cuando cambies la configuración de Doppler**
