import type { SqliteDatabase } from '../db/database.js';
import type { Reservation, ReservationView } from '../types/domain.js';

const reservationSelect = `
  SELECT id, user_id as userId, court_id as courtId, date, start_hour as startHour,
         end_hour as endHour, status, created_at as createdAt, cancelled_at as cancelledAt
  FROM reservations
`;

export function findActiveByUser(database: SqliteDatabase, userId: number): Reservation | undefined {
  return database.prepare(`${reservationSelect} WHERE user_id = ? AND status = 'active' LIMIT 1`).get(userId) as Reservation | undefined;
}

export function findByUser(database: SqliteDatabase, userId: number): ReservationView[] {
  return database.prepare(`
    SELECT r.id, r.user_id as userId, r.court_id as courtId, r.date,
           r.start_hour as startHour, r.end_hour as endHour, r.status,
           r.created_at as createdAt, r.cancelled_at as cancelledAt,
           CASE r.court_id
             WHEN 'laureles' THEN 'Cancha Laureles'
             WHEN 'el-poblado' THEN 'Cancha El Poblado'
             WHEN 'belen' THEN 'Cancha Belen'
             WHEN 'robledo' THEN 'Cancha Robledo'
             WHEN 'envigado' THEN 'Cancha Envigado'
           END as courtName
    FROM reservations r WHERE r.user_id = ? ORDER BY r.date, r.start_hour
  `).all(userId) as ReservationView[];
}

export function insertReservation(database: SqliteDatabase, userId: number, courtId: string, date: string, startHour: number): Reservation {
  const createdAt = new Date().toISOString();
  const result = database.prepare(`
    INSERT INTO reservations (user_id, court_id, date, start_hour, end_hour, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
  `).run(userId, courtId, date, startHour, startHour + 1, createdAt);
  return {
    id: Number(result.lastInsertRowid), userId, courtId, date, startHour,
    endHour: startHour + 1, status: 'active', createdAt, cancelledAt: null,
  };
}

export function cancelReservation(database: SqliteDatabase, reservationId: number, userId: number): boolean {
  const result = database.prepare(`
    UPDATE reservations SET status = 'cancelled', cancelled_at = ?
    WHERE id = ? AND user_id = ? AND status = 'active'
  `).run(new Date().toISOString(), reservationId, userId);
  return result.changes === 1;
}
