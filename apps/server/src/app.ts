import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { authMiddleware } from "./integrations/auth";
import { agentRoutes } from "./routes/agent-routes";
import { waitlistRoutes } from "./routes/waitlist-routes";

const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) =>
  o.trim(),
);

// This manual CORS handler is more robust for serverless environments.
const corsHandler = (ctx: {
  request: Request;
  set: { status: number | string; headers: Record<string, string> };
}) => {
  const origin = ctx.request.headers.get("origin");

  // If the request origin is in our trusted list, add CORS headers.
  if (origin && trustedOrigins.includes(origin)) {
    ctx.set.headers["Access-Control-Allow-Origin"] = origin;
    ctx.set.headers["Access-Control-Allow-Credentials"] = "true";

    // Handle the preflight (OPTIONS) request specifically.
    if (ctx.request.method === "OPTIONS") {
      ctx.set.headers["Access-Control-Allow-Methods"] =
        "GET, POST, PUT, DELETE, PATCH, OPTIONS";
      ctx.set.headers["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization";
      // Cache the preflight response for 1 day
      ctx.set.headers["Access-Control-Max-Age"] = "86400";

      ctx.set.status = 204; // Use 204 for No Content
      return ""; // End the response for preflight requests
    }
  }
};

export const app = new Elysia({ aot: false })
  // Use our manual CORS handler on every request.
  .onRequest(corsHandler)
  .use(authMiddleware)
  .use(agentRoutes)
  .use(waitlistRoutes)
  .get("/works", () => {
    return { message: "Eden WORKS!" };
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
