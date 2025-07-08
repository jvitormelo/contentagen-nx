# Product Requirements Document: Content API & Publishing Pipeline

**Version:** 1.0  
**Date:** July 8, 2025  
**Author:** Product Team  
**Status:** Implemented

## 1. Vision & Overview

**Vision:**  
Decouple content creation from publishing, enabling the platform to function as a headless CMS for AI-generated content. Users can automate their content pipeline from draft to live publication via secure, modern integrations.

**Feature Summary:**  
The Content API & Publishing Pipeline provides a secure API for programmatic access to published content. Users can manage API keys in their profile, enabling integration with blogs, apps, and CI/CD workflows—eliminating manual content transfer.

## 2. Problem Statement

Manual content publishing is slow, error-prone, and unscalable.  
Key issues:

1. Inefficient manual download/upload process.
2. No automation for publishing.
3. No secure integration for external systems.
4. Agencies cannot scale content delivery for multiple clients.

## 3. Target Audience & User Personas

- **Agency Anna (Technical Content Manager):**  
  Needs a secure, read-only API for client sites to pull content automatically.
- **Expert Eric (Solo Creator):**  
  Wants his blog to auto-update by fetching content via API in CI/CD.

## 4. Goals & Success Metrics

| Goal                         | Key Result (KR)                              | Metric to Track                                   |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------- |
| Headless Content Delivery    | Users fetch published content via secure API | >50% active users generate API key in 3 months    |
| Automate Publishing Workflow | Reduce manual publishing steps               | >75% reduction in time-to-publish (user feedback) |
| Provide Secure Access        | Secure, revocable, hashed API keys           | Zero security incidents with API keys             |
| Improve Developer Experience | Standard integration for developers          | Positive developer feedback                       |

## 5. Functional Requirements (FR)

### FR-1: API Key Management (Backend)

- Integrate `apiKey` plugin from `better-auth`.
- Add `api_key` table for metadata.
- Store only hashed keys and prefix.
- Support create, list (by prefix), and revoke per user.

### FR-2: API Key Management (Frontend)

- Add "API Keys" section to ProfilePage.
- Allow key creation with description.
- Show full key once in modal; warn user to store securely.
- List keys by prefix, description, creation date.
- Allow revocation of keys.

### FR-3: Public Content API Endpoint

- New endpoint: `/api/v1/public/content`.
- Require Bearer token in Authorization header.
- `GET /api/v1/public/content`: List all published articles for user.
- `GET /api/v1/public/content/:slug`: Get single published article by slug.
- Return 401 for invalid/missing key, 404 for missing/unpublished post.

### FR-4: Blog Application Integration (Proof of Concept)

- Refactor `apps/blog` to remove local Markdown dependency.
- Update config for API fetching and env vars.
- Update `getStaticPaths` to fetch from API at build time.
- Require `CONTENTA_API_URL` and `CONTENTA_API_KEY` env vars.

## 6. Out of Scope

- Granular API key permissions (all keys are full read).
- Webhooks (no push notifications; integrations must pull).
- Usage tracking & rate limiting for API keys (future consideration).
