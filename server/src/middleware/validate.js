import { AppError } from '../lib/errors.js';

// validate(schema) checks req.body and replaces it with the cleaned data (trimmed, lowercased...)
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!fields[key]) fields[key] = issue.message;
    }
    const first = result.error.issues[0]?.message || 'Invalid input';
    return next(new AppError(400, 'VALIDATION', first, fields));
  }
  req.body = result.data;
  next();
};
