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
        default: "https://api.contentagen.com",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "react-dom/server": "react-dom/server.edge",
        "react-dom/server.browser": "react-dom/server.edge",
      },
    },
  },
});
