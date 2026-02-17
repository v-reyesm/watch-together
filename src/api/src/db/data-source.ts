import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Debug: print database environment variables (mask password)
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
const maskedPassword = DB_PASSWORD ? DB_PASSWORD.replace(/.(?=.{2})/g, '*') : undefined;
console.log('[DEBUG] DB envs:', {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_NAME,
  DB_PASSWORD: maskedPassword,
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Include both compiled JS (for production) and TS (for CLI during development)
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: true,
});
