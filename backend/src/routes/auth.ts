import { Router, Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { protect, generateToken, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      return;
    }
    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, usage: user.usage, limits: user.limits, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid credentials format.' });
      return;
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    const token = generateToken(user._id.toString());
    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, usage: user.usage, limits: user.limits, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, plan: user.plan, usage: user.usage, limits: user.limits, createdAt: user.createdAt },
  });
});

export default router;
