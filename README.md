<div align="center">
  <h1>🤖 ContentaGen</h1>
  <p><strong>Build Your Own AI Content Team.</strong></p>
  <p>An open-source, agent-based platform for creating strategic, brand-aligned SEO content at scale.</p>
</div>

<p align="center">
  <a href="https://github.com/your-username/contentagen/actions/workflows/check.yml">
    <img src="https://github.com/your-username/contentagen/actions/workflows/check.yml/badge.svg" alt="Biome Check Status">
  </a>
  <a href="https://github.com/your-username/contentagen/actions/workflows/typecheck.yml">
    <img src="https://github.com/your-username/contentagen/actions/workflows/typecheck.yml/badge.svg" alt="TypeScript Typecheck Status">
  </a>
  <a href="https://github.com/your-username/contentagen/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License">
  </a>
</p>

---

**ContentaGen** is not just another AI writer. It's a strategic content operations platform that allows you to build, manage, and deploy a team of specialized AI agents. Each agent can be fine-tuned with a unique persona, brand voice, and knowledge base, ensuring every piece of content is perfectly aligned with your SEO and brand strategy.

## ✨ Key Features

-   🧠 **Custom AI Agents**: Create highly configurable agents with distinct personalities, voices, tones, and target audiences.
-   📚 **Brand Brain**: Automatically build a dedicated knowledge base for each agent by simply providing a website URL. Your agent learns your brand, products, and style.
-   🚀 **Automated Content Workflow**: Streamline your entire content lifecycle, from idea generation and research to writing, editing, and post-processing.
-   🔗 **Headless CMS & SDK**: Treat your generated content as a headless source. Fetch articles, posts, and data programmatically using our TypeScript SDK to power any frontend application.
-   🏢 **Multi-Tenancy & Organizations**: Manage multiple brands or clients within a single dashboard, with support for team members and invitations.
-   🛠️ **Modern, Open-Source Stack**: Built with TypeScript, ElysiaJS, React, Astro, and Drizzle ORM in a high-performance Nx monorepo using Bun.

## 🚀 Live Demos

-   **Dashboard**: `https://app.contentagen.com` 
-   **Blog Example**: `https://blog.contentagen.com` - A live blog powered entirely by content from a ContentaGen agent!

## 🏁 Getting Started

Get the ContentaGen platform running on your local machine in a few steps.

### Prerequisites

-   [Bun](https://bun.sh/) (v1.1.0 or higher)
-   [Docker](https://www.docker.com/) and Docker Compose

## 📂 Project Structure

This project is a monorepo managed by [Nx](https://nx.dev).

-   `apps/`: Contains the individual applications.
    -   `server`: ElysiaJS backend with tRPC for the API.
    -   `dashboard`: React (Vite) application for the user dashboard.
    -   `blog`: Astro-powered blog that consumes content from the SDK.
    -   `docs`: Astro-powered documentation site.
    -   `landing-page`: Astro-powered marketing landing page.
-   `packages/`: Shared libraries and utilities used across the monorepo.
    -   `api`: tRPC router definitions, shared between client and server.
    -   `authentication`: Shared authentication logic using Better Auth.
    -   `database`: Drizzle ORM schema, migrations, and repository logic.
    -   `workers`: BullMQ queue and worker definitions for background jobs.
    -   `ui`: Shared React component library using shadcn/ui and Tailwind CSS.
    -   `...and more!`
-   `tooling/`: Shared tooling configurations, like TypeScript `tsconfig.json` presets.

## 🛠️ Tech Stack

-   **Monorepo:** [Nx](https://nx.dev/) + [Bun](https://bun.sh/)
-   **Backend:** [ElysiaJS](https://elysiajs.com/), [tRPC](https://trpc.io/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
-   **Frontend (Dashboard):** [React](https://react.dev/), [Vite](https://vitejs.dev/), [TanStack Router](https://tanstack.com/router), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
-   **Frontend (Static Sites):** [Astro](https://astro.build/)
-   **AI Integration:** [OpenRouter](https://openrouter.ai/), [ChromaDB](https://www.trychroma.com/)
-   **Background Jobs:** [BullMQ](https://bullmq.io/) with [Redis](https://redis.io/)
-   **File Storage:** [MinIO](https://min.io/) (S3-compatible)
-   **Formatting & Linting:** [Biome](https://biomejs.dev/)

## 🤝 Contributing

We welcome contributions from the community! Whether it's a bug fix, a new feature, or improvements to documentation, your help is appreciated.

Please read our **[Contribution Guidelines](CONTRIBUTING.md)** to get started. It outlines our workflow, code style, and conventions.

## 📜 License

This project is licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file for details.
