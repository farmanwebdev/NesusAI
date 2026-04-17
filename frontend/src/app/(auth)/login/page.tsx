'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/dashboard');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] grid-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 50% 40% at 50% 0%,rgba(224,58,47,0.12) 0%,transparent 70%)'}} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-semibold">NexusAI</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to your account</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="••••••••" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#E03A2F] hover:bg-[#FF4D42] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : <>Sign in<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-white/70 hover:text-white transition-colors font-medium">Sign up free</Link>
          </div>
        </div>
        <p className="text-center text-xs text-white/20 mt-4">Demo: demo@nexusai.com / password123</p>
      </div>
    </div>
  );
}
