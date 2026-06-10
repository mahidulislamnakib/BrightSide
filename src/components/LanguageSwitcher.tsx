import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { LOCALES, type Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-warmgrey hover:text-charcoal hover:bg-peach transition-all"
        title="Change language"
      >
        <Globe size={16} />
        <span className="font-body text-xs">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-44 glass-light rounded-card border border-borderlight shadow-card z-50 overflow-hidden"
            >
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { onChange(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-all ${
                    l.code === locale
                      ? 'bg-peach text-coral font-medium'
                      : 'text-charcoal hover:bg-peach/50'
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
