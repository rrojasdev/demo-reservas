import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { SqliteDatabase } from '../../src/db/database.js';
import { closeTestDatabase } from '../test-database.js';
import { createTestServer } from '../test-server.js';

let database: SqliteDatabase;
afterEach(() => closeTestDatabase(database));

function createTestApp() {
  const testServer = createTestServer();
  database = testServer.database;
  return testServer.app;
}

describe('authentication and reservation contracts', () => {
  it('protects courts and creates one reservation per user', async () => {
    const app = createTestApp();
    const unauthenticated = await request(app).get('/api/courts');
    expect(unauthenticated.status).toBe(401);

    const registered = await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: 'password123' });
    expect(registered.status).toBe(201);
    const cookie = registered.headers['set-cookie'][0].split(';')[0];

    const courts = await request(app).get('/api/courts').set('Cookie', cookie);
    expect(courts.body.courts).toHaveLength(5);

    const reservation = await request(app).post('/api/reservations').set('Cookie', cookie).send({ courtId: 'laureles', date: '2099-01-01', startHour: 14 });
    expect(reservation.status).toBe(201);

    const limit = await request(app).post('/api/reservations').set('Cookie', cookie).send({ courtId: 'belen', date: '2099-01-01', startHour: 15 });
    expect(limit.status).toBe(409);
    expect(limit.body.error.code).toBe('active_reservation_limit');
  });
});
