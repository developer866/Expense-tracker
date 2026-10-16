import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema, forgotSchema } from '../validators/auth.js';
import * as auth from '../services/authService.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await auth.register(req.body, req.get('user-agent')));
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  res.json(await auth.login(req.body, req.get('user-agent')));
}));

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
  res.json(await auth.refresh(req.body.refreshToken, req.get('user-agent')));
}));

router.post('/logout', validate(refreshSchema), asyncHandler(async (req, res) => {
  await auth.logout(req.body.refreshToken);
  res.status(204).end();
}));

// Placeholder: always answers the same way so it never reveals whether an email exists.
// Sending the reset email is added later when we pick an email provider.
router.post('/forgot-password', validate(forgotSchema), (req, res) => {
  res.json({ message: 'If that email has an account, a reset link will be sent.' });
});

export default router;
