import { Router, Response } from 'express';
import { z } from 'zod';
import Generation from '../models/Generation';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import { generateContent } from '../services/openai';

const router = Router();
router.use(protect);

const generateSchema = z.object({
  type: z.enum(['blog-post','social-media','email','product-description','ad-copy','landing-page','seo-content','press-release']),
  prompt: z.string().min(10).max(2000),
  tone: z.enum(['professional','casual','friendly','formal','humorous','persuasive']).default('professional'),
  language: z.string().default('English'),
  model: z.string().optional(),
});

router.post('/content', aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors }); return; }
    const user = req.user!;
    if (user.usage.contentGenerations >= user.limits.contentGenerations) {
      res.status(429).json({ success: false, message: `Monthly limit reached (${user.limits.contentGenerations} generations). Please upgrade.`, limitReached: true });
      return;
    }
    const { type, prompt, tone, language, model = 'gpt-4o' } = parsed.data;
    const result = await generateContent(type, prompt, tone, language, model);
    const generation = await Generation.create({ user: user._id, type, prompt, result: result.content, tone, language, tokensUsed: result.tokensUsed, model });
    await User.findByIdAndUpdate(user._id, { $inc: { 'usage.contentGenerations': 1, 'usage.tokensUsed': result.tokensUsed } });
    res.status(201).json({ success: true, generation: { id: generation._id, type: generation.type, prompt: generation.prompt, result: generation.result, tone: generation.tone, tokensUsed: generation.tokensUsed, createdAt: generation.createdAt } });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate content.' });
  }
});

router.get('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    const query: Record<string, unknown> = { user: req.user!._id };
    if (type) query.type = type;
    const [generations, total] = await Promise.all([
      Generation.find(query).select('type prompt result tone tokensUsed isFavorited createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Generation.countDocuments(query),
    ]);
    res.json({ success: true, generations, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch history.' }); }
});

router.patch('/:id/favorite', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const generation = await Generation.findOne({ _id: req.params.id, user: req.user!._id });
    if (!generation) { res.status(404).json({ success: false, message: 'Not found.' }); return; }
    generation.isFavorited = !generation.isFavorited;
    await generation.save();
    res.json({ success: true, isFavorited: generation.isFavorited });
  } catch { res.status(500).json({ success: false, message: 'Server error.' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Generation.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true, message: 'Deleted.' });
  } catch { res.status(500).json({ success: false, message: 'Server error.' }); }
});

export default router;
