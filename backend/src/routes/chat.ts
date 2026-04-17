import { Router, Response } from 'express';
import { z } from 'zod';
import Conversation from '../models/Conversation';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import { chatCompletion } from '../services/openai';

const router = Router();
router.use(protect);

router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find({ user: req.user!._id })
      .select('title model totalTokens createdAt updatedAt')
      .sort({ updatedAt: -1 }).limit(50);
    res.json({ success: true, conversations });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch conversations.' }); }
});

router.post('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversation = await Conversation.create({ user: req.user!._id, title: 'New Conversation', messages: [] });
    res.status(201).json({ success: true, conversation });
  } catch { res.status(500).json({ success: false, message: 'Failed to create conversation.' }); }
});

router.get('/conversations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user!._id });
    if (!conversation) { res.status(404).json({ success: false, message: 'Conversation not found.' }); return; }
    res.json({ success: true, conversation });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch conversation.' }); }
});

const msgSchema = z.object({ content: z.string().min(1).max(10000), model: z.string().optional() });

router.post('/conversations/:id/messages', aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = msgSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: 'Invalid message.' }); return; }
    const user = req.user!;
    if (user.usage.chatMessages >= user.limits.chatMessages) {
      res.status(429).json({ success: false, message: `Monthly limit reached (${user.limits.chatMessages} messages). Please upgrade.`, limitReached: true });
      return;
    }
    const conversation = await Conversation.findOne({ _id: req.params.id, user: user._id });
    if (!conversation) { res.status(404).json({ success: false, message: 'Conversation not found.' }); return; }
    const { content, model = 'gpt-4o' } = parsed.data;
    conversation.messages.push({ role: 'user', content, createdAt: new Date() });
    const history = conversation.messages.slice(-20).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const aiResponse = await chatCompletion(history, model);
    conversation.messages.push({ role: 'assistant', content: aiResponse.content, tokens: aiResponse.tokensUsed, createdAt: new Date() });
    if (conversation.messages.length === 2) {
      conversation.title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
    }
    conversation.totalTokens += aiResponse.tokensUsed;
    conversation.model = model;
    await conversation.save();
    await User.findByIdAndUpdate(user._id, { $inc: { 'usage.chatMessages': 1, 'usage.tokensUsed': aiResponse.tokensUsed } });
    const msgs = conversation.messages.slice(-2);
    res.json({ success: true, userMessage: msgs[0], assistantMessage: msgs[1], tokensUsed: aiResponse.tokensUsed, conversationTitle: conversation.title });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI response.' });
  }
});

router.delete('/conversations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch { res.status(500).json({ success: false, message: 'Failed to delete.' }); }
});

export default router;
