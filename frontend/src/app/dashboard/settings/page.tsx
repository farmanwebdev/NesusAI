'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User, Shield, CreditCard, Check, Loader2, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { userApi, getErrorMessage } from '@/lib/api';
import { PLAN_FEATURES } from '@/types';
import { cn, getInitials, getPlanBadge } from '@/lib/utils';

type Tab = 'profile' | 'plan' | 'security';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await userApi.updateProfile({ name });
      updateUser({ name: r.data.user.name });
      toast.success('Profile updated!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id:'profile', label:'Profile', icon:User },
    { id:'plan', label:'Plan & Billing', icon:CreditCard },
    { id:'security', label:'Security', icon:Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your account and subscription.</p>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all', tab===t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70')}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && user && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E03A2F]/20 border border-[#E03A2F]/30 flex items-center justify-center text-lg font-semibold text-[#E03A2F]">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="font-medium text-white">{user.name}</p>
              <p className="text-sm text-white/40">{user.email}</p>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block', getPlanBadge(user.plan))}>
                {user.plan.charAt(0).toUpperCase()+user.plan.slice(1)} plan
              </span>
            </div>
          </div>
          <div className="border-t border-white/6 pt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1.5">Full name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1.5">Email address</label>
              <input value={user.email} disabled className="w-full bg-white/3 border border-white/6 rounded-xl px-4 py-3 text-white/40 text-sm cursor-not-allowed" />
              <p className="text-xs text-white/22 mt-1">Email cannot be changed.</p>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving||name===user.name}
                className="flex items-center gap-2 bg-[#E03A2F] hover:bg-[#FF4D42] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : 'Save changes'}
              </button>
            </div>
          </div>
          <div className="border-t border-white/6 pt-5">
            <h3 className="text-sm font-medium text-white/55 mb-3">Monthly Usage</h3>
            <div className="space-y-3">
              {[
                { label:'Chat messages', used:user.usage.chatMessages, max:user.limits.chatMessages },
                { label:'Content generations', used:user.usage.contentGenerations, max:user.limits.contentGenerations },
                { label:'Tokens', used:user.usage.tokensUsed, max:user.limits.tokensPerMonth },
              ].map(s => {
                const pct = Math.min(100, Math.round((s.used/s.max)*100));
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/45">{s.label}</span>
                      <span className="text-white/25">{s.used.toLocaleString()} / {s.max.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, backgroundColor: pct>80?'#E03A2F':'#3B82F6'}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(PLAN_FEATURES) as [keyof typeof PLAN_FEATURES, typeof PLAN_FEATURES[keyof typeof PLAN_FEATURES]][]).map(([key, plan]) => {
              const isCurrent = user?.plan === key;
              return (
                <div key={key} className={cn('glass rounded-2xl p-5 flex flex-col relative', isCurrent && 'border border-[#E03A2F]/30')}>
                  {isCurrent && <div className="absolute -top-2.5 left-4 bg-[#E03A2F] text-white text-xs px-2.5 py-0.5 rounded-full">Current</div>}
                  <div className="mb-4">
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-light">${plan.price}</span>
                      <span className="text-xs text-white/30">/month</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-2 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/55">
                        <Check className="w-3.5 h-3.5 text-[#E03A2F] flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={isCurrent} onClick={() => toast.success('Redirecting to payment…')}
                    className={cn('w-full py-2.5 rounded-xl text-sm font-medium transition-all', isCurrent ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-[#E03A2F] hover:bg-[#FF4D42] text-white')}>
                    {isCurrent ? 'Current plan' : key==='enterprise' ? 'Contact sales' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3 border border-yellow-500/10">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Usage resets monthly</p>
              <p className="text-xs text-white/40 mt-0.5">
                Your counters reset on {user?.usage?.resetDate ? new Date(user.usage.resetDate).toLocaleDateString('en-US',{month:'long',day:'numeric'}) : 'the 1st'} of each month.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-medium text-white mb-1">Change Password</h3>
            <p className="text-sm text-white/40">Update your password to keep your account secure.</p>
          </div>
          <div className="space-y-3 border-t border-white/6 pt-5">
            {['Current password','New password','Confirm new password'].map(label => (
              <div key={label}>
                <label className="block text-sm font-medium text-white/55 mb-1.5">{label}</label>
                <input type="password" placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all" />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={() => toast.success('Password change coming soon!')}
                className="flex items-center gap-2 bg-[#E03A2F] hover:bg-[#FF4D42] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
                Update password
              </button>
            </div>
          </div>
          <div className="border-t border-white/6 pt-5">
            <h3 className="font-medium text-[#E03A2F] mb-1">Danger Zone</h3>
            <p className="text-sm text-white/40 mb-3">Permanently delete your account and all data.</p>
            <button onClick={() => toast.error('Account deletion requires email confirmation.')}
              className="border border-[#E03A2F]/30 text-[#E03A2F] hover:bg-[#E03A2F]/10 text-sm px-4 py-2 rounded-xl transition-all">
              Delete account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
