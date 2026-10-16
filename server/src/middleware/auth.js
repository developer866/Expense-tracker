import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';

// Reads "Authorization: Bearer <accessToken>" and sets req.userId
export function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing access token'));
  }
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      // The app should call /auth/refresh, then retry the request
      return next(new AppError(401, 'TOKEN_EXPIRED', 'Access token expired'));
    }
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid access token'));
  }
}
