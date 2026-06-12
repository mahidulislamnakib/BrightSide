import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { trpc } from '@/providers/trpc';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { t } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  articles?: Array<{ id: number; title: string; summary: string | null; category: string; hopeScore: string; tier: string }>;
}

const SUGGESTIONS = [
  "Find health stories from Africa",
  "Show me environmental innovations",
  "Latest community news",
  "Top gold standard stories",
  "I'm feeling motivated today",
  "What are the stats?",
];

export default function ChatPage() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! I'm your BrightSide assistant. I can help you discover hopeful stories from around the world. What are you interested in?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await utils.chat.send.fetch({ message: text });
      if (result) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          articles: result.articles,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I had trouble processing that. Please try again!" },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-16 pb-0 flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 border-b border-borderlight/60 flex items-center gap-3 glass-light sticky top-16 z-30">
        <Link to="/" className="p-2 text-warmgrey hover:text-coral transition-colors rounded-lg hover:bg-peach flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-cream" />
          </div>
          <div>
            <h1 className="font-display text-base text-charcoal leading-tight">BrightSide AI</h1>
            <p className="font-body text-[10px] text-warmgrey">Hope-powered story discovery</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-body text-[10px] text-warmgrey">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] as const }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-b from-coral-bright to-amber'
                  : 'bg-charcoal'
              }`}>
                {msg.role === 'assistant' ? <Bot size={12} className="text-cream" /> : <User size={12} className="text-cream" />}
              </div>
              <div className={`max-w-[82%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-peach text-charcoal rounded-tl-sm'
                    : 'bg-coral text-cream rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>

                {/* Article cards */}
                {msg.articles && msg.articles.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {msg.articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.id}`}
                        className="block bg-cream border border-borderlight rounded-card p-3 hover:border-coral-bright/30 hover:shadow-card transition-all text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="caption-style text-coral">{article.category.toUpperCase()}</span>
                          <span className="w-1 h-1 rounded-full bg-borderlight" />
                          <span className="caption-style text-warmgrey">Score: {Math.round(Number(article.hopeScore) * 100)}</span>
                        </div>
                        <p className="font-body text-sm text-charcoal line-clamp-2">{article.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center flex-shrink-0">
              <Bot size={12} className="text-cream" />
            </div>
            <div className="bg-peach rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-warmgrey/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-warmgrey/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-warmgrey/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 pt-4"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="px-4 py-2 rounded-pill bg-peach text-charcoal/80 font-body text-xs hover:bg-coral-bright hover:text-cream transition-all border border-borderlight hover:border-transparent"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-3 border-t border-borderlight/60 bg-cream/80 backdrop-blur-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('askAnything', locale)}
            className="flex-1 px-4 py-2.5 rounded-pill border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral-bright/50 focus:shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-full bg-gradient-to-b from-coral-bright to-amber text-cream hover:scale-105 transition-all disabled:opacity-30 shadow-sm flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
