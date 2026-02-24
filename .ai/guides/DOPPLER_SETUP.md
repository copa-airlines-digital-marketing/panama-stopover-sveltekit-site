# Doppler Configuration para package.json

Actualiza tus scripts en `package.json` para usar Doppler:

## Opción 1: Usando doppler run directamente (Recomendado para CI/CD)

```json
{
  "scripts": {
    "dev": "doppler run -- vite dev --host --port 1614",
    "build": "doppler run -- vite build",
    "preview": "doppler run -- vite preview",
    "test": "doppler run -- pnpm run test:integration && doppler run -- npm run test:unit",
    "test:integration": "doppler run -- playwright test",
    "test:unit": "doppler run -- vitest",
    "check": "doppler run -- svelte-kit sync && doppler run -- svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "doppler run -- svelte-kit sync && doppler run -- svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "doppler run -- prettier --check . && doppler run -- eslint .",
    "format": "doppler run -- prettier --write .",
    "start": "doppler run -- node build/index.js"
  }
}
```

## Opción 2: Usando script wrapper personalizado (Más limpio)

```json
{
  "scripts": {
    "dev": "./scripts/doppler-run.sh pnpm dev",
    "build": "./scripts/doppler-run.sh --environment prod pnpm build",
    "preview": "./scripts/doppler-run.sh pnpm preview",
    "test": "./scripts/doppler-run.sh pnpm run test:integration && ./scripts/doppler-run.sh npm run test:unit",
    "test:integration": "./scripts/doppler-run.sh playwright test",
    "test:unit": "./scripts/doppler-run.sh vitest",
    "check": "./scripts/doppler-run.sh svelte-kit sync && ./scripts/doppler-run.sh svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "./scripts/doppler-run.sh svelte-kit sync && ./scripts/doppler-run.sh svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "./scripts/doppler-run.sh prettier --check . && ./scripts/doppler-run.sh eslint .",
    "format": "./scripts/doppler-run.sh prettier --write .",
    "start": "./scripts/doppler-run.sh --environment prod node build/index.js"
  }
}
```

## Opción 3: Variables de Entorno para CI/CD (GitHub Actions, GitLab CI, etc.)

```json
{
  "scripts": {
    "dev": "node scripts/load-doppler.js -- vite dev --host --port 1614",
    "build": "node scripts/load-doppler.js -- vite build",
    "preview": "node scripts/load-doppler.js -- vite preview"
  }
}
```

Con un script Node.js `scripts/load-doppler.js`:

```javascript
#!/usr/bin/env node
import { spawn } from 'child_process';
import { execSync } from 'child_process';

const env = process.env.ENVIRONMENT || 'dev';

try {
  // Fetch secrets from Doppler
  const secrets = execSync(`doppler secrets download --config ${env} --format json`, {
    encoding: 'utf-8'
  });
  
  const parsed = JSON.parse(secrets);
  const envVars = { ...process.env, ...parsed };
  
  // Execute command
  const [, , ...command] = process.argv;
  const proc = spawn(command[0], command.slice(1), {
    env: envVars,
    stdio: 'inherit'
  });
  
  process.exit(proc.exitCode || 0);
} catch (error) {
  console.error('Error loading Doppler secrets:', error.message);
  process.exit(1);
}
```

## Configuración Recomendada

### Para Desarrollo Local

```bash
# Usar el script wrapper
npm run dev

# O especificar entorno
./scripts/doppler-run.sh -e staging pnpm dev

# O guardar env local
./scripts/doppler-run.sh -s pnpm dev
```

### Para CI/CD (GitHub Actions)

```yaml
# .github/workflows/build.yml
name: Build

on: [push]

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
      
      - name: Install Doppler
        run: curl -Ls https://cli.doppler.com/install.sh | sh
      
      - name: Run Tests
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: doppler run -p panama-stopover-site -c prod -- pnpm build
```

### Para Docker

```dockerfile
FROM node:18-alpine

RUN curl -Ls https://cli.doppler.com/install.sh | sh

WORKDIR /app
COPY . .

RUN pnpm install

ENV DOPPLER_TOKEN=${DOPPLER_TOKEN}
ENV ENVIRONMENT=prod

RUN doppler run -- pnpm build

CMD ["doppler", "run", "--", "node", "build/index.js"]
```

## Comandos Útiles

```bash
# Autenticar con Doppler
doppler login

# Ver secrets en el entorno actual
doppler secrets get

# Ver secrets de un config específico
doppler secrets get --config staging

# Descargar secretos en un archivo .env
doppler secrets download --format env > .env.local

# Descargar secretos en JSON
doppler secrets download --format json > secrets.json

# Ejecutar un comando con secrets inyectados
doppler run -- pnpm dev

# Especificar config
DOPPLER_CONFIG=staging doppler run -- pnpm build

# Ver el status de Doppler
doppler status
```

## Notas Importantes

1. **Autenticación**: Asegúrate de ejecutar `doppler login` una vez
2. **Tokens**: Puedes usar `DOPPLER_TOKEN` en CI/CD en lugar de login
3. **Configs**: Asegúrate de que los configs (dev, staging, prod) existan en Doppler
4. **Seguridad**: Nunca commits el `.env` local; úsalo solo localmente
5. **CI/CD**: Usa `DOPPLER_TOKEN` como secret en tu plataforma (GitHub, GitLab, etc.)
