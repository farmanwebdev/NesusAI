import { Router, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Conversation from '../models/Conversation';
import Generation from '../models/Generation';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, plan: user.plan, usage: user.usage, limits: user.limits, createdAt: user.createdAt } });
});

router.put('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({ name: z.string().min(2).max(50).optional(), avatar: z.string().url().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Validation failed' }); return; }
    const user = await User.findByIdAndUpdate(req.user!._id, { $set: parsed.data }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user: { id: user!._id, name: user!.name, email: user!.email, avatar: user!.avatar, plan: user!.plan } });
  } catch { res.status(500).json({ success: false, message: 'Failed to update profile.' }); }
});

router.get('/usage', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalConversations, totalGenerations, recentChats, recentGenerations, user] = await Promise.all([
      Conversation.countDocuments({ user: userId }),
      Generation.countDocuments({ user: userId }),
      Conversation.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } }),
      Generation.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } }),
      User.findById(userId),
    ]);
    res.json({
      success: true,
      stats: {
        totalConversations, totalGenerations, recentChats, recentGenerations,
        usage: user!.usage, limits: user!.limits, plan: user!.plan,
        usagePercentages: {
          chatMessages: Math.round((user!.usage.chatMessages / user!.limits.chatMessages) * 100),
          contentGenerations: Math.round((user!.usage.contentGenerations / user!.limits.contentGenerations) * 100),
          tokens: Math.round((user!.usage.tokensUsed / user!.limits.tokensPerMonth) * 100),
        },
      },
    });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch usage.' }); }
});

export default router;
