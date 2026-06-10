import { getDb } from "./connection";
import { articles, sources, categories } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// ─── Article Queries ───

export async function findAllArticles(filters?: {
  category?: string;
  region?: string;
  tier?: string;
  minScore?: number;
}) {
  const db = getDb();
  const conditions = [];

  if (filters?.category) conditions.push(eq(articles.category, filters.category));
  if (filters?.region) conditions.push(eq(articles.region, filters.region));
  if (filters?.tier) conditions.push(eq(articles.tier, filters.tier as "gold" | "verified" | "constructive"));
  if (filters?.minScore) conditions.push(sql`${articles.hopeScore} >= ${filters.minScore}`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      imageUrl: articles.imageUrl,
      publishedAt: articles.publishedAt,
      sourceId: articles.sourceId,
      region: articles.region,
      regionTier: articles.regionTier,
      category: articles.category,
      hopeScore: articles.hopeScore,
      verifiedFacts: articles.verifiedFacts,
      systemicImpact: articles.systemicImpact,
      actionability: articles.actionability,
      novelty: articles.novelty,
      representation: articles.representation,
      tier: articles.tier,
      isVerified: articles.isVerified,
      hasAction: articles.hasAction,
      url: articles.url,
      content: articles.content,
      actionsJson: articles.actionsJson,
    })
    .from(articles)
    .where(where)
    .orderBy(desc(articles.hopeScore));
}

export async function findArticleById(id: number) {
  const db = getDb();
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return article || null;
}

export async function findFeaturedArticle() {
  const db = getDb();
  const [article] = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.hopeScore))
    .limit(1);
  return article || null;
}

export async function findRelatedArticles(articleId: number, category: string, region: string, limit = 4) {
  const db = getDb();
  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      imageUrl: articles.imageUrl,
      publishedAt: articles.publishedAt,
      region: articles.region,
      category: articles.category,
      hopeScore: articles.hopeScore,
      tier: articles.tier,
    })
    .from(articles)
    .where(
      and(
        sql`${articles.id} != ${articleId}`,
        sql`(${articles.category} = ${category} OR ${articles.region} = ${region})`
      )
    )
    .orderBy(desc(articles.hopeScore))
    .limit(limit);
}

export async function findArticlesByRegion(region: string) {
  const db = getDb();
  return db
    .select()
    .from(articles)
    .where(eq(articles.region, region))
    .orderBy(desc(articles.hopeScore));
}

// ─── Source Queries ───

export async function findAllSources() {
  const db = getDb();
  return db.select().from(sources).where(eq(sources.isActive, true));
}

// ─── Category Queries ───

export async function findAllCategories() {
  const db = getDb();
  return db.select().from(categories);
}

export async function getCategoryStats() {
  const db = getDb();
  return db
    .select({
      category: articles.category,
      count: sql<number>`count(*)`,
      avgHopeScore: sql<number>`avg(${articles.hopeScore})`,
    })
    .from(articles)
    .groupBy(articles.category);
}

// ─── Dashboard Queries ───

export async function getDashboardStats() {
  const db = getDb();
  const [stats] = await db
    .select({
      totalArticles: sql<number>`count(*)`,
      avgHopeScore: sql<number>`avg(${articles.hopeScore})`,
      goldCount: sql<number>`sum(case when ${articles.tier} = 'gold' then 1 else 0 end)`,
      verifiedCount: sql<number>`sum(case when ${articles.tier} = 'verified' then 1 else 0 end)`,
      actionableCount: sql<number>`sum(case when ${articles.hasAction} = true then 1 else 0 end)`,
    })
    .from(articles);
  return stats;
}

export async function getRegionStats() {
  const db = getDb();
  return db
    .select({
      region: articles.region,
      count: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${articles.hopeScore})`,
    })
    .from(articles)
    .groupBy(articles.region);
}

// ─── Seed (for initial data population) ───

export async function getArticleCount() {
  const db = getDb();
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(articles);
  return result.count;
}
