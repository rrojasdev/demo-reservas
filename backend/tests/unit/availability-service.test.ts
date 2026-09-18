import { afterEach, describe, expect, it } from 'vitest';
import { getAvailability } from '../../src/availability/availability-service.js';
import { createTestDatabase, closeTestDatabase } from '../test-database.js';
import type { SqliteDatabase } from '../../src/db/database.js';

let database: SqliteDatabase | undefined;
afterEach(() => closeTestDatabase(database));

describe('availability service', () => {
  it('returns hourly blocks with available status for a future date', () => {
    database = createTestDatabase();
    const result = getAvailability(database, 'laureles', '2099-01-01');

    expect(result).toHaveLength(24);
    expect(result[14]).toMatchObject({ startHour: 14, endHour: 15, status: 'available' });
  });

  it('marks an active reservation as reserved', () => {
    database = createTestDatabase();
    database.prepare(`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (?, ?, ?)
    `).run('user@example.com', 'test-hash', new Date().toISOString());
    database.prepare(`
      INSERT INTO reservations (user_id, court_id, date, start_hour, end_hour, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?)
    `).run(1, 'laureles', '2099-01-01', 14, 15, new Date().toISOString());

    const result = getAvailability(database, 'laureles', '2099-01-01');
    expect(result[14].status).toBe('reserved');
  });
});
