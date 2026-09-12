import type { NextFunction, Request, Response } from 'express';
import type { SqliteDatabase } from '../db/database.js';
import type { User } from '../types/domain.js';
import { appError } from './errors.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

export function createAuthMiddleware(database: SqliteDatabase) {
  return function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
    const cookieHeader = request.header('cookie') ?? '';
    const sessionCookie = cookieHeader.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith('padel_session='));
    const sessionId = sessionCookie?.slice('padel_session='.length) ?? request.header('x-session-id');
    if (!sessionId) {
      response.status(401).json({ error: { code: 'unauthenticated', message: 'Inicia sesión para continuar.' } });
      return;
    }
    const row = database.prepare(`
      SELECT s.id as sessionId, s.expires_at as expiresAt,
             u.id, u.email, u.password_hash as passwordHash, u.created_at as createdAt
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > ?
    `).get(sessionId, new Date().toISOString()) as (User & { sessionId: string; expiresAt: string }) | undefined;
    if (!row) {
      response.status(401).json({ error: { code: 'unauthenticated', message: 'Inicia sesión para continuar.' } });
      return;
    }
    request.user = {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    };
    request.sessionId = row.sessionId;
    next();
  };
}
