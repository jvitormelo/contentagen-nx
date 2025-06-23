import type { Env } from "bun";
import type { Context } from "elysia";
import { app } from "./app";
export type App = typeof app;
export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    return await app.fetch(request);
  },
};
