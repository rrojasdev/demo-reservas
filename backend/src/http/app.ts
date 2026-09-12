import express from 'express';
import type { SqliteDatabase } from '../db/database.js';
import { createAuthMiddleware } from './auth-middleware.js';
import { errorHandler } from './error-handler.js';
import { createAuthRoutes } from '../auth/auth-routes.js';
import { createAvailabilityRoutes } from '../availability/availability-routes.js';
import { createReservationRoutes } from '../reservations/reservation-routes.js';

export function createApp(database: SqliteDatabase) {
  const app = express();
  app.use(express.json());
  const requireAuth = createAuthMiddleware(database);
  app.use('/api/auth', createAuthRoutes(database));
  app.use('/api', requireAuth, createAvailabilityRoutes(database));
  app.use('/api', requireAuth, createReservationRoutes(database));
  app.use(errorHandler);
  return app;
}
