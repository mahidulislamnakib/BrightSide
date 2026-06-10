import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WarmParticleFlow from '@/components/WarmParticleFlow';
import LuminousHopeOrb from '@/components/LuminousHopeOrb';
import ScrollReveal from '@/components/ScrollReveal';
import CategoryCard from '@/components/CategoryCard';
import ProgressCounter from '@/components/ProgressCounter';
import HopeScoreBadge from '@/components/HopeScoreBadge';
import { useLocale } from '@/contexts/LocaleContext';
import { trpc } from '@/providers/trpc';
import { CATEGORIES } from '@/data/articles';
import { t } from '@/lib/i18n';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const },
  },
};

export default function HomePage() {
  const { locale } = useLocale();
  const { data: featured, isLoading: featuredLoading } = trpc.article.featured.useQuery();
  const { data: allArticles } = trpc.article.list.useQuery();
  const { data: categoryStats } = trpc.article.categoryStats.useQuery();

  // Auto-seed on first load if no articles
  trpc.seed.run.useQuery(undefined, {
    enabled: !!allArticles && allArticles.length === 0,
    refetchOnWindowFocus: false,
  });

  // Refetch after potential seed
  const { refetch } = trpc.article.list.useQuery();
  if (allArticles && allArticles.length === 0) {
    setTimeout(() => refetch(), 1000);
  }

  const stats = [
    { value: allArticles?.length ? allArticles.length * 113 + 47 : 1247, labelKey: 'storiesToday', suffix: '' },
    { value: 0.72, labelKey: 'avgHopeScore', suffix: '' },
    { value: 47, labelKey: 'countries', suffix: '' },
  ];

  // Merge static category info with dynamic stats
  const categoriesWithStats = CATEGORIES.map((cat) => {
    const stat = categoryStats?.find((s) => s.category === cat.name);
    return {
      ...cat,
      articleCount: stat?.count ?? cat.articleCount,
      avgHopeScore: stat?.avgHopeScore ? Number(stat.avgHopeScore) : cat.avgHopeScore,
    };
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-peach-light to-cream z-0" />
        <WarmParticleFlow />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 max-w-[680px] mx-auto"
        >
          <motion.span variants={itemVariants} className="caption-style text-coral inline-block mb-6 tracking-[0.12em]">
            {t('todayProgress', locale)}
          </motion.span>

          <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-6xl lg:text-[64px] text-charcoal leading-[0.95] tracking-tight mb-5">
            {t('heroTitle', locale)}
          </motion.h1>

          <motion.p variants={itemVariants} className="font-body text-base text-warmgrey leading-relaxed max-w-[480px] mx-auto mb-10">
            {t('heroSubtitle', locale)}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/feed" className="px-8 py-3.5 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-[15px] font-medium hover:scale-[1.02] hover:shadow-lg transition-all duration-250">
              {t('readStories', locale)}
            </Link>
            <button className="px-8 py-3.5 rounded-button border-[1.5px] border-charcoal text-charcoal font-body text-[15px] font-medium hover:bg-charcoal hover:text-cream transition-all duration-250">
              {t('hopeBudget', locale)}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="glass-light rounded-xl px-6 py-4 min-w-[140px]">
                <div className="font-display text-3xl md:text-4xl text-charcoal tracking-tight">
                  {stat.value >= 100 ? Math.round(stat.value).toLocaleString() : stat.value}
                </div>
                <div className="text-xs font-body text-warmgrey uppercase tracking-wider mt-1">{stat.labelKey === 'storiesToday' ? t('todayProgress', locale).toLowerCase() : stat.labelKey === 'avgHopeScore' ? 'avg hope score' : 'countries'}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 right-8 z-10 hidden lg:block">
          <LuminousHopeOrb size={150} />
        </div>
      </section>

      {/* FEATURED STORY */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            {featuredLoading || !featured ? (
              <div className="glass-light border border-peach-light/50 rounded-card-lg p-10">
                <div className="skeleton-shimmer h-8 w-2/3 mb-4" />
                <div className="skeleton-shimmer h-4 w-1/2" />
              </div>
            ) : (
              <div className="glass-light border border-peach-light/50 rounded-card-lg p-6 md:p-10 hover:shadow-featured hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-[55%] aspect-[4/3] rounded-card-lg overflow-hidden flex-shrink-0">
                    <img src={featured.imageUrl ?? ''} alt={featured.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <HopeScoreBadge score={Number(featured.hopeScore)} size={48} showLabel />
                    </div>
                    <span className="caption-style px-3.5 py-1 rounded-pill inline-block mb-4 bg-peach text-coral">
                      {featured.category.toUpperCase()}
                    </span>
                    <h2 className="font-display text-2xl text-charcoal leading-tight mb-3">{featured.title}</h2>
                    <p className="font-body text-[15px] text-warmgrey leading-relaxed line-clamp-2 mb-5">{featured.summary}</p>
                    <Link to={`/article/${featured.id}`} className="inline-flex items-center gap-2 font-body text-[15px] font-medium text-coral hover:gap-3 transition-all duration-200">
                      {t('readStories', locale)} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-[44px] text-charcoal text-center mb-4 tracking-tight">{t('discoverTopic', locale)}</h2>
            <p className="font-body text-base text-warmgrey text-center mb-12 max-w-md mx-auto">{t('bePartSub', locale)}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithStats.map((cat, i) => (
              <CategoryCard key={cat.name} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PROGRESS DASHBOARD */}
      <section className="py-20 md:py-24 px-6 bg-gradient-to-b from-[#2A2620] to-charcoal">
        <div className="max-w-[1200px] mx-auto text-center">
          <ScrollReveal>
            <span className="caption-style text-amber tracking-[0.12em] mb-4 block">{t('globalProgress', locale)}</span>
            <h2 className="font-display text-4xl md:text-[44px] text-cream mb-12 tracking-tight">{t('weekInNews', locale)}</h2>
          </ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 mb-12">
            <ProgressCounter value={3} label={t('global', locale).toLowerCase()} inverse />
            <ProgressCounter value={12} label={t('share', locale).toLowerCase()} inverse />
            <ProgressCounter value={2.4} suffix="M" label={t('discoverTopic', locale).toLowerCase()} inverse />
          </div>
          <ScrollReveal delay={0.3}>
            <div className="border-t border-cream/10 pt-8">
              <Link to="/dashboard" className="inline-flex items-center gap-2 font-body text-[15px] font-medium text-amber hover:gap-3 transition-all duration-200">
                {t('dashboard', locale)} <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-coral-bright via-[#D4523C] to-[#9B4D36] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] as const }} className="relative z-10 text-center px-6 max-w-lg mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-5 tracking-tight">{t('bePart', locale)}</h2>
          <p className="font-body text-base text-cream/75 leading-relaxed mb-9 max-w-md mx-auto">{t('bePartSub', locale)}</p>
          <Link to="/feed" className="inline-block px-10 py-4 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-base font-medium hover:scale-105 transition-transform duration-300" style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {t('getStarted', locale)}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
