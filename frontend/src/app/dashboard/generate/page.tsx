'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Wand2, Copy, Check, Loader2, ChevronDown } from 'lucide-react';
import { generateApi, getErrorMessage } from '@/lib/api';
import { Generation, CONTENT_TYPES, TONES, ContentType, Tone } from '@/types';
import { cn } from '@/lib/utils';

const LANGUAGES = ['English','Spanish','French','German','Portuguese','Italian','Dutch','Arabic','Chinese','Japanese','Hindi'];

export default function GeneratePage() {
  const [selectedType, setSelectedType] = useState<ContentType>('blog-post');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Generation | null>(null);
  const [copied, setCopied] = useState(false);
  const typeInfo = CONTENT_TYPES.find(t => t.value === selectedType)!;

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) { toast.error('Please enter a more detailed prompt (min 10 chars).'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await generateApi.generate({ type:selectedType, prompt:prompt.trim(), tone, language });
      setResult(r.data.generation);
      toast.success('Content generated!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.result);
    setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Content Generator</h1>
        <p className="text-sm text-white/40 mt-1">Generate world-class content with AI in seconds.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map(t => (
                <button key={t.value} onClick={() => setSelectedType(t.value)}
                  className={cn('flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all text-xs', selectedType===t.value ? 'border-[#E03A2F]/40 bg-[#E03A2F]/10 text-white' : 'border-white/8 bg-white/3 text-white/45 hover:border-white/14 hover:text-white/75')}>
                  <span className="text-base">{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Prompt / Topic</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder={`Describe what you want to create...\n\nE.g., "Benefits of remote work for software teams"`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/22 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all resize-none leading-relaxed" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-white/20">{typeInfo.description}</span>
              <span className={cn('text-xs', prompt.length>1800 ? 'text-[#E03A2F]' : 'text-white/20')}>{prompt.length}/2000</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Tone</label>
              <div className="relative">
                <select value={tone} onChange={e => setTone(e.target.value as Tone)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all cursor-pointer">
                  {TONES.map(t => <option key={t.value} value={t.value} className="bg-[#1a1e24]">{t.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Language</label>
              <div className="relative">
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all cursor-pointer">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#1a1e24]">{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#E03A2F] hover:bg-[#FF4D42] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4" />Generate {typeInfo.label}</>}
          </button>
        </div>
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl min-h-[480px] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">{typeInfo.icon}</span>
                <span className="text-sm font-medium text-white">{result ? typeInfo.label : 'Output'}</span>
                {result && <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">~{result.tokensUsed} tokens</span>}
              </div>
              {result && (
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                  {copied ? <><Check className="w-3 h-3 text-green-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              )}
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                  <div className="w-10 h-10 rounded-full border-2 border-[#E03A2F]/30 border-t-[#E03A2F] animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/45">Generating {typeInfo.label}</p>
                    <p className="text-xs mt-1">Usually 5–15 seconds…</p>
                  </div>
                </div>
              ) : result ? (
                <div className="prose-dark text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.result}</ReactMarkdown></div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-white/22">
                  <Wand2 className="w-10 h-10" />
                  <div>
                    <p className="text-sm font-medium text-white/35">Your content will appear here</p>
                    <p className="text-xs mt-1">Fill in the form and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
