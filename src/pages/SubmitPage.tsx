import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import { Send, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const CATEGORIES = ['Health', 'Environment', 'Innovation', 'Community', 'Economic', 'Peace'];

export default function SubmitPage() {
  const [form, setForm] = useState({
    submitterName: '',
    submitterEmail: '',
    title: '',
    summary: '',
    content: '',
    sourceUrl: '',
    category: '',
    region: '',
  });
  const [result, setResult] = useState<{
    success: boolean;
    id: number;
    hopeScore: number;
    tier: string;
    category: string;
  } | null>(null);

  const submitMutation = trpc.submission.create.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.summary || !form.submitterName) return;
    submitMutation.mutate({
      submitterName: form.submitterName,
      submitterEmail: form.submitterEmail || undefined,
      title: form.title,
      summary: form.summary,
      content: form.content || undefined,
      sourceUrl: form.sourceUrl || undefined,
      category: form.category || undefined,
      region: form.region || undefined,
    });
  };

  if (result) {
    return (
      <div className="min-h-screen bg-cream pt-20 pb-12 flex items-center justify-center px-6">
        <ScrollReveal>
          <div className="text-center max-w-md">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
              <CheckCircle size={64} className="text-coral-bright mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display text-3xl text-charcoal mb-3">Thank You!</h2>
            <p className="font-body text-warmgrey mb-2">Your story has been submitted for review.</p>
            <div className="bg-peach rounded-card p-4 mb-6 mt-4">
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="font-display text-3xl score-pulse">{Math.round(result.hopeScore * 100)}</div>
                  <div className="text-xs font-body text-warmgrey">AI Hope Score</div>
                </div>
                <div className="h-10 w-px bg-borderlight" />
                <div>
                  <div className="caption-style text-coral">{result.tier.toUpperCase()}</div>
                  <div className="text-xs font-body text-warmgrey">{result.category}</div>
                </div>
              </div>
            </div>
            <Link to="/feed" className="inline-flex items-center gap-2 font-body text-coral hover:underline">
              <ArrowLeft size={16} /> Back to Feed
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12">
      <div className="max-w-[640px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <Send size={24} className="text-coral" />
            <h1 className="font-display text-4xl text-charcoal tracking-tight">Submit a Story</h1>
          </div>
          <p className="font-body text-warmgrey mb-8">
            Found some good news? Share it with the world. Our AI will classify it with a Hope Score.
          </p>
        </ScrollReveal>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Your Name *</label>
              <input required value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Email (optional)</label>
              <input type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors" placeholder="jane@example.com" />
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Story Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors" placeholder="e.g., Solar-Powered Hospital Opens in Rural Kenya" />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Summary * <span className="text-warmgrey font-normal">(1-2 sentences)</span></label>
            <textarea required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors resize-none" placeholder="Describe the positive impact in 1-2 sentences..." />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Full Story (optional)</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors resize-none" placeholder="Paste the full article text here..." />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Source URL (optional)</label>
            <input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors" placeholder="https://example.com/article" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors">
                <option value="">Auto-detect</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Region</label>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full px-4 py-2.5 rounded-card border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral transition-colors" placeholder="e.g., Kenya" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <ShieldCheck size={16} className="text-warmgrey" />
            <span className="font-body text-xs text-warmgrey">Stories are reviewed by our AI and editorial team before publishing.</span>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full py-3.5 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitMutation.isPending ? 'Analyzing with Hope Score AI...' : 'Submit Story'}
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
