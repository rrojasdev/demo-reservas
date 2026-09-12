import { Router, type Response } from 'express';
import type { SqliteDatabase } from '../db/database.js';
import { appError } from '../http/errors.js';
import { type AuthenticatedRequest, createAuthMiddleware } from '../http/auth-middleware.js';
import { login, logout, register } from './auth-service.js';
import { isProduction } from '../config/environment.js';

function setSessionCookie(response: Response, sessionId: string): void {
  response.setHeader('Set-Cookie', `padel_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/${isProduction ? '; Secure' : ''}`);
}

export function createAuthRoutes(database: SqliteDatabase) {
  const router = Router();
  router.post('/register', (request, response, next) => {
    try {
      const result = register(database, request.body?.email, request.body?.password);
      setSessionCookie(response, result.session.id);
      response.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  });
  router.post('/login', (request, response, next) => {
    try {
      const result = login(database, request.body?.email, request.body?.password);
      setSessionCookie(response, result.session.id);
      response.json({ user: result.user });
    } catch (error) {
      next(error);
    }
  });
  router.post('/logout', createAuthMiddleware(database), (request: AuthenticatedRequest, response, next) => {
    try {
      if (!request.sessionId) throw appError(401, 'unauthenticated');
      logout(database, request.sessionId);
      response.setHeader('Set-Cookie', `padel_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${isProduction ? '; Secure' : ''}`);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  router.get('/me', createAuthMiddleware(database), (request: AuthenticatedRequest, response, next) => {
    try {
      if (!request.user) throw appError(401, 'unauthenticated');
      response.json({ user: { id: request.user.id, email: request.user.email, createdAt: request.user.createdAt } });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
