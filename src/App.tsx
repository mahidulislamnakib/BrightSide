import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LocaleProvider } from '@/contexts/LocaleContext';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ToastNotification from '@/components/Toast';
import FloatingChatButton from '@/components/FloatingChatButton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const GlobalPage = lazy(() => import('@/pages/GlobalPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));
const SubmitPage = lazy(() => import('@/pages/SubmitPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-peach-light to-cream flex flex-col items-center justify-center">
      <span className="font-display text-3xl text-charcoal mb-4">BrightSide</span>
      <div className="w-10 h-10 rounded-full bg-gradient-to-b from-coral-bright to-amber animate-pulse" />
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-cream">
        <TopNav />

        <AnimatePresence mode="wait">
          <Suspense key={location.pathname} fallback={<LoadingScreen />}>
            <PageTransition>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/global" element={<GlobalPage />} />
                <Route path="/bangladesh" element={<GlobalPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/submit" element={<SubmitPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </AnimatePresence>

        <Footer />
        <BottomNav />
        <FloatingChatButton />
        <ToastNotification />
      </div>
    </LocaleProvider>
  );
}

import { useLocale } from '@/contexts/LocaleContext';
import { t } from '@/lib/i18n';

function Footer() {
  const { locale } = useLocale();

  return (
    <footer className="bg-cream border-t border-borderlight/60 pt-14 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-coral-bright to-amber flex items-center justify-center">
                <span className="font-display text-cream text-xs font-bold">B</span>
              </div>
              <span className="font-display text-lg text-charcoal">BrightSide</span>
            </div>
            <p className="font-body text-xs text-warmgrey">Hope, engineered.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-5">
            {[
              { label: t('feed', locale), path: '/feed' },
              { label: t('dashboard', locale), path: '/dashboard' },
              { label: t('global', locale), path: '/global' },
              { label: 'About', path: '#' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="font-body text-sm text-charcoal/70 hover:text-coral transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Email Signup */}
        <div className="border-t border-borderlight/60 pt-8 pb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-display text-lg text-charcoal mb-1">{t('morningBriefTitle', locale)}</h4>
            <p className="font-body text-sm text-warmgrey mb-4">{t('morningBriefDesc', locale)}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-pill border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral-bright/50 focus:shadow-sm transition-all"
              />
              <button className="px-5 py-2.5 rounded-pill bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-105 transition-all shadow-sm">
                {t('subscribe', locale)}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-borderlight/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="caption-style text-warmgrey/60">
            &copy; 2026 BrightSide. {t('hopeIsPractice', locale)}
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-body text-xs text-warmgrey/60 hover:text-coral transition-colors">
              Privacy
            </a>
            <a href="#" className="font-body text-xs text-warmgrey/60 hover:text-coral transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
