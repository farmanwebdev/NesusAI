'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Heart, Trash2, Copy, Check, ChevronDown, Clock, Loader2 } from 'lucide-react';
import { generateApi } from '@/lib/api';
import { Generation, CONTENT_TYPES } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [copied, setCopied] = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    generateApi.getHistory(1, filterType||undefined)
      .then(r => setGenerations(r.data.generations))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [filterType]);

  const handleFavorite = async (id: string) => {
    try {
      const r = await generateApi.toggleFavorite(id);
      setGenerations(p => p.map(g => g._id===id ? {...g, isFavorited:r.data.isFavorited} : g));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await generateApi.delete(id);
      setGenerations(p => p.filter(g => g._id!==id));
      if (expanded===id) setExpanded(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Generation History</h1>
          <p className="text-sm text-white/40 mt-1">All your AI-generated content.</p>
        </div>
        <div className="relative">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-white focus:outline-none cursor-pointer">
            <option value="" className="bg-[#1a1e24]">All types</option>
            {CONTENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#1a1e24]">{t.icon} {t.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : generations.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-white/30 text-sm">No generations found.</p>
          <p className="text-white/20 text-xs mt-1">Generate some content to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map(gen => {
            const typeInfo = CONTENT_TYPES.find(t => t.value===gen.type);
            const isExpanded = expanded===gen._id;
            return (
              <div key={gen._id} className="glass rounded-2xl overflow-hidden">
                <div onClick={() => setExpanded(isExpanded?null:gen._id)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/3 transition-colors">
                  <span className="text-xl flex-shrink-0">{typeInfo?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{gen.prompt}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-white/30">{typeInfo?.label}</span>
                      <span className="text-xs text-white/18">·</span>
                      <span className="text-xs text-white/30 capitalize">{gen.tone}</span>
                      <span className="text-xs text-white/18">·</span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Clock className="w-3 h-3" />{formatRelativeTime(gen.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleFavorite(gen._id); }}
                      className={cn('p-1.5 rounded-lg transition-colors', gen.isFavorited ? 'text-[#E03A2F]' : 'text-white/22 hover:text-white/50')}>
                      <Heart className="w-3.5 h-3.5" fill={gen.isFavorited?'currentColor':'none'} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleCopy(gen._id,gen.result); }}
                      className="p-1.5 rounded-lg text-white/22 hover:text-white/50 transition-colors">
                      {copied===gen._id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(gen._id); }}
                      className="p-1.5 rounded-lg text-white/22 hover:text-[#E03A2F] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={cn('w-4 h-4 text-white/18 transition-transform ml-1', isExpanded && 'rotate-180')} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-white/6 p-5">
                    <div className="prose-dark text-sm max-h-80 overflow-y-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{gen.result}</ReactMarkdown>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/6">
                      <span className="text-xs text-white/22">{gen.tokensUsed} tokens used</span>
                      <button onClick={() => handleCopy(gen._id,gen.result)}
                        className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                        {copied===gen._id ? <><Check className="w-3 h-3 text-green-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy all</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
