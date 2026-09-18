import { createApp } from '../src/http/app.js';
import { createTestDatabase } from './test-database.js';

export function createTestServer() {
  const database = createTestDatabase();
  return {
    app: createApp(database),
    database,
  };
}
