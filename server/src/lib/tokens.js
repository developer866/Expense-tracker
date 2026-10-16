import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error('JWT_ACCESS_SECRET is not set');
  return s;
}

export const signAccessToken = (userId) =>
  jwt.sign({}, secret(), {
    subject: String(userId),
    expiresIn: ACCESS_TTL_SECONDS,
    algorithm: 'HS256',
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, secret(), { algorithms: ['HS256'] });

// Refresh tokens are random strings. Only their hash is stored in the database.
export const newRefreshToken = () => crypto.randomBytes(48).toString('base64url');
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
