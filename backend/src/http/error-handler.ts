import type { ErrorRequestHandler } from 'express';
import { AppError, appError } from './errors.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (error instanceof Error && ['invalid_email', 'invalid_password', 'invalid_date', 'invalid_hour'].includes(error.message)) {
    const validationError = appError(400, error.message as 'invalid_email' | 'invalid_password' | 'invalid_date' | 'invalid_hour');
    response.status(validationError.status).json({ error: { code: validationError.code, message: validationError.message } });
    return;
  }
  console.error(error);
  response.status(500).json({
    error: { code: 'internal_error', message: 'Ocurrió un error. Intenta nuevamente.' },
  });
};
