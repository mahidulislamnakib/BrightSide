import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sunrise, FileText, BarChart3, Globe, Bookmark } from 'lucide-react';

const navItems = [
  { icon: Sunrise, label: 'Home', path: '/' },
  { icon: FileText, label: 'Feed', path: '/feed' },
  { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
  { icon: Globe, label: 'Global', path: '/bangladesh' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 glass-light border-t border-borderlight/60 md:hidden">
      <div className="h-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute -top-0.5 w-1 h-1 rounded-full bg-coral-bright"
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.2 }}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-coral-bright' : 'text-warmgrey'}
                />
              </motion.div>
              <span
                className={`text-[11px] font-body font-semibold uppercase tracking-wider ${
                  isActive ? 'text-coral-bright' : 'text-warmgrey'
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