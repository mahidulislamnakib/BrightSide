import { createRouter, publicQuery } from "./middleware";
import { articleRouter } from "./routers/article";
import { dashboardRouter } from "./routers/dashboard";
import { seedRouter } from "./routers/seed";
import { scraperRouter } from "./routers/scraper";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { bookmarkRouter } from "./routers/bookmark";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  article: articleRouter,
  dashboard: dashboardRouter,
  seed: seedRouter,
  scraper: scraperRouter,
  auth: authRouter,
  admin: adminRouter,
  bookmark: bookmarkRouter,
});

export type AppRouter = typeof appRouter;
