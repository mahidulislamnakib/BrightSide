import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import ToastNotification from "@/components/Toast";
import FloatingChatButton from "@/components/FloatingChatButton";

const HomePage = lazy(() => import("@/pages/HomePage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const GlobalPage = lazy(() => import("@/pages/GlobalPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const BookmarksPage = lazy(() => import("@/pages/BookmarksPage"));
const SubmitPage = lazy(() => import("@/pages/SubmitPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-peach-light to-cream flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8644B] to-[#F4A261] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="font-display text-cream text-xl font-bold">B</span>
        </div>
        <span className="font-display text-2xl text-charcoal">BrightSide</span>
        <div className="mt-4 w-8 h-8 border-2 border-[#E8644B] border-t-transparent rounded-full animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
    >
      {children}
    </motion.div>
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
  );
}

function Footer() {
  const { locale } = useLocale();

  return (
    <footer className="bg-charcoal text-cream/80">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8644B] to-[#F4A261] flex items-center justify-center">
                <span className="font-display text-cream text-sm font-bold">B</span>
              </div>
              <span className="font-display text-lg text-cream">BrightSide</span>
            </div>
            <p className="font-body text-[13px] text-cream/50 leading-relaxed mb-5 max-w-xs">
              Evidence-based good news from around the world. Every story ranked by real impact using our proprietary Hope Score AI.
            </p>
            <div className="flex items-center gap-3">
              {["X", "Instagram", "LinkedIn"].map((social) => (
                <button
                  key={social}
                  className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center text-cream/40 hover:bg-[#E8644B] hover:text-cream transition-all duration-200 text-[10px] font-body font-medium"
                >
                  {social[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Discover Column */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/40 mb-4">
              Discover
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: t("feed", locale), path: "/feed" },
                { label: t("dashboard", locale), path: "/dashboard" },
                { label: t("global", locale), path: "/global" },
                { label: "Bookmarks", path: "/bookmarks" },
                { label: "AI Assistant", path: "/chat" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-body text-[13px] text-cream/60 hover:text-[#F4A261] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Community Column */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/40 mb-4">
              Community
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Submit a Story", path: "/submit" },
                { label: "Share Cards", path: "/feed" },
                { label: "Hope Score", path: "/dashboard" },
                { label: "Sources", path: "/global" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="font-body text-[13px] text-cream/60 hover:text-[#F4A261] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/40 mb-4">
              {t("morningBriefTitle", locale)}
            </h4>
            <p className="font-body text-[13px] text-cream/50 mb-4 leading-relaxed">
              {t("morningBriefDesc", locale)}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3.5 py-2 rounded-lg bg-cream/10 border border-cream/10 font-body text-[13px] text-cream placeholder:text-cream/30 focus:outline-none focus:border-[#F4A261]/40 transition-colors"
              />
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#E8644B] to-[#F4A261] text-cream font-body text-[12px] font-medium hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap">
                {t("subscribe", locale)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[11px] text-cream/30">
            &copy; 2026 BrightSide. {t("hopeIsPractice", locale)}
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "About"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-body text-[11px] text-cream/30 hover:text-cream/60 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
