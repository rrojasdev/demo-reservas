import { Router } from 'express';
import type { SqliteDatabase } from '../db/database.js';
import type { AuthenticatedRequest } from '../http/auth-middleware.js';
import { appError } from '../http/errors.js';
import { cancelUserReservation, createReservation, listReservations } from './reservation-service.js';

export function createReservationRoutes(database: SqliteDatabase) {
  const router = Router();
  router.post('/reservations', (request: AuthenticatedRequest, response, next) => {
    try {
      if (!request.user) throw appError(401, 'unauthenticated');
      const reservation = createReservation(database, request.user.id, request.body?.courtId, request.body?.date, request.body?.startHour);
      response.status(201).json({ reservation });
    } catch (error) {
      next(error);
    }
  });
  router.get('/reservations/me', (request: AuthenticatedRequest, response, next) => {
    try {
      if (!request.user) throw appError(401, 'unauthenticated');
      response.json(listReservations(database, request.user.id));
    } catch (error) {
      next(error);
    }
  });
  router.post('/reservations/:reservationId/cancel', (request: AuthenticatedRequest, response, next) => {
    try {
      if (!request.user) throw appError(401, 'unauthenticated');
      cancelUserReservation(database, request.user.id, request.params.reservationId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  return router;
}
