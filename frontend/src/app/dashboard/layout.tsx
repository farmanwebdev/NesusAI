'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, MessageSquare, FileText, History, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getInitials, getPlanBadge, cn } from '@/lib/utils';

const navItems = [
  { href:'/dashboard',           icon:LayoutDashboard, label:'Overview' },
  { href:'/dashboard/chat',      icon:MessageSquare,   label:'AI Chat' },
  { href:'/dashboard/generate',  icon:FileText,        label:'Generator' },
  { href:'/dashboard/history',   icon:History,         label:'History' },
  { href:'/dashboard/settings',  icon:Settings,        label:'Settings' },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />}
      <aside className={cn('fixed left-0 top-0 h-full w-60 bg-[#0E1012] border-r border-white/6 z-50 flex flex-col transition-transform duration-300 md:translate-x-0', open ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/6 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="font-semibold text-sm">NexusAI</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group', active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5')}>
                <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[#E03A2F]' : '')} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 text-white/30" />}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="border-t border-white/6 p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getPlanBadge(user.plan))}>
                {user.plan.charAt(0).toUpperCase()+user.plan.slice(1)}
              </span>
              {user.plan === 'free' && <Link href="/dashboard/settings" className="text-xs text-[#E03A2F] hover:text-[#FF4D42]">Upgrade →</Link>}
            </div>
            <div className="px-1 mb-3">
              <div className="flex justify-between text-xs text-white/25 mb-1">
                <span>Messages</span><span>{user.usage.chatMessages}/{user.limits.chatMessages}</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#E03A2F] rounded-full transition-all" style={{width:`${Math.min(100,(user.usage.chatMessages/user.limits.chatMessages)*100)}%`}} />
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-xl hover:bg-white/5 group transition-all cursor-default">
              <div className="w-7 h-7 rounded-full bg-[#E03A2F]/20 border border-[#E03A2F]/30 flex items-center justify-center text-xs font-medium text-[#E03A2F] flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/30 truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-[#E03A2F] transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { if (!token && !user) router.push('/login'); }, [token, user, router]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080A0C]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-60 min-h-screen flex flex-col">
        <header className="h-14 border-b border-white/6 flex items-center justify-between px-5 bg-[#0A0C0E]/80 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-white/35">
            <span>NexusAI</span><ChevronRight className="w-3 h-3" /><span className="text-white/70">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-7 h-7 rounded-full bg-[#E03A2F]/20 border border-[#E03A2F]/30 flex items-center justify-center text-xs font-medium text-[#E03A2F]">
              {getInitials(user.name)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
