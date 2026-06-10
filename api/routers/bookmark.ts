import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { bookmarks, articles } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Helper: get user ID from session cookie in context
async function getUserIdFromContext(ctx: { req: Request }): Promise<number | null> {
  const cookie = ctx.req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const data = Buffer.from(match[1], "base64url").toString("utf-8");
    const session = JSON.parse(data);
    return session.userId ? Number(session.userId) : null;
  } catch {
    return null;
  }
}

export const bookmarkRouter = createRouter({
  // Toggle bookmark (add or remove)
  toggle: publicQuery
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserIdFromContext(ctx);
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = getDb();
      const [existing] = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, input.articleId)))
        .limit(1);

      if (existing) {
        await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
        return { bookmarked: false };
      } else {
        await db.insert(bookmarks).values({ userId, articleId: input.articleId });
        return { bookmarked: true };
      }
    }),

  // Check if article is bookmarked
  isBookmarked: publicQuery
    .input(z.object({ articleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserIdFromContext(ctx);
      if (!userId) return false;

      const db = getDb();
      const [existing] = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, input.articleId)))
        .limit(1);

      return !!existing;
    }),

  // Get user's bookmarked articles
  list: publicQuery.query(async ({ ctx }) => {
    const userId = await getUserIdFromContext(ctx);
    if (!userId) return [];

    const db = getDb();
    return db
      .select({
        bookmarkId: bookmarks.id,
        bookmarkNote: bookmarks.note,
        bookmarkCreatedAt: bookmarks.createdAt,
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
      .from(bookmarks)
      .innerJoin(articles, eq(bookmarks.articleId, articles.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }),

  // Get bookmark count
  count: publicQuery.query(async ({ ctx }) => {
    const userId = await getUserIdFromContext(ctx);
    if (!userId) return 0;

    const db = getDb();
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return result.count;
  }),

  // Add note to bookmark
  addNote: publicQuery
    .input(z.object({ bookmarkId: z.number(), note: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserIdFromContext(ctx);
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = getDb();
      await db
        .update(bookmarks)
        .set({ note: input.note })
        .where(eq(bookmarks.id, input.bookmarkId));

      return { success: true };
    }),
});
