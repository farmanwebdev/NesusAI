'use client';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Plus, Send, Trash2, MessageSquare, Loader2, Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { Conversation, Message } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function MsgBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1', isUser ? 'bg-[#E03A2F]/20 border border-[#E03A2F]/30 text-[#E03A2F]' : 'bg-white/8 border border-white/10 text-white/50')}>
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      </div>
      <div className={cn('flex flex-col max-w-[78%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn('rounded-2xl px-4 py-3 text-sm', isUser ? 'bg-[#E03A2F]/12 border border-[#E03A2F]/18 text-white/90 rounded-tr-sm' : 'bg-white/5 border border-white/8 rounded-tl-sm')}>
          {isUser ? <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p> :
            <div className="prose-dark text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>}
        </div>
        <div className={cn('flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-white/20">{formatRelativeTime(message.createdAt)}</span>
          {!isUser && <CopyBtn text={message.content} />}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-white/8 border border-white/10 flex items-center justify-center"><Bot className="w-3 h-3 text-white/50" /></div>
      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onFocus }: { onFocus: () => void }) {
  const suggestions = ['Explain quantum computing simply','Write a Python function to sort a list','Help me brainstorm startup ideas','What are React best practices in 2025?'];
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03A2F] to-[#FF6B5B] flex items-center justify-center mb-5 animate-float">
        <Sparkles className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">How can I help you today?</h2>
      <p className="text-white/40 text-sm mb-7 max-w-sm">Ask me anything — coding, writing, analysis, math, or creative projects.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map(s => (
          <button key={s} onClick={onFocus} className="glass glass-hover rounded-xl px-4 py-3 text-left text-xs text-white/55 hover:text-white/80 transition-all">
            &ldquo;{s}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatApi.getConversations().then(r => setConversations(r.data.conversations)).catch(console.error).finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const loadConv = async (id: string) => {
    setActiveId(id);
    try { const r = await chatApi.getConversation(id); setMessages(r.data.conversation.messages); }
    catch { toast.error('Failed to load conversation'); }
  };

  const newConv = async () => {
    try {
      const r = await chatApi.createConversation();
      setConversations(p => [r.data.conversation, ...p]);
      setActiveId(r.data.conversation._id);
      setMessages([]);
      inputRef.current?.focus();
    } catch { toast.error('Failed to create conversation'); }
  };

  const deleteConv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteConversation(id);
      setConversations(p => p.filter(c => c._id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch { toast.error('Failed to delete'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    let convId = activeId;
    if (!convId) {
      try { const r = await chatApi.createConversation(); convId = r.data.conversation._id; setActiveId(convId); setConversations(p => [r.data.conversation, ...p]); }
      catch { toast.error('Failed to start conversation'); return; }
    }
    const userMsg: Message = { role:'user', content:input.trim(), createdAt: new Date().toISOString() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setSending(true);
    try {
      const r = await chatApi.sendMessage(convId!, userMsg.content);
      setMessages(p => [...p, r.data.assistantMessage]);
      setConversations(p => p.map(c => c._id === convId ? {...c, title:r.data.conversationTitle, updatedAt:new Date().toISOString()} : c));
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages(p => p.slice(0,-1));
    } finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex gap-0 -m-5 md:-m-6 overflow-hidden">
      <aside className="hidden md:flex w-56 flex-col bg-[#0A0C0E] border-r border-white/6 flex-shrink-0">
        <div className="p-3 border-b border-white/6">
          <button onClick={newConv} className="w-full flex items-center gap-2 bg-[#E03A2F]/10 hover:bg-[#E03A2F]/18 border border-[#E03A2F]/20 text-white text-xs font-medium px-3 py-2.5 rounded-xl transition-all">
            <Plus className="w-3.5 h-3.5 text-[#E03A2F]" />New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {loadingConvs ? [...Array(4)].map((_,i) => <div key={i} className="h-9 shimmer rounded-xl" />) :
            conversations.length === 0 ? <p className="text-center py-8 text-white/20 text-xs">No conversations yet</p> :
            conversations.map(c => (
              <div key={c._id} onClick={() => loadConv(c._id)}
                className={cn('flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer group transition-all text-xs', activeId===c._id ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/5')}>
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <button onClick={e => deleteConv(c._id,e)} className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-[#E03A2F] transition-all flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          }
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 ? <WelcomeScreen onFocus={() => inputRef.current?.focus()} /> :
            <>{messages.map((m,i) => <MsgBubble key={i} message={m} />)}{sending && <TypingDots />}</>}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-white/6 bg-[#0A0C0E] flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 glass rounded-2xl px-4 py-3 border border-white/10 focus-within:border-white/18 transition-colors">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Message NexusAI… (Enter to send, Shift+Enter for newline)" rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/22 resize-none outline-none max-h-36 overflow-y-auto leading-relaxed" />
              <button onClick={sendMessage} disabled={!input.trim()||sending}
                className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#E03A2F] hover:bg-[#FF4D42] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-center text-xs text-white/18 mt-2">NexusAI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
