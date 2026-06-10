import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Search, Sparkles, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/contexts/LocaleContext';
import { trpc } from '@/providers/trpc';
import LanguageSwitcher from './LanguageSwitcher';
import { t } from '@/lib/i18n';

export default function TopNav() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 100);
      setHidden(y > lastScrollY && y > 200);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: t('home', locale), path: '/' },
    { label: t('feed', locale), path: '/feed' },
    { label: t('bookmarks', locale), path: '/bookmarks' },
    { label: t('dashboard', locale), path: '/dashboard' },
    { label: t('global', locale), path: '/bangladesh' },
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'glass-light shadow-[0_4px_20px_rgba(26,24,20,0.06)] border-b border-borderlight/60'
          : 'bg-transparent'
      }`}
    >
      <div className="h-full flex items-center justify-between px-6 lg:px-10 max-w-[1440px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-[22px] text-charcoal" style={{ textShadow: '0 0 20px rgba(232,100,75,0.15)' }}>
            BrightSide
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative font-body text-[15px] font-medium transition-colors duration-150 ${
                location.pathname === link.path ? 'text-coral' : 'text-charcoal hover:text-coral'
              }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-coral-bright to-amber" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <SearchBox />
          <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-peach text-charcoal text-xs font-body font-medium hover:bg-coral-bright hover:text-cream transition-all duration-300">
            <Sparkles size={12} />
            AI
          </Link>
          <Link to="/submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-gradient-to-b from-coral-bright to-amber text-cream text-xs font-body font-medium hover:scale-105 transition-all">
            <Send size={12} />
            {t('submit', locale)}
          </Link>

          <LanguageSwitcher locale={locale} onChange={setLocale} />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ''} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center">
                    <User size={14} className="text-cream" />
                  </div>
                )}
                <span className="font-body text-sm text-charcoal">{user.name || 'User'}</span>
              </div>
              <button onClick={logout} className="p-1.5 text-warmgrey hover:text-coral transition-colors" title={t('logout', locale)}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-body text-sm font-medium text-charcoal hover:text-coral transition-colors"
            >
              {t('login', locale)}
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 text-charcoal" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-light border-t border-borderlight/60 overflow-hidden">
            <nav className="flex flex-col px-6 py-4 gap-3">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`font-body text-[15px] font-medium py-2 ${location.pathname === link.path ? 'text-coral' : 'text-charcoal'}`}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="font-body text-[15px] font-medium py-2 text-warmgrey text-left flex items-center gap-2">
                  <LogOut size={16} /> {t('logout', locale)}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="font-body text-[15px] font-medium py-2 text-coral">
                  {t('login', locale)}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function SearchBox() {
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: results, isLoading } = trpc.article.search.useQuery(
    { q: query },
    { enabled: query.length >= 2 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/feed?search=${encodeURIComponent(query)}`);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill border border-borderlight bg-cream/50 focus-within:border-coral-bright transition-colors">
          <Search size={14} className="text-warmgrey" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t('search', locale)}
            className="bg-transparent font-body text-sm text-charcoal placeholder:text-warmgrey/60 w-32 focus:w-48 transition-all outline-none"
          />
        </div>
      </form>

      {open && query.length >= 2 && (
        <div className="absolute top-full right-0 mt-2 w-80 glass-light rounded-card border border-borderlight shadow-card-hover z-50 p-2">
          {isLoading ? (
            <div className="p-4 text-center font-body text-sm text-warmgrey">Searching...</div>
          ) : results && results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {results.map((article) => (
                <a
                  key={article.id}
                  href={`/article/${article.id}`}
                  onClick={() => { setOpen(false); setQuery(''); }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-peach/50 transition-colors"
                >
                  <img src={article.imageUrl ?? ''} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-body text-sm text-charcoal truncate">{article.title}</p>
                    <p className="font-body text-xs text-warmgrey">{article.category} &middot; Score: {Math.round(Number(article.hopeScore) * 100)}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center font-body text-sm text-warmgrey">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
