export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  usage: { chatMessages: number; contentGenerations: number; tokensUsed: number; resetDate: string; };
  limits: { chatMessages: number; contentGenerations: number; tokensPerMonth: number; };
  createdAt: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  model: string;
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = 'blog-post'|'social-media'|'email'|'product-description'|'ad-copy'|'landing-page'|'seo-content'|'press-release';
export type Tone = 'professional'|'casual'|'friendly'|'formal'|'humorous'|'persuasive';

export interface Generation {
  _id: string;
  type: ContentType;
  prompt: string;
  result: string;
  tone: string;
  tokensUsed: number;
  isFavorited: boolean;
  createdAt: string;
}

export interface UsageStats {
  totalConversations: number;
  totalGenerations: number;
  recentChats: number;
  recentGenerations: number;
  usage: User['usage'];
  limits: User['limits'];
  plan: User['plan'];
  usagePercentages: { chatMessages: number; contentGenerations: number; tokens: number; };
}

export const PLAN_FEATURES = {
  free:       { name: 'Free',       price: 0,  features: ['50 chat messages/month', '10 content generations', 'GPT-4o access', 'Basic history'] },
  pro:        { name: 'Pro',        price: 29, features: ['2,000 chat messages/month', '500 content generations', 'GPT-4o priority', 'Priority support', 'API access'] },
  enterprise: { name: 'Enterprise', price: 99, features: ['Unlimited everything', 'Custom fine-tuning', 'Dedicated support', 'SLA guarantee', 'SSO/SAML'] },
} as const;

export const CONTENT_TYPES: { value: ContentType; label: string; icon: string; description: string }[] = [
  { value: 'blog-post',           label: 'Blog Post',          icon: '📝', description: 'Long-form SEO-optimized articles' },
  { value: 'social-media',        label: 'Social Media',       icon: '📱', description: 'Posts for all platforms' },
  { value: 'email',               label: 'Email',              icon: '📧', description: 'Professional email campaigns' },
  { value: 'product-description', label: 'Product Description',icon: '🛒', description: 'Compelling product copy' },
  { value: 'ad-copy',             label: 'Ad Copy',            icon: '📢', description: 'High-converting advertisements' },
  { value: 'landing-page',        label: 'Landing Page',       icon: '🚀', description: 'Full page copy that converts' },
  { value: 'seo-content',         label: 'SEO Content',        icon: '🔍', description: 'Keyword-optimized content' },
  { value: 'press-release',       label: 'Press Release',      icon: '📰', description: 'Professional announcements' },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual',       label: 'Casual' },
  { value: 'friendly',     label: 'Friendly' },
  { value: 'formal',       label: 'Formal' },
  { value: 'humorous',     label: 'Humorous' },
  { value: 'persuasive',   label: 'Persuasive' },
];
