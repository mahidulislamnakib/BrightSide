import type { Article } from '@/data/articles';

export type Mood = 'motivated' | 'calm' | 'informed' | 'inspired';

export interface HopeScoreBreakdown {
  verifiedFacts: number;
  systemicImpact: number;
  actionability: number;
  novelty: number;
  representation: number;
  overall: number;
}

export const getTier = (score: number): 'gold' | 'verified' | 'constructive' => {
  if (score >= 0.80) return 'gold';
  if (score >= 0.65) return 'verified';
  return 'constructive';
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'gold': return '#F4A261';
    case 'verified': return '#E8644B';
    case 'constructive': return '#F4D0C4';
    default: return '#F4D0C4';
  }
};

export const getTierLabel = (tier: string): string => {
  switch (tier) {
    case 'gold': return 'GOLD STANDARD';
    case 'verified': return 'VERIFIED';
    case 'constructive': return 'CONSTRUCTIVE';
    default: return 'CONSTRUCTIVE';
  }
};

export const moodWeights: Record<Mood, { verifiedFacts: number; systemicImpact: number; actionability: number; novelty: number; representation: number }> = {
  motivated: { verifiedFacts: 0.20, systemicImpact: 0.30, actionability: 0.25, novelty: 0.15, representation: 0.10 },
  calm: { verifiedFacts: 0.25, systemicImpact: 0.15, actionability: 0.15, novelty: 0.10, representation: 0.35 },
  informed: { verifiedFacts: 0.35, systemicImpact: 0.25, actionability: 0.15, novelty: 0.10, representation: 0.15 },
  inspired: { verifiedFacts: 0.20, systemicImpact: 0.20, actionability: 0.30, novelty: 0.10, representation: 0.20 },
};

export const computeMoodScore = (article: Article, mood: Mood): number => {
  const w = moodWeights[mood];
  return (
    article.verifiedFacts * w.verifiedFacts +
    article.systemicImpact * w.systemicImpact +
    article.actionability * w.actionability +
    article.novelty * w.novelty +
    article.representation * w.representation
  );
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Health: '#E8644B',
    Environment: '#4ADE80',
    Innovation: '#F4A261',
    Community: '#C45C3E',
    Economic: '#2DD4BF',
    Peace: '#F472B6',
  };
  return colors[category] || '#F4A261';
};

export const timeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

export const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return n.toString();
};

export const getScorePercentage = (score: number): number => Math.round(score * 100);

export const getWhyThisMatters = (article: { title: string; summary: string; content: string; category: string; region: string; regionTier: string }): string => {
  const templates: Record<string, string> = {
    Health: `This story matters because it demonstrates scalable, community-driven healthcare solutions that can be replicated in resource-limited settings worldwide. With ${article.region} facing ongoing health infrastructure challenges, approaches like this offer a proven pathway to reducing preventable deaths.`,
    Environment: `Climate solutions like this are critical as the world faces unprecedented environmental challenges. The approach shown here combines traditional knowledge with modern techniques, offering a replicable model for other regions facing similar ecological pressures.`,
    Innovation: `Breakthrough innovations like this have ripple effects far beyond their immediate application. They create new industries, inspire future researchers, and demonstrate that even complex global challenges have solutions within reach.`,
    Community: `Stories of community resilience matter because they remind us that change often starts at the grassroots level. In a world of top-down narratives, this shows the power of local action and collective compassion.`,
    Economic: `Economic empowerment stories are crucial because they highlight pathways out of poverty that don't depend on external aid. Sustainable livelihoods create dignity, stability, and ripple effects throughout communities.`,
    Peace: `Peace-building efforts deserve attention because they show what's possible when communities choose dialogue over conflict. In a media landscape dominated by war coverage, these stories provide essential balance and hope.`,
  };
  return templates[article.category] || `This story from ${article.region} represents the kind of solutions-oriented journalism that helps us understand how real progress happens. It combines evidence-based reporting with actionable insights, embodying the principles of constructive journalism.`;
};
