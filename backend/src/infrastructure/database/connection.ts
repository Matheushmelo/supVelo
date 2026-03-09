import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

export function createDatabase(dbPath: string): Database.Database {
  // Garantir que o diretório existe
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Wal mode: permite leituras e escritas simultâneas
  db.pragma('journal_mode = WAL');

  // Ativando as Foreign Keys
  db.pragma('foreign_keys = ON');

  // Rodas migrations
  const migrationsPath = join(__dirname, 'migrations', '001-initial.sql');
  const migration = readFileSync(migrationsPath, 'utf8');
  db.exec(migration);

  return db;
}