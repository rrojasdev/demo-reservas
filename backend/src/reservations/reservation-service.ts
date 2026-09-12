import type { SqliteDatabase } from '../db/database.js';
import { findCourt } from '../courts/court-catalog.js';
import { appError } from '../http/errors.js';
import { validateDate, validateStartHour } from '../validation/input-validation.js';
import { isPastBlock } from '../availability/availability-service.js';
import type { ReservationView } from '../types/domain.js';
import { cancelReservation, findActiveByUser, findByUser, insertReservation } from './reservation-repository.js';

export function createReservation(database: SqliteDatabase, userId: number, courtIdInput: unknown, dateInput: unknown, startHourInput: unknown) {
  if (typeof courtIdInput !== 'string' || !findCourt(courtIdInput)) throw appError(400, 'invalid_request');
  const date = validateDate(dateInput);
  const startHour = validateStartHour(startHourInput);
  if (isPastBlock(date, startHour)) throw appError(400, 'invalid_request');
  const transaction = database.transaction(() => {
    if (findActiveByUser(database, userId)) throw appError(409, 'active_reservation_limit');
    try {
      return insertReservation(database, userId, courtIdInput, date, startHour);
    } catch (error) {
      if (error instanceof Error && 'code' in error && String(error.code).startsWith('SQLITE_CONSTRAINT')) {
        throw appError(409, 'reservation_conflict');
      }
      throw error;
    }
  });
  return transaction();
}

function withCurrentStatus(reservation: ReservationView): ReservationView {
  if (reservation.status === 'active' && isPastBlock(reservation.date, reservation.startHour)) {
    return { ...reservation, status: 'past' };
  }
  return reservation;
}

export function listReservations(database: SqliteDatabase, userId: number) {
  const reservations = findByUser(database, userId).map(withCurrentStatus);
  return {
    future: reservations.filter((reservation) => reservation.status === 'active'),
    history: reservations.filter((reservation) => reservation.status === 'past'),
    cancelled: reservations.filter((reservation) => reservation.status === 'cancelled'),
  };
}

export function cancelUserReservation(database: SqliteDatabase, userId: number, reservationIdInput: unknown): void {
  const reservationId = Number(reservationIdInput);
  if (!Number.isInteger(reservationId)) throw appError(400, 'invalid_request');
  const reservation = findByUser(database, userId).find((item) => item.id === reservationId);
  if (!reservation || reservation.status !== 'active' || isPastBlock(reservation.date, reservation.startHour)) {
    throw appError(409, 'reservation_not_cancellable');
  }
  if (!cancelReservation(database, reservationId, userId)) throw appError(409, 'reservation_not_cancellable');
}
