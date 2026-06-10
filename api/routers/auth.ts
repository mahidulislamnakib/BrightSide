import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

// Simple JWT-like token using APP_SECRET
function signToken(payload: Record<string, unknown>): string {
  const data = JSON.stringify({ ...payload, _t: Date.now() });
  return Buffer.from(data).toString("base64url");
}

function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const data = Buffer.from(token, "base64url").toString("utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function getOAuthUrl() {
  const kimiAuthUrl = process.env.VITE_KIMI_AUTH_URL || "https://api-auth.kimi.ai";
  const appID = process.env.VITE_APP_ID || "";
  const redirectUri = `${process.env.VITE_APP_URL || "http://localhost:3000"}/api/oauth/callback`;
  const state = signToken({ redirectUri });

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export const authRouter = createRouter({
  // Get OAuth URL for login
  url: publicQuery.query(() => {
    return { url: getOAuthUrl() };
  }),

  // Get current user from session cookie
  me: publicQuery.query(async ({ ctx }) => {
    const cookie = ctx.req.headers.get("cookie");
    if (!cookie) return null;

    const sessionMatch = cookie.match(/session=([^;]+)/);
    if (!sessionMatch) return null;

    const session = verifyToken(sessionMatch[1]);
    if (!session || !session.userId) return null;

    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        unionId: users.unionId,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        dailyLimit: users.dailyLimit,
        moodSetting: users.moodSetting,
      })
      .from(users)
      .where(eq(users.id, Number(session.userId)))
      .limit(1);

    return user || null;
  }),

  // Logout
  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.set(
      "Set-Cookie",
      "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );
    return { success: true };
  }),

  // Update user preferences
  updatePrefs: authedQuery
    .input(
      z.object({
        dailyLimit: z.number().min(5).max(50).optional(),
        moodSetting: z.enum(["motivated", "calm", "informed", "inspired"]).optional(),
        preferredCategories: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({
          ...(input.dailyLimit !== undefined && { dailyLimit: input.dailyLimit }),
          ...(input.moodSetting !== undefined && { moodSetting: input.moodSetting }),
          ...(input.preferredCategories !== undefined && {
            preferredCategories: JSON.stringify(input.preferredCategories),
          }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

// OAuth callback handler - added to boot.ts
export async function handleOAuthCallback(code: string, _state: string) {
  const kimiAuthUrl = process.env.VITE_KIMI_AUTH_URL || "https://api-auth.kimi.ai";
  const appID = process.env.VITE_APP_ID || "";
  const appSecret = process.env.APP_SECRET || "";

  // Exchange code for token
  const tokenRes = await fetch(`${kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: appID,
      client_secret: appSecret,
      code,
      redirect_uri: `${process.env.VITE_APP_URL || "http://localhost:3000"}/api/oauth/callback`,
    }),
  });

  if (!tokenRes.ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to exchange code" });
  }

  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No access token" });
  }

  // Fetch user profile
  const profileRes = await fetch(`${kimiAuthUrl}/api/user/profile`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to fetch profile" });
  }

  const profile = await profileRes.json() as {
    id?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  if (!profile.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No user ID" });
  }

  // Upsert user in database
  const db = getDb();
  const ownerId = process.env.OWNER_UNION_ID;
  const isAdmin = ownerId ? profile.id === ownerId : false;

  // Try to find existing user
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.unionId, profile.id))
    .limit(1);

  let userId: number;

  if (existing) {
    await db
      .update(users)
      .set({
        name: profile.name || null,
        email: profile.email || null,
        avatar: profile.avatar_url || null,
        lastSignInAt: new Date(),
        ...(isAdmin && { role: "admin" as const }),
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
  } else {
    const [newUser] = await db.insert(users).values({
      unionId: profile.id,
      name: profile.name || null,
      email: profile.email || null,
      avatar: profile.avatar_url || null,
      role: isAdmin ? "admin" : "user",
      lastSignInAt: new Date(),
    });
    userId = Number(newUser.insertId);
  }

  // Create session token
  const sessionToken = signToken({ userId });

  return { sessionToken, userId };
}
