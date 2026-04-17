//########## MOCK MODE switch #########
import OpenAI from 'openai';
import { ContentType } from '../models/Generation';

let client: OpenAI | null = null;
const getClient = (): OpenAI => {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResult {
  content: string;
  tokensUsed: number;
  model: string;
}

/**
 * 🔴 TOGGLE THIS FOR TESTING
 * true  → no OpenAI calls (safe for frontend testing)
 * false → real AI enabled
 */
const USE_MOCK_AI = true;

/* ---------------- CHAT ---------------- */

export const chatCompletion = async (
  messages: ChatMessage[],
  model = 'gpt-4o'
): Promise<AIResult> => {

  // ✅ MOCK MODE (NO BILLING NEEDED)
  if (USE_MOCK_AI) {
    const lastMessage = messages[messages.length - 1]?.content || '';

    return {
      content: `🧪 Mock AI Reply:\nYou said: "${lastMessage}"`,
      tokensUsed: 0,
      model: 'mock-model',
    };
  }

  // ❌ REAL OPENAI CALL
  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are NexusAI, an advanced AI assistant. You are helpful, knowledgeable, and concise. Today is ${new Date().toLocaleDateString()}.`,
      },
      ...messages,
    ],
    max_tokens: 2048,
    temperature: 0.7,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    tokensUsed: response.usage?.total_tokens || 0,
    model,
  };
};

/* ---------------- CONTENT GENERATION ---------------- */

const contentPrompts: Record<ContentType, (prompt: string, tone: string) => string> = {
  'blog-post': (p, t) => `Write a comprehensive SEO-optimized blog post about: "${p}". Tone: ${t}. Include a catchy title, intro, 4-5 sections with headers, and conclusion. ~1000 words.`,
  'social-media': (p, t) => `Create 5 social media posts about: "${p}". Tone: ${t}. Include Twitter/X (max 280 chars), LinkedIn, and Instagram variations with hashtags.`,
  'email': (p, t) => `Write a professional email about: "${p}". Tone: ${t}. Include subject line, greeting, body, CTA, and signature.`,
  'product-description': (p, t) => `Write a compelling product description for: "${p}". Tone: ${t}. Highlight features, benefits, and include a CTA. ~200 words.`,
  'ad-copy': (p, t) => `Create 3 ad copy variations for: "${p}". Tone: ${t}. Each with headline, body, and CTA. Make them punchy and conversion-focused.`,
  'landing-page': (p, t) => `Write landing page copy for: "${p}". Tone: ${t}. Include hero headline, subheadline, 3-5 value props, FAQ, and CTA sections.`,
  'seo-content': (p, t) => `Write SEO-optimized content about: "${p}". Tone: ${t}. Include meta description (155 chars), proper H1/H2/H3 structure. ~700 words.`,
  'press-release': (p, t) => `Write a professional press release about: "${p}". Tone: ${t}. Follow standard format: headline, dateline, intro, body, quotes, boilerplate.`,
};

export const generateContent = async (
  type: ContentType,
  prompt: string,
  tone: string,
  language: string,
  model = 'gpt-4o'
): Promise<AIResult> => {

  // (Optional: you can also mock this later if needed)

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are NexusAI Content Generator, a world-class copywriter. Generate high-quality ${type.replace('-', ' ')} content.${language !== 'English' ? ` Write in ${language}.` : ''} Return well-formatted, professional content ready to use.`,
      },
      { role: 'user', content: contentPrompts[type](prompt, tone) },
    ],
    max_tokens: 2048,
    temperature: 0.8,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    tokensUsed: response.usage?.total_tokens || 0,
    model,
  };
};




//########## Real OpenAI  code #########

// import OpenAI from 'openai';
// import { ContentType } from '../models/Generation';

// let client: OpenAI | null = null;
// const getClient = (): OpenAI => {
//   if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   return client;
// };

// export interface ChatMessage {
//   role: 'user' | 'assistant' | 'system';
//   content: string;
// }

// export interface AIResult {
//   content: string;
//   tokensUsed: number;
//   model: string;
// }

// export const chatCompletion = async (messages: ChatMessage[], model = 'gpt-4o'): Promise<AIResult> => {
//   const response = await getClient().chat.completions.create({
//     model,
//     messages: [
//       {
//         role: 'system',
//         content: You are NexusAI, an advanced AI assistant. You are helpful, knowledgeable, and concise. Today is ${new Date().toLocaleDateString()}.,
//       },
//       ...messages,
//     ],
//     max_tokens: 2048,
//     temperature: 0.7,
//   });

  
//   return {
//     content: response.choices[0]?.message?.content || '',
//     tokensUsed: response.usage?.total_tokens || 0,
//     model,
//   };
// };

// const contentPrompts: Record<ContentType, (prompt: string, tone: string) => string> = {
//   'blog-post': (p, t) => Write a comprehensive SEO-optimized blog post about: "${p}". Tone: ${t}. Include a catchy title, intro, 4-5 sections with headers, and conclusion. ~1000 words.,
//   'social-media': (p, t) => Create 5 social media posts about: "${p}". Tone: ${t}. Include Twitter/X (max 280 chars), LinkedIn, and Instagram variations with hashtags.,
//   'email': (p, t) => Write a professional email about: "${p}". Tone: ${t}. Include subject line, greeting, body, CTA, and signature.,
//   'product-description': (p, t) => Write a compelling product description for: "${p}". Tone: ${t}. Highlight features, benefits, and include a CTA. ~200 words.,
//   'ad-copy': (p, t) => Create 3 ad copy variations for: "${p}". Tone: ${t}. Each with headline, body, and CTA. Make them punchy and conversion-focused.,
//   'landing-page': (p, t) => Write landing page copy for: "${p}". Tone: ${t}. Include hero headline, subheadline, 3-5 value props, FAQ, and CTA sections.,
//   'seo-content': (p, t) => Write SEO-optimized content about: "${p}". Tone: ${t}. Include meta description (155 chars), proper H1/H2/H3 structure. ~700 words.,
//   'press-release': (p, t) => Write a professional press release about: "${p}". Tone: ${t}. Follow standard format: headline, dateline, intro, body, quotes, boilerplate.,
// };

// export const generateContent = async (
//   type: ContentType, prompt: string, tone: string, language: string, model = 'gpt-4o'
// ): Promise<AIResult> => {
//   const response = await getClient().chat.completions.create({
//     model,
//     messages: [
//       {
//         role: 'system',
//         content: You are NexusAI Content Generator, a world-class copywriter. Generate high-quality ${type.replace('-', ' ')} content.${language !== 'English' ?  Write in ${language}. : ''} Return well-formatted, professional content ready to use.,
//       },
//       { role: 'user', content: contentPrompts[type](prompt, tone) },
//     ],
//     max_tokens: 2048,
//     temperature: 0.8,
//   });
//   return {
//     content: response.choices[0]?.message?.content || '',
//     tokensUsed: response.usage?.total_tokens || 0,
//     model,
//   };
// };
