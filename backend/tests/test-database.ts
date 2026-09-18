import { createDatabase, type SqliteDatabase } from '../src/db/database.js';

export function createTestDatabase(): SqliteDatabase {
  return createDatabase(':memory:');
}

export function closeTestDatabase(database: SqliteDatabase | undefined): void {
  if (database && database.open) database.close();
}
