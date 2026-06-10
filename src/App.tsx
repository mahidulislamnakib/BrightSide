import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ToastNotification from '@/components/Toast';
import FloatingChatButton from '@/components/FloatingChatButton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BangladeshPage = lazy(() => import('@/pages/BangladeshPage'));
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

function Footer() {
  return (
    <footer className="bg-cream border-t border-borderlight/60 pt-12 pb-8 md:pb-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
          <div>
            <span className="font-display text-xl text-charcoal">BrightSide</span>
            <p className="font-body text-sm text-warmgrey mt-1">Hope, engineered.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-6">
            {[
              { label: 'Feed', path: '/feed' },
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Bangladesh', path: '/bangladesh' },
              { label: 'About', path: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.path}
                className="font-body text-sm text-charcoal hover:text-coral transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="text-right">
            <p className="caption-style text-warmgrey">Built with hope</p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="caption-style text-warmgrey hover:text-coral transition-colors">
                Privacy
              </a>
              <a href="#" className="caption-style text-warmgrey hover:text-coral transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-borderlight pt-6">
          <p className="caption-style text-warmgrey text-center">
            &copy; 2026 BrightSide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();

  return (
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
              <Route path="/bangladesh" element={<BangladeshPage />} />
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
  );
}
