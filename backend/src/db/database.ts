import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { databasePath } from '../config/environment.js';

export type SqliteDatabase = Database.Database;

export function openDatabase(path = databasePath): SqliteDatabase {
  if (path === ':memory:') {
    const database = new Database(':memory:');
    database.pragma('foreign_keys = ON');
    database.pragma('journal_mode = WAL');
    return database;
  }
  const absolutePath = resolve(path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const database = new Database(absolutePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  return database;
}

export function migrateDatabase(database: SqliteDatabase): void {
  const migrationPath = resolve('db/migrations/001-initial.sql');
  database.exec(readFileSync(migrationPath, 'utf8'));
}

export function createDatabase(path = databasePath): SqliteDatabase {
  const database = openDatabase(path);
  migrateDatabase(database);
  return database;
}
