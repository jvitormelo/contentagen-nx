# 🤖 ContentaGen - AI Content Automation Platform

**A full-stack monorepo for a powerful platform that automates high-quality blog content creation using customizable AI agents. Built with a modern, type-safe stack including Elysia, Astro, and React.**

## ✨ Features

- **Custom AI Agents:** Create and manage a team of AI agents, each with a unique persona, voice, knowledge base, and content specialty.
- **Brand Brain:** Upload brand guidelines and knowledge documents to ensure all generated content is perfectly aligned with your brand's voice and values.
- **Content Generation Workflow:** Submit content requests, have them processed by the appropriate agent, and manage the generated articles, drafts, and published content from a central dashboard.
- **Multi-Client Architecture:** Each agent's settings and knowledge are securely isolated, making it ideal for agencies managing multiple clients.
- **Async Job Processing:** Uses BullMQ and Redis to handle intensive tasks like content generation and knowledge distillation in the background without blocking the API.
- **Type-Safe API:** End-to-end type safety from the Elysia backend to the React frontend, powered by Eden.
- **User Authentication & Subscriptions:** Secure user management, authentication, and subscription handling powered by Better Auth & Polar.

## 🛠️ Tech Stack

| Category               | Technology                                   |
|------------------------|----------------------------------------------|
| Monorepo               | Nx                                           |
| Package Manager        | pnpm                                         |
| Runtime                | Bun                                          |
| Backend                | ElysiaJS                                     |
| Database               | PostgreSQL (with pgvector)                   |
| ORM                    | Drizzle ORM                                  |
| Job Queue              | BullMQ with Redis                            |
| File Storage           | MinIO (S3-Compatible)                        |
| Frontend (Dashboard)   | React via TanStack Start, Vite               |
| Frontend (Sites)       | Astro                                        |
| Styling                | Tailwind CSS with Shadcn UI                  |
| Authentication         | Better Auth & Polar for Subscriptions        |
| Security               | Arcjet (Rate Limiting, Bot Protection)       |
| CI/CD & Tooling        | GitHub Actions, Docker, Biome, Husky, Commitlint |

## 📦 Project Structure

The monorepo is organized into applications, shared packages, and tooling configurations.

### Applications (`apps/`)

| Application   | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| server        | The ElysiaJS backend. Handles the API, database, authentication, and job queuing. |
| dashboard     | The main React SPA where users manage AI agents, content requests, and their account. |
| landing-page  | The public-facing marketing website built with Astro.                      |
| blog          | The company blog, featuring AI-generated content about the platform and industry. |
| docs          | The documentation site for the platform, built with Astro Starlight.        |

### Packages (`packages/`)

| Package    | Description                                                        |
|------------|--------------------------------------------------------------------|
| brand      | Shared brand assets and configuration (e.g., project name, logo).  |
| eden       | Type-safe RPC client for connecting the frontend to the ElysiaJS backend. |
| ui         | Shared React component library built with Shadcn UI and Tailwind CSS. |
| typescript | Shared TypeScript configurations (tsconfig.json) used across the monorepo. |

## 🚀 Getting Started

### Prerequisites

- **Node.js:** ^20.0.0
- **pnpm:** ^10.0.0 (enable with `corepack enable`)
- **Bun:** ^1.0.0
- **Docker and Docker Compose:** To run the local database and other services.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Local Services

The backend requires a PostgreSQL database, Redis, and MinIO. A `docker-compose.yml` file is provided to run these services easily.

```bash
cd apps/server
docker-compose up -d
cd ../..
```

This will start the required services in the background.

### 4. Configure Environment Variables

Create `.env` files for the applications that need them by copying the `.env.example` files.

**Most Important: `apps/server`**

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` with your credentials. The defaults are set up to work with the local `docker-compose.yml` environment. You will need to provide:

- `BETTER_AUTH_SECRET`: A long, random string for session encryption.
- `BETTER_AUTH_TRUSTED_ORIGINS`: e.g., http://localhost:3000,http://localhost:4321
- `ARCJET_KEY`: Your key from arcjet.com.
- API keys for RESEND, POLAR, OPENROUTER, etc.

**Dashboard: `apps/dashboard`**

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
```

Edit `apps/dashboard/.env` to point to your backend server:

```
VITE_SERVER_URL=http://localhost:9876
```

(Optional) Create `.env` files for landing-page, blog, and docs if you wish to configure their Arcjet keys.

### 5. Run Database Migrations

With the local database running via Docker, apply the Drizzle ORM schema:

```bash
pnpm --filter server push
```

### 6. Start Development Servers

You can run all applications at once or start them individually.

To run the main dashboard and its server:

```bash
pnpm dev:dashboard
```

To run everything:

```bash
pnpm dev:all
```

The applications will be available at the following ports:

- Dashboard: http://localhost:3000
- Server API: http://localhost:9876
- Landing Page: http://localhost:4322
- Blog: http://localhost:4321
- Docs: http://localhost:4323

## ⚙️ Available Scripts

All scripts should be run from the root of the monorepo:

- `pnpm dev:all`: Start all applications in development mode.
- `pnpm dev:dashboard`: Start only the dashboard and server apps.
- `pnpm build:all`: Build all apps and packages for production.
- `pnpm check`: Run Biome linter across all projects.
- `pnpm typecheck`: Run TypeScript checks across all projects.
- `pnpm format`: Format the entire codebase using Biome.

## 🚢 Deployment

Each application in the `apps/` directory is configured for deployment via Docker.

- A `Dockerfile` is present in each application folder.
- `railway.json` files are included, showing configuration for deployment on Railway.
- The CI/CD pipeline in `.github/workflows` runs checks and type-checking on every pull request.