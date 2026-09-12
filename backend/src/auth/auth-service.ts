import type { SqliteDatabase } from '../db/database.js';
import { appError } from '../http/errors.js';
import { normalizeEmail, validatePassword } from '../validation/input-validation.js';
import { hashPassword, verifyPassword } from './password-hasher.js';
import { createSession, createUser, deleteSession, findUserByEmail } from './auth-repository.js';
import { sessionDurationMs } from '../config/environment.js';

export function publicUser(user: { id: number; email: string; createdAt: string }) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

function newSession(database: SqliteDatabase, userId: number) {
  return createSession(database, userId, new Date(Date.now() + sessionDurationMs).toISOString());
}

export function register(database: SqliteDatabase, emailInput: unknown, passwordInput: unknown) {
  const email = normalizeEmail(emailInput);
  const password = validatePassword(passwordInput);
  if (findUserByEmail(database, email)) throw appError(409, 'email_taken');
  const user = createUser(database, email, hashPassword(password));
  return { user: publicUser(user), session: newSession(database, user.id) };
}

export function login(database: SqliteDatabase, emailInput: unknown, passwordInput: unknown) {
  const email = normalizeEmail(emailInput);
  const password = validatePassword(passwordInput);
  const user = findUserByEmail(database, email);
  if (!user || !verifyPassword(password, user.passwordHash)) throw appError(401, 'invalid_credentials');
  return { user: publicUser(user), session: newSession(database, user.id) };
}

export function logout(database: SqliteDatabase, sessionId: string): void {
  deleteSession(database, sessionId);
}
