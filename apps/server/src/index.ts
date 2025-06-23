import type { Env } from "bun";
import type { Context } from "elysia";
import { app } from "./app";

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    return await app.fetch(request);
  },
};
export type App = typeof app;
