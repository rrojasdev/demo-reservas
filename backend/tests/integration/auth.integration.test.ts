import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { SqliteDatabase } from '../../src/db/database.js';
import { closeTestDatabase } from '../test-database.js';
import { createTestServer } from '../test-server.js';

let database: SqliteDatabase | undefined;
afterEach(() => closeTestDatabase(database));

describe('authentication integration', () => {
  it('rejects invalid credentials and duplicate email without exposing internals', async () => {
    const testServer = createTestServer();
    database = testServer.database;
    const payload = { email: 'person@example.com', password: 'password123' };

    const registered = await request(testServer.app).post('/api/auth/register').send(payload);
    expect(registered.status).toBe(201);

    const duplicate = await request(testServer.app).post('/api/auth/register').send(payload);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toEqual({ code: 'email_taken', message: 'Ya existe una cuenta con ese correo.' });
    expect(JSON.stringify(duplicate.body)).not.toMatch(/stack|sqlite|password/i);

    const invalidLogin = await request(testServer.app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'wrong-password' });
    expect(invalidLogin.status).toBe(401);
    expect(JSON.stringify(invalidLogin.body)).not.toMatch(/stack|sqlite/i);
  });

  it('protects reservation management endpoints without a session', async () => {
    const testServer = createTestServer();
    database = testServer.database;

    for (const path of ['/api/courts', '/api/reservations/me']) {
      const response = await request(testServer.app).get(path);
      expect(response.status).toBe(401);
    }
  });
});
