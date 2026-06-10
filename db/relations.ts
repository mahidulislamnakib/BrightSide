import { relations } from "drizzle-orm";
import { articles, sources, readingHistory } from "./schema";

export const sourcesRelations = relations(sources, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  source: one(sources, {
    fields: [articles.sourceId],
    references: [sources.id],
  }),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  article: one(articles, {
    fields: [readingHistory.articleId],
    references: [articles.id],
  }),
}));
