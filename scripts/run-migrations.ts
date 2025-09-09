import { sequelize } from '../src/db/sequelize.js';
import fs from 'node:fs/promises';
import path from 'node:path';

async function ensureMigrationsTable() {
  await sequelize.query(`CREATE TABLE IF NOT EXISTS migrations (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(200) NOT NULL UNIQUE, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
}

async function appliedMigrations(): Promise<Set<string>> {
  const [rows] = await sequelize.query(`SELECT name FROM migrations`);
  const set = new Set<string>();
  for (const r of rows as any[]) set.add(r.name);
  return set;
}

async function run() {
  await ensureMigrationsTable();
  const applied = await appliedMigrations();
  const dir = path.join(process.cwd(), 'sql');
  const files = (await fs.readdir(dir)).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(path.join(dir, file), 'utf8');
    await sequelize.query(sql);
    await sequelize.query(`INSERT INTO migrations (name) VALUES (?)`, { replacements: [file] });
    console.log('Applied migration', file);
  }
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1);});

