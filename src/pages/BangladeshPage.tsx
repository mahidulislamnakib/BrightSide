import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { localHeroes } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import ScrollReveal from '@/components/ScrollReveal';

const BANGLADESH_CATEGORIES = ['All', 'Climate Adaptation', 'Economic Empowerment', 'Education', 'Health', 'Innovation', 'Community'];

const CATEGORY_MAP: Record<string, string> = {
  'Climate Adaptation': 'Environment',
  'Economic Empowerment': 'Economic',
  'Education': 'Education',
  'Health': 'Health',
  'Innovation': 'Innovation',
  'Community': 'Community',
};

export default function BangladeshPage() {
  const [activeTab, setActiveTab] = useState('All');
  const { data: bangladeshArticles, isLoading } = trpc.article.byRegion.useQuery({ region: 'Bangladesh' });

  const filteredArticles = activeTab === 'All'
    ? (bangladeshArticles ?? [])
    : (bangladeshArticles ?? []).filter((a) => a.category === CATEGORY_MAP[activeTab]);

  const quickStats = [
    { value: '50M+', label: 'lives improved' },
    { value: '97%', label: 'literacy growth' },
    { value: "World's largest", label: 'NGO' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative bg-gradient-to-b from-[#2A2620] to-charcoal py-20 md:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: 'url(/assets/bangladesh-hero-bg.jpg)' }} />
        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="caption-style text-amber tracking-[0.12em] mb-6 block">SPECIAL FOCUS</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-[56px] text-cream leading-tight tracking-tight mb-5">Bangladesh Rising</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-body text-base text-cream/70 leading-relaxed max-w-lg mx-auto mb-10">Stories of resilience, innovation, and progress from the delta</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-dark rounded-pill px-6 py-3">
                <div className="font-display text-lg text-amber">{stat.value}</div>
                <div className="text-[11px] font-body text-cream/60 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <ScrollReveal>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {BANGLADESH_CATEGORIES.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-5 py-2.5 rounded-pill text-sm font-body transition-all duration-300 ${activeTab === tab ? 'bg-gradient-to-b from-coral-bright to-amber text-cream' : 'border border-borderlight text-charcoal hover:border-coral-bright/30'}`}>{tab}</button>
            ))}
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-peach rounded-card p-5"><div className="skeleton-shimmer h-24 w-full" /></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 mb-16">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16"><p className="font-body text-warmgrey">No stories found for this category yet.</p></div>
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

        <section className="mb-16">
          <ScrollReveal>
            <span className="caption-style text-amber tracking-[0.12em] mb-6 block">LOCAL HEROES</span>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localHeroes.map((hero, i) => (
              <motion.div key={hero.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-peach rounded-card p-7 text-center">
                <img src={hero.avatar} alt={hero.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="font-display text-xl text-charcoal mb-1">{hero.name}</h3>
                <p className="font-body text-sm text-warmgrey mb-3">{hero.role}</p>
                <p className="font-body text-sm text-coral italic mb-4">&ldquo;{hero.quote}&rdquo;</p>
                <Link to={`/article/${hero.storyId}`} className="inline-flex items-center gap-2 font-body text-sm font-medium text-amber hover:gap-3 transition-all duration-200">Read Story <ArrowRight size={14} /></Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
