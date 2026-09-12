import type { SqliteDatabase } from '../db/database.js';

export interface ActiveSlot {
  startHour: number;
}

export function findActiveSlots(database: SqliteDatabase, courtId: string, date: string): ActiveSlot[] {
  return database.prepare("SELECT start_hour as startHour FROM reservations WHERE court_id = ? AND date = ? AND status = 'active'").all(courtId, date) as ActiveSlot[];
}
