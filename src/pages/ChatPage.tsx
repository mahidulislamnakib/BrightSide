import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { trpc } from '@/providers/trpc';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';

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
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-20 pb-4 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-borderlight flex items-center gap-3">
        <Link to="/" className="p-2 text-warmgrey hover:text-coral transition-colors rounded-lg hover:bg-peach">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center">
            <Sparkles size={16} className="text-cream" />
          </div>
          <div>
            <h1 className="font-display text-lg text-charcoal">BrightSide AI</h1>
            <p className="font-body text-[10px] text-warmgrey">Hope-powered story discovery</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-b from-coral-bright to-amber'
                : 'bg-charcoal'
            }`}>
              {msg.role === 'assistant' ? <Bot size={14} className="text-cream" /> : <User size={14} className="text-cream" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block rounded-card-lg px-4 py-3 font-body text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-peach text-charcoal'
                  : 'bg-coral text-cream'
              }`}>
                {msg.content}
              </div>

              {/* Article cards */}
              {msg.articles && msg.articles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="block bg-cream border border-borderlight rounded-card p-3 hover:border-coral-bright/30 hover:shadow-card transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="caption-style text-coral">{article.category.toUpperCase()}</span>
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

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center">
              <Bot size={14} className="text-cream" />
            </div>
            <div className="bg-peach rounded-card-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-warmgrey rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-warmgrey rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-warmgrey rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="px-4 py-2 rounded-pill bg-peach text-charcoal font-body text-xs hover:bg-coral-bright hover:text-cream transition-all border border-borderlight hover:border-transparent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-borderlight">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about good news..."
            className="flex-1 px-4 py-3 rounded-pill border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-full bg-gradient-to-b from-coral-bright to-amber text-cream hover:scale-105 transition-all disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
