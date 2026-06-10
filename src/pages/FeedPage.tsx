import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import type { Mood } from '@/lib/classifier';
import type { Article } from '@/data/articles';
import { REGIONS } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import ShareCardGenerator from '@/components/ShareCardGenerator';
import ScrollReveal from '@/components/ScrollReveal';

const MOODS: { key: Mood; label: string; emoji: string }[] = [
  { key: 'motivated', label: 'Motivated', emoji: '\uD83D\uDE80' },
  { key: 'calm', label: 'Calm', emoji: '\uD83D\uDE0C' },
  { key: 'informed', label: 'Informed', emoji: '\uD83E\uDDE0' },
  { key: 'inspired', label: 'Inspired', emoji: '\uD83D\uDCAA' },
];

const CATEGORIES_LIST = ['Health', 'Environment', 'Innovation', 'Community', 'Economic', 'Peace'];

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mood, setMood] = useState<Mood | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [shareArticle, setShareArticle] = useState<Article | null>(null);

  // Fetch articles from tRPC
  const utils = trpc.useUtils();

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleTier = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const resetFilters = () => {
    setMood(null);
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedTiers([]);
    setSearchParams({});
  };

  const { data: articles, isLoading } = trpc.article.list.useQuery(
    {
      category: selectedCategories[0],
      region: selectedRegions[0],
      tier: selectedTiers[0],
      mood: mood || undefined,
    }
  );

  const scrapeMutation = trpc.scraper.scrape.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate();
      utils.article.featured.invalidate();
    },
  });

  const articleCount = articles?.length ?? 0;

  // Split articles into groups of 10 for "Take a Break" interstitials
  const articleGroups: NonNullable<typeof articles>[] = [];
  if (articles) {
    for (let i = 0; i < articles.length; i += 10) {
      articleGroups.push(articles.slice(i, i + 10));
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <h1 className="font-display text-4xl md:text-[44px] text-charcoal mb-2 tracking-tight">News Feed</h1>
          <div className="flex items-center gap-4 mb-8">
            <p className="font-body text-base text-warmgrey">
              {isLoading ? 'Loading stories...' : `${articleCount} stories matching your filters`}
            </p>
            <button
              onClick={() => scrapeMutation.mutate({})}
              disabled={scrapeMutation.isPending}
              className="text-xs font-body text-coral border border-coral/30 rounded-pill px-3 py-1 hover:bg-coral hover:text-cream transition-all disabled:opacity-50"
            >
              {scrapeMutation.isPending ? 'Scraping...' : '↻ Refresh Sources'}
            </button>
            {scrapeMutation.isSuccess && (
              <span className="text-xs font-body text-green-600">
                +{scrapeMutation.data.totalNew} new
              </span>
            )}
          </div>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTER SIDEBAR */}
          <aside className="w-full lg:w-60 lg:sticky lg:top-24 lg:self-start flex-shrink-0">
            <div className="space-y-6">
              {/* Mood */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">MOOD</h3>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMood(mood === m.key ? null : m.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-body transition-all duration-300 ${
                        mood === m.key
                          ? 'bg-gradient-to-b from-coral-bright to-amber text-cream'
                          : 'border border-borderlight text-charcoal hover:border-coral-bright/30'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">CATEGORY</h3>
                <div className="space-y-2">
                  {CATEGORIES_LIST.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                          selectedCategories.includes(cat)
                            ? 'bg-gradient-to-b from-coral-bright to-amber border-transparent'
                            : 'border-borderlight group-hover:border-coral-bright/40'
                        }`}
                      >
                        {selectedCategories.includes(cat) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="font-body text-sm text-charcoal">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">REGION</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {REGIONS.map((region) => (
                    <label key={region} className="flex items-center gap-3 cursor-pointer group">
                      <button
                        onClick={() => toggleRegion(region)}
                        className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                          selectedRegions.includes(region)
                            ? 'bg-gradient-to-b from-coral-bright to-amber border-transparent'
                            : 'border-borderlight group-hover:border-coral-bright/40'
                        }`}
                      >
                        {selectedRegions.includes(region) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="font-body text-sm text-charcoal">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tier */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">TIER</h3>
                <div className="flex flex-wrap gap-2">
                  {['gold', 'verified', 'constructive'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`px-4 py-1.5 rounded-pill text-xs font-body uppercase tracking-wider transition-all duration-300 ${
                        selectedTiers.includes(tier)
                          ? 'bg-gradient-to-b from-coral-bright to-amber text-cream'
                          : 'border border-borderlight text-charcoal hover:border-coral-bright/30'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={resetFilters} className="text-sm font-body text-coral hover:text-coral-bright transition-colors">
                Reset Filters
              </button>
            </div>
          </aside>

          {/* ARTICLE FEED */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-peach rounded-card p-5">
                    <div className="flex gap-5">
                      <div className="skeleton-shimmer w-[35%] aspect-[16/10] rounded-card flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="skeleton-shimmer h-3 w-1/4" />
                        <div className="skeleton-shimmer h-5 w-3/4" />
                        <div className="skeleton-shimmer h-3 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articleCount === 0 ? (
              <ScrollReveal>
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">\uD83C\uDF10</div>
                  <h3 className="font-display text-xl text-charcoal mb-2">No stories match your filters</h3>
                  <p className="font-body text-sm text-warmgrey mb-6">Try adjusting your mood or categories to discover more good news.</p>
                  <button onClick={resetFilters} className="px-6 py-2.5 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium">
                    Reset Filters
                  </button>
                </div>
              </ScrollReveal>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {articleGroups.map((group, gi) => (
                    <div key={gi}>
                      {group.map((article) => (
                        <div key={article.id} className="mb-6">
                          <ArticleCard
                            onShare={(a) => setShareArticle(a)}
                            article={{
                            id: String(article.id),
                            title: article.title,
                            summary: article.summary ?? '',
                            content: '',
                            url: article.url,
                            imageUrl: article.imageUrl ?? '/assets/card-community.jpg',
                            publishedAt: article.publishedAt?.toISOString() ?? new Date().toISOString(),
                            source: '',
                            sourceTrust: 0.5,
                            region: article.region,
                            regionTier: article.regionTier,
                            category: article.category,
                            hopeScore: Number(article.hopeScore),
                            verifiedFacts: Number(article.verifiedFacts),
                            systemicImpact: Number(article.systemicImpact),
                            actionability: Number(article.actionability),
                            novelty: Number(article.novelty),
                            representation: Number(article.representation),
                            tier: article.tier,
                          }} />
                        </div>
                      ))}
                      {gi < articleGroups.length - 1 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-charcoal rounded-card p-8 text-center my-8">
                          <p className="font-body text-cream mb-4">
                            You&apos;ve read {((gi + 1) * 10)} stories. Take a breath —<span className="text-amber"> progress takes rest too.</span>
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <button className="px-6 py-2.5 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium">Continue</button>
                            <span className="text-cream/50 font-body text-sm cursor-pointer hover:text-cream/80 transition-colors">I&apos;m Done</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Share Card Generator Modal */}
        <ShareCardGenerator
          isOpen={!!shareArticle}
          onClose={() => setShareArticle(null)}
          article={shareArticle ? {
            title: shareArticle.title,
            summary: shareArticle.summary,
            category: shareArticle.category,
            hopeScore: shareArticle.hopeScore,
            tier: shareArticle.tier,
            region: shareArticle.region,
          } : null}
        />
      </div>
    </div>
  );
}
