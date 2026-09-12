import type { SqliteDatabase } from '../db/database.js';
import { timeZone } from '../config/environment.js';
import { findCourt } from '../courts/court-catalog.js';
import { appError } from '../http/errors.js';
import { validateDate } from '../validation/input-validation.js';
import { findActiveSlots } from './availability-repository.js';

function currentLocalParts(): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${value.year}-${value.month}-${value.day}`, hour: Number(value.hour) };
}

export function isPastBlock(date: string, startHour: number): boolean {
  const current = currentLocalParts();
  return date < current.date || (date === current.date && startHour <= current.hour);
}

export function getAvailability(database: SqliteDatabase, courtId: string, dateInput: unknown) {
  if (!findCourt(courtId)) throw appError(404, 'not_found');
  const date = validateDate(dateInput);
  const reserved = new Set(findActiveSlots(database, courtId, date).map((slot) => slot.startHour));
  return Array.from({ length: 24 }, (_, startHour) => ({
    startHour,
    endHour: startHour + 1,
    status: reserved.has(startHour) ? 'reserved' : isPastBlock(date, startHour) ? 'past' : 'available',
  }));
}
