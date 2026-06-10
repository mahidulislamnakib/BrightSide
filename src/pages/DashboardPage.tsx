import { useState } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import ProgressCounter from '@/components/ProgressCounter';
import ScrollReveal from '@/components/ScrollReveal';
import LuminousHopeOrb from '@/components/LuminousHopeOrb';

function Sparkline({ data, color = '#F4A261', height = 40, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return <svg width={width} height={height} className="mx-auto"><path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TrendLineChart() {
  const data = [0.62, 0.64, 0.65, 0.63, 0.68, 0.70, 0.69, 0.71, 0.70, 0.72, 0.73, 0.72, 0.74, 0.73, 0.75, 0.74, 0.76, 0.75, 0.77, 0.76, 0.78, 0.77, 0.79, 0.78, 0.80, 0.79, 0.81, 0.80, 0.82, 0.81];
  const width = 600, height = 200, padding = 30;
  const points = data.map((v, i) => ({ x: padding + (i / (data.length - 1)) * (width - padding * 2), y: padding + (1 - v) * (height - padding * 2) }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <ScrollReveal>
      <div className="bg-peach rounded-card p-6 md:p-8">
        <h3 className="font-display text-xl text-charcoal mb-6">Average Hope Score Over Time</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padding + (1 - t) * (height - padding * 2);
            return <g key={t}><line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F0E6D8" strokeWidth={1} /><text x={padding - 8} y={y + 3} textAnchor="end" className="text-[10px] font-body fill-warmgrey">{t.toFixed(2)}</text></g>;
          })}
          <motion.path d={areaPath} fill="rgba(232, 100, 75, 0.06)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          <motion.path d={linePath} fill="none" stroke="url(#trendGrad)" strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] as const }} />
          <defs><linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8644B" /><stop offset="100%" stopColor="#F4A261" /></linearGradient></defs>
        </svg>
      </div>
    </ScrollReveal>
  );
}

function CategoryBarChart() {
  const { data: stats } = trpc.article.categoryStats.useQuery();
  const categories = (stats ?? []).map((s) => ({
    name: s.category,
    count: s.count,
    color: '#F4A261',
  }));
  const max = Math.max(...categories.map((c) => c.count), 1);

  return (
    <ScrollReveal>
      <div className="bg-peach rounded-card p-6 md:p-8">
        <h3 className="font-display text-xl text-charcoal mb-6">Stories by Category</h3>
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="font-body text-sm text-warmgrey w-24 flex-shrink-0 text-right">{cat.name}</span>
              <div className="flex-1 h-8 bg-cream rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-coral-bright to-amber" initial={{ width: 0 }} whileInView={{ width: `${(cat.count / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] as const }} />
              </div>
              <span className="font-body text-sm font-medium text-charcoal w-10">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function ImpactMap() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const { data: regions } = trpc.dashboard.impactMap.useQuery();

  const filteredRegions = (regions ?? []).filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Africa') return ['Rwanda', 'Kenya', 'Nigeria'].includes(r.name);
    if (filter === 'South Asia') return ['Bangladesh', 'Nepal', 'India'].includes(r.name);
    if (filter === 'Latin America') return ['Brazil', 'Colombia'].includes(r.name);
    if (filter === 'North America') return r.name === 'USA';
    return false;
  });

  const project = (lat: number, lng: number) => ({ x: ((lng + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 });
  const regionFilters = ['All', 'Africa', 'South Asia', 'Latin America', 'North America'];

  return (
    <ScrollReveal>
      <div className="bg-peach rounded-card p-6 md:p-8">
        <h3 className="font-display text-xl text-charcoal mb-4">Impact Map</h3>
        <div className="relative aspect-[2/1] bg-cream rounded-card overflow-hidden mb-4">
          <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <path d="M20,8 Q25,5 30,8 Q35,10 32,15 Q28,18 25,15 Q20,12 20,8 M15,18 Q20,15 25,18 Q28,22 25,28 Q20,32 15,28 Q12,22 15,18 M45,5 Q55,3 60,8 Q58,15 52,18 Q45,15 45,5 M62,8 Q68,6 72,10 Q70,16 65,18 Q60,15 62,8 M48,22 Q55,20 60,25 Q58,32 50,35 Q45,30 48,22 M75,12 Q82,10 88,15 Q85,22 78,24 Q72,20 75,12 M80,28 Q88,26 92,32 Q88,38 82,36 Q78,32 80,28" fill="none" stroke="#F0E6D8" strokeWidth={0.5} />
            {filteredRegions.map((region) => {
              const { x, y } = project(region.lat, region.lng);
              return (
                <g key={region.name}>
                  <circle cx={x} cy={y} r={3 + region.score * 2} fill="#F4A261" className="cursor-pointer" onMouseEnter={() => setActiveRegion(region.name)} onMouseLeave={() => setActiveRegion(null)}>
                    <animate attributeName="r" values={`${3 + region.score * 2};${5 + region.score * 2};${3 + region.score * 2}`} dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={3 + region.score * 2} fill="none" stroke="#F4A261" strokeWidth={0.5} className="animate-pulse-ring" style={{ transformOrigin: `${x}px ${y}px` }} />
                </g>
              );
            })}
          </svg>
          {activeRegion && (
            <div className="absolute top-2 left-2 bg-charcoal/90 text-cream text-xs font-body px-3 py-2 rounded-lg">
              {(() => {
                const r = (regions ?? []).find((reg) => reg.name === activeRegion);
                return r ? <div><div className="font-semibold">{r.name}</div><div className="text-cream/60">{r.count} stories</div></div> : null;
              })()}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {regionFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-pill text-xs font-body transition-all duration-300 ${filter === f ? 'bg-gradient-to-b from-coral-bright to-amber text-cream' : 'border border-borderlight text-charcoal hover:border-coral-bright/30'}`}>{f}</button>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function DashboardPage() {
  const { data: metrics } = trpc.dashboard.metrics.useQuery();

  return (
    <div className="min-h-screen bg-cream pt-20 pb-24 md:pb-12">
      <section className="relative bg-gradient-to-b from-[#2A2620] to-charcoal py-12 px-6 overflow-hidden">
        <div className="absolute top-4 right-8 opacity-30 hidden md:block"><LuminousHopeOrb size={200} /></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-4xl text-cream mb-6 tracking-tight">Welcome back, Changemaker</motion.h1>
          <div className="flex flex-wrap gap-3">
            {['47 articles read this week', 'Actions taken: 3', 'Time saved: 2.4h'].map((stat, i) => (
              <motion.div key={stat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="glass-dark rounded-pill px-5 py-2 text-cream font-body text-sm">{stat}</motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <ScrollReveal>
          <h2 className="font-display text-4xl text-charcoal text-center mb-12 tracking-tight">This Week in Good News</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {(metrics ?? []).map((metric, i) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] as const }} className="bg-peach rounded-card p-8 text-center">
              <ProgressCounter value={metric.value} suffix={metric.suffix || ''} label={metric.label} />
              <div className="mt-4"><Sparkline data={metric.trend} /></div>
            </motion.div>
          ))}
        </div>

        <div className="mb-10"><ImpactMap /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendLineChart />
          <CategoryBarChart />
        </div>
      </div>
    </div>
  );
}
