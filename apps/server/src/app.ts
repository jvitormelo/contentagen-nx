import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { authMiddleware } from "./integrations/auth";
import { agentRoutes } from "./routes/agent-routes";
import { waitlistRoutes } from "./routes/waitlist-routes";

export const app = new Elysia({ aot: false })
  .use(
    cors({
      allowedHeaders: ["content-type", "Authorization"],
      aot: false,
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
  .onRequest(({ set }) => {
    // https://github.com/elysiajs/elysia-cors/issues/41#issuecomment-2282638086
    set.headers["access-control-allow-credentials"] = "true";
  })
  .use(authMiddleware)
  .use(agentRoutes)
  .use(waitlistRoutes)
  .get("/works", () => {
    return { message: "Eden WORKS!!" };
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
