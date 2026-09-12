export function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new Error('invalid_email');
  }
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('invalid_email');
  }
  return normalized;
}

export function validatePassword(password: unknown): string {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new Error('invalid_password');
  }
  return password;
}

export function validateDate(date: unknown): string {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('invalid_date');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('invalid_date');
  }
  return date;
}

export function validateStartHour(startHour: unknown): number {
  if (typeof startHour !== 'number' || !Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
    throw new Error('invalid_hour');
  }
  return startHour;
}
