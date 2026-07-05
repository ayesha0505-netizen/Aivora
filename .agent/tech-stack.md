# Aivora Technical Stack

This document specifies the technologies, frameworks, libraries, and hosting infrastructure that comprise the Aivora personal life manager system.

---

## 1. Core Backend & Orchestration

*   **Runtime:** Python 3.11+
    *   *Package Manager:* `uv` (for ultra-fast environment resolution and package lock management)
*   **Orchestration Framework:** Google Agent Development Kit (ADK) 2.0
    *   *Features Used:* Workflow Graph Engine, Task-Mode Agents, Callback hooks, Session Memory Bank, Context manager, State rewind capabilities.
*   **API Framework:** FastAPI
    *   *Libraries:*
        *   `pydantic` (v2) for request/response validation and agent schemas.
        *   `sqlalchemy` (async engine) for SQL database operations.
        *   `uvicorn` for high-performance ASGI server runtime.
        *   `cryptography` / `pyjwt` for security, token signing, and encryption.
        *   `httpx` for asynchronous HTTP requests.

---

## 2. Frontend Application

*   **Framework:** Next.js (TypeScript)
    *   *Core libraries:*
        *   `react` and `react-dom` (App Router structure).
        *   `framer-motion` for fluid, premium transitions and micro-animations.
        *   `tailwindcss` for utility styling.
        *   `lucide-react` for clean, modern icon representations.
*   **A2UI Engine:** Custom React renderer component
    *   Maps structured JSON payloads emitted by sub-agents to specific React widget templates (maps, packing items, charts, calendars, approval triggers).
*   **Transport Client:** EventSource API (native Web API for SSE connections).

---

## 3. Database & Caching

*   **Relational Database:** MySQL 8.0
    *   *Provider:* Google Cloud SQL (MySQL) in production.
    *   *Purpose:* Persistent storage for users, session histories, travel itineraries, packing lists, and scheduler records.
*   **Cache & Session Store:** Redis
    *   *Provider:* Google Cloud Memorystore (Redis) in production.
    *   *Purpose:* Job queues, transient state storage, and distributed execution locks to prevent concurrent run collisions.

---

## 4. Model Context Protocol (MCP)

*   **Calendar Integration Server:** Node.js / TypeScript
    *   *Libraries:* Google APIs Client (`googleapis`), `@modelcontextprotocol/sdk`.
    *   *Purpose:* Operates calendar synchronization and reservation actions via Google APIs.
*   **Weather Wrapper Server:** Python / TypeScript
    *   *Purpose:* Translates coordinates and query contexts to external meteorological APIs.

---

## 5. Hosting & Infrastructure (GCP)

*   **Serverless Compute:** Google Cloud Run
    *   FastAPI backend and Next.js frontend are packaged in separate containers and run on Cloud Run.
*   **Object Storage:** Google Cloud Storage (GCS)
    *   Host generated files (CSV packing lists, PDF itineraries) as static artifacts with short-lived presigned URLs.
*   **Secrets Manager:** Google Cloud Secret Manager
    *   Secure storage for database passwords, client secret keys, weather tokens, and Gemini API keys.
*   **Infrastructure-as-Code:** Terraform
    *   Declaratively configures network topologies, Cloud Run configurations, databases, and IAM access policies.
