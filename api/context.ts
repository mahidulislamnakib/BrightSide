import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export type User = {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  return { req: opts.req, resHeaders: opts.resHeaders };
}
