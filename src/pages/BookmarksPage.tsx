import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ArrowRight, BookOpen } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import ScrollReveal from '@/components/ScrollReveal';
import ArticleCard from '@/components/ArticleCard';

export default function BookmarksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: bookmarkedArticles, isLoading } = trpc.bookmark.list.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: false }
  );
  const { data: count } = trpc.bookmark.count.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: false }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-coral-bright border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20 px-6">
        <div className="text-center max-w-md">
          <Bookmark size={48} className="text-coral mx-auto mb-4" />
          <h2 className="font-display text-2xl text-charcoal mb-2">Sign in to Save Stories</h2>
          <p className="font-body text-warmgrey mb-6">
            Create an account to bookmark your favorite good news stories and build your personal reading list.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark size={28} className="text-coral" />
            <h1 className="font-display text-4xl text-charcoal tracking-tight">Your Bookmarks</h1>
          </div>
          <p className="font-body text-warmgrey mb-8">
            {count !== undefined ? `${count} saved stor${count === 1 ? 'y' : 'ies'}` : 'Loading...'}
          </p>
        </ScrollReveal>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-peach rounded-card p-5">
                <div className="skeleton-shimmer h-24 w-full" />
              </div>
            ))}
          </div>
        ) : bookmarkedArticles && bookmarkedArticles.length > 0 ? (
          <div className="space-y-6">
            {bookmarkedArticles.map((item) => (
              <motion.div
                key={item.bookmarkId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ArticleCard
                  article={{
                    id: String(item.id),
                    title: item.title,
                    summary: item.summary ?? '',
                    content: '',
                    url: '#',
                    imageUrl: item.imageUrl ?? '/assets/card-community.jpg',
                    publishedAt: item.publishedAt?.toISOString() ?? new Date().toISOString(),
                    source: '',
                    sourceTrust: 0.5,
                    region: item.region,
                    regionTier: 'global',
                    category: item.category,
                    hopeScore: Number(item.hopeScore),
                    verifiedFacts: 0,
                    systemicImpact: 0,
                    actionability: 0,
                    novelty: 0,
                    representation: 0,
                    tier: item.tier,
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-warmgrey/40 mx-auto mb-4" />
            <h3 className="font-display text-xl text-charcoal mb-2">No bookmarks yet</h3>
            <p className="font-body text-warmgrey mb-6 max-w-md mx-auto">
              Start exploring good news and bookmark stories that inspire you. Your collection will appear here.
            </p>
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all"
            >
              Explore Stories
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
