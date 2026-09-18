import { describe, expect, it } from 'vitest';
import { validateDate, validateStartHour } from '../../src/validation/input-validation.js';
import { isPastBlock } from '../../src/availability/availability-service.js';

describe('reservation validation', () => {
  it('accepts a valid ISO date and whole-hour slot', () => {
    expect(validateDate('2099-01-01')).toBe('2099-01-01');
    expect(validateStartHour(14)).toBe(14);
  });

  it('rejects malformed dates and non-integer hours', () => {
    expect(() => validateDate('2099-02-30')).toThrow('invalid_date');
    expect(() => validateStartHour(14.5)).toThrow('invalid_hour');
    expect(() => validateStartHour(24)).toThrow('invalid_hour');
  });

  it('treats a future block as reservable', () => {
    expect(isPastBlock('2099-01-01', 0)).toBe(false);
  });
});
