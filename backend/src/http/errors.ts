export type ErrorCode =
  | 'invalid_request'
  | 'invalid_email'
  | 'invalid_password'
  | 'invalid_date'
  | 'invalid_hour'
  | 'unauthenticated'
  | 'not_found'
  | 'email_taken'
  | 'invalid_credentials'
  | 'reservation_conflict'
  | 'active_reservation_limit'
  | 'reservation_not_cancellable';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const errorMessages: Record<ErrorCode, string> = {
  invalid_request: 'La solicitud no es válida.',
  invalid_email: 'Escribe un correo electrónico válido.',
  invalid_password: 'La contraseña debe tener entre 8 y 128 caracteres.',
  invalid_date: 'Selecciona una fecha válida.',
  invalid_hour: 'Selecciona un bloque horario válido.',
  unauthenticated: 'Inicia sesión para continuar.',
  not_found: 'No encontramos el recurso solicitado.',
  email_taken: 'Ya existe una cuenta con ese correo.',
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  reservation_conflict: 'La cancha ya fue reservada en este horario.',
  active_reservation_limit: 'Solo puedes tener una reserva activa a la vez.',
  reservation_not_cancellable: 'Esta reserva ya no se puede cancelar.',
};

export function appError(status: number, code: ErrorCode): AppError {
  return new AppError(status, code, errorMessages[code]);
}
