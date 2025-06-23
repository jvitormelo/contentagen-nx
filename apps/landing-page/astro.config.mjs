import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  output: "server",
  env: {
    schema: {
      VITE_SERVER_URL: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {},
  },
});
