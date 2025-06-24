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
  server: {
    host: "0.0.0.0",
  },
  integrations: [react()],
  output: "server",

  vite: {
    plugins: [tailwindcss()],
    resolve:
      process.env.NODE_ENV === "production"
        ? {
          alias: {
            "react-dom/server": "react-dom/server.edge",
            "react-dom/server.browser": "react-dom/server.edge",
          },
        }
        : {},
  },
});
