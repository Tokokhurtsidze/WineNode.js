import React, { useState, useRef, useEffect } from 'react';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SYSTEM_PROMPT = `You are LAMI — the AI wine assistant for LAMIANI, a premium Georgian wine shop in Tbilisi.

About LAMIANI:
- Located at David Gamrekeli Street 3, Tbilisi, Georgia
- Open Mon–Sun 11:00–23:00
- Contact: rklamiani@gmail.com | +995 599 47 20 67
- Premium Georgian wines from Kvareli, Kakhetian region
- Collections: Rkatsiteli, Saperavi, Kindzmarauli, Alazani Valley (white/red)
- Founded 2021, 5 wine varieties, premium quality

You help customers with:
- Wine recommendations (suggest based on taste preferences)
- Wine pairing advice (Georgian cuisine, international food)
- Georgian wine history and traditions (qvevri, 8000 years of winemaking)
- Order and shipping questions
- Store information

Rules:
- Be warm, knowledgeable, slightly poetic about wine
- Keep answers concise (2–4 sentences max unless asked for more)
- Detect the user's language from their message and respond in the SAME language (Georgian, English, or Russian)
- If asked about things unrelated to wine/LAMIANI, gently redirect
- Never invent prices or specific stock availability — tell them to contact the store`;

const ui = {
  GE: { title: 'LAMIANI ასისტენტი', placeholder: 'დამისვი შეკითხვა ღვინის შესახებ...', greeting: 'გამარჯობა! მე ვარ LAMIANI, LAMIANI-ის ღვინის ასისტენტი. როგორ შეიძლება დაგეხმარო?' },
  EN: { title: 'LAMIANI Assistant', placeholder: 'Ask me about our wines...', greeting: "Hello! I'm LAMIANI, LAMIANI's wine assistant. How can I help you today?" },
  RU: { title: 'Ассистент LAMIANI', placeholder: 'Спросите меня о винах...', greeting: 'Привет! Я LAMIANI, винный ассистент LAMIANI. Чем могу помочь?' },
};

const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function ChatBot() {
  const { lang } = useLanguage();
  const t = ui[lang as keyof typeof ui] || ui.EN;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: t.greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: ui[lang as keyof typeof ui]?.greeting || ui.EN.greeting }]);
    historyRef.current = [];
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    historyRef.current.push({ role: 'user', content: text });
    setLoading(true);

    // add empty assistant bubble to stream into
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

    try {
      const { textStream } = streamText({
        model: google('gemini-2.5-flash-lite'),
        system: SYSTEM_PROMPT,
        messages: historyRef.current.map((m) => ({ role: m.role, content: m.content })),
      });

      let reply = '';
      for await (const chunk of textStream) {
        reply += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', text: reply },
        ]);
      }

      historyRef.current.push({ role: 'assistant', content: reply });
    } catch (err: any) {
      console.error('AI error:', err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: '⚠️ ' + (err?.message?.includes('API') ? 'API key error — check .env' : 'Something went wrong. Please try again.') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 rounded-full bg-[#5b1f1f] text-white shadow-2xl shadow-[#5b1f1f]/40 flex items-center justify-center hover:bg-[#6e2626] hover:scale-105 transition-all duration-300"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      <div className={`fixed bottom-24 right-6 z-[299] w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-gray-100 dark:border-[#B89968]/15 flex flex-col transition-all duration-300 origin-bottom-right ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-[#5b1f1f] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold font-serif">{t.title}</p>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-[10px] uppercase tracking-widest">online</span>
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-h-[380px] p-4 flex flex-col gap-3 bg-white dark:bg-[#12151B]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#5b1f1f]/10 dark:bg-[#5b1f1f]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-[#5b1f1f]" />
                </div>
              )}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed font-sans ${
                msg.role === 'user'
                  ? 'bg-[#5b1f1f] text-white rounded-tr-sm'
                  : 'bg-gray-50 dark:bg-[#1E2230] text-[#1a1a1a] dark:text-[#D9D2C6] rounded-tl-sm border border-gray-100 dark:border-[#B89968]/10'
              }`}>
                {msg.text || (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b1f1f]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b1f1f]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b1f1f]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-[#12151B] border-t border-gray-100 dark:border-[#B89968]/10">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1E2230] rounded-xl px-3 py-2 border border-gray-100 dark:border-[#B89968]/10 focus-within:border-[#5b1f1f]/30 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={t.placeholder}
              disabled={loading}
              className="flex-1 bg-transparent outline-none text-sm text-[#1a1a1a] dark:text-[#D9D2C6] placeholder:text-gray-400 dark:placeholder:text-[#555] font-sans"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-[#5b1f1f] disabled:opacity-40 flex items-center justify-center hover:bg-[#6e2626] transition-colors"
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
