'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, FileText, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import { UsageStats } from '@/types';
import { formatNumber } from '@/lib/utils';

function StatCard({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-white/45">{label}</p>
        <span className="text-xs text-white/25">{pct}%</span>
      </div>
      <p className="text-2xl font-light text-white mb-3">
        {formatNumber(value)}<span className="text-sm text-white/25 ml-1">/ {formatNumber(max)}</span>
      </p>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, backgroundColor: pct > 80 ? '#E03A2F' : color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getUsage().then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-white/40 mt-1 text-sm">Here&apos;s your AI workspace overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_,i) => <div key={i} className="glass rounded-2xl p-5 h-28 shimmer" />) :
          stats ? (
            <>
              <StatCard label="Chat Messages" value={stats.usage.chatMessages} max={stats.limits.chatMessages} color="#3B82F6" />
              <StatCard label="Content Generations" value={stats.usage.contentGenerations} max={stats.limits.contentGenerations} color="#8B5CF6" />
              <StatCard label="Tokens Used" value={stats.usage.tokensUsed} max={stats.limits.tokensPerMonth} color="#22C55E" />
            </>
          ) : null}
      </div>

      <div>
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href:'/dashboard/chat', icon:MessageSquare, label:'New Chat', desc:'Start an AI conversation', color:'#3B82F6' },
            { href:'/dashboard/generate', icon:FileText, label:'Generate Content', desc:'Create AI-powered content', color:'#8B5CF6' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 group transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor:`${a.color}15`,border:`1px solid ${a.color}25`}}>
                <a.icon className="w-5 h-5" style={{color:a.color}} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{a.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Total Chats', value:stats.totalConversations, icon:MessageSquare, color:'#3B82F6' },
            { label:'Generations', value:stats.totalGenerations, icon:FileText, color:'#8B5CF6' },
            { label:'Chats (7d)', value:stats.recentChats, icon:TrendingUp, color:'#22C55E' },
            { label:'Content (7d)', value:stats.recentGenerations, icon:Zap, color:'#F59E0B' },
          ].map(c => (
            <div key={c.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <c.icon className="w-3.5 h-3.5" style={{color:c.color}} />
                <span className="text-xs text-white/40">{c.label}</span>
              </div>
              <p className="text-xl font-semibold text-white">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {user?.plan === 'free' && (
        <div className="relative overflow-hidden rounded-2xl border border-[#E03A2F]/20 bg-gradient-to-r from-[#E03A2F]/8 to-transparent p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Unlock unlimited AI</h3>
              <p className="text-xs text-white/50">Upgrade to Pro — 2,000 messages &amp; 500 generations/month.</p>
            </div>
            <Link href="/dashboard/settings" className="flex-shrink-0 bg-[#E03A2F] hover:bg-[#FF4D42] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all whitespace-nowrap">
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
