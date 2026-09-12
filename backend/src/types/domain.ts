export type ReservationStatus = 'active' | 'cancelled' | 'past';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: number;
  expiresAt: string;
  createdAt: string;
}

export interface Reservation {
  id: number;
  userId: number;
  courtId: string;
  date: string;
  startHour: number;
  endHour: number;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt: string | null;
}

export interface ReservationView extends Reservation {
  courtName: string;
}
