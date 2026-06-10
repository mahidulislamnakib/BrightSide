import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import {
  findAllArticles,
  findArticleById,
  findFeaturedArticle,
  findRelatedArticles,
  findArticlesByRegion,
  findAllCategories,
  getCategoryStats,
} from "../queries/articles";
import { classifyArticle, computeMoodScore, type Mood, getWhyThisMatters } from "../lib/classifier";
import { getDb } from "../queries/connection";
import { articles } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const articleRouter = createRouter({
  // List articles with optional filters
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        region: z.string().optional(),
        tier: z.string().optional(),
        minScore: z.number().optional(),
        mood: z.enum(["motivated", "calm", "informed", "inspired"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const rows = await findAllArticles(input || {});

      // Parse actions JSON
      const articles = rows.map((a) => ({
        ...a,
        actions: a.actionsJson ? JSON.parse(a.actionsJson) : undefined,
      }));

      // Apply mood-based re-ranking if specified
      if (input?.mood) {
        articles.sort((a, b) => {
          const scoreA = computeMoodScore(
            {
              verifiedFacts: Number(a.verifiedFacts),
              systemicImpact: Number(a.systemicImpact),
              actionability: Number(a.actionability),
              novelty: Number(a.novelty),
              representation: Number(a.representation),
            },
            input.mood as Mood
          );
          const scoreB = computeMoodScore(
            {
              verifiedFacts: Number(b.verifiedFacts),
              systemicImpact: Number(b.systemicImpact),
              actionability: Number(b.actionability),
              novelty: Number(b.novelty),
              representation: Number(b.representation),
            },
            input.mood as Mood
          );
          return scoreB - scoreA;
        });
      }

      return articles;
    }),

  // Get single article by ID
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const article = await findArticleById(input.id);
      if (!article) return null;
      return {
        ...article,
        actions: article.actionsJson ? JSON.parse(article.actionsJson) : undefined,
      };
    }),

  // Get featured article (highest hope score)
  featured: publicQuery.query(async () => {
    const article = await findFeaturedArticle();
    if (!article) return null;
    return {
      ...article,
      actions: article.actionsJson ? JSON.parse(article.actionsJson) : undefined,
    };
  }),

  // Get related articles
  related: publicQuery
    .input(z.object({ id: z.number(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const article = await findArticleById(input.id);
      if (!article) return [];
      return findRelatedArticles(input.id, article.category, article.region, input.limit);
    }),

  // Get articles by region
  byRegion: publicQuery
    .input(z.object({ region: z.string() }))
    .query(async ({ input }) => {
      return findArticlesByRegion(input.region);
    }),

  // Get all categories
  categories: publicQuery.query(async () => {
    return findAllCategories();
  }),

  // Get category statistics
  categoryStats: publicQuery.query(async () => {
    return getCategoryStats();
  }),

  // Search articles by text
  search: publicQuery
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const searchTerm = `%${input.q}%`;
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
        .where(sql`lower(${articles.title}) like lower(${searchTerm}) or lower(${articles.summary}) like lower(${searchTerm}) or lower(${articles.content}) like lower(${searchTerm})`)
        .orderBy(desc(articles.hopeScore))
        .limit(20);
    }),

  // Generate Morning Brief (top stories summary)
  morningBrief: publicQuery.query(async () => {
    const db = getDb();
    const topArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        summary: articles.summary,
        category: articles.category,
        region: articles.region,
        hopeScore: articles.hopeScore,
        tier: articles.tier,
        imageUrl: articles.imageUrl,
      })
      .from(articles)
      .orderBy(desc(articles.hopeScore))
      .limit(5);

    const stats = await db
      .select({
        totalArticles: sql<number>`count(*)`,
        avgScore: sql<number>`avg(${articles.hopeScore})`,
        goldCount: sql<number>`sum(case when ${articles.tier} = 'gold' then 1 else 0 end)`,
        topCategory: articles.category,
      })
      .from(articles)
      .groupBy(articles.category)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    return {
      date: new Date().toISOString(),
      headline: "Hope Is a Practice, Not a Feeling",
      summary: `Today we found ${stats[0]?.totalArticles ?? 0} stories of progress from around the world. The average Hope Score is ${Number(stats[0]?.avgScore ?? 0).toFixed(2)}, with ${stats[0]?.goldCount ?? 0} Gold Standard stories. Most stories are about ${stats[0]?.topCategory ?? 'progress'}.`,
      topStories: topArticles,
    };
  }),

  // Generate "Why This Matters" context
  whyItMatters: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, input.id))
        .limit(1);
      if (!article) return null;
      return getWhyThisMatters({
        title: article.title,
        summary: article.summary ?? '',
        content: article.content ?? '',
        category: article.category,
        region: article.region,
        regionTier: article.regionTier,
      });
    }),

  // Classify article text (compute Hope Score on the fly)
  classify: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        summary: z.string(),
        content: z.string(),
        sourceName: z.string().default(""),
        region: z.string().default("Global"),
      })
    )
    .query(({ input }) => {
      return classifyArticle(
        input.title,
        input.summary,
        input.content,
        input.sourceName,
        input.region,
        new Date()
      );
    }),
});
