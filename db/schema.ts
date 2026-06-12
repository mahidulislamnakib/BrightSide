import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  int,
} from "drizzle-orm/mysql-core";

// ─── Sources ───
export const sources = mysqlTable("sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  category: varchar("category", { length: 64 }).notNull().$type<
    "human_curated" | "investigative" | "institutional" | "community" | "academic"
  >(),
  regionFocus: varchar("region_focus", { length: 128 }),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull().default("1.0"),
  trustScore: decimal("trust_score", { precision: 3, scale: 2 }).notNull().default("0.5"),
  isActive: boolean("is_active").notNull().default(true),
  lastFetch: timestamp("last_fetch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Articles ───
export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  url: varchar("url", { length: 512 }).notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  sourceId: int("source_id").notNull(),
  region: varchar("region", { length: 128 }).notNull(),
  regionTier: varchar("region_tier", { length: 32 }).notNull().$type<
    "underreported" | "developing" | "global" | "western"
  >(),
  category: varchar("category", { length: 64 }).notNull(),
  // Hope Score dimensions
  hopeScore: decimal("hope_score", { precision: 4, scale: 3 }).notNull(),
  verifiedFacts: decimal("verified_facts", { precision: 4, scale: 3 }).notNull(),
  systemicImpact: decimal("systemic_impact", { precision: 4, scale: 3 }).notNull(),
  actionability: decimal("actionability", { precision: 4, scale: 3 }).notNull(),
  novelty: decimal("novelty", { precision: 4, scale: 3 }).notNull(),
  representation: decimal("representation", { precision: 4, scale: 3 }).notNull(),
  // Classification
  tier: varchar("tier", { length: 32 }).notNull().$type<"gold" | "verified" | "constructive">(),
  isVerified: boolean("is_verified").notNull().default(false),
  hasAction: boolean("has_action").notNull().default(false),
  // Actions (stored as JSON array)
  actionsJson: text("actions_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Reading History ───
export const readingHistory = mysqlTable("reading_history", {
  id: serial("id").primaryKey(),
  articleId: int("article_id").notNull(),
  readAt: timestamp("read_at").notNull().defaultNow(),
  timeSpent: int("time_spent_seconds"),
  actionTaken: varchar("action_taken", { length: 64 }),
});

// ─── Bookmarks ───
export const bookmarks = mysqlTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  articleId: int("article_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  note: text("note"),
});

// ─── Story Submissions ───
export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  submitterName: varchar("submitter_name", { length: 255 }).notNull(),
  submitterEmail: varchar("submitter_email", { length: 320 }),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary").notNull(),
  content: text("content"),
  sourceUrl: varchar("source_url", { length: 512 }),
  category: varchar("category", { length: 64 }),
  region: varchar("region", { length: 128 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  hopeScore: decimal("hope_score", { precision: 4, scale: 3 }),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// ─── Chat Messages ───
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Categories (reference table) ───
// ─── Users ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredCategories: text("preferred_categories"),
  dailyLimit: int("daily_limit").default(10),
  moodSetting: varchar("mood_setting", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ─── User Reading History ───
export const userReadingHistory = mysqlTable("user_reading_history", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  articleId: int("article_id").notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
  timeSpentSeconds: int("time_spent_seconds"),
  actionTaken: varchar("action_taken", { length: 64 }),
});

// ─── Scraper Run History ───
export const scraperRuns = mysqlTable("scraper_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 32 }).notNull().default("running"), // running, completed, failed
  sourcesScraped: int("sources_scraped").default(0),
  articlesFound: int("articles_found").default(0),
  articlesNew: int("articles_new").default(0),
  errors: text("errors"), // JSON array of error strings
  triggeredBy: varchar("triggered_by", { length: 32 }).default("manual"), // manual, auto, scheduled
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  emoji: varchar("emoji", { length: 16 }),
  description: text("description"),
});
