import { validateEnv } from './env.validation';

const validEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'watch_together',
  JWT_SECRET: 'a-secret',
};

describe('validateEnv', () => {
  it('returns the config when all required vars are present', () => {
    expect(validateEnv({ ...validEnv })).toEqual(validEnv);
  });

  it('accepts a missing DB_PORT (falls back to default downstream)', () => {
    const withoutPort: Record<string, unknown> = { ...validEnv };
    delete withoutPort.DB_PORT;
    expect(() => validateEnv(withoutPort)).not.toThrow();
  });

  it.each(['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'])(
    'throws when %s is missing',
    (key) => {
      const rest: Record<string, unknown> = { ...validEnv };
      delete rest[key];
      expect(() => validateEnv(rest)).toThrow(key);
    },
  );

  it('treats blank/whitespace values as missing', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: '   ' })).toThrow(
      'JWT_SECRET',
    );
  });

  it('lists every missing variable in a single error', () => {
    expect(() => validateEnv({ JWT_SECRET: 'x' })).toThrow(
      /DB_HOST.*DB_USERNAME.*DB_PASSWORD.*DB_NAME/,
    );
  });

  it('rejects a non-numeric DB_PORT', () => {
    expect(() => validateEnv({ ...validEnv, DB_PORT: 'abc' })).toThrow(
      'DB_PORT',
    );
  });

  it('rejects an out-of-range DB_PORT', () => {
    expect(() => validateEnv({ ...validEnv, DB_PORT: '70000' })).toThrow(
      'DB_PORT',
    );
  });
});
