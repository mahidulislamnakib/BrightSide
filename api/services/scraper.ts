/**
 * BrightSide Scraper Engine v3 — Universal News Collector
 * 80+ sources: Newspapers, RSS feeds, positive news, NGOs, academic, institutional
 * HTML scraping + RSS parsing + content enrichment
 */

import { XMLParser } from "fast-xml-parser";
import { classifyArticle } from "../lib/classifier";
import { getDb } from "../queries/connection";
import { articles, sources, scraperRuns } from "@db/schema";
import { eq, sql, desc } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface FeedItem {
  title?: string;
  description?: string;
  content?: string;
  "content:encoded"?: string;
  link?: string;
  guid?: string | { _: string };
  enclosure?: { url?: string; type?: string };
  "media:content"?: { url?: string; medium?: string };
  "media:thumbnail"?: { url?: string };
  pubDate?: string;
  published?: string;
  updated?: string;
  date?: string;
  category?: string | string[];
  creator?: string;
}

interface FeedSource {
  id: number;
  name: string;
  rssUrl: string;
  category: string;
  trustScore: string;
  regionFocus?: string | null;
}

export interface ScrapeResult {
  source: string;
  fetched: number;
  newArticles: number;
  errors: string[];
  durationMs: number;
}

export interface ScraperStatus {
  lastRun: Date | null;
  totalSources: number;
  totalArticles: number;
  todayNew: number;
  isRunning: boolean;
  lastError: string | null;
}

// ═══════════════════════════════════════════════════════════
// SOURCE DATABASE — 80+ Real Sources
// ═══════════════════════════════════════════════════════════

const RSS_FEEDS: FeedSource[] = [
  // ═══ TIER 1: Major Positive News Outlets ═══
  { id: 1, name: "Positive.News", rssUrl: "https://www.positive.news/feed/", category: "human_curated", trustScore: "0.82", regionFocus: "Global" },
  { id: 2, name: "Good News Network", rssUrl: "https://www.goodnewsnetwork.org/feed/", category: "human_curated", trustScore: "0.75", regionFocus: "USA" },
  { id: 3, name: "Optimist Daily", rssUrl: "https://www.optimistdaily.com/feed/", category: "human_curated", trustScore: "0.78", regionFocus: "Global" },
  { id: 4, name: "Reasons to be Cheerful", rssUrl: "https://reasonstobecheerful.world/feed/", category: "investigative", trustScore: "0.88", regionFocus: "Global" },
  { id: 5, name: "Future Crunch", rssUrl: "https://futurecrunch.com/rss", category: "human_curated", trustScore: "0.85", regionFocus: "Global" },
  { id: 6, name: "The Happy Broadcast", rssUrl: "https://www.thehappybroadcast.com/rss", category: "human_curated", trustScore: "0.70", regionFocus: "Global" },
  { id: 7, name: "Global Citizen", rssUrl: "https://www.globalcitizen.org/en/rss/", category: "human_curated", trustScore: "0.81", regionFocus: "Global" },
  { id: 8, name: "BrightVibes", rssUrl: "https://brightvibes.com/feed", category: "human_curated", trustScore: "0.73", regionFocus: "Europe" },
  { id: 9, name: "EcoWatch", rssUrl: "https://www.ecowatch.com/feed/", category: "environment", trustScore: "0.80", regionFocus: "Global" },
  { id: 10, name: "CleanTechnica", rssUrl: "https://cleantechnica.com/feed/", category: "environment", trustScore: "0.78", regionFocus: "Global" },

  // ═══ TIER 2: Investigative & Solutions Journalism ═══
  { id: 11, name: "Solutions Journalism Network", rssUrl: "https://solutionsjournalism.org/feed", category: "investigative", trustScore: "0.95", regionFocus: "Global" },
  { id: 12, name: "Yes! Magazine", rssUrl: "https://www.yesmagazine.org/rss", category: "investigative", trustScore: "0.87", regionFocus: "USA" },
  { id: 13, name: "Stanford Social Innovation", rssUrl: "https://ssir.org/site/rss", category: "academic", trustScore: "0.94", regionFocus: "Global" },
  { id: 14, name: "Fast Company - Impact", rssUrl: "https://www.fastcompany.com/impact/feed", category: "investigative", trustScore: "0.83", regionFocus: "Global" },
  { id: 15, name: "Christian Science Monitor", rssUrl: "https://www.csmonitor.com/rss/positive.rss", category: "investigative", trustScore: "0.89", regionFocus: "USA" },
  { id: 16, name: "Apolitical", rssUrl: "https://apolitical.co/rss", category: "institutional", trustScore: "0.86", regionFocus: "Global" },
  { id: 17, name: "The Correspondent", rssUrl: "https://thecorrespondent.com/rss", category: "investigative", trustScore: "0.84", regionFocus: "Global" },
  { id: 18, name: "ProPublica", rssUrl: "https://www.propublica.org/feeds/default", category: "investigative", trustScore: "0.96", regionFocus: "USA" },

  // ═══ TIER 3: Major Newspapers (filtered for positive) ═══
  { id: 19, name: "The Guardian - Global Development", rssUrl: "https://www.theguardian.com/global-development/rss", category: "institutional", trustScore: "0.91", regionFocus: "Global" },
  { id: 20, name: "The Guardian - Environment", rssUrl: "https://www.theguardian.com/environment/rss", category: "environment", trustScore: "0.91", regionFocus: "Global" },
  { id: 21, name: "BBC News - Science & Environment", rssUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "institutional", trustScore: "0.93", regionFocus: "Global" },
  { id: 22, name: "BBC News - Technology", rssUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "institutional", trustScore: "0.93", regionFocus: "Global" },
  { id: 23, name: "BBC News - Health", rssUrl: "https://feeds.bbci.co.uk/news/health/rss.xml", category: "institutional", trustScore: "0.93", regionFocus: "Global" },
  { id: 24, name: "NPR News", rssUrl: "https://feeds.npr.org/1001/rss.xml", category: "institutional", trustScore: "0.92", regionFocus: "USA" },
  { id: 25, name: "NPR - Science", rssUrl: "https://feeds.npr.org/1007/rss.xml", category: "institutional", trustScore: "0.92", regionFocus: "USA" },
  { id: 26, name: "Reuters - Sustainability", rssUrl: "https://www.reuters.com/rss/sustainability", category: "institutional", trustScore: "0.94", regionFocus: "Global" },
  { id: 27, name: "Reuters - Science", rssUrl: "https://www.reuters.com/rss/science", category: "institutional", trustScore: "0.94", regionFocus: "Global" },
  { id: 28, name: "Washington Post - Climate", rssUrl: "https://www.washingtonpost.com/climate-environment/rss", category: "institutional", trustScore: "0.90", regionFocus: "USA" },
  { id: 29, name: "NYT - Science", rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml", category: "institutional", trustScore: "0.93", regionFocus: "USA" },
  { id: 30, name: "NYT - Climate", rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml", category: "institutional", trustScore: "0.93", regionFocus: "USA" },
  { id: 31, name: "AP News", rssUrl: "https://rsshub.app/apnews/topics/apf-topnews", category: "institutional", trustScore: "0.95", regionFocus: "Global" },
  { id: 32, name: "The Independent - Climate", rssUrl: "https://www.independent.co.uk/climate-change/rss", category: "institutional", trustScore: "0.86", regionFocus: "UK" },
  { id: 33, name: "Al Jazeera - Climate", rssUrl: "https://www.aljazeera.com/xml/rss/all.xml", category: "institutional", trustScore: "0.88", regionFocus: "Global" },

  // ═══ TIER 4: NGOs & International Institutions ═══
  { id: 34, name: "World Economic Forum", rssUrl: "https://feeds.weforum.org/agenda/development", category: "institutional", trustScore: "0.92", regionFocus: "Global" },
  { id: 35, name: "UNDP", rssUrl: "https://www.undp.org/rss", category: "institutional", trustScore: "0.93", regionFocus: "Global" },
  { id: 36, name: "UN News", rssUrl: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", category: "institutional", trustScore: "0.94", regionFocus: "Global" },
  { id: 37, name: "WHO News", rssUrl: "https://www.who.int/rss-feeds/news-english.xml", category: "institutional", trustScore: "0.95", regionFocus: "Global" },
  { id: 38, name: "World Bank", rssUrl: "https://www.worldbank.org/en/news/rss", category: "institutional", trustScore: "0.94", regionFocus: "Global" },
  { id: 39, name: "UNICEF", rssUrl: "https://www.unicef.org/rss", category: "institutional", trustScore: "0.93", regionFocus: "Global" },
  { id: 40, name: "Oxfam", rssUrl: "https://www.oxfam.org/en/rss", category: "institutional", trustScore: "0.87", regionFocus: "Global" },
  { id: 41, name: "Amnesty International", rssUrl: "https://www.amnesty.org/en/rss/", category: "institutional", trustScore: "0.90", regionFocus: "Global" },
  { id: 42, name: "Human Rights Watch", rssUrl: "https://www.hrw.org/news.rss", category: "institutional", trustScore: "0.91", regionFocus: "Global" },
  { id: 43, name: "Greenpeace", rssUrl: "https://www.greenpeace.org/international/rss/news/", category: "environment", trustScore: "0.84", regionFocus: "Global" },

  // ═══ TIER 5: Science & Academic ═══
  { id: 44, name: "Nature - News", rssUrl: "https://www.nature.com/nature.rss", category: "academic", trustScore: "0.98", regionFocus: "Global" },
  { id: 45, name: "Science Magazine", rssUrl: "https://www.science.org/rss/news_current.xml", category: "academic", trustScore: "0.97", regionFocus: "Global" },
  { id: 46, name: "The Lancet", rssUrl: "https://www.thelancet.com/rss", category: "academic", trustScore: "0.97", regionFocus: "Global" },
  { id: 47, name: "Scientific American", rssUrl: "https://www.scientificamerican.com/rss/", category: "academic", trustScore: "0.92", regionFocus: "Global" },
  { id: 48, name: "Smithsonian Magazine", rssUrl: "https://www.smithsonianmag.com/rss/", category: "academic", trustScore: "0.88", regionFocus: "Global" },
  { id: 49, name: "MIT Technology Review", rssUrl: "https://www.technologyreview.com/feed/", category: "academic", trustScore: "0.93", regionFocus: "Global" },
  { id: 50, name: "Ars Technica - Science", rssUrl: "https://arstechnica.com/science/feed/", category: "academic", trustScore: "0.87", regionFocus: "Global" },
  { id: 51, name: "Phys.org", rssUrl: "https://phys.org/rss-feed/", category: "academic", trustScore: "0.85", regionFocus: "Global" },

  // ═══ TIER 6: Regional & Community Sources ═══
  { id: 52, name: "The Better India", rssUrl: "https://www.thebetterindia.com/feed/", category: "community", trustScore: "0.76", regionFocus: "India" },
  { id: 53, name: "All Africa", rssUrl: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf", category: "community", trustScore: "0.82", regionFocus: "Africa" },
  { id: 54, name: "Daily Maverick", rssUrl: "https://www.dailymaverick.co.za/rss/", category: "institutional", trustScore: "0.85", regionFocus: "South Africa" },
  { id: 55, name: "The Africa Report", rssUrl: "https://www.theafricareport.com/feed/", category: "institutional", trustScore: "0.83", regionFocus: "Africa" },
  { id: 56, name: "Scroll.in", rssUrl: "https://scroll.in/rss", category: "institutional", trustScore: "0.84", regionFocus: "India" },
  { id: 57, name: "Quartz Africa", rssUrl: "https://qz.com/africa/feed", category: "institutional", trustScore: "0.85", regionFocus: "Africa" },
  { id: 58, name: "Rest of World", rssUrl: "https://restofworld.org/feed/", category: "investigative", trustScore: "0.88", regionFocus: "Global South" },
  { id: 59, name: "Mongabay", rssUrl: "https://news.mongabay.com/feed/", category: "environment", trustScore: "0.88", regionFocus: "Global" },
  { id: 60, name: "Carbon Brief", rssUrl: "https://www.carbonbrief.org/feed/", category: "environment", trustScore: "0.91", regionFocus: "Global" },

  // ═══ TIER 7: Innovation & Technology ═══
  { id: 61, name: "TechCrunch", rssUrl: "https://techcrunch.com/feed/", category: "innovation", trustScore: "0.84", regionFocus: "Global" },
  { id: 62, name: "Wired - Science", rssUrl: "https://www.wired.com/feed/category/science/latest/rss", category: "innovation", trustScore: "0.88", regionFocus: "Global" },
  { id: 63, name: "VentureBeat", rssUrl: "https://venturebeat.com/feed/", category: "innovation", trustScore: "0.82", regionFocus: "Global" },
  { id: 64, name: "The Verge - Science", rssUrl: "https://www.theverge.com/science/rss/index.xml", category: "innovation", trustScore: "0.86", regionFocus: "Global" },
  { id: 65, name: "Engadget", rssUrl: "https://www.engadget.com/rss.xml", category: "innovation", trustScore: "0.83", regionFocus: "Global" },

  // ═══ TIER 8: Health & Medical ═══
  { id: 66, name: "Medical News Today", rssUrl: "https://www.medicalnewstoday.com/newsfeeds/opinions", category: "health", trustScore: "0.87", regionFocus: "Global" },
  { id: 67, name: "Health Affairs", rssUrl: "https://www.healthaffairs.org/rss", category: "academic", trustScore: "0.91", regionFocus: "Global" },
  { id: 68, name: "Kaiser Health News", rssUrl: "https://khn.org/news/feed/", category: "institutional", trustScore: "0.90", regionFocus: "Global" },
  { id: 69, name: "CIDRAP", rssUrl: "https://www.cidrap.umn.edu/rss", category: "academic", trustScore: "0.92", regionFocus: "Global" },

  // ═══ TIER 9: Development & Economics ═══
  { id: 70, name: "Devex", rssUrl: "https://www.devex.com/news/rss", category: "institutional", trustScore: "0.89", regionFocus: "Global" },
  { id: 71, name: "Brookings Institution", rssUrl: "https://www.brookings.edu/feed/", category: "academic", trustScore: "0.93", regionFocus: "Global" },
  { id: 72, name: "CGD (Center for Global Development)", rssUrl: "https://www.cgdev.org/rss", category: "academic", trustScore: "0.91", regionFocus: "Global" },
  { id: 73, name: "Overseas Development Institute", rssUrl: "https://odi.org/en/rss", category: "academic", trustScore: "0.88", regionFocus: "Global" },
  { id: 74, name: "McKinsey Global Institute", rssUrl: "https://www.mckinsey.com/rss", category: "institutional", trustScore: "0.90", regionFocus: "Global" },

  // ═══ TIER 10: Environment & Climate ═══
  { id: 75, name: "Grist", rssUrl: "https://grist.org/feed/", category: "environment", trustScore: "0.86", regionFocus: "Global" },
  { id: 76, name: "Inside Climate News", rssUrl: "https://insideclimatenews.org/feed/", category: "environment", trustScore: "0.89", regionFocus: "Global" },
  { id: 77, name: "Yale Environment 360", rssUrl: "https://e360.yale.edu/feed.xml", category: "environment", trustScore: "0.91", regionFocus: "Global" },
  { id: 78, name: "Ensia", rssUrl: "https://ensia.com/feed/", category: "environment", trustScore: "0.87", regionFocus: "Global" },
  { id: 79, name: "Conversation - Environment", rssUrl: "https://theconversation.com/environment/articles.atom", category: "academic", trustScore: "0.88", regionFocus: "Global" },
  { id: 80, name: "Conversation - Health", rssUrl: "https://theconversation.com/health/articles.atom", category: "academic", trustScore: "0.88", regionFocus: "Global" },
  { id: 81, name: "Conversation - Science", rssUrl: "https://theconversation.com/science/articles.atom", category: "academic", trustScore: "0.88", regionFocus: "Global" },
  { id: 82, name: " TreeHugger", rssUrl: "https://www.treehugger.com/rss.xml", category: "environment", trustScore: "0.80", regionFocus: "Global" },
];

// ═══════════════════════════════════════════════════════════
// FETCHING WITH RETRY & POLITENESS
// ═══════════════════════════════════════════════════════════

async function fetchWithRetry(url: string, retries = 3, timeoutMs = 15000): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "BrightSide-Bot/3.0 (https://brightside.app; news@brightside.app) Mozilla/5.0",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
      });
      clearTimeout(timeout);
      if (response.status === 429) {
        await sleep(attempt * 3000);
        continue;
      }
      if (!response.ok) {
        if (attempt < retries) { await sleep(attempt * 1000); continue; }
        return null;
      }
      const text = await response.text();
      if (!text || text.trim().length < 50) return null;
      return text;
    } catch {
      if (attempt >= retries) return null;
      await sleep(attempt * 1000);
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════
// MULTI-FORMAT FEED PARSING (RSS 2.0 / Atom / RDF / JSON)
// ═══════════════════════════════════════════════════════════

function parseFeed(xml: string): FeedItem[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: false,
      trimValues: true,
      parseTagValue: true,
      cdataPropName: "__cdata",
    });
    const parsed = parser.parse(xml);

    // RSS 2.0
    const channel = parsed?.rss?.channel;
    if (channel?.item) return normalizeItems(Array.isArray(channel.item) ? channel.item : [channel.item]);

    // Atom
    const feed = parsed?.feed;
    if (feed?.entry) {
      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
      return normalizeItems(entries.map((e: FeedItem) => ({
        ...e,
        description: (e as Record<string, unknown>).content as string || e.description || (e as Record<string, unknown>).summary as string,
        pubDate: e.published || e.updated || (e as Record<string, unknown>).date as string,
      })));
    }

    // RDF / RSS 1.0
    const rdf = parsed?.["rdf:RDF"] || parsed?.RDF;
    if (rdf?.item) return normalizeItems(Array.isArray(rdf.item) ? rdf.item : [rdf.item]);

    return [];
  } catch {
    return [];
  }
}

function normalizeItems(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => item && (item.title || item.description));
}

// ═══════════════════════════════════════════════════════════
// CONTENT EXTRACTION
// ═══════════════════════════════════════════════════════════

function extractImageUrl(item: FeedItem): string {
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image")) return item.enclosure.url;
  if (item.enclosure?.url) return item.enclosure.url;
  const mc = (item as Record<string, unknown>)["media:content"] as { url?: string } | undefined;
  if (mc?.url) return mc.url;
  const mt = (item as Record<string, unknown>)["media:thumbnail"] as { url?: string } | undefined;
  if (mt?.url) return mt.url;
  for (const field of [item.description, (item as Record<string, unknown>)["content:encoded"] as string, item.content]) {
    if (typeof field === "string") {
      const match = field.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
      if (match) return match[1];
    }
  }
  return "/assets/card-community.jpg";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);
}

function getItemContent(item: FeedItem): string {
  const ce = (item as Record<string, unknown>)["content:encoded"];
  if (typeof ce === "string" && ce.length > 50) return cleanHtml(ce);
  if (item.content && typeof item.content === "string" && item.content.length > 50) return cleanHtml(item.content);
  if (item.description && item.description.length > 10) return cleanHtml(item.description);
  return "";
}

function getItemSummary(item: FeedItem): string {
  const desc = item.description ? cleanHtml(item.description) : "";
  if (desc.length > 20) return desc.slice(0, 500);
  return getItemContent(item).slice(0, 500);
}

function getGuid(item: FeedItem): string {
  if (typeof item.guid === "string") return item.guid;
  if (item.guid && typeof item.guid === "object" && "_" in item.guid) return (item.guid as { _: string })._;
  return item.link || "";
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

// ═══════════════════════════════════════════════════════════
// DEDUPLICATION
// ═══════════════════════════════════════════════════════════

async function buildExistingSet(): Promise<{ titles: Set<string>; urls: Set<string> }> {
  const db = getDb();
  const existing = await db
    .select({ title: articles.title, url: articles.url })
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(10000);
  return {
    titles: new Set(existing.map((a) => normalizeTitle(a.title))),
    urls: new Set(existing.map((a) => a.url).filter(Boolean)),
  };
}

// ═══════════════════════════════════════════════════════════
// REGION DETECTION
// ═══════════════════════════════════════════════════════════

function detectRegion(title: string, content: string): { region: string; tier: "underreported" | "developing" | "global" | "western" } {
  const text = `${title} ${content}`.toLowerCase();
  const underreported = ["rwanda", "bangladesh", "nepal", "nigeria", "laos", "haiti", "yemen", "malawi", "bolivia", "myanmar", "afghanistan", "somalia", "madagascar", "ethiopia", "tanzania", "mali", "niger", "chad", "south sudan", "democratic republic of congo", "guinea", "sierra leone", "liberia", "burundi", "central african republic"];
  const developing = ["colombia", "kenya", "brazil", "india", "pakistan", "ghana", "uganda", "philippines", "vietnam", "indonesia", "peru", "ecuador", "morocco", "egypt", "jordan", "lebanon", "thailand", "sri lanka", "cambodia", "zambia", "zimbabwe", "senegal", "tunisia", "algeria", "south africa", "mexico", "argentina", "chile", "turkey", "iran", "iraq"];
  const western = ["usa", "united states", "america", "uk", "united kingdom", "canada", "australia", "germany", "france", "netherlands", "sweden", "norway", "denmark", "finland", "switzerland", "austria", "belgium", "ireland", "new zealand", "spain", "italy", "japan", "south korea", "singapore"];

  for (const r of underreported) if (text.includes(r)) return { region: r.charAt(0).toUpperCase() + r.slice(1), tier: "underreported" };
  for (const r of developing) if (text.includes(r)) return { region: r.charAt(0).toUpperCase() + r.slice(1), tier: "developing" };
  for (const r of western) if (text.includes(r)) return { region: r === "america" || r === "united states" ? "USA" : r.charAt(0).toUpperCase() + r.slice(1), tier: "western" };
  return { region: "Global", tier: "global" };
}

// ═══════════════════════════════════════════════════════════
// POSITIVE FILTER — Only keep hopeful/positive stories
// ═══════════════════════════════════════════════════════════

const POSITIVE_SIGNALS = [
  "breakthrough", "cure", "vaccine", "eliminate", "eradicate", "decline", "reduce", "fall",
  "progress", "milestone", "achievement", "success", "launch", "discover", "invent",
  "renewable", "solar", "wind energy", "clean energy", "reforestation", "conservation",
  "protect", "preserve", "restore", "recover", "heal", "treat", "save", "rescue",
  "donate", "fund", "invest", "grant", "aid", "relief", "support", "help",
  "peace", "treaty", "agreement", "cooperation", "unity", "reconcile", "dialogue",
  "education", "school", "learn", "literacy", "graduate", "scholarship",
  "growth", "expand", "create", "jobs", "employment", "opportunity",
  "rights", "equality", "justice", "freedom", "democracy", "vote", "elect",
  "record", "highest", "lowest", "first", "historic", "unprecedented",
  "innovation", "technology", "ai", "robot", "space", "mars", "satellite",
  "electric vehicle", "ev", "carbon neutral", "net zero", "sustainable",
];

const NEGATIVE_SIGNALS = [
  "death toll", "killed", "murder", "assassination", "terrorist", "bombing",
  "massacre", "genocide", "war crime", "atrocity", "torture", "execute",
  "crash", "disaster", "catastrophe", "tragedy", "horror", "devastation",
  "collapse", "bankrupt", "fraud", "scandal", "corrupt", "bribe",
  "outbreak", "epidemic", "plague", "famine", "starvation",
];

function isPositiveStory(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  const posCount = POSITIVE_SIGNALS.filter((s) => text.includes(s)).length;
  const negCount = NEGATIVE_SIGNALS.filter((s) => text.includes(s)).length;
  // Must have at least 1 positive signal and more positive than negative
  return posCount >= 1 && posCount > negCount;
}

// ═══════════════════════════════════════════════════════════
// CORE SCRAPING — Single Source
// ═══════════════════════════════════════════════════════════

export async function scrapeSource(source: FeedSource): Promise<ScrapeResult> {
  const start = Date.now();
  const result: ScrapeResult = { source: source.name, fetched: 0, newArticles: 0, errors: [], durationMs: 0 };

  const xml = await fetchWithRetry(source.rssUrl, 3, 15000);
  if (!xml) { result.errors.push("Failed to fetch feed"); result.durationMs = Date.now() - start; return result; }

  const items = parseFeed(xml);
  result.fetched = items.length;
  if (items.length === 0) { result.errors.push("No valid items"); result.durationMs = Date.now() - start; return result; }

  const existing = await buildExistingSet();
  const seenGuids = new Set<string>();
  const db = getDb();

  for (const item of items.slice(0, 10)) {
    try {
      const title = (item.title || "Untitled").trim();
      if (!title || title === "Untitled" || title.length < 10) continue;

      const url = item.link || getGuid(item) || "#";
      if (url !== "#" && existing.urls.has(url)) continue;

      const normTitle = normalizeTitle(title);
      if (existing.titles.has(normTitle)) continue;

      const guid = getGuid(item);
      if (guid && seenGuids.has(guid)) continue;
      if (guid) seenGuids.add(guid);

      const summary = getItemSummary(item);
      const content = getItemContent(item);
      const imageUrl = extractImageUrl(item);

      // Parse date
      let pubDate: Date;
      const dateStr = item.pubDate || item.published || item.updated || item.date;
      if (dateStr) {
        const d = new Date(dateStr);
        pubDate = isNaN(d.getTime()) ? new Date() : d;
        if (pubDate > new Date(Date.now() + 86400000)) pubDate = new Date();
        if (pubDate < new Date(Date.now() - 60 * 86400000)) continue; // Skip articles >60 days old
      } else {
        pubDate = new Date();
      }

      // Positive filter — only good news
      if (!isPositiveStory(title, summary)) continue;

      // Detect region
      const { region, tier } = detectRegion(title, content || summary);

      // Classify with Hope Score
      const classification = classifyArticle(title, summary, content, source.name, region, pubDate);

      // Insert
      await db.insert(articles).values({
        title: title.slice(0, 500),
        summary: summary.slice(0, 1000) || null,
        content: content.slice(0, 5000) || null,
        url: url.slice(0, 500),
        imageUrl: imageUrl.slice(0, 500),
        publishedAt: pubDate,
        sourceId: source.id,
        region,
        regionTier: tier,
        category: classification.category,
        hopeScore: String(classification.overall),
        verifiedFacts: String(classification.verifiedFacts),
        systemicImpact: String(classification.systemicImpact),
        actionability: String(classification.actionability),
        novelty: String(classification.novelty),
        representation: String(classification.representation),
        tier: classification.tier,
        isVerified: classification.verifiedFacts > 0.7,
        hasAction: classification.actionability > 0.5,
      });

      existing.titles.add(normTitle);
      if (url !== "#") existing.urls.add(url);
      result.newArticles++;
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  // Update source last_fetch
  try { await db.update(sources).set({ lastFetch: new Date() }).where(eq(sources.id, source.id)); } catch { /* ignore */ }

  result.durationMs = Date.now() - start;
  return result;
}

// ═══════════════════════════════════════════════════════════
// BATCH SCRAPING — All Sources
// ═══════════════════════════════════════════════════════════

export async function scrapeAllSources(): Promise<ScrapeResult[]> {
  const runStart = Date.now();
  console.log(`[scraper] ═══ STARTING UNIVERSAL SCRAPE: ${RSS_FEEDS.length} sources ═══`);

  const results: ScrapeResult[] = [];
  let totalErrors: string[] = [];

  // Create run record
  const db = getDb();
  let runId: number | null = null;
  try {
    const [run] = await db.insert(scraperRuns).values({ status: "running", triggeredBy: "scheduled" });
    runId = run.insertId ? Number(run.insertId) : null;
  } catch { /* ignore */ }

  // Scrape with 800ms delay between sources
  for (let i = 0; i < RSS_FEEDS.length; i++) {
    const source = RSS_FEEDS[i];
    try {
      const result = await scrapeSource(source);
      results.push(result);
      totalErrors.push(...result.errors);
      if (result.newArticles > 0) {
        console.log(`[scraper] ✓ ${source.name}: +${result.newArticles} new (${result.durationMs}ms)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[scraper] ✗ ${source.name}: ${msg}`);
      results.push({ source: source.name, fetched: 0, newArticles: 0, errors: [msg], durationMs: 0 });
      totalErrors.push(msg);
    }
    if (i < RSS_FEEDS.length - 1) await sleep(800);
  }

  const totalNew = results.reduce((s, r) => s + r.newArticles, 0);
  const totalFound = results.reduce((s, r) => s + r.fetched, 0);
  const duration = Date.now() - runStart;

  console.log(`[scraper] ═══ COMPLETE: ${totalNew} new articles from ${totalFound} fetched (${Math.round(duration / 1000)}s) ═══`);

  // Update run record
  if (runId) {
    try {
      await db.update(scraperRuns).set({
        status: "completed",
        completedAt: new Date(),
        sourcesScraped: results.filter((r) => r.fetched > 0).length,
        articlesFound: totalFound,
        articlesNew: totalNew,
        errors: totalErrors.length > 0 ? JSON.stringify(totalErrors.slice(0, 30)) : null,
      }).where(eq(scraperRuns.id, runId));
    } catch { /* ignore */ }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// BACKGROUND SCRAPE
// ═══════════════════════════════════════════════════════════

export async function scrapeAllSourcesBackground(): Promise<ScrapeResult[]> {
  return scrapeAllSources();
}

// ═══════════════════════════════════════════════════════════
// STATUS & HISTORY
// ═══════════════════════════════════════════════════════════

export async function getScraperStatus(): Promise<ScraperStatus> {
  const db = getDb();
  const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(articles);
  const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(articles).where(sql`${articles.createdAt} >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`);
  const [lastRun] = await db.select().from(scraperRuns).orderBy(desc(scraperRuns.completedAt)).limit(1);
  const [running] = await db.select().from(scraperRuns).where(eq(scraperRuns.status, "running")).limit(1);
  return {
    lastRun: lastRun?.completedAt || null,
    totalSources: RSS_FEEDS.length,
    totalArticles: totalCount?.count ?? 0,
    todayNew: todayCount?.count ?? 0,
    isRunning: !!running,
    lastError: lastRun?.errors ? JSON.parse(lastRun.errors)[0] : null,
  };
}

export async function getScraperSources(): Promise<FeedSource[]> {
  return RSS_FEEDS;
}

export async function getScraperHistory(limit = 10) {
  const db = getDb();
  return db.select().from(scraperRuns).orderBy(desc(scraperRuns.startedAt)).limit(limit);
}
