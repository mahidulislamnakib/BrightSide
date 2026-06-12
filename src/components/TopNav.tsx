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
    { label: t('global', locale), path: '/global' },
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'glass-light shadow-[0_4px_24px_rgba(26,24,20,0.07)] border-b border-borderlight/60'
          : 'bg-transparent'
      }`}
    >
      <div className="h-full flex items-center justify-between px-5 md:px-8 lg:px-10 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral-bright to-amber flex items-center justify-center">
            <span className="font-display text-cream text-sm font-bold">B</span>
          </div>
          <span className="font-display text-[20px] text-charcoal tracking-tight">
            BrightSide
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3 py-2 rounded-lg font-body text-[14px] font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? 'text-coral'
                  : 'text-charcoal/70 hover:text-coral hover:bg-peach/50'
              }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div layoutId="activeNav" className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-coral-bright to-amber rounded-full" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">
          <SearchBox />
          <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-peach text-charcoal text-xs font-body font-medium hover:bg-coral-bright hover:text-cream transition-all duration-300">
            <Sparkles size={12} />
            AI
          </Link>
          <Link to="/submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-gradient-to-b from-coral-bright to-amber text-cream text-xs font-body font-medium hover:scale-105 transition-all shadow-sm">
            <Send size={12} />
            {t('submit', locale)}
          </Link>

          <div className="w-px h-5 bg-borderlight mx-1" />

          <LanguageSwitcher locale={locale} onChange={setLocale} />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ''} className="w-7 h-7 rounded-full object-cover ring-2 ring-borderlight" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center">
                    <User size={14} className="text-cream" />
                  </div>
                )}
                <span className="font-body text-sm text-charcoal max-w-[80px] truncate">{user.name || 'User'}</span>
              </div>
              <button onClick={logout} className="p-1.5 text-warmgrey hover:text-coral transition-colors rounded-lg hover:bg-peach" title={t('logout', locale)}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-body text-sm font-medium text-charcoal/80 hover:text-coral transition-colors px-2 py-1 rounded-lg hover:bg-peach/50"
            >
              {t('login', locale)}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-charcoal rounded-lg hover:bg-peach transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
            className="md:hidden glass-light border-t border-borderlight/60 overflow-hidden"
          >
            <nav className="flex flex-col px-5 py-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-[15px] font-medium py-2.5 px-3 rounded-lg transition-colors ${
                    location.pathname === link.path ? 'text-coral bg-peach/50' : 'text-charcoal hover:bg-peach/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-borderlight/50 my-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="font-body text-sm text-warmgrey">Language</span>
                  <LanguageSwitcher locale={locale} onChange={setLocale} />
                </div>
              </div>
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="font-body text-[15px] font-medium py-2.5 px-3 text-warmgrey text-left flex items-center gap-2 rounded-lg hover:bg-peach/30 transition-colors">
                  <LogOut size={16} /> {t('logout', locale)}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="font-body text-[15px] font-medium py-2.5 px-3 text-coral rounded-lg hover:bg-peach/50 transition-colors">
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill border border-borderlight/80 bg-cream/60 focus-within:border-coral-bright/50 focus-within:bg-cream focus-within:shadow-sm transition-all">
          <Search size={14} className="text-warmgrey/60 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t('search', locale)}
            className="bg-transparent font-body text-sm text-charcoal placeholder:text-warmgrey/50 w-28 focus:w-44 transition-all outline-none"
          />
        </div>
      </form>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 glass-light rounded-card border border-borderlight shadow-card-hover z-50 p-2"
          >
            {isLoading ? (
              <div className="p-4 text-center font-body text-sm text-warmgrey">Searching...</div>
            ) : results && results.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.id}`}
                    onClick={() => { setOpen(false); setQuery(''); }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-peach/60 transition-colors"
                  >
                    <img src={article.imageUrl ?? ''} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-body text-sm text-charcoal truncate">{article.title}</p>
                      <p className="font-body text-xs text-warmgrey">{article.category} &middot; Score: {Math.round(Number(article.hopeScore) * 100)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center font-body text-sm text-warmgrey">No results found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
