import { z } from 'zod';

const timezone = z.string().refine((v) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: v });
    return true;
  } catch {
    return false;
  }
}, 'Invalid timezone');

const email = z.string().trim().toLowerCase().email('Enter a valid email');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email,
  // bcrypt only uses the first 72 bytes, so we cap the length
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  timezone: timezone.optional(),
  currency: z.string().trim().length(3, 'Use a 3-letter currency code').toUpperCase().optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'refreshToken is required'),
});

export const forgotSchema = z.object({ email });

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    theme: z.enum(['light', 'dark', 'system']),
    timezone,
    currency: z.string().trim().length(3).toUpperCase(),
    monthStartDay: z.number().int().min(1).max(28),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Send at least one field to update');
