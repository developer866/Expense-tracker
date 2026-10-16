import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateMeSchema } from '../validators/auth.js';
import { User } from '../models/index.js';
import { toPublicUser } from '../services/authService.js';

const router = Router();
router.use(requireAuth);

async function currentUser(req) {
  const user = await User.findOne({ _id: req.userId, deletedAt: null });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Account not found');
  return user;
}

router.get('/', asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(await currentUser(req)) });
}));

// Settings screen: name, theme, timezone, currency, monthStartDay
router.patch('/', validate(updateMeSchema), asyncHandler(async (req, res) => {
  const user = await currentUser(req);
  user.set(req.body);
  await user.save();
  res.json({ user: toPublicUser(user) });
}));

export default router;
