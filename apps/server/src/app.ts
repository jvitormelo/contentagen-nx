import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { authMiddleware } from "./integrations/auth";
import { agentRoutes } from "./routes/agent-routes";
import { waitlistRoutes } from "./routes/waitlist-routes";

export const app = new Elysia({ aot: false })
  .use(
    cors({
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      origin: env.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
      preflight: true,
    }),
  )
  .use(authMiddleware)
  .use(agentRoutes)
  .use(waitlistRoutes)
  .get("/works", () => {
    return { message: "Eden WORKS!!" };
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
