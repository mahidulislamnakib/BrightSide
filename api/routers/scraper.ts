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
  // Trigger a full scrape of all 82 sources (blocks until done)
  scrape: publicQuery
    .input(z.object({ force: z.boolean().optional() }).optional())
    .mutation(async () => {
      const results = await scrapeAllSources();
      const successCount = results.filter((r) => r.fetched > 0).length;
      return {
        success: true,
        results,
        totalNew: results.reduce((sum, r) => sum + r.newArticles, 0),
        totalFetched: results.reduce((sum, r) => sum + r.fetched, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
        sourcesReached: successCount,
        totalSources: results.length,
      };
    }),

  // Background scrape — returns immediately
  scrapeBackground: publicQuery.mutation(async () => {
    const results = await scrapeAllSourcesBackground();
    return {
      success: true,
      message: "Universal scrape completed",
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

  // List all configured sources
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
