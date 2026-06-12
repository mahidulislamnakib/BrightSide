import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sunrise, FileText, BarChart3, Globe, Bookmark } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { t } from '@/lib/i18n';

export default function BottomNav() {
  const location = useLocation();
  const { locale } = useLocale();

  const navItems = [
    { icon: Sunrise, label: t('home', locale), path: '/' },
    { icon: FileText, label: t('feed', locale), path: '/feed' },
    { icon: Bookmark, label: t('bookmarks', locale), path: '/bookmarks' },
    { icon: BarChart3, label: t('dashboard', locale), path: '/dashboard' },
    { icon: Globe, label: t('global', locale), path: '/global' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 glass-light border-t border-borderlight/50 md:hidden">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 relative min-w-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-coral-bright to-amber"
                  transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.25 }}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-coral-bright' : 'text-warmgrey/60'}
                />
              </motion.div>
              <span
                className={`text-[10px] font-body font-semibold uppercase tracking-wider ${
                  isActive ? 'text-coral-bright' : 'text-warmgrey/50'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
