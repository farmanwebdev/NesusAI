'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Zap, MessageSquare, FileText, BarChart3, Shield, Globe, ArrowRight, Check, Star, ChevronDown, Sparkles, Brain, Cpu } from 'lucide-react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/8' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">NexusAI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[['Features','#features'],['Pricing','#pricing'],['Docs','#']].map(([label,href]) => (
            <a key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link href="/register" className="text-sm bg-white text-black font-medium px-4 py-2 rounded-xl hover:bg-white/90 transition-all">Get started free</Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage:`repeating-linear-gradient(to right,rgba(0,0,0,0.05),rgba(0,0,0,0.25) 18px,transparent 2px,transparent 10px)`, maskImage:'linear-gradient(to bottom,transparent,black 20%,black 80%,transparent)' }} />
        <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(224,58,47,0.15) 0%,transparent 70%)' }} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E03A2F] animate-pulse" />
          Powered by GPT-4o · Now in beta
          <ArrowRight className="w-3 h-3" />
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight mb-6">
          The AI platform<br />
          <span className="gradient-text-red font-medium">built for creators</span>
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Chat with GPT-4o, generate world-class content, and ship faster than ever. NexusAI gives your team unified AI access in one beautiful interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-[#E03A2F] hover:bg-[#FF4D42] text-white font-medium px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-900/20">
            <Sparkles className="w-4 h-4" />Start for free<ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded-xl transition-all duration-200">
            View demo
          </Link>
        </div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {['#E03A2F','#3B82F6','#8B5CF6','#22C55E','#F59E0B'].map((color,i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0C0E] flex items-center justify-center text-xs font-medium text-white" style={{backgroundColor:color}}>
                {['JD','AK','MR','SL','TY'][i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <div className="flex">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400" fill="#FBBF24" />)}</div>
            <span>Loved by 12,000+ creators &amp; teams</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
        <span className="text-xs">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}

const features = [
  { icon: MessageSquare, color:'#3B82F6', title:'AI Chat', description:'Natural conversations with GPT-4o. Full markdown, code highlighting, persistent history.' },
  { icon: FileText, color:'#8B5CF6', title:'Content Generator', description:'8 content types: blog posts, social media, emails, ad copy and more in seconds.' },
  { icon: BarChart3, color:'#22C55E', title:'Usage Analytics', description:'Track AI usage, token consumption, and content history with beautiful dashboards.' },
  { icon: Shield, color:'#F59E0B', title:'Secure by Default', description:'JWT auth, encrypted storage, rate limiting, and enterprise-grade security built in.' },
  { icon: Globe, color:'#E03A2F', title:'Multi-language', description:'Generate content in 11+ languages. NexusAI understands any language you need.' },
  { icon: Cpu, color:'#06B6D4', title:'GPT-4o Powered', description:"Access OpenAI's most capable model. Intelligent, fast, and reliable AI." },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#E03A2F]" />Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">Everything you need</h2>
          <p className="text-white/50 max-w-xl mx-auto">NexusAI is a complete AI platform — not just a chatbot.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="glass glass-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{backgroundColor:`${f.color}20`,border:`1px solid ${f.color}30`}}>
                <f.icon className="w-5 h-5" style={{color:f.color}} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name:'Free', price:'$0', period:'forever', desc:'Perfect for trying NexusAI', features:['50 chat messages/month','10 content generations','GPT-4o access','Basic history'], cta:'Start free', href:'/register', hot:false },
  { name:'Pro', price:'$29', period:'/month', desc:'For professionals & creators', features:['2,000 chat messages/month','500 content generations','GPT-4o priority access','Full history','API access','Priority support'], cta:'Get Pro', href:'/register?plan=pro', hot:true },
  { name:'Enterprise', price:'$99', period:'/month', desc:'For teams & organizations', features:['Unlimited everything','Custom model fine-tuning','Dedicated support','SLA guarantee','SSO/SAML','Custom integrations'], cta:'Contact sales', href:'/register?plan=enterprise', hot:false },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 60% 40% at 50% 50%,rgba(224,58,47,0.05) 0%,transparent 70%)'}} />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#E03A2F]" />Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col relative ${plan.hot ? 'bg-white/8 border border-[#E03A2F]/40' : 'glass'}`}>
              {plan.hot && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E03A2F] text-white text-xs font-medium px-3 py-1 rounded-full">Most popular</div>}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2"><span className="text-3xl font-light">{plan.price}</span><span className="text-white/40 text-sm">{plan.period}</span></div>
                <p className="text-sm text-white/50">{plan.desc}</p>
              </div>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="w-4 h-4 text-[#E03A2F] shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`w-full py-3 rounded-xl text-sm font-medium text-center transition-all ${plan.hot ? 'bg-[#E03A2F] hover:bg-[#FF4D42] text-white' : 'border border-white/10 hover:bg-white/5 text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(224,58,47,0.15) 0%,transparent 70%)'}} />
          <Brain className="w-12 h-12 text-[#E03A2F] mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-4">Ready to build with AI?</h2>
          <p className="text-white/50 mb-8">Join thousands of creators using NexusAI to 10x their productivity.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#E03A2F] hover:bg-[#FF4D42] text-white font-medium px-8 py-4 rounded-xl transition-all">
            <Sparkles className="w-4 h-4" />Get started for free<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/8 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-semibold">NexusAI</span>
        </div>
        <p className="text-sm text-white/30">© 2025 NexusAI. Built with Next.js, Express &amp; MongoDB.</p>
        <div className="flex items-center gap-6">
          {['Privacy','Terms','Docs'].map(item => (
            <a key={item} href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0C0E]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
