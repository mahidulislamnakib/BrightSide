import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { submissions } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { classifyArticle } from "../lib/classifier";

export const submissionRouter = createRouter({
  // Submit a new story
  create: publicQuery
    .input(
      z.object({
        submitterName: z.string().min(1).max(255),
        submitterEmail: z.string().email().optional(),
        title: z.string().min(5).max(512),
        summary: z.string().min(20).max(2000),
        content: z.string().max(10000).optional(),
        sourceUrl: z.string().url().optional(),
        category: z.string().optional(),
        region: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Auto-classify with Hope Score
      const classification = classifyArticle(
        input.title,
        input.summary,
        input.content || input.summary,
        "Community Submission",
        input.region || "Global",
        new Date()
      );

      const [result] = await db.insert(submissions).values({
        submitterName: input.submitterName,
        submitterEmail: input.submitterEmail || null,
        title: input.title,
        summary: input.summary,
        content: input.content || null,
        sourceUrl: input.sourceUrl || null,
        category: classification.category,
        region: input.region || "Global",
        status: "pending",
        hopeScore: String(classification.overall),
      });

      return {
        success: true,
        id: Number(result.insertId),
        hopeScore: classification.overall,
        tier: classification.tier,
        category: classification.category,
      };
    }),

  // List submissions (public, only approved)
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(submissions)
      .where(eq(submissions.status, "approved"))
      .orderBy(desc(submissions.createdAt))
      .limit(50);
  }),

  // Admin: list all submissions
  adminList: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt))
      .limit(100);
  }),

  // Admin: review submission
  review: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(submissions)
        .set({
          status: input.status,
          adminNote: input.adminNote || null,
          reviewedAt: new Date(),
        })
        .where(eq(submissions.id, input.id));
      return { success: true };
    }),

  // Stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const [pending] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.status, "pending"));
    const [approved] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.status, "approved"));
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(submissions);
    return { pending: pending.count, approved: approved.count, total: total.count };
  }),
});
