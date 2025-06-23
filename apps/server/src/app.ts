import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { authMiddleware } from "./integrations/auth";
import { agentRoutes } from "./routes/agent-routes";
import { waitlistRoutes } from "./routes/waitlist-routes";

export const app = new Elysia({ aot: false })
  .use(
    cors({
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      origin: (request): boolean => {
        const origin = request.headers.get("origin");
        if (!origin) {
          return false;
        }
        console.log(origin);
        const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS.split(","); // Allow if the origin is in our trusted list
        return trustedOrigins.includes(origin);
      },
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
