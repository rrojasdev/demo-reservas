import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { SqliteDatabase } from '../../src/db/database.js';
import { closeTestDatabase } from '../test-database.js';
import { createTestServer } from '../test-server.js';

let database: SqliteDatabase | undefined;
afterEach(() => closeTestDatabase(database));

describe('availability contracts', () => {
  it('returns the fixed court catalog and hourly availability', async () => {
    const testServer = createTestServer();
    database = testServer.database;
    const registered = await request(testServer.app)
      .post('/api/auth/register')
      .send({ email: 'availability@example.com', password: 'password123' });
    const cookie = registered.headers['set-cookie'][0].split(';')[0];

    const courts = await request(testServer.app).get('/api/courts').set('Cookie', cookie);
    expect(courts.status).toBe(200);
    expect(courts.body.courts.map((court: { name: string }) => court.name)).toEqual([
      'Cancha Laureles',
      'Cancha El Poblado',
      'Cancha Belen',
      'Cancha Robledo',
      'Cancha Envigado',
    ]);

    const availability = await request(testServer.app)
      .get('/api/courts/laureles/availability?date=2099-01-01')
      .set('Cookie', cookie);
    expect(availability.status).toBe(200);
    expect(availability.body.blocks).toHaveLength(24);
    expect(availability.body.blocks[14]).toMatchObject({ startHour: 14, endHour: 15, status: 'available' });
  });

  it('rejects invalid dates and unknown courts', async () => {
    const testServer = createTestServer();
    database = testServer.database;
    const registered = await request(testServer.app)
      .post('/api/auth/register')
      .send({ email: 'invalid@example.com', password: 'password123' });
    const cookie = registered.headers['set-cookie'][0].split(';')[0];

    const invalidDate = await request(testServer.app)
      .get('/api/courts/laureles/availability?date=not-a-date')
      .set('Cookie', cookie);
    expect(invalidDate.status).toBe(400);

    const unknownCourt = await request(testServer.app)
      .get('/api/courts/unknown/availability?date=2099-01-01')
      .set('Cookie', cookie);
    expect(unknownCourt.status).toBe(404);
  });
});
