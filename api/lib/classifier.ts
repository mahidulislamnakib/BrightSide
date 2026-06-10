// Hope Score Classification Engine
// Computes multi-dimensional scores for articles based on keyword analysis

export type RegionTier = "underreported" | "developing" | "global" | "western";
export type Tier = "gold" | "verified" | "constructive";
export type Mood = "motivated" | "calm" | "informed" | "inspired";

// Source trust scores
const SOURCE_TRUST: Record<string, number> = {
  "Solutions Journalism Network": 0.95,
  "Nature": 0.98,
  "The Lancet": 0.98,
  "World Bank": 0.96,
  "BRAC Reports": 0.90,
  "IDCOL": 0.88,
  "Positive.News": 0.82,
  "The Daily Star": 0.78,
  "Good News Network": 0.75,
};

// Region representation scores
const REGION_REPRESENTATION: Record<string, number> = {
  Rwanda: 0.9,
  Nepal: 0.9,
  Bangladesh: 0.9,
  Nigeria: 0.9,
  Colombia: 0.7,
  Kenya: 0.7,
  Brazil: 0.7,
  India: 0.7,
  Global: 0.5,
  USA: 0.4,
};

// Keyword dictionaries for scoring
const VERIFIED_KEYWORDS: Record<string, number> = {
  study: 0.15, research: 0.15, "data shows": 0.2, "peer-reviewed": 0.3,
  "who reports": 0.25, percent: 0.1, "reduced by": 0.15, trial: 0.2,
  phase: 0.15, efficacy: 0.2, clinical: 0.15, survey: 0.1,
  analysis: 0.1, confirmed: 0.15, verified: 0.15, demonstrated: 0.1,
};

const IMPACT_KEYWORDS: Record<string, number> = {
  vaccine: 0.25, cure: 0.3, eradicated: 0.3, rewilding: 0.2,
  renewable: 0.2, "lifted out of poverty": 0.3, "peace treaty": 0.25,
  "job creation": 0.2, innovation: 0.2, eliminated: 0.25,
  breakthrough: 0.2, milestone: 0.15, achieved: 0.1, launched: 0.1,
  expanded: 0.1, "reached million": 0.2, independent: 0.15,
};

const ACTION_KEYWORDS: Record<string, number> = {
  donate: 0.2, volunteer: 0.2, "get involved": 0.25, "learn more": 0.15,
  "how to": 0.15, guide: 0.1, toolkit: 0.1, join: 0.15,
  support: 0.1, contribute: 0.1, participate: 0.1, sign: 0.1,
  register: 0.1, apply: 0.1, share: 0.05,
};

const NEGATIVE_PENALTIES: Record<string, number> = {
  celebrity: -0.3, "cute puppy": -0.4, "viral video": -0.2,
  miracle: -0.2, tragedy: -0.8, "death toll": -0.9,
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Health: ["vaccine", "maternal", "health worker", "clinic", "disease", "malaria", "medical"],
  Environment: ["solar", "renewable", "reforestation", "climate", "electric", "carbon", "green"],
  Innovation: ["solar", "technology", "digital", "app", "engineered", "enzyme", "innovation"],
  Community: ["community", "volunteer", "fundraiser", "local", "village", "neighborhood"],
  Economic: ["jobs", "employment", "income", "poverty", "microfinance", "entrepreneur"],
  Peace: ["treaty", "conflict", "reconciliation", "diplomacy", "peace", "ranger"],
};

export interface HopeScoreBreakdown {
  verifiedFacts: number;
  systemicImpact: number;
  actionability: number;
  novelty: number;
  representation: number;
  overall: number;
  tier: Tier;
  category: string;
}

function scoreKeywords(text: string, keywords: Record<string, number>): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const [kw, weight] of Object.entries(keywords)) {
    if (lower.includes(kw.toLowerCase())) {
      score += weight;
    }
  }
  return Math.min(1, Math.max(0, score));
}

function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  let bestCategory = "Community";
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

function computeTier(overall: number): Tier {
  if (overall >= 0.80) return "gold";
  if (overall >= 0.65) return "verified";
  return "constructive";
}

export function classifyArticle(
  title: string,
  summary: string,
  content: string,
  sourceName: string,
  region: string,
  publishedAt?: Date
): HopeScoreBreakdown {
  const fullText = `${title} ${summary} ${content}`;

  // 1. Verified Facts (0-1)
  const sourceTrust = SOURCE_TRUST[sourceName] || 0.5;
  const keywordScore = scoreKeywords(fullText, VERIFIED_KEYWORDS);
  const penaltyScore = scoreKeywords(fullText, NEGATIVE_PENALTIES);
  const verifiedFacts = Math.min(1, sourceTrust * 0.4 + keywordScore * 0.6 + penaltyScore * 0.2);

  // 2. Systemic Impact (0-1)
  const impactScore = scoreKeywords(fullText, IMPACT_KEYWORDS);
  const systemicImpact = Math.min(1, impactScore / 0.5); // normalize

  // 3. Actionability (0-1)
  const actionScore = scoreKeywords(fullText, ACTION_KEYWORDS);
  const actionability = Math.min(1, 0.2 + actionScore);

  // 4. Novelty (0-1)
  const now = new Date();
  const age = publishedAt ? (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60) : 48;
  const recency = Math.max(0, 1 - age / 48);
  const uniqueness = 0.7; // placeholder - would use embeddings in production
  const novelty = recency * 0.4 + uniqueness * 0.6;

  // 5. Representation (0-1)
  const representation = REGION_REPRESENTATION[region] || 0.5;

  // Overall Hope Score
  const overall =
    verifiedFacts * 0.25 +
    systemicImpact * 0.25 +
    actionability * 0.20 +
    novelty * 0.15 +
    representation * 0.15;

  const category = detectCategory(title, summary);

  return {
    verifiedFacts: Math.round(verifiedFacts * 1000) / 1000,
    systemicImpact: Math.round(systemicImpact * 1000) / 1000,
    actionability: Math.round(actionability * 1000) / 1000,
    novelty: Math.round(novelty * 1000) / 1000,
    representation: Math.round(representation * 1000) / 1000,
    overall: Math.round(overall * 1000) / 1000,
    tier: computeTier(overall),
    category,
  };
}

// Mood-based ranking weights
export const MOOD_WEIGHTS: Record<Mood, number[]> = {
  motivated: [0.20, 0.30, 0.25, 0.15, 0.10],
  calm: [0.25, 0.15, 0.15, 0.10, 0.35],
  informed: [0.35, 0.25, 0.15, 0.10, 0.15],
  inspired: [0.20, 0.20, 0.30, 0.10, 0.20],
};

const WHY_TEMPLATES: Record<string, string> = {
  Health: `This story demonstrates scalable, community-driven healthcare solutions that can be replicated in resource-limited settings worldwide. The approach offers a proven pathway to reducing preventable deaths and improving health equity.`,
  Environment: `Climate solutions like this combine traditional knowledge with modern techniques, offering a replicable model for regions facing similar ecological pressures. They demonstrate that environmental restoration is possible at scale.`,
  Innovation: `Breakthrough innovations have ripple effects far beyond their immediate application. They create new industries, inspire future researchers, and demonstrate that complex global challenges have solutions within reach.`,
  Community: `Stories of community resilience remind us that change often starts at the grassroots level. In a world of top-down narratives, this shows the power of local action and collective compassion.`,
  Economic: `Economic empowerment stories highlight pathways out of poverty that don't depend on external aid. Sustainable livelihoods create dignity, stability, and ripple effects throughout communities.`,
  Peace: `Peace-building efforts show what's possible when communities choose dialogue over conflict. In a media landscape dominated by war coverage, these stories provide essential balance and hope.`,
};

export function getWhyThisMatters(article: { title: string; summary: string; content: string; category: string; region: string; regionTier: string }): string {
  return WHY_TEMPLATES[article.category] || `This story from ${article.region} represents solutions-oriented journalism that helps us understand how real progress happens. It combines evidence-based reporting with actionable insights.`;
}

export function computeMoodScore(
  scores: { verifiedFacts: number; systemicImpact: number; actionability: number; novelty: number; representation: number },
  mood: Mood
): number {
  const w = MOOD_WEIGHTS[mood];
  return (
    scores.verifiedFacts * w[0] +
    scores.systemicImpact * w[1] +
    scores.actionability * w[2] +
    scores.novelty * w[3] +
    scores.representation * w[4]
  );
}
