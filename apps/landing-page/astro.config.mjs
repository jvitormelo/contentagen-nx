import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    schema: {
      VITE_SERVER_URL: envField.string({
        access: "public",
        context: "client",
      }),
    },
  },
  integrations: [react()],
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
});
