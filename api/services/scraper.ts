/**
 * BrightSide Scraper Engine v2
 * Production-grade RSS scraper with deduplication, retry logic,
 * multi-format parsing, and background execution.
 */

import { XMLParser } from "fast-xml-parser";
import { classifyArticle } from "../lib/classifier";
import { getDb } from "../queries/connection";
import { articles, sources, scraperRuns } from "@db/schema";
import { eq, sql, desc } from "drizzle-orm";

// ─── Types ───

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
  publishedParsed?: string;
  date?: string;
  updated?: string;
  category?: string | string[];
  creator?: string;
  dc_creator?: string;
}

export interface FeedSource {
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

// ─── RSS Feed Sources (15 real good news feeds) ───

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
    id: 3,
    name: "Good News Network",
    rssUrl: "https://www.goodnewsnetwork.org/feed/",
    category: "human_curated",
    trustScore: "0.75",
    regionFocus: "USA",
  },
  {
    id: 4,
    name: "Optimist Daily",
    rssUrl: "https://www.optimistdaily.com/feed/",
    category: "human_curated",
    trustScore: "0.78",
    regionFocus: "Global",
  },
  {
    id: 5,
    name: "Reasons to be Cheerful",
    rssUrl: "https://reasonstobecheerful.world/feed/",
    category: "investigative",
    trustScore: "0.88",
    regionFocus: "Global",
  },
  {
    id: 6,
    name: "Future Crunch",
    rssUrl: "https://futurecrunch.com/rss",
    category: "human_curated",
    trustScore: "0.85",
    regionFocus: "Global",
  },
  {
    id: 7,
    name: "The Happy Broadcast",
    rssUrl: "https://www.thehappybroadcast.com/rss",
    category: "human_curated",
    trustScore: "0.70",
    regionFocus: "Global",
  },
  {
    id: 8,
    name: "Yes! Magazine",
    rssUrl: "https://www.yesmagazine.org/rss",
    category: "investigative",
    trustScore: "0.87",
    regionFocus: "USA",
  },
  {
    id: 9,
    name: "World Economic Forum - SDGs",
    rssUrl: "https://feeds.weforum.org/agenda/development",
    category: "institutional",
    trustScore: "0.92",
    regionFocus: "Global",
  },
  {
    id: 10,
    name: "UNDP",
    rssUrl: "https://www.undp.org/rss",
    category: "institutional",
    trustScore: "0.93",
    regionFocus: "Global",
  },
  {
    id: 11,
    name: "The Better India",
    rssUrl: "https://www.thebetterindia.com/feed/",
    category: "community",
    trustScore: "0.76",
    regionFocus: "India",
  },
  {
    id: 12,
    name: "Kurzgesagt (Science & Hope)",
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsXVk37bltHxD1rDPwtNM8Q",
    category: "human_curated",
    trustScore: "0.80",
    regionFocus: "Global",
  },
  {
    id: 13,
    name: "Fast Company - Impact",
    rssUrl: "https://www.fastcompany.com/impact/feed",
    category: "investigative",
    trustScore: "0.83",
    regionFocus: "Global",
  },
  {
    id: 14,
    name: "Stanford Social Innovation",
    rssUrl: "https://ssir.org/site/rss",
    category: "academic",
    trustScore: "0.94",
    regionFocus: "Global",
  },
  {
    id: 15,
    name: "Global Citizen",
    rssUrl: "https://www.globalcitizen.org/en/rss/",
    category: "human_curated",
    trustScore: "0.81",
    regionFocus: "Global",
  },
];

// ─── Feed Fetching with Retry ───

async function fetchWithRetry(
  url: string,
  retries = 3,
  timeoutMs = 15000
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "BrightSide-Bot/2.0 (https://brightside.app; bot@brightside.app)",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeout);

      if (response.status === 429) {
        // Rate limited - wait and retry
        const delay = attempt * 2000;
        console.log(`[scraper] Rate limited by ${url}, waiting ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        if (attempt < retries) {
          await sleep(attempt * 1000);
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const xml = await response.text();
      if (!xml || xml.trim().length < 50) {
        throw new Error("Empty response body");
      }

      return xml;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt >= retries) {
        console.error(`[scraper] Failed to fetch ${url} after ${retries} attempts: ${msg}`);
        return null;
      }
      await sleep(attempt * 1000);
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Multi-Format Feed Parsing ───

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
    if (channel?.item) {
      return normalizeItems(Array.isArray(channel.item) ? channel.item : [channel.item]);
    }

    // Atom
    const feed = parsed?.feed;
    if (feed?.entry) {
      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
      return normalizeItems(
        entries.map((e: FeedItem) => ({
          ...e,
          description: e.content || e.description || e.summary,
          pubDate: e.published || e.updated || e.pubDate || e.date,
        }))
      );
    }

    // RDF / RSS 1.0
    const rdf = parsed?.["rdf:RDF"] || parsed?.RDF;
    if (rdf?.item) {
      return normalizeItems(Array.isArray(rdf.item) ? rdf.item : [rdf.item]);
    }

    return [];
  } catch (err) {
    console.error(`[scraper] Parse error: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

function normalizeItems(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => item && (item.title || item.description));
}

// ─── Content Extraction ───

function extractImageUrl(item: FeedItem): string {
  // enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image")) {
    return item.enclosure.url;
  }
  if (item.enclosure?.url) return item.enclosure.url;

  // media:content
  if ((item as Record<string, unknown>)["media:content"]) {
    const mc = (item as Record<string, unknown>)["media:content"] as { url?: string };
    if (mc.url) return mc.url;
  }

  // media:thumbnail
  if ((item as Record<string, unknown>)["media:thumbnail"]) {
    const mt = (item as Record<string, unknown>)["media:thumbnail"] as { url?: string };
    if (mt.url) return mt.url;
  }

  // img tag in description
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }

  // img tag in content:encoded
  const contentEncoded = (item as Record<string, unknown>)["content:encoded"];
  if (typeof contentEncoded === "string") {
    const imgMatch = contentEncoded.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }

  // img tag in content
  if (item.content && typeof item.content === "string") {
    const imgMatch = item.content.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
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
  // Prefer content:encoded (full content) over description (summary)
  const contentEncoded = (item as Record<string, unknown>)["content:encoded"];
  if (typeof contentEncoded === "string" && contentEncoded.length > 50) {
    return cleanHtml(contentEncoded);
  }
  if (item.content && typeof item.content === "string" && item.content.length > 50) {
    return cleanHtml(item.content);
  }
  if (item.description && item.description.length > 10) {
    return cleanHtml(item.description);
  }
  return "";
}

function getItemSummary(item: FeedItem): string {
  const desc = item.description ? cleanHtml(item.description) : "";
  if (desc.length > 20) return desc.slice(0, 500);
  const content = getItemContent(item);
  return content.slice(0, 500);
}

// ─── Deduplication ───

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function getGuid(item: FeedItem): string {
  if (typeof item.guid === "string") return item.guid;
  if (item.guid && typeof item.guid === "object" && "_" in item.guid) return (item.guid as { _: string })._;
  return item.link || "";
}

async function buildExistingSet(): Promise<{
  titles: Set<string>;
  urls: Set<string>;
}> {
  const db = getDb();
  const existing = await db
    .select({ title: articles.title, url: articles.url })
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(5000);

  return {
    titles: new Set(existing.map((a) => normalizeTitle(a.title))),
    urls: new Set(existing.map((a) => a.url).filter(Boolean)),
  };
}

// ─── Region Detection ───

function detectRegion(
  title: string,
  content: string
): { region: string; tier: "underreported" | "developing" | "global" | "western" } {
  const text = `${title} ${content}`.toLowerCase();

  const underreportedRegions = [
    "rwanda", "bangladesh", "nepal", "nigeria", "laos", "haiti",
    "yemen", "malawi", "bolivia", "myanmar", "afghanistan", "somalia",
    "madagascar", "ethiopia", "tanzania", "mali", "niger", "chad",
    "south sudan", "democratic republic of congo", "guinea",
  ];
  const developingRegions = [
    "colombia", "kenya", "brazil", "india", "pakistan", "ghana",
    "uganda", "philippines", "vietnam", "indonesia", "peru",
    "ecuador", "morocco", "egypt", "jordan", "lebanon", "thailand",
    "sri lanka", "cambodia", "zambia", "zimbabwe", "senegal",
  ];
  const westernRegions = [
    "usa", "united states", "america", "uk", "united kingdom",
    "canada", "australia", "germany", "france", "netherlands",
    "sweden", "norway", "denmark", "finland", "switzerland",
    "austria", "belgium", "ireland", "new zealand", "spain",
    "italy", "japan", "south korea", "singapore",
  ];

  for (const region of underreportedRegions) {
    if (text.includes(region)) return { region: region.charAt(0).toUpperCase() + region.slice(1), tier: "underreported" };
  }
  for (const region of developingRegions) {
    if (text.includes(region)) return { region: region.charAt(0).toUpperCase() + region.slice(1), tier: "developing" };
  }
  for (const region of westernRegions) {
    if (text.includes(region)) {
      return {
        region: region === "america" || region === "united states" ? "USA" : region.charAt(0).toUpperCase() + region.slice(1),
        tier: "western",
      };
    }
  }

  return { region: "Global", tier: "global" };
}

// ─── Core Scraping ───

export async function scrapeSource(source: FeedSource): Promise<ScrapeResult> {
  const start = Date.now();
  const result: ScrapeResult = {
    source: source.name,
    fetched: 0,
    newArticles: 0,
    errors: [],
    durationMs: 0,
  };

  console.log(`[scraper] >>> ${source.name} - ${source.rssUrl}`);

  // Fetch feed
  const xml = await fetchWithRetry(source.rssUrl, 3, 15000);
  if (!xml) {
    result.errors.push("Failed to fetch feed after retries");
    result.durationMs = Date.now() - start;
    return result;
  }

  // Parse feed
  const items = parseFeed(xml);
  result.fetched = items.length;

  if (items.length === 0) {
    result.errors.push("No valid items found in feed");
    result.durationMs = Date.now() - start;
    return result;
  }

  // Build dedup set
  const existing = await buildExistingSet();
  const seenGuids = new Set<string>();

  const db = getDb();
  let processed = 0;

  for (const item of items.slice(0, 15)) {
    try {
      const title = (item.title || "Untitled").trim();
      if (!title || title === "Untitled" || title.length < 10) continue;

      // Skip by URL
      const url = item.link || getGuid(item) || "#";
      if (url !== "#" && existing.urls.has(url)) continue;

      // Skip by title similarity
      const normTitle = normalizeTitle(title);
      if (existing.titles.has(normTitle)) continue;

      // Skip duplicate GUIDs within this batch
      const guid = getGuid(item);
      if (guid && seenGuids.has(guid)) continue;
      if (guid) seenGuids.add(guid);

      // Extract content
      const summary = getItemSummary(item);
      const content = getItemContent(item);
      const imageUrl = extractImageUrl(item);

      // Parse date
      let pubDate: Date;
      const dateStr = item.pubDate || item.published || item.updated || item.date;
      if (dateStr) {
        const d = new Date(dateStr);
        pubDate = isNaN(d.getTime()) ? new Date() : d;
        // Future dates = invalid, use now
        if (pubDate > new Date(Date.now() + 86400000)) pubDate = new Date();
        // Too old (>90 days) = skip
        if (pubDate < new Date(Date.now() - 90 * 86400000)) continue;
      } else {
        pubDate = new Date();
      }

      // Detect region
      const { region, tier } = detectRegion(title, content || summary);

      // Classify with Hope Score engine
      const classification = classifyArticle(title, summary, content, source.name, region, pubDate);

      // Insert into database
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

      // Add to dedup set
      existing.titles.add(normTitle);
      if (url !== "#") existing.urls.add(url);

      result.newArticles++;
      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(msg);
    }
  }

  // Update source last_fetch
  try {
    await db
      .update(sources)
      .set({ lastFetch: new Date() })
      .where(eq(sources.id, source.id));
  } catch {
    /* ignore */
  }

  result.durationMs = Date.now() - start;
  console.log(
    `[scraper] <<< ${source.name}: ${result.fetched} fetched, ${result.newArticles} new, ${result.errors.length} errors, ${result.durationMs}ms`
  );

  return result;
}

export async function scrapeAllSources(): Promise<ScrapeResult[]> {
  const runStart = Date.now();
  console.log(`[scraper] === STARTING SCRAPE: ${RSS_FEEDS.length} sources ===`);

  const results: ScrapeResult[] = [];
  let totalErrors: string[] = [];

  // Create a scraper run record
  const db = getDb();
  let runId: number | null = null;
  try {
    const [run] = await db.insert(scraperRuns).values({
      status: "running",
      triggeredBy: "manual",
    });
    runId = run.insertId ? Number(run.insertId) : null;
  } catch {
    /* ignore */
  }

  // Scrape each source with 1s delay between them (polite)
  for (let i = 0; i < RSS_FEEDS.length; i++) {
    const source = RSS_FEEDS[i];
    try {
      const result = await scrapeSource(source);
      results.push(result);
      totalErrors.push(...result.errors);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[scraper] CRITICAL ERROR: ${source.name}: ${msg}`);
      results.push({
        source: source.name,
        fetched: 0,
        newArticles: 0,
        errors: [msg],
        durationMs: 0,
      });
      totalErrors.push(msg);
    }

    // Polite delay between sources (except last)
    if (i < RSS_FEEDS.length - 1) {
      await sleep(1000);
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.newArticles, 0);
  const totalFound = results.reduce((sum, r) => sum + r.fetched, 0);
  const totalDuration = Date.now() - runStart;

  console.log(
    `[scraper] === COMPLETE: ${totalNew} new articles from ${totalFound} fetched (${totalDuration}ms) ===`
  );

  // Update run record
  if (runId) {
    try {
      await db
        .update(scraperRuns)
        .set({
          status: "completed",
          completedAt: new Date(),
          sourcesScraped: results.length,
          articlesFound: totalFound,
          articlesNew: totalNew,
          errors: totalErrors.length > 0 ? JSON.stringify(totalErrors.slice(0, 20)) : null,
        })
        .where(eq(scraperRuns.id, runId));
    } catch {
      /* ignore */
    }
  }

  return results;
}

// ─── Background Scrape (non-blocking) ───

export async function scrapeAllSourcesBackground(): Promise<ScrapeResult[]> {
  console.log("[scraper] Running background scrape...");
  return scrapeAllSources();
}

// ─── Scraper Status ───

export async function getScraperStatus(): Promise<ScraperStatus> {
  const db = getDb();

  const [totalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles);

  const [todayCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(sql`${articles.createdAt} >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`);

  const [lastRun] = await db
    .select()
    .from(scraperRuns)
    .orderBy(desc(scraperRuns.completedAt))
    .limit(1);

  const [runningRun] = await db
    .select()
    .from(scraperRuns)
    .where(eq(scraperRuns.status, "running"))
    .limit(1);

  return {
    lastRun: lastRun?.completedAt || null,
    totalSources: RSS_FEEDS.length,
    totalArticles: totalCount?.count ?? 0,
    todayNew: todayCount?.count ?? 0,
    isRunning: !!runningRun,
    lastError: lastRun?.errors ? JSON.parse(lastRun.errors)[0] : null,
  };
}

// ─── Sources List ───

export async function getScraperSources(): Promise<FeedSource[]> {
  return RSS_FEEDS;
}

// ─── Scraper History ───

export async function getScraperHistory(limit = 10) {
  const db = getDb();
  return db
    .select()
    .from(scraperRuns)
    .orderBy(desc(scraperRuns.startedAt))
    .limit(limit);
}
