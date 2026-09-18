import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { SqliteDatabase } from '../../src/db/database.js';
import { closeTestDatabase } from '../test-database.js';
import { createTestServer } from '../test-server.js';

let database: SqliteDatabase | undefined;
afterEach(() => closeTestDatabase(database));

describe('reservation concurrency', () => {
  it('allows at most one active reservation for the same court and slot', async () => {
    const testServer = createTestServer();
    database = testServer.database;
    const first = await request(testServer.app)
      .post('/api/auth/register')
      .send({ email: 'first@example.com', password: 'password123' });
    const second = await request(testServer.app)
      .post('/api/auth/register')
      .send({ email: 'second@example.com', password: 'password123' });
    const firstCookie = first.headers['set-cookie'][0].split(';')[0];
    const secondCookie = second.headers['set-cookie'][0].split(';')[0];
    const payload = { courtId: 'laureles', date: '2099-01-02', startHour: 14 };

    const results = await Promise.all([
      request(testServer.app).post('/api/reservations').set('Cookie', firstCookie).send(payload),
      request(testServer.app).post('/api/reservations').set('Cookie', secondCookie).send(payload),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    const activeCount = database.prepare("SELECT COUNT(*) as count FROM reservations WHERE court_id = ? AND date = ? AND start_hour = ? AND status = 'active'").get(payload.courtId, payload.date, payload.startHour) as { count: number };
    expect(activeCount.count).toBe(1);
  });
});
