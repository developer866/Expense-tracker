import { AppError } from '../lib/errors.js';

export function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error leaves the API in the same shape:
// { "error": { "code": "VALIDATION", "message": "...", "fields": { ... } } }
export function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'SERVER_ERROR';
  let message = 'Something went wrong';
  let fields;

  if (err instanceof AppError) {
    ({ status, code, message, fields } = err);
  } else if (err?.type === 'entity.parse.failed') {
    status = 400; code = 'VALIDATION'; message = 'Request body is not valid JSON';
  } else if (err?.type === 'entity.too.large') {
    status = 413; code = 'VALIDATION'; message = 'Request body is too large';
  } else if (err?.name === 'ValidationError' && err.errors) {
    status = 400; code = 'VALIDATION'; message = 'Invalid data';
    fields = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err?.name === 'CastError') {
    status = 400; code = 'VALIDATION'; message = 'Invalid id';
  } else {
    console.error(err); // real details go to the server log, never to the client
  }

  res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}
