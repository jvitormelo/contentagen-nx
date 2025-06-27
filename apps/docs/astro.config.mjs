import node from "@astrojs/node";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig, passthroughImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
  image: {
    service: passthroughImageService(),
  },

  integrations: [
    starlight({
      customCss: ["./src/styles/global.css"],
      sidebar: [
        {
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
          label: "Guides",
        },
        {
          autogenerate: { directory: "reference" },
          label: "Reference",
        },
      ],
      social: [
        {
          href: "https://github.com/withastro/starlight",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "My Docs",
    }),
  ],

  site: "https://docs.contentagen.com",

  output: "server",
  server: {
    host: "0.0.0.0",
  },
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
