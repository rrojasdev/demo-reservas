import { Router } from 'express';
import type { SqliteDatabase } from '../db/database.js';
import { courts, findCourt } from '../courts/court-catalog.js';
import { getAvailability } from './availability-service.js';

export function createAvailabilityRoutes(database: SqliteDatabase) {
  const router = Router();
  router.get('/courts', (_request, response) => response.json({ courts }));
  router.get('/courts/:courtId/availability', (request, response, next) => {
    try {
      if (!findCourt(request.params.courtId)) {
        response.status(404).json({ error: { code: 'not_found', message: 'No encontramos la cancha solicitada.' } });
        return;
      }
      response.json({ court: findCourt(request.params.courtId), date: request.query.date, blocks: getAvailability(database, request.params.courtId, request.query.date) });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
