import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { articles, sources, users, userReadingHistory } from "@db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [articleCount] = await db.select({ value: count() }).from(articles);
    const [sourceCount] = await db.select({ value: count() }).from(sources);
    const [userCount] = await db.select({ value: count() }).from(users);
    const [readCount] = await db.select({ value: count() }).from(userReadingHistory);

    return {
      articles: articleCount.value,
      sources: sourceCount.value,
      users: userCount.value,
      reads: readCount.value,
    };
  }),

  // List all articles with pagination
  articles: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const rows = await db
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt))
        .limit(limit)
        .offset(offset);

      const [total] = await db.select({ value: count() }).from(articles);

      return { articles: rows, total: total.value, page, limit };
    }),

  // Update article
  updateArticle: adminQuery
    .input(
      z.object({
        id: z.number(),
        tier: z.enum(["gold", "verified", "constructive"]).optional(),
        isVerified: z.boolean().optional(),
        category: z.string().optional(),
        hopeScore: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(articles).set(updates).where(eq(articles.id, id));
      return { success: true };
    }),

  // Delete article
  deleteArticle: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(articles).where(eq(articles.id, input.id));
      return { success: true };
    }),

  // List all sources
  sources: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(sources).orderBy(sources.name);
  }),

  // Create source
  createSource: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        category: z.enum(["human_curated", "investigative", "institutional", "community", "academic"]),
        regionFocus: z.string().optional(),
        trustScore: z.string().default("0.5"),
        weight: z.string().default("1.0"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(sources).values(input);
      return { success: true };
    }),

  // Update source
  updateSource: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        url: z.string().url().optional(),
        isActive: z.boolean().optional(),
        trustScore: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(sources).set(updates).where(eq(sources.id, id));
      return { success: true };
    }),

  // Analytics
  analytics: adminQuery.query(async () => {
    const db = getDb();

    const categoryBreakdown = await db
      .select({
        category: articles.category,
        count: sql<number>`count(*)`,
        avgScore: sql<number>`avg(${articles.hopeScore})`,
      })
      .from(articles)
      .groupBy(articles.category);

    const tierBreakdown = await db
      .select({
        tier: articles.tier,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .groupBy(articles.tier);

    const dailyArticles = await db
      .select({
        date: sql<string>`date(${articles.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .groupBy(sql`date(${articles.createdAt})`)
      .orderBy(desc(sql`date(${articles.createdAt})`))
      .limit(30);

    return { categoryBreakdown, tierBreakdown, dailyArticles };
  }),
});
