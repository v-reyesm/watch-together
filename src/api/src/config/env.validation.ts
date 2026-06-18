/**
 * Fail-fast validation of required environment variables.
 *
 * Wired into `ConfigModule.forRoot({ validate })` so the API refuses to boot
 * with a clear, aggregated error when configuration is missing, instead of
 * letting a misconfigured deploy surface later as an opaque
 * "Error interno del servidor" (e.g. during user registration).
 */

/** Variables the API cannot function without. */
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'TMDB_API_KEY',
  'TMDB_BASE_URL',
] as const;

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  return false;
}

function display(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing = REQUIRED_ENV_VARS.filter((key) => isBlank(config[key]));

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
        'Revisa tu archivo .env (ver src/api/.env.example).',
    );
  }

  if (!isBlank(config.DB_PORT)) {
    const port = Number(config.DB_PORT);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(
        `DB_PORT debe ser un puerto válido (1-65535), recibido: "${display(
          config.DB_PORT,
        )}".`,
      );
    }
  }

  return config;
}
