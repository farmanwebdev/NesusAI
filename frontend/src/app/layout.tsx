import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'NexusAI — Unified AI Platform',
  description: 'The most powerful AI SaaS platform for chat, content generation, and more. Powered by GPT-4o.',
  keywords: 'AI, ChatGPT, content generation, AI assistant, NexusAI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0A0C0E] text-white antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1e24', color: '#F7F8F8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0A0C0E' } },
            error: { iconTheme: { primary: '#E03A2F', secondary: '#0A0C0E' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
