import { randomBytes } from 'node:crypto';
import type { SqliteDatabase } from '../db/database.js';
import type { Session, User } from '../types/domain.js';

export function findUserByEmail(database: SqliteDatabase, email: string): User | undefined {
  return database.prepare('SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?').get(email) as User | undefined;
}

export function findUserById(database: SqliteDatabase, id: number): User | undefined {
  return database.prepare('SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(database: SqliteDatabase, email: string, passwordHash: string): User {
  const createdAt = new Date().toISOString();
  const result = database.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)').run(email, passwordHash, createdAt);
  return { id: Number(result.lastInsertRowid), email, passwordHash, createdAt };
}

export function createSession(database: SqliteDatabase, userId: number, expiresAt: string): Session {
  const session: Session = {
    id: randomBytes(32).toString('hex'),
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  database.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(session.id, session.userId, session.expiresAt, session.createdAt);
  return session;
}

export function deleteSession(database: SqliteDatabase, sessionId: string): void {
  database.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}
