export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  sourceTrust: number;
  region: string;
  regionTier: 'underreported' | 'developing' | 'global' | 'western';
  category: string;
  hopeScore: number;
  verifiedFacts: number;
  systemicImpact: number;
  actionability: number;
  novelty: number;
  representation: number;
  tier: 'gold' | 'verified' | 'constructive';
  actions?: { type: string; label: string; url: string }[];
}

export interface CategoryInfo {
  name: string;
  emoji: string;
  articleCount: number;
  avgHopeScore: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: 'Health', emoji: '⚕️', articleCount: 142, avgHopeScore: 0.78 },
  { name: 'Environment', emoji: '🌿', articleCount: 98, avgHopeScore: 0.71 },
  { name: 'Innovation', emoji: '💡', articleCount: 156, avgHopeScore: 0.75 },
  { name: 'Community', emoji: '🤝', articleCount: 203, avgHopeScore: 0.65 },
  { name: 'Economic', emoji: '📈', articleCount: 87, avgHopeScore: 0.72 },
  { name: 'Peace', emoji: '🕊️', articleCount: 64, avgHopeScore: 0.80 },
];

export const REGIONS = [
  'Rwanda', 'Colombia', 'Bangladesh', 'Global', 'USA',
  'Kenya', 'India', 'Brazil', 'Nigeria', 'Nepal'
];

export const BANGLADESH_CATEGORIES = [
  'Climate Adaptation',
  'Economic Empowerment',
  'Education',
  'Health',
  'Innovation',
  'Community',
];

export const articles: Article[] = [
  {
    id: '1',
    title: "Rwanda's Community Health Workers Eliminated Maternal Deaths in One District",
    summary: "A network of 45,000 trained volunteers achieved zero maternal deaths through motorcycle transport and community education.",
    content: `In the remote district of Kirehe, Rwanda, a remarkable transformation has occurred over the past five years. A network of 45,000 community health workers, equipped with medical kits and motorcycle ambulances, has achieved what many thought impossible: zero maternal deaths in 2024.\n\nThe program, launched in partnership with the Rwandan Ministry of Health and international NGOs, trains local volunteers to identify pregnancy complications early, provide basic prenatal care, and coordinate rapid transport to regional hospitals when emergencies arise.\n\n"Before this program, women in our village would walk for hours when labor started," says Marie Uwimana, a community health worker in Kirehe. "Many died on the way. Now, a phone call brings help within minutes."\n\nThe success in Kirehe is now being scaled to five additional districts, with the goal of nationwide coverage by 2027. The program costs approximately $12 per person annually, making it one of the most cost-effective health interventions in sub-Saharan Africa.`,
    url: '#',
    imageUrl: '/assets/featured-rwanda.jpg',
    publishedAt: '2026-06-10T08:00:00Z',
    source: 'Solutions Journalism Network',
    sourceTrust: 0.95,
    region: 'Rwanda',
    regionTier: 'underreported',
    category: 'Health',
    hopeScore: 0.95,
    verifiedFacts: 0.98,
    systemicImpact: 0.96,
    actionability: 0.88,
    novelty: 0.82,
    representation: 0.90,
    tier: 'gold',
    actions: [
      { type: 'donate', label: 'Support CHW Programs', url: '#' },
      { type: 'volunteer', label: 'Find Medical Volunteer Ops', url: '#' },
      { type: 'learn', label: 'Learn About CHW Model', url: '#' },
    ],
  },
  {
    id: '2',
    title: "How Medellín Transformed From Murder Capital to Innovation Hub",
    summary: "Colombia's second-largest city achieved an 80% reduction in homicides through cable cars, library-parks, and community investment.",
    content: `Three decades ago, Medellín was the most dangerous city in the world. Today, it is a UNESCO City of Learning and a global model for urban transformation. The journey from murder capital to innovation hub holds lessons for cities worldwide.`,
    url: '#',
    imageUrl: '/assets/card-community.jpg',
    publishedAt: '2026-06-09T14:30:00Z',
    source: 'Positive.News',
    sourceTrust: 0.82,
    region: 'Colombia',
    regionTier: 'developing',
    category: 'Innovation',
    hopeScore: 0.82,
    verifiedFacts: 0.88,
    systemicImpact: 0.94,
    actionability: 0.72,
    novelty: 0.76,
    representation: 0.70,
    tier: 'verified',
  },
  {
    id: '3',
    title: "Bangladesh Village Builds Floating Gardens to Beat Floods",
    summary: "Farmers in flood-prone regions are producing 3 tons of vegetables monthly using water hyacinth and bamboo rafts.",
    content: `In the flood-prone wetlands of southern Bangladesh, a centuries-old agricultural technique is being revived with modern twists. Floating gardens -- rafts woven from water hyacinth and bamboo -- are allowing farmers to grow crops even when their land is submerged for months.`,
    url: '#',
    imageUrl: '/assets/bangladesh-climate.jpg',
    publishedAt: '2026-06-09T10:00:00Z',
    source: 'BRAC Reports',
    sourceTrust: 0.90,
    region: 'Bangladesh',
    regionTier: 'underreported',
    category: 'Environment',
    hopeScore: 0.76,
    verifiedFacts: 0.80,
    systemicImpact: 0.78,
    actionability: 0.68,
    novelty: 0.74,
    representation: 0.90,
    tier: 'verified',
  },
  {
    id: '4',
    title: "Scientists Develop Plastic-Eating Enzyme That Works in Hours",
    summary: "MIT researchers have engineered an enzyme that breaks down PET plastic 6 times faster than previous versions.",
    content: `Researchers at MIT have developed a new variant of the PETase enzyme that can break down polyethylene terephthalate (PET) plastic six times faster than previous versions, potentially revolutionizing recycling processes worldwide.`,
    url: '#',
    imageUrl: '/assets/card-innovation.jpg',
    publishedAt: '2026-06-08T16:00:00Z',
    source: 'Nature',
    sourceTrust: 0.98,
    region: 'Global',
    regionTier: 'global',
    category: 'Innovation',
    hopeScore: 0.74,
    verifiedFacts: 0.96,
    systemicImpact: 0.72,
    actionability: 0.58,
    novelty: 0.90,
    representation: 0.50,
    tier: 'verified',
  },
  {
    id: '5',
    title: "Strangers Raise $50,000 for Homeless Man Who Returned Wallet",
    summary: "A community fundraiser secured an apartment and fresh start for a man who chose honesty over desperation.",
    content: `When James Robertson found a wallet containing $2,300 in cash on a Chicago street corner, he didn't hesitate. Despite being homeless for three years, he walked three miles to return it to its owner. What happened next changed his life.`,
    url: '#',
    imageUrl: '/assets/card-economic.jpg',
    publishedAt: '2026-06-08T12:00:00Z',
    source: 'Good News Network',
    sourceTrust: 0.75,
    region: 'USA',
    regionTier: 'western',
    category: 'Community',
    hopeScore: 0.58,
    verifiedFacts: 0.72,
    systemicImpact: 0.38,
    actionability: 0.80,
    novelty: 0.62,
    representation: 0.40,
    tier: 'constructive',
  },
  {
    id: '6',
    title: "Kenya Launches Africa's Largest Electric Bus Fleet",
    summary: "Nairobi's new fleet of 200 electric buses will reduce city transport emissions by 35% within two years.",
    content: `Nairobi has launched the largest electric bus fleet in Africa, with 200 zero-emission vehicles hitting the streets this month. The $85 million initiative, funded through a public-private partnership, aims to reduce the city's transport emissions by 35% within two years.`,
    url: '#',
    imageUrl: '/assets/card-environment.jpg',
    publishedAt: '2026-06-07T09:00:00Z',
    source: 'The Daily Star',
    sourceTrust: 0.78,
    region: 'Kenya',
    regionTier: 'developing',
    category: 'Environment',
    hopeScore: 0.84,
    verifiedFacts: 0.90,
    systemicImpact: 0.88,
    actionability: 0.62,
    novelty: 0.78,
    representation: 0.70,
    tier: 'verified',
  },
  {
    id: '7',
    title: "Nepal's All-Female Ranger Unit Protects Endangered Rhinos",
    summary: "The first all-female anti-poaching unit in Chitwan National Park has achieved zero rhino poaching for 18 consecutive months.",
    content: `In Chitwan National Park, a team of 42 female rangers is rewriting the rules of wildlife conservation. Since their deployment 18 months ago, rhino poaching in their sector has dropped to zero -- a first in the park's 50-year history.`,
    url: '#',
    imageUrl: '/assets/card-peace.jpg',
    publishedAt: '2026-06-07T07:00:00Z',
    source: 'Positive.News',
    sourceTrust: 0.82,
    region: 'Nepal',
    regionTier: 'underreported',
    category: 'Environment',
    hopeScore: 0.88,
    verifiedFacts: 0.86,
    systemicImpact: 0.84,
    actionability: 0.58,
    novelty: 0.82,
    representation: 0.90,
    tier: 'gold',
  },
  {
    id: '8',
    title: "Brazilian Favela Youth Code Their Way Out of Poverty",
    summary: "A coding bootcamp in Rio's favelas has placed 3,000 graduates in tech jobs with an average salary of $45,000.",
    content: `In the narrow alleys of Complexo do Alemão, one of Rio de Janeiro's largest favelas, a quiet revolution is taking place. Young people who once faced limited prospects are now writing code for some of Brazil's biggest tech companies.`,
    url: '#',
    imageUrl: '/assets/card-community.jpg',
    publishedAt: '2026-06-06T11:00:00Z',
    source: 'Solutions Journalism Network',
    sourceTrust: 0.95,
    region: 'Brazil',
    regionTier: 'developing',
    category: 'Economic',
    hopeScore: 0.79,
    verifiedFacts: 0.88,
    systemicImpact: 0.82,
    actionability: 0.74,
    novelty: 0.76,
    representation: 0.70,
    tier: 'verified',
  },
  {
    id: '9',
    title: "New Malaria Vaccine Shows 94% Efficacy in Phase 3 Trials",
    summary: "A new RNA-based malaria vaccine developed by a Nigerian-German research partnership shows unprecedented protection.",
    content: `A groundbreaking malaria vaccine has shown 94% efficacy in Phase 3 clinical trials, potentially saving hundreds of thousands of lives annually. The vaccine, developed through a partnership between Nigerian and German researchers, represents a major leap forward in the fight against one of humanity's oldest diseases.`,
    url: '#',
    imageUrl: '/assets/card-health.jpg',
    publishedAt: '2026-06-06T08:00:00Z',
    source: 'The Lancet',
    sourceTrust: 0.98,
    region: 'Nigeria',
    regionTier: 'underreported',
    category: 'Health',
    hopeScore: 0.93,
    verifiedFacts: 0.98,
    systemicImpact: 0.96,
    actionability: 0.52,
    novelty: 0.92,
    representation: 0.90,
    tier: 'gold',
  },
  {
    id: '10',
    title: "Indian Villages Achieve 100% Solar Power Independence",
    summary: "A cluster of 12 villages in Rajasthan now runs entirely on solar energy, eliminating grid dependency entirely.",
    content: `In the sun-baked landscape of rural Rajasthan, a clean energy revolution is unfolding. Twelve villages, once plagued by daily power outages, have achieved complete energy independence through a community-managed solar microgrid system.`,
    url: '#',
    imageUrl: '/assets/card-innovation.jpg',
    publishedAt: '2026-06-05T13:00:00Z',
    source: 'World Bank',
    sourceTrust: 0.96,
    region: 'India',
    regionTier: 'developing',
    category: 'Innovation',
    hopeScore: 0.87,
    verifiedFacts: 0.94,
    systemicImpact: 0.86,
    actionability: 0.62,
    novelty: 0.78,
    representation: 0.70,
    tier: 'gold',
  },
  {
    id: '11',
    title: "Bangladesh's Solar Home Systems Reach 6 Million Households",
    summary: "The world's largest off-grid solar program has now powered 6 million rural homes, creating 100,000 green jobs.",
    content: `Bangladesh's Infrastructure Development Company Limited (IDCOL) has achieved a historic milestone: 6 million solar home systems now power rural households across the country. The program, which began in 2003, has become the world's largest off-grid renewable energy initiative.`,
    url: '#',
    imageUrl: '/assets/bangladesh-education.jpg',
    publishedAt: '2026-06-05T06:00:00Z',
    source: 'IDCOL',
    sourceTrust: 0.88,
    region: 'Bangladesh',
    regionTier: 'underreported',
    category: 'Innovation',
    hopeScore: 0.91,
    verifiedFacts: 0.92,
    systemicImpact: 0.94,
    actionability: 0.72,
    novelty: 0.70,
    representation: 0.90,
    tier: 'gold',
  },
];

export const getFeaturedArticle = (): Article =>
  articles.reduce((best, a) => (a.hopeScore > best.hopeScore ? a : best), articles[0]);

export const getBangladeshArticles = (): Article[] =>
  articles.filter((a) => a.region === 'Bangladesh');

export const getArticlesByCategory = (category: string): Article[] =>
  articles.filter((a) => a.category === category);

export const getArticleById = (id: string): Article | undefined =>
  articles.find((a) => a.id === id);

export const getRelatedArticles = (article: Article, limit = 4): Article[] =>
  articles
    .filter((a) => a.id !== article.id && (a.category === article.category || a.region === article.region))
    .slice(0, limit);

export const dashboardMetrics = [
  { label: 'Diseases Eliminated', value: 3, trend: [1, 2, 2, 3, 3, 3, 3] },
  { label: 'Peace Treaties Signed', value: 12, trend: [5, 7, 8, 9, 10, 11, 12] },
  { label: 'Tons Plastic Removed', value: 2.4, suffix: 'M', trend: [1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.4] },
  { label: 'Students Enrolled', value: 450, suffix: 'K', trend: [200, 250, 300, 340, 380, 410, 450] },
  { label: 'Homes Solar Powered', value: 6.2, suffix: 'M', trend: [4.0, 4.5, 5.0, 5.4, 5.7, 6.0, 6.2] },
  { label: 'Health Workers Trained', value: 85, suffix: 'K', trend: [40, 50, 60, 68, 73, 79, 85] },
];

export const impactMapRegions = [
  { name: 'Rwanda', lat: -1.94, lng: 29.87, count: 8, score: 0.92 },
  { name: 'Bangladesh', lat: 23.68, lng: 90.36, count: 12, score: 0.88 },
  { name: 'Colombia', lat: 4.57, lng: -74.30, count: 6, score: 0.82 },
  { name: 'Kenya', lat: -1.29, lng: 36.82, count: 9, score: 0.84 },
  { name: 'Nigeria', lat: 9.08, lng: 8.68, count: 7, score: 0.93 },
  { name: 'Nepal', lat: 28.39, lng: 84.12, count: 5, score: 0.88 },
  { name: 'Brazil', lat: -14.24, lng: -51.93, count: 10, score: 0.79 },
  { name: 'India', lat: 20.59, lng: 78.96, count: 14, score: 0.87 },
  { name: 'USA', lat: 37.09, lng: -95.71, count: 4, score: 0.58 },
];

export const localHeroes = [
  {
    name: 'Claire Murekatete',
    role: 'Community Health Worker, Rwanda',
    avatar: '/assets/avatar-hero-1.jpg',
    quote: '"Every mother deserves a safe birth. We make sure no one is left behind."',
    storyId: '1',
  },
  {
    name: 'Dr. Farzana Rahman',
    role: 'STEM Educator, Bangladesh',
    avatar: '/assets/avatar-hero-2.jpg',
    quote: '"When a girl learns science, she changes not just her future, but her entire community."',
    storyId: '11',
  },
];
