import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function FloatingChatButton() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', bounce: 0.5 }}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50"
    >
      <Link
        to="/chat"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-b from-coral-bright to-amber text-cream shadow-lg hover:scale-105 transition-all font-body text-sm font-medium"
      >
        <Sparkles size={18} />
        <span className="hidden md:inline">Ask AI</span>
      </Link>
    </motion.div>
  );
}
