import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Hand, BookOpen, ShieldCheck, ImageIcon } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { getWhyThisMatters } from '@/lib/classifier';
import ArticleCard from '@/components/ArticleCard';
import ScrollReveal from '@/components/ScrollReveal';
import LuminousHopeOrb from '@/components/LuminousHopeOrb';
import ShareCardGenerator from '@/components/ShareCardGenerator';
import CommentSection from '@/components/CommentSection';

function RadarChart({ scores, size = 280 }: { scores: number[]; size?: number }) {
  const colors = ['#E8644B', '#F4A261', '#C45C3E', '#F4D0C4', '#9B4D36'];
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const angleStep = (Math.PI * 2) / 5;

  const getPoint = (i: number, value: number) => ({
    x: cx + Math.cos(i * angleStep - Math.PI / 2) * maxR * value,
    y: cy + Math.sin(i * angleStep - Math.PI / 2) * maxR * value,
  });

  const points = scores.map((s, i) => getPoint(i, s));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} className="mx-auto">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={Array.from({ length: 5 }, (_, i) => { const p = getPoint(i, r); return `${p.x},${p.y}` }).join(' ')} fill="none" stroke="#F0E6D8" strokeWidth={1} />
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#F0E6D8" strokeWidth={1} />;
      })}
      <motion.path
        d={pathD}
        fill="rgba(232, 100, 75, 0.1)"
        stroke="url(#flameGrad)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] as const }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <defs>
        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8644B" />
          <stop offset="100%" stopColor="#F4A261" />
        </linearGradient>
      </defs>
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={4} fill={colors[i]} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring', bounce: 0.5 }} />
      ))}
      {['Verified Facts', 'Systemic Impact', 'Actionability', 'Novelty', 'Representation'].map((label, i) => {
        const p = getPoint(i, 1.2);
        return <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-body fill-charcoal">{label}</text>;
      })}
    </svg>
  );
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = Number(id) || 0;
  const [shareOpen, setShareOpen] = useState(false);

  const { data: article, isLoading } = trpc.article.byId.useQuery(
    { id: articleId },
    { enabled: articleId > 0 }
  );

  const { data: related } = trpc.article.related.useQuery(
    { id: articleId, limit: 4 },
    { enabled: articleId > 0 }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-coral-bright border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-warmgrey">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-display text-2xl text-charcoal mb-2">Article not found</h2>
          <button onClick={() => navigate('/feed')} className="text-coral font-body text-sm hover:underline">Back to Feed</button>
        </div>
      </div>
    );
  }

  const scoreDimensions = [
    Number(article.verifiedFacts),
    Number(article.systemicImpact),
    Number(article.actionability),
    Number(article.novelty),
    Number(article.representation),
  ];
  const dimensionLabels = [
    { label: 'Verified Facts', score: Number(article.verifiedFacts) },
    { label: 'Systemic Impact', score: Number(article.systemicImpact) },
    { label: 'Actionability', score: Number(article.actionability) },
    { label: 'Novelty', score: Number(article.novelty) },
    { label: 'Representation', score: Number(article.representation) },
  ];

  const actionDefaults = [
    { type: 'donate', label: 'Give Now', desc: 'Support the organizations making this happen', icon: Heart },
    { type: 'volunteer', label: 'Find Opportunities', desc: 'Find local opportunities to contribute', icon: Hand },
    { type: 'learn', label: 'Explore Resources', desc: 'Explore resources and learn more', icon: BookOpen },
    { type: 'share', label: 'Create Card', desc: 'Generate a shareable card for social media', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
        <img src={article.imageUrl ?? '/assets/card-community.jpg'} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-20 left-6 z-20 flex items-center gap-2 text-cream/80 hover:text-cream font-body text-sm transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-[800px]">
            <div className="flex items-center gap-3 mb-3">
              <span className="caption-style px-3 py-1 rounded-pill bg-cream/20 text-cream">{article.category.toUpperCase()}</span>
              <span className="caption-style text-cream/60">{article.region.toUpperCase()}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-cream leading-tight">{article.title}</h1>
            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck size={16} className="text-amber" />
              <span className="font-body text-sm text-cream/70">From database</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="caption-style text-coral mb-4 block">HOPE SCORE BREAKDOWN</span>
            <div className="flex items-center justify-center gap-4 mb-8">
              <LuminousHopeOrb size={100} />
              <div className="score-pulse font-display text-6xl md:text-7xl">{Math.round(Number(article.hopeScore) * 100)}</div>
            </div>
            <div className="max-w-[320px] mx-auto mb-8">
              <RadarChart scores={scoreDimensions} />
            </div>
            <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
              {dimensionLabels.map((dim) => (
                <div key={dim.label} className="text-center">
                  <div className="font-body text-sm font-semibold text-coral">{Math.round(dim.score * 100)}</div>
                  <div className="text-[10px] font-body text-warmgrey leading-tight mt-0.5">{dim.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="prose prose-lg max-w-none mb-12">
            <p className="font-body text-[16px] text-charcoal leading-[1.75] mb-6">{article.summary}</p>
            {article.content && article.content.split('\n\n').map((paragraph, i) => (
              paragraph.startsWith('"') ? (
                <blockquote key={i} className="border-l-[3px] border-coral-bright pl-6 my-8 py-2">
                  <p className="font-display text-xl md:text-2xl text-coral italic leading-snug">{paragraph}</p>
                </blockquote>
              ) : (
                <p key={i} className="font-body text-[16px] text-charcoal leading-[1.75] mb-6">{paragraph}</p>
              )
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-peach rounded-card border-l-4 border-coral-bright p-7 mb-10">
            <span className="caption-style text-coral mb-3 block">WHY THIS MATTERS</span>
            <p className="font-body text-[15px] text-charcoal leading-relaxed">{getWhyThisMatters({ title: article.title, summary: article.summary ?? '', content: article.content ?? '', category: article.category, region: article.region, regionTier: article.regionTier })}</p>
            <div className="flex items-center gap-1.5 mt-4 text-warmgrey">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor" /></svg>
              <span className="caption-style text-warmgrey">AI-generated</span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h3 className="caption-style text-coral mb-5">TAKE ACTION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {actionDefaults.map((action, i) => {
              const ActionIcon = action.icon;
              const isPrimary = i < 2;
              return (
                <motion.div key={action.type} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="bg-peach rounded-card p-6 text-center">
                  <ActionIcon size={24} className={isPrimary ? 'text-coral-bright mx-auto mb-3' : 'text-coral mx-auto mb-3'} />
                  <h4 className="font-body text-sm font-semibold text-charcoal mb-1 capitalize">{action.type}</h4>
                  <p className="font-body text-xs text-warmgrey mb-4">{action.desc}</p>
                  {action.type === 'share' ? (
                    <button onClick={() => setShareOpen(true)} className="inline-flex items-center gap-2 px-5 py-2 rounded-button border border-coral text-coral bg-transparent font-body text-sm font-medium hover:bg-coral hover:text-cream transition-all duration-200 hover:scale-[1.02]">
                      {action.label} <ImageIcon size={12} />
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-button font-body text-sm font-medium ${isPrimary ? 'bg-gradient-to-b from-coral-bright to-amber text-cream' : 'border border-coral text-coral bg-transparent'}`}>
                      {action.label}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Comments */}
        <CommentSection articleId={articleId} />

        {/* Share Card Generator Modal */}
        <ShareCardGenerator
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          article={{
            title: article.title,
            summary: article.summary ?? '',
            category: article.category,
            hopeScore: Number(article.hopeScore),
            tier: article.tier,
            region: article.region,
          }}
        />

        {related && related.length > 0 && (
          <ScrollReveal>
            <h3 className="caption-style text-coral mb-5">RELATED STORIES</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
              {related.map((a) => (
                <div key={a.id} className="w-[280px] flex-shrink-0 snap-start">
                  <ArticleCard article={{
                    id: String(a.id), title: a.title, summary: a.summary ?? '', content: '', url: '#',
                    imageUrl: a.imageUrl ?? '/assets/card-community.jpg', publishedAt: a.publishedAt?.toISOString() ?? new Date().toISOString(),
                    source: '', sourceTrust: 0.5, region: a.region, regionTier: 'global', category: a.category,
                    hopeScore: Number(a.hopeScore), verifiedFacts: 0, systemicImpact: 0, actionability: 0, novelty: 0, representation: 0, tier: a.tier,
                  }} compact />
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
