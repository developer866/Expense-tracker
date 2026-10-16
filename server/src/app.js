import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { AppError } from './lib/errors.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1); // correct client IPs behind a host like Render or Railway
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Slow down password guessing. Loose in development so testing isn't annoying.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) =>
    next(new AppError(429, 'RATE_LIMITED', 'Too many attempts. Please try again later.')),
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/me', meRoutes);
app.get('/',(req,res)=>{
  res.send("hello world")
})

app.use(notFound);
app.use(errorHandler);

export default app;
