import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Search, Sparkles, Send, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/providers/trpc";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "@/lib/i18n";

const NAV_LINKS = [
  { label: "Home", path: "/", icon: null },
  { label: "Feed", path: "/feed", icon: null },
  { label: "Dashboard", path: "/dashboard", icon: null },
  { label: "Global", path: "/global", icon: Globe },
  { label: "Bookmarks", path: "/bookmarks", icon: null },
];

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
      setScrolled(y > 60);
      setHidden(y > lastScrollY && y > 200);
      setLastScrollY(y);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-light shadow-[0_4px_30px_rgba(26,24,20,0.08)] border-b border-borderlight/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8644B] to-[#F4A261] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="font-display text-cream text-[15px] font-bold leading-none">B</span>
          </div>
          <span className="font-display text-[19px] text-charcoal tracking-tight">BrightSide</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3.5 py-2 rounded-lg text-[13.5px] font-body font-medium transition-all duration-200 flex items-center gap-1.5 ${
                location.pathname === link.path
                  ? "text-[#E8644B] bg-[#F4A261]/10"
                  : "text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5"
              }`}
            >
              {link.icon && <link.icon size={14} />}
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 rounded-lg bg-[#F4A261]/10 border border-[#E8644B]/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-2">
          <SearchBox />

          <Link
            to="/chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-peach/60 text-charcoal/80 text-xs font-body font-medium hover:bg-[#E8644B] hover:text-cream transition-all duration-200"
          >
            <Sparkles size={12} />
            AI
          </Link>

          <Link
            to="/submit"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E8644B] to-[#F4A261] text-cream text-xs font-body font-medium hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <Send size={12} />
            {t("submit", locale)}
          </Link>

          <div className="w-px h-5 bg-borderlight/60 mx-1" />

          <LanguageSwitcher locale={locale} onChange={setLocale} />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-1">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-borderlight/50" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8644B] to-[#F4A261] flex items-center justify-center">
                  <User size={13} className="text-cream" />
                </div>
              )}
              <button
                onClick={logout}
                className="p-1.5 text-warmgrey/60 hover:text-[#E8644B] transition-colors rounded-lg hover:bg-peach/50"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-[13px] font-body font-medium text-charcoal/70 hover:text-[#E8644B] transition-colors px-3 py-1.5 rounded-lg hover:bg-peach/40"
            >
              {t("login", locale)}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-charcoal rounded-lg hover:bg-peach/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden glass-light border-t border-borderlight/40 overflow-hidden"
          >
            <nav className="flex flex-col px-5 py-3 gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 font-body text-[14px] font-medium py-2.5 px-3 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "text-[#E8644B] bg-[#F4A261]/10"
                      : "text-charcoal/70 hover:bg-charcoal/5"
                  }`}
                >
                  {link.icon && <link.icon size={16} />}
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-borderlight/40 my-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="font-body text-[13px] text-warmgrey">Language</span>
                  <LanguageSwitcher locale={locale} onChange={setLocale} />
                </div>
              </div>
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 font-body text-[14px] text-warmgrey py-2.5 px-3 rounded-lg hover:bg-charcoal/5 text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-[14px] text-[#E8644B] py-2.5 px-3 rounded-lg hover:bg-peach/50"
                >
                  Sign In
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: results } = trpc.article.search.useQuery(
    { q: query },
    { enabled: query.length >= 2 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/feed?search=${encodeURIComponent(query)}`);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-borderlight/60 bg-cream/50 focus-within:border-[#E8644B]/30 focus-within:bg-cream focus-within:shadow-sm transition-all">
          <Search size={14} className="text-warmgrey/50 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t("search", locale)}
            className="bg-transparent font-body text-[13px] text-charcoal placeholder:text-warmgrey/40 w-24 focus:w-40 transition-all outline-none"
          />
        </div>
      </form>
      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 glass-light rounded-xl border border-borderlight/60 shadow-xl z-50 p-2"
          >
            {results && results.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-peach/50 transition-colors"
                  >
                    <img src={article.imageUrl ?? ""} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-body text-[13px] text-charcoal truncate">{article.title}</p>
                      <p className="font-body text-[11px] text-warmgrey/60">{article.category} · Score {Math.round(Number(article.hopeScore) * 100)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center font-body text-[13px] text-warmgrey/60">No results found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
