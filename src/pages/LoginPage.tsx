import { useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function LoginPage() {
  const { data: authUrl } = trpc.auth.url.useQuery();

  // Warm particle glow effect
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-peach-light to-cream flex items-center justify-center relative overflow-hidden">
      {/* Subtle glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral-bright/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] as const }}
        className="relative z-10 w-full max-w-sm mx-6"
      >
        <div className="glass-light rounded-card-lg p-8 border border-peach-light/50 shadow-card">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-charcoal mb-2">BrightSide</h1>
            <p className="font-body text-sm text-warmgrey">Sign in to save stories, track progress, and set your Hope Budget.</p>
          </div>

          <button
            onClick={() => {
              window.location.href = authUrl?.url || getOAuthUrl();
            }}
            className="w-full py-3.5 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-[15px] font-medium hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
          >
            Sign in with Kimi
          </button>

          <p className="text-center font-body text-xs text-warmgrey mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
