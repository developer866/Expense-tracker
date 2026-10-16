import bcrypt from 'bcrypt';
import { User, RefreshToken } from '../models/index.js';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories.js';
import { AppError } from '../lib/errors.js';
import {
  signAccessToken, newRefreshToken, hashToken, REFRESH_TTL_MS, ACCESS_TTL_SECONDS,
} from '../lib/tokens.js';

const BCRYPT_COST = 12;
// Used when the email doesn't exist, so a wrong email takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync('timing-protection-dummy', BCRYPT_COST);
// If a used refresh token comes back within this window, treat it as a double request, not theft
const REUSE_GRACE_MS = 10_000;

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    currency: user.currency,
    timezone: user.timezone,
    theme: user.theme,
    monthStartDay: user.monthStartDay,
    createdAt: user.createdAt,
    categories: user.categories.map((c) => ({
      id: String(c._id), name: c.name, kind: c.kind, icon: c.icon, color: c.color, sortOrder: c.sortOrder,
    })),
    reminders: user.reminders.map((r) => ({
      id: String(r._id), hour: r.hour, minute: r.minute, enabled: r.enabled,
    })),
  };
}

async function issueTokens(user, userAgent) {
  const refreshToken = newRefreshToken();
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: userAgent?.slice(0, 200),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return {
    accessToken: signAccessToken(user._id),
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

const emailTaken = () => new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');

export async function register(input, userAgent) {
  if (await User.exists({ email: input.email })) throw emailTaken();

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  let user;
  try {
    user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      timezone: input.timezone,
      currency: input.currency,
      categories: DEFAULT_CATEGORIES, // one write, so no multi-document transaction needed
    });
  } catch (e) {
    if (e.code === 11000) throw emailTaken(); // two signups at the same moment
    throw e;
  }
  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function login({ email, password }, userAgent) {
  const user = await User.findOne({ email, deletedAt: null });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function refresh(refreshToken, userAgent) {
  const tokenHash = hashToken(refreshToken);
  const now = new Date();

  // Atomic: only one request can use a given refresh token
  const used = await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now } }
  );

  if (!used) {
    const known = await RefreshToken.findOne({ tokenHash }).select('userId revokedAt');
    if (known?.revokedAt && now - known.revokedAt > REUSE_GRACE_MS) {
      // An old token was replayed: end every session for that user
      await RefreshToken.updateMany({ userId: known.userId, revokedAt: null }, { $set: { revokedAt: now } });
    }
    throw new AppError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.');
  }

  const user = await User.findOne({ _id: used.userId, deletedAt: null });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.');
  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function logout(refreshToken) {
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
