import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string) {
  const toast = { id: Date.now().toString(), message };
  toastListeners.forEach((l) => l(toast));
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter((l) => l !== listener); };
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
            className="glass-dark text-cream text-sm font-body px-5 py-3 rounded-card whitespace-nowrap"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
