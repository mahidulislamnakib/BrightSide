import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { scrapeAllSources, scrapeSource, getScraperSources } from "../services/scraper";

export const scraperRouter = createRouter({
  // Trigger a full scrape of all sources
  scrape: publicQuery
    .input(z.object({ force: z.boolean().optional() }).optional())
    .mutation(async () => {
      const results = await scrapeAllSources();
      return {
        success: true,
        results,
        totalNew: results.reduce((sum, r) => sum + r.newArticles, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
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
});
