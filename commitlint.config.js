export default {
   extends: ["@commitlint/config-conventional"],
<<<<<<< HEAD
   rules: {
      "scope-enum": [
         2,
         "always",
         [
            // Apps
            "blog",
            "dashboard",
            "docs",
            "landing-page",
            "server",

            // Packages
            "agents",
            "api",
            "authentication",
            "brand",
            "database",
            "environment",
            "files",
            "localization",
            "payment",
            "posthog",
            "rag",
            "server-events",
            "transactional",
            "ui",
            "utils",
            "contenta-sdk",
            "workers",
            "lp-blocks",

            // Tooling
            "typescript",

            // Global scopes
            "deps",
            "build",
            "ci",
            "release",
            "chore",
         ],
      ],
      "scope-empty": [2, "never"],
   },
=======
>>>>>>> bc9da08e65d37c35c196a5c8c57ba2248ace37ce
   prompt: {
      questions: {
         scope: {
            description: "What packages/apps are affected by this change?",
            enum: [
               "blog",
               "dashboard",
               "docs",
               "landing-page",
               "server",
               "agents",
               "api",
               "authentication",
               "brand",
               "database",
               "environment",
               "files",
               "localization",
               "payment",
               "posthog",
               "rag",
               "server-events",
               "transactional",
               "ui",
               "utils",
               "workers",
               "typescript",
               "deps",
               "build",
               "ci",
               "release",
               "chore",
            ],
         },
      },
   },
   rules: {
      "scope-empty": [2, "never"],
      "scope-enum": [
         2,
         "always",
         [
            // Apps
            "blog",
            "dashboard",
            "docs",
            "landing-page",
            "server",

            // Packages
            "agents",
            "api",
            "authentication",
            "brand",
            "database",
            "environment",
            "files",
            "localization",
            "payment",
            "posthog",
            "rag",
            "server-events",
            "transactional",
            "ui",
            "utils",
            "contenta-sdk",
            "workers",
            "lp-blocks",

            // Tooling
            "typescript",

            // Global scopes
            "deps",
            "build",
            "ci",
            "release",
            "chore",
         ],
      ],
   },
};
