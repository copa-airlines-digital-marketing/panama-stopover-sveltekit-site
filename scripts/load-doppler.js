#!/usr/bin/env node

/**
 * Script para cargar secrets de Doppler en Node.js
 * Útil para CI/CD y scripts que necesitan env vars inyectadas
 * 
 * Uso: node scripts/load-doppler.js -- vite build
 * Env: DOPPLER_CONFIG=staging node scripts/load-doppler.js -- pnpm test
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Configuración
const environment = process.env.DOPPLER_CONFIG || process.env.ENVIRONMENT || 'dev';
const dopplerConfigMap = {
  dev: 'dev',
  development: 'dev',
  staging: 'staging',
  prod: 'prod',
  production: 'prod'
};

const dopplerConfig = dopplerConfigMap[environment] || environment;

// Colores para output
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

async function loadDopplerSecrets() {
  try {
    log(colors.blue, '🔐 Loading Doppler secrets...');
    log(colors.blue, `   Environment: ${colors.green}${environment}${colors.blue} (config: ${colors.green}${dopplerConfig}${colors.blue})`);

    // Verificar que doppler esté instalado
    try {
      execSync('which doppler', { stdio: 'ignore' });
    } catch {
      log(colors.red, '❌ Error: doppler no está instalado');
      log(colors.yellow, '   Instálalo desde: https://docs.doppler.com/docs/cli');
      process.exit(1);
    }

    // Verificar autenticación
    try {
      execSync('doppler status', { stdio: 'ignore' });
    } catch {
      log(colors.red, '❌ Error: No estás autenticado en Doppler');
      log(colors.yellow, '   Ejecuta: doppler login');
      process.exit(1);
    }

    // Obtener secrets desde Doppler
    let secrets = {};
    try {
      const output = execSync(
        `doppler secrets download --config ${dopplerConfig} --format json`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      secrets = JSON.parse(output);
      log(colors.green, `✅ Loaded ${Object.keys(secrets).length} secrets`);
    } catch (error) {
      log(colors.red, '❌ Error loading secrets from Doppler');
      log(colors.yellow, `   Error: ${error.message}`);
      process.exit(1);
    }

    return secrets;
  } catch (error) {
    log(colors.red, '❌ Error initializing Doppler');
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  const [, , , ...commandArgs] = process.argv;

  if (commandArgs.length === 0) {
    log(colors.yellow, 'Usage: node scripts/load-doppler.js -- <command> [args...]');
    log(colors.yellow, 'Example: node scripts/load-doppler.js -- vite build');
    process.exit(1);
  }

  const secrets = await loadDopplerSecrets();

  // Merge secrets con env vars existentes
  const envVars = { ...process.env, ...secrets };

  log(colors.blue, `▶️  Running: ${colors.green}${commandArgs.join(' ')}`);
  log(colors.blue, '');

  // Ejecutar comando con env vars inyectadas
  const [command, ...args] = commandArgs;

  const proc = spawn(command, args, {
    env: envVars,
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', (code) => {
    if (code === 0) {
      log(colors.green, '✅ Command executed successfully');
    } else {
      log(colors.red, `❌ Command failed with code: ${code}`);
    }
    process.exit(code || 0);
  });

  proc.on('error', (error) => {
    log(colors.red, `❌ Error: ${error.message}`);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
