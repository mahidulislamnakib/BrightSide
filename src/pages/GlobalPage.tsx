import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, TrendingUp, Users, Leaf } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useLocale } from '@/contexts/LocaleContext';
import { localHeroes } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import ScrollReveal from '@/components/ScrollReveal';
import { t } from '@/lib/i18n';

const REGION_TABS = ['All', 'Africa', 'South Asia', 'Latin America', 'Middle East', 'Southeast Asia', 'Europe', 'North America'];

const REGION_MAP: Record<string, string[]> = {
  'Africa': ['Rwanda', 'Kenya', 'Nigeria'],
  'South Asia': ['Bangladesh', 'Nepal', 'India', 'Pakistan'],
  'Latin America': ['Brazil', 'Colombia', 'Mexico'],
  'Middle East': ['UAE', 'Jordan', 'Lebanon'],
  'Southeast Asia': ['Indonesia', 'Vietnam', 'Philippines'],
  'Europe': ['Netherlands', 'Germany', 'Sweden'],
  'North America': ['USA', 'Canada'],
};

const IMPACT_STATS = [
  { icon: TrendingUp, value: '2.4M', label: 'lives improved', color: '#E8644B' },
  { icon: Users, value: '47', label: 'countries', color: '#F4A261' },
  { icon: Leaf, value: '12K+', label: 'good news stories', color: '#C45C3E' },
  { icon: Globe, value: '89%', label: 'hope score avg', color: '#9B4D36' },
];

export default function GlobalPage() {
  const [activeTab, setActiveTab] = useState('All');
  const { locale } = useLocale();
  const { data: allArticles, isLoading } = trpc.article.list.useQuery({});

  const filteredArticles = activeTab === 'All'
    ? (allArticles ?? [])
    : (allArticles ?? []).filter((a) => REGION_MAP[activeTab]?.includes(a.region));

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#2A2620] to-charcoal py-20 md:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral rounded-full blur-[150px]" />
        </div>
        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="caption-style text-amber tracking-[0.12em] mb-6 block">
            {t('global', locale)}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-[56px] text-cream leading-tight tracking-tight mb-5">
            Good News Worldwide
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-body text-base text-cream/70 leading-relaxed max-w-lg mx-auto mb-10">
            Discover stories of progress, resilience, and hope from every corner of the globe
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.label} className="glass-dark rounded-card p-4 text-center">
                <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
                <div className="font-display text-xl text-cream">{stat.value}</div>
                <div className="text-[10px] font-body text-cream/50 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Region Filter Tabs */}
        <ScrollReveal>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide snap-x snap-mandatory">
            {REGION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-pill text-sm font-body transition-all duration-300 snap-start ${
                  activeTab === tab
                    ? 'bg-gradient-to-b from-coral-bright to-amber text-cream shadow-card'
                    : 'border border-borderlight text-charcoal hover:border-coral-bright/30 hover:bg-peach'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Articles */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
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
        ) : (
          <div className="space-y-6 mb-16">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <Globe size={48} className="text-warmgrey/30 mx-auto mb-4" />
                <p className="font-body text-warmgrey mb-2">{t('noResults', locale)}</p>
                <button
                  onClick={() => setActiveTab('All')}
                  className="text-coral font-body text-sm hover:underline mt-2"
                >
                  {t('resetFilters', locale)}
                </button>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className="border-l-[3px] border-amber rounded-r-card">
                  <ArticleCard article={{
                    id: String(article.id), title: article.title, summary: article.summary ?? '', content: '', url: article.url,
                    imageUrl: article.imageUrl ?? '/assets/card-community.jpg', publishedAt: article.publishedAt?.toISOString() ?? new Date().toISOString(),
                    source: '', sourceTrust: 0.5, region: article.region, regionTier: article.regionTier, category: article.category,
                    hopeScore: Number(article.hopeScore), verifiedFacts: Number(article.verifiedFacts), systemicImpact: Number(article.systemicImpact),
                    actionability: Number(article.actionability), novelty: Number(article.novelty), representation: Number(article.representation), tier: article.tier,
                  }} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Local Heroes / Global Changemakers */}
        <section className="mb-16">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-8">
              <Users size={24} className="text-coral" />
              <div>
                <span className="caption-style text-amber tracking-[0.12em] block">GLOBAL CHANGEMAKERS</span>
                <h2 className="font-display text-3xl text-charcoal tracking-tight">People Making a Difference</h2>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localHeroes.map((hero, i) => (
              <motion.div
                key={hero.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-peach rounded-card p-7 flex gap-5 items-start hover:shadow-card-hover transition-all duration-300"
              >
                <img src={hero.avatar} alt={hero.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-coral/20" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-charcoal mb-0.5">{hero.name}</h3>
                  <p className="font-body text-xs text-warmgrey mb-2">{hero.role}</p>
                  <p className="font-body text-sm text-coral italic leading-relaxed mb-3 line-clamp-2">&ldquo;{hero.quote}&rdquo;</p>
                  <Link to={`/article/${hero.storyId}`} className="inline-flex items-center gap-2 font-body text-sm font-medium text-amber hover:gap-3 transition-all duration-200">
                    Read Story <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
