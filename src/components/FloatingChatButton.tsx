import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { t } from '@/lib/i18n';

export default function FloatingChatButton() {
  const { locale } = useLocale();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', bounce: 0.5 }}
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40"
    >
      <Link
        to="/chat"
        className="group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-b from-coral-bright to-amber text-cream shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-body text-sm font-medium"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-b from-coral-bright to-amber opacity-40 animate-pulse-ring" />
        <Sparkles size={16} className="relative z-10" />
        <span className="hidden md:inline relative z-10">{t('askAnything', locale).split(' ').slice(0, 2).join(' ')}</span>
      </Link>
    </motion.div>
  );
}
