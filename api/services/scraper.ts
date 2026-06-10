import { XMLParser } from "fast-xml-parser";
import { classifyArticle } from "../lib/classifier";
import { getDb } from "../queries/connection";
import { articles, sources } from "@db/schema";
import { eq, sql } from "drizzle-orm";

interface FeedItem {
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  enclosure?: { url?: string };
  "media:content"?: { url?: string };
  pubDate?: string;
  published?: string;
  date?: string;
}

interface FeedSource {
  id: number;
  name: string;
  rssUrl: string;
  category: string;
  trustScore: string;
  regionFocus?: string | null;
}

const RSS_FEEDS: FeedSource[] = [
  {
    id: 1,
    name: "Solutions Journalism Network",
    rssUrl: "https://solutionsjournalism.org/feed",
    category: "investigative",
    trustScore: "0.95",
    regionFocus: "Global",
  },
  {
    id: 2,
    name: "Positive.News",
    rssUrl: "https://www.positive.news/feed/",
    category: "human_curated",
    trustScore: "0.82",
    regionFocus: "Global",
  },
  {
    id: 5,
    name: "Good News Network",
    rssUrl: "https://www.goodnewsnetwork.org/feed/",
    category: "human_curated",
    trustScore: "0.75",
    regionFocus: "USA",
  },
  {
    id: 10,
    name: "Optimist Daily",
    rssUrl: "https://www.optimistdaily.com/feed/",
    category: "human_curated",
    trustScore: "0.78",
    regionFocus: "Global",
  },
  {
    id: 11,
    name: "Reasons to be Cheerful",
    rssUrl: "https://reasonstobecheerful.world/feed/",
    category: "investigative",
    trustScore: "0.88",
    regionFocus: "Global",
  },
];

async function fetchFeed(url: string): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BrightSide News Aggregator/1.0 (https://brightside.app)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();

    if (!xml || xml.trim().length === 0) {
      return [];
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: false,
      trimValues: true,
    });

    const parsed = parser.parse(xml);

    // Handle RSS 2.0
    const channel = parsed?.rss?.channel;
    if (channel?.item) {
      return Array.isArray(channel.item) ? channel.item : [channel.item];
    }

    // Handle Atom feeds
    const feed = parsed?.feed;
    if (feed?.entry) {
      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
      return entries.map((entry: FeedItem) => ({
        ...entry,
        description: entry.content || entry.description,
        pubDate: entry.published || entry.pubDate || entry.date,
      }));
    }

    return [];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[scraper] Failed to fetch ${url}: ${msg}`);
    return [];
  }
}

function extractImageUrl(item: FeedItem): string {
  // Try enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  // Try media:content
  if ((item as Record<string, unknown>)["media:content"]) {
    const mc = (item as Record<string, unknown>)["media:content"] as { url?: string };
    if (mc.url) return mc.url;
  }
  // Try to extract from description content
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }
  return "/assets/card-community.jpg";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function detectRegion(title: string, content: string): { region: string; tier: "underreported" | "developing" | "global" | "western" } {
  const text = `${title} ${content}`.toLowerCase();

  const underreportedRegions = ["rwanda", "bangladesh", "nepal", "nigeria", "laos", "haiti", "yemen", "malawi", "bolivia"];
  const developingRegions = ["colombia", "kenya", "brazil", "india", "pakistan", "ethiopia", "ghana", "uganda", "tanzania"];
  const westernRegions = ["usa", "united states", "america", "uk", "united kingdom", "canada", "australia", "europe", "germany", "france"];

  for (const region of underreportedRegions) {
    if (text.includes(region)) return { region: region.charAt(0).toUpperCase() + region.slice(1), tier: "underreported" };
  }
  for (const region of developingRegions) {
    if (text.includes(region)) return { region: region.charAt(0).toUpperCase() + region.slice(1), tier: "developing" };
  }
  for (const region of westernRegions) {
    if (text.includes(region)) return { region: region === "america" ? "USA" : region.charAt(0).toUpperCase() + region.slice(1), tier: "western" };
  }

  return { region: "Global", tier: "global" };
}

async function articleExists(title: string): Promise<boolean> {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(sql`lower(${articles.title}) = lower(${title})`)
    .limit(1);
  return (result?.count ?? 0) > 0;
}

export interface ScrapeResult {
  source: string;
  fetched: number;
  newArticles: number;
  errors: string[];
}

export async function scrapeSource(source: FeedSource): Promise<ScrapeResult> {
  const result: ScrapeResult = { source: source.name, fetched: 0, newArticles: 0, errors: [] };

  console.log(`[scraper] Fetching ${source.rssUrl}...`);
  const items = await fetchFeed(source.rssUrl);
  result.fetched = items.length;

  if (items.length === 0) {
    result.errors.push("No items found in feed");
    return result;
  }

  const db = getDb();

  for (const item of items.slice(0, 10)) { // Process max 10 articles per source
    try {
      const title = (item.title || "Untitled").trim();
      if (!title || title === "Untitled") continue;

      // Skip duplicates
      if (await articleExists(title)) continue;

      const description = item.description ? cleanHtml(item.description) : "";
      const content = item.content ? cleanHtml(String(item.content)) : description;
      const imageUrl = extractImageUrl(item);
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const url = item.link || "#";

      // Detect region from content
      const { region, tier } = detectRegion(title, content);

      // Classify with Hope Score engine
      const classification = classifyArticle(
        title,
        description,
        content,
        source.name,
        region,
        pubDate
      );

      // Insert into database
      await db.insert(articles).values({
        title: title.slice(0, 500),
        summary: description.slice(0, 1000) || null,
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

      result.newArticles++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(msg);
    }
  }

  // Update source last_fetch timestamp
  await db.update(sources).set({ lastFetch: new Date() }).where(eq(sources.id, source.id));

  console.log(`[scraper] ${source.name}: ${result.fetched} fetched, ${result.newArticles} new`);
  return result;
}

export async function scrapeAllSources(): Promise<ScrapeResult[]> {
  console.log(`[scraper] Starting scrape of ${RSS_FEEDS.length} sources...`);
  const results: ScrapeResult[] = [];

  for (const source of RSS_FEEDS) {
    try {
      const result = await scrapeSource(source);
      results.push(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ source: source.name, fetched: 0, newArticles: 0, errors: [msg] });
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.newArticles, 0);
  console.log(`[scraper] Complete: ${totalNew} new articles from ${RSS_FEEDS.length} sources`);

  return results;
}

export async function getScraperSources(): Promise<FeedSource[]> {
  return RSS_FEEDS;
}
