import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, FileText, Globe, ShieldCheck, Trash2, Plus } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

type Tab = 'articles' | 'sources' | 'analytics';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const [page, setPage] = useState(1);

  // Redirect non-admin
  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center">
          <ShieldCheck size={48} className="text-coral mx-auto mb-4" />
          <h2 className="font-display text-2xl text-charcoal mb-2">Admin Access Required</h2>
          <p className="font-body text-warmgrey mb-4">You need admin privileges to view this page.</p>
          <button onClick={() => navigate('/')} className="text-coral font-body text-sm hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck size={28} className="text-coral" />
            <h1 className="font-display text-3xl text-charcoal tracking-tight">Admin Panel</h1>
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-borderlight pb-1">
          {[
            { key: 'articles' as Tab, label: 'Articles', icon: FileText },
            { key: 'sources' as Tab, label: 'Sources', icon: Globe },
            { key: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-coral border-b-2 border-coral bg-peach/50'
                  : 'text-warmgrey hover:text-charcoal'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'articles' && <ArticlesTab page={page} onPageChange={setPage} />}
        {activeTab === 'sources' && <SourcesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

function ArticlesTab({ page, onPageChange }: { page: number; onPageChange: (p: number) => void }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.articles.useQuery({ page, limit: 20 });
  const deleteMutation = trpc.admin.deleteArticle.useMutation({
    onSuccess: () => utils.admin.articles.invalidate(),
  });

  const tierColors: Record<string, string> = { gold: '#F4A261', verified: '#E8644B', constructive: '#F4D0C4' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-warmgrey">{data?.total ?? 0} total articles</p>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 rounded-lg border border-borderlight text-sm font-body disabled:opacity-30">Previous</button>
          <span className="px-3 py-1 font-body text-sm text-charcoal">Page {page}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={!data || page * 20 >= data.total} className="px-3 py-1 rounded-lg border border-borderlight text-sm font-body disabled:opacity-30">Next</button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-shimmer h-14 rounded-card" />)}</div>
      ) : (
        <div className="bg-peach rounded-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-borderlight">
                <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warmgrey uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warmgrey uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warmgrey uppercase tracking-wider">Score</th>
                <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warmgrey uppercase tracking-wider">Tier</th>
                <th className="text-right px-4 py-3 font-body text-xs font-semibold text-warmgrey uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.articles.map((article) => (
                <tr key={article.id} className="border-b border-borderlight/50 hover:bg-cream/50 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-charcoal max-w-xs truncate">{article.title}</td>
                  <td className="px-4 py-3"><span className="caption-style text-coral">{article.category}</span></td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-charcoal">{Number(article.hopeScore).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className="caption-style px-2 py-0.5 rounded-pill" style={{ backgroundColor: tierColors[article.tier] + '25', color: tierColors[article.tier] }}>{article.tier.toUpperCase()}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Delete this article?')) deleteMutation.mutate({ id: article.id }); }} className="p-1.5 text-warmgrey hover:text-coral transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SourcesTab() {
  const utils = trpc.useUtils();
  const { data: sourceList, isLoading } = trpc.admin.sources.useQuery();
  const updateMutation = trpc.admin.updateSource.useMutation({
    onSuccess: () => utils.admin.sources.invalidate(),
  });
  const createMutation = trpc.admin.createSource.useMutation({
    onSuccess: () => { utils.admin.sources.invalidate(); setShowAdd(false); },
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', category: 'human_curated' as const, trustScore: '0.5' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-warmgrey">{sourceList?.length ?? 0} configured sources</p>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all">
          <Plus size={16} /> Add Source
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-peach rounded-card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="Source name" className="px-4 py-2 rounded-lg border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral" />
            <input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} placeholder="URL" className="px-4 py-2 rounded-lg border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral" />
            <select value={newSource.category} onChange={(e) => setNewSource({ ...newSource, category: e.target.value as 'human_curated' })} className="px-4 py-2 rounded-lg border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral">
              <option value="human_curated">Human Curated</option>
              <option value="investigative">Investigative</option>
              <option value="institutional">Institutional</option>
              <option value="community">Community</option>
              <option value="academic">Academic</option>
            </select>
            <button onClick={() => createMutation.mutate(newSource)} disabled={!newSource.name || !newSource.url || createMutation.isPending} className="px-4 py-2 rounded-button bg-charcoal text-cream font-body text-sm font-medium disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Source'}
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-shimmer h-14 rounded-card" />)}</div>
      ) : (
        <div className="space-y-3">
          {sourceList?.map((source) => (
            <div key={source.id} className="bg-peach rounded-card p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-body text-sm font-semibold text-charcoal truncate">{source.name}</h3>
                <p className="font-body text-xs text-warmgrey truncate">{source.url}</p>
              </div>
              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <span className="caption-style text-coral">{source.category}</span>
                <span className="font-body text-xs text-warmgrey">Trust: {source.trustScore}</span>
                <button
                  onClick={() => updateMutation.mutate({ id: source.id, isActive: !source.isActive })}
                  className={`px-3 py-1 rounded-pill text-xs font-body transition-all ${source.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {source.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const { data, isLoading } = trpc.admin.analytics.useQuery();

  if (isLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-shimmer h-40 rounded-card" />)}</div>;
  }

  const maxCategoryCount = Math.max(...(data?.categoryBreakdown.map((c) => c.count) ?? [1]), 1);

  return (
    <div className="space-y-8">
      {/* Category Breakdown */}
      <div className="bg-peach rounded-card p-6">
        <h3 className="font-display text-lg text-charcoal mb-4">Articles by Category</h3>
        <div className="space-y-3">
          {data?.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="font-body text-sm text-warmgrey w-28 text-right">{cat.category}</span>
              <div className="flex-1 h-6 bg-cream rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-coral-bright to-amber" initial={{ width: 0 }} whileInView={{ width: `${(cat.count / maxCategoryCount) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
              </div>
              <span className="font-body text-sm text-charcoal w-12">{cat.count}</span>
              <span className="font-body text-xs text-warmgrey w-16">avg: {Number(cat.avgScore).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="bg-peach rounded-card p-6">
        <h3 className="font-display text-lg text-charcoal mb-4">Articles by Tier</h3>
        <div className="grid grid-cols-3 gap-4">
          {data?.tierBreakdown.map((tier) => (
              <div key={tier.tier} className="text-center p-4 bg-cream rounded-card">
                <div className={`font-display text-3xl ${tier.tier === 'gold' ? 'score-pulse' : 'text-charcoal'}`}>{tier.count}</div>
                <div className="caption-style text-warmgrey mt-1">{tier.tier.toUpperCase()}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Daily Activity */}
      <div className="bg-peach rounded-card p-6">
        <h3 className="font-display text-lg text-charcoal mb-4">Daily Article Activity (Last 30 Days)</h3>
        <div className="flex items-end gap-1 h-32">
          {(data?.dailyArticles ?? []).map((day) => {
            const maxDaily = Math.max(...(data?.dailyArticles.map((d) => d.count) ?? [1]));
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.count} articles`}>
                <motion.div
                  className="w-full bg-gradient-to-t from-coral-bright to-amber rounded-t"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(day.count / maxDaily) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  style={{ minHeight: 4 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
