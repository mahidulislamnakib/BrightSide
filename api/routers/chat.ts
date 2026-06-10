import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { articles } from "@db/schema";
import { desc, sql } from "drizzle-orm";

interface ChatResponse {
  type: "greeting" | "stories" | "stats" | "help" | "unknown";
  message: string;
  articles?: Array<{
    id: number;
    title: string;
    summary: string | null;
    category: string;
    hopeScore: string;
    tier: string;
  }>;
}

function parseIntent(message: string): { intent: string; filters: Record<string, string> } {
  const lower = message.toLowerCase();
  const filters: Record<string, string> = {};

  // Detect category
  const categories: Record<string, string[]> = {
    health: ["health", "medical", "vaccine", "disease", "doctor", "hospital"],
    environment: ["environment", "climate", "solar", "green", "nature", "forest", "carbon"],
    innovation: ["innovation", "tech", "technology", "ai", "app", "digital", "solar"],
    community: ["community", "volunteer", "help", "charity", "donation", "local"],
    peace: ["peace", "treaty", "conflict", "war", "diplomacy", "resolution"],
    economic: ["economic", "poverty", "jobs", "money", "income", "business", "trade"],
  };
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((k) => lower.includes(k))) {
      filters.category = cat.charAt(0).toUpperCase() + cat.slice(1);
      break;
    }
  }

  // Detect region
  const regions: Record<string, string[]> = {
    Africa: ["africa", "rwanda", "kenya", "nigeria"],
    "South Asia": ["india", "bangladesh", "nepal", "pakistan"],
    "Latin America": ["brazil", "colombia", "mexico"],
    Europe: ["europe", "uk", "germany", "france"],
  };
  for (const [region, keywords] of Object.entries(regions)) {
    if (keywords.some((k) => lower.includes(k))) {
      filters.region = region;
      break;
    }
  }

  // Detect tier
  if (lower.includes("gold")) filters.tier = "gold";
  else if (lower.includes("verified")) filters.tier = "verified";

  // Detect mood/intent
  let intent = "search";
  if (lower.match(/^(hi|hello|hey|greetings)/)) intent = "greeting";
  else if (lower.includes("how many") || lower.includes("stats") || lower.includes("count")) intent = "stats";
  else if (lower.includes("help") || lower.includes("what can you")) intent = "help";
  else if (lower.includes("latest") || lower.includes("new") || lower.includes("recent")) intent = "latest";
  else if (lower.includes("best") || lower.includes("top") || lower.includes("highest")) intent = "top";
  else if (lower.includes("motivated") || lower.includes("inspired") || lower.includes("calm") || lower.includes("informed")) intent = "mood";

  return { intent, filters };
}

function generateResponse(intent: string, filters: Record<string, string>, articleCount: number, avgScore: number): string {
  const greetings = [
    "Hey there! I'm your BrightSide assistant. Ask me to find hopeful stories on any topic!",
    "Hello! Looking for some good news? Tell me what you're interested in — health, environment, innovation, peace, and more.",
    "Hi! I can help you discover evidence-based good news from around the world. What would you like to read about?",
  ];

  switch (intent) {
    case "greeting":
      return greetings[Math.floor(Math.random() * greetings.length)];
    case "stats":
      return `BrightSide has ${articleCount} stories with an average Hope Score of ${avgScore.toFixed(2)}. We cover health, environment, innovation, community, peace, and economic progress across 47 countries.`;
    case "help":
      return `Here are some things you can ask me:\n\n- "Find health stories from Africa"\n- "Show me the latest environmental news"\n- "Top gold standard stories"\n- "What are the stats?"\n- "I'm feeling motivated today"`;
    case "top":
      return `Here are the highest-rated stories${filters.category ? ` in ${filters.category}` : ""}${filters.region ? ` from ${filters.region}` : ""}:`;
    case "latest":
      return `Here are the most recent stories${filters.category ? ` about ${filters.category}` : ""}${filters.region ? ` from ${filters.region}` : ""}:`;
    case "mood":
      return `I love that energy! Here are some stories that should resonate with how you're feeling:`;
    default:
      if (Object.keys(filters).length > 0) {
        const parts: string[] = [];
        if (filters.category) parts.push(filters.category);
        if (filters.region) parts.push(`from ${filters.region}`);
        return `Here are some good news stories${parts.length > 0 ? ` about ${parts.join(" ")}` : ""}:`;
      }
      return `I'd love to help you find good news! Try asking about a specific topic like "health stories from Africa" or "latest environmental news".`;
  }
}

export const chatRouter = createRouter({
  send: publicQuery
    .input(z.object({ message: z.string().min(1).max(500) }))
    .query(async ({ input }) => {
      const db = getDb();
      const { intent, filters } = parseIntent(input.message);

      // Get stats for responses
      const [stats] = await db
        .select({
          count: sql<number>`count(*)`,
          avg: sql<number>`avg(${articles.hopeScore})`,
        })
        .from(articles);

      let foundArticles: ChatResponse["articles"] = [];

      // Search for articles based on filters
      if (intent !== "greeting" && intent !== "help" && intent !== "stats") {
        const conditions: ReturnType<typeof sql>[] = [];
        if (filters.category) {
          conditions.push(sql`lower(${articles.category}) = lower(${filters.category})`);
        }
        if (filters.region) {
          conditions.push(sql`${articles.region} = ${filters.region}`);
        }
        if (filters.tier) {
          conditions.push(sql`${articles.tier} = ${filters.tier}`);
        }

        const where = conditions.length > 0 ? sql.join(conditions, sql` and `) : sql`1=1`;

        foundArticles = await db
          .select({
            id: articles.id,
            title: articles.title,
            summary: articles.summary,
            category: articles.category,
            hopeScore: articles.hopeScore,
            tier: articles.tier,
          })
          .from(articles)
          .where(where)
          .orderBy(intent === "latest" ? desc(articles.publishedAt) : desc(articles.hopeScore))
          .limit(5);
      }

      return {
        type: intent as ChatResponse["type"],
        message: generateResponse(intent, filters, stats.count, stats.avg || 0),
        articles: foundArticles.length > 0 ? foundArticles : undefined,
      };
    }),
});
