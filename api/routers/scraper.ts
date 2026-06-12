import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import {
  scrapeAllSources,
  scrapeAllSourcesBackground,
  scrapeSource,
  getScraperSources,
  getScraperStatus,
  getScraperHistory,
} from "../services/scraper";

export const scraperRouter = createRouter({
  // Trigger a full scrape of all sources (blocks until done)
  scrape: publicQuery
    .input(z.object({ force: z.boolean().optional() }).optional())
    .mutation(async () => {
      const results = await scrapeAllSources();
      return {
        success: true,
        results,
        totalNew: results.reduce((sum, r) => sum + r.newArticles, 0),
        totalFetched: results.reduce((sum, r) => sum + r.fetched, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
        sources: results.length,
      };
    }),

  // Trigger background scrape (returns immediately, scrapes in background)
  scrapeBackground: publicQuery.mutation(async () => {
    // Fire and forget - the caller should use ctx.waitUntil in production
    const results = await scrapeAllSourcesBackground();
    return {
      success: true,
      message: "Background scrape completed",
      totalNew: results.reduce((sum, r) => sum + r.newArticles, 0),
      totalFetched: results.reduce((sum, r) => sum + r.fetched, 0),
      sources: results.length,
    };
  }),

  // Scrape a single source by name
  scrapeSource: publicQuery
    .input(z.object({ sourceName: z.string() }))
    .mutation(async ({ input }) => {
      const sources = await getScraperSources();
      const source = sources.find((s) =>
        s.name.toLowerCase().includes(input.sourceName.toLowerCase())
      );
      if (!source) {
        return { success: false, error: `Source "${input.sourceName}" not found` };
      }
      const result = await scrapeSource(source);
      return { success: true, result };
    }),

  // List configured scraper sources
  sources: publicQuery.query(async () => {
    return getScraperSources();
  }),

  // Get scraper status dashboard
  status: publicQuery.query(async () => {
    return getScraperStatus();
  }),

  // Get scraper run history
  history: publicQuery
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ input }) => {
      return getScraperHistory(input?.limit ?? 10);
    }),
});
