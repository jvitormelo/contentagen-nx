import { z } from "zod";
import { parseEnv } from "./helpers";

const EnvSchema = z.object({
   AP_QUEUE_UI_PASSWORD: z.string(),
   AP_QUEUE_UI_USERNAME: z.string(),
   BETTER_AUTH_GOOGLE_CLIENT_ID: z.string(),
   BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string(),
   BETTER_AUTH_SECRET: z.string(),
   BETTER_AUTH_TRUSTED_ORIGINS: z.string(),
   CONTENTAGEN_API_KEY: z.string(),
   DATABASE_URL: z.string(),
   MINIO_ACCESS_KEY: z.string(),
   MINIO_BUCKET: z.string().default("content-writer"),
   MINIO_ENDPOINT: z.string(),
   MINIO_SECRET_KEY: z.string(),
   OPENAI_API_KEY: z.string(),
   OPENROUTER_API_KEY: z.string(),
   PG_VECTOR_URL: z.string(),
   POLAR_ACCESS_TOKEN: z.string(),
   POLAR_FREE_PLAN_ID: z.string(),
   POLAR_PAID_PLAN_ID: z.string(),
   REDIS_URL: z.string(),
   RESEND_API_KEY: z.string(),
   TAVILY_API_KEY: z.string(),
});
export type ServerEnv = z.infer<typeof EnvSchema>;
export const serverEnv: ServerEnv = parseEnv(process.env, EnvSchema);
