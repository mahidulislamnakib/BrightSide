import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, FileText, BarChart3, Globe, Bookmark } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileText, label: "Feed", path: "/feed" },
  { icon: BarChart3, label: "Stats", path: "/dashboard" },
  { icon: Globe, label: "Global", path: "/global" },
  { icon: Bookmark, label: "Saved", path: "/bookmarks" },
];

export default function BottomNav() {
  const location = useLocation();
  const { locale } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] glass-light border-t border-borderlight/40 md:hidden">
      <div className="h-full flex items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 relative min-w-[52px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-gradient-to-r from-[#E8644B] to-[#F4A261]"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", bounce: 0.4, duration: 0.2 }}>
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "text-[#E8644B]" : "text-warmgrey/40"}
                />
              </motion.div>
              <span className={`text-[9.5px] font-body font-medium ${isActive ? "text-[#E8644B]" : "text-warmgrey/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
