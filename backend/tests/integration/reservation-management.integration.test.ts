import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { SqliteDatabase } from '../../src/db/database.js';
import { closeTestDatabase } from '../test-database.js';
import { createTestServer } from '../test-server.js';

let database: SqliteDatabase | undefined;
afterEach(() => closeTestDatabase(database));

async function register(app: Parameters<typeof request>[0], email: string) {
  const response = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  return response.headers['set-cookie'][0].split(';')[0];
}

describe('reservation management', () => {
  it('isolates reservations and releases a cancelled slot', async () => {
    const testServer = createTestServer();
    database = testServer.database;
    const ownerCookie = await register(testServer.app, 'owner@example.com');
    const otherCookie = await register(testServer.app, 'other@example.com');

    const created = await request(testServer.app)
      .post('/api/reservations')
      .set('Cookie', ownerCookie)
      .send({ courtId: 'laureles', date: '2099-01-01', startHour: 14 });
    expect(created.status).toBe(201);

    const otherReservations = await request(testServer.app).get('/api/reservations/me').set('Cookie', otherCookie);
    expect(otherReservations.status).toBe(200);
    expect(otherReservations.body.future).toHaveLength(0);

    const ownerReservations = await request(testServer.app).get('/api/reservations/me').set('Cookie', ownerCookie);
    expect(ownerReservations.body.future).toHaveLength(1);
    const reservationId = ownerReservations.body.future[0].id;

    const cancelled = await request(testServer.app)
      .post(`/api/reservations/${reservationId}/cancel`)
      .set('Cookie', ownerCookie);
    expect(cancelled.status).toBe(204);

    const availability = await request(testServer.app)
      .get('/api/courts/laureles/availability?date=2099-01-01')
      .set('Cookie', otherCookie);
    expect(availability.body.blocks[14].status).toBe('available');
  });
});
