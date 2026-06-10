import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { handleOAuthCallback } from "./routers/auth";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// OAuth callback
app.get("/api/oauth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.redirect("/login?error=" + encodeURIComponent(error));
  }

  if (!code || !state) {
    return c.redirect("/login?error=missing_params");
  }

  try {
    const { sessionToken } = await handleOAuthCallback(code, state);

    // Set session cookie and redirect
    c.header(
      "Set-Cookie",
      `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      { append: true }
    );
    return c.redirect("/");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "auth_failed";
    return c.redirect("/login?error=" + encodeURIComponent(msg));
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  // Parse session cookie and add user to context
  const cookie = c.req.header("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  let user = undefined;

  if (sessionMatch) {
    try {
      const data = Buffer.from(sessionMatch[1], "base64url").toString("utf-8");
      const session = JSON.parse(data);
      if (session.userId) {
        const { getDb } = await import("./queries/connection");
        const { users } = await import("@db/schema");
        const { eq } = await import("drizzle-orm");
        const db = getDb();
        const [u] = await db
          .select({
            id: users.id,
            unionId: users.unionId,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, Number(session.userId)))
          .limit(1);
        if (u) user = u;
      }
    } catch {
      // Invalid session
    }
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: async (opts) => ({
      ...await createContext(opts),
      user,
    }),
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
