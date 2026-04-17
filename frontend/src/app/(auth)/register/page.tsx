'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const pwStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const sLabel = ['','Weak','Fair','Good','Strong'];
const sColor = ['','#E03A2F','#F59E0B','#3B82F6','#22C55E'];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = pwStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome to NexusAI, ${res.data.user.name}! 🎉`);
      router.push('/dashboard');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] grid-bg flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 50% 40% at 50% 0%,rgba(224,58,47,0.12) 0%,transparent 70%)'}} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-semibold">NexusAI</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-white/50 mt-1">Free forever. No credit card required.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
          {['50 free messages','10 content generations','GPT-4o access'].map(b => (
            <div key={b} className="flex items-center gap-1.5 text-xs text-white/40">
              <Check className="w-3 h-3 text-[#E03A2F]" />{b}
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Jane Smith" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Min. 8 characters" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E03A2F]/50 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{backgroundColor: i<=strength ? sColor[strength] : 'rgba(255,255,255,0.1)'}} />
                    ))}
                  </div>
                  <p className="text-xs" style={{color:sColor[strength]}}>{sLabel[strength]}</p>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#E03A2F] hover:bg-[#FF4D42] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : <>Create free account<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="mt-4 text-xs text-center text-white/25">
            By signing up you agree to our <a href="#" className="text-white/40 hover:text-white/60">Terms</a> and <a href="#" className="text-white/40 hover:text-white/60">Privacy Policy</a>.
          </p>
          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
