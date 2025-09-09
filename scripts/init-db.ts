import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'denuncias_app';

async function ensureDatabase() {
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, multipleStatements: true });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

async function runInitialSchema() {
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, multipleStatements: true });
  const sqlPath = path.join(process.cwd(), 'sql', '001_schema.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await conn.query(sql);
  await conn.end();
}

ensureDatabase()
  .then(runInitialSchema)
  .then(() => console.log('Database ensured and initial schema applied'))
  .catch((err) => {
    console.error('DB init error', err);
    process.exit(1);
  });

