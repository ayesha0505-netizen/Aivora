# Aivora Task Checklist

This is the task backlog for implementing Aivora. Check off tasks as they are completed.

## Milestone 1: Environment & Project Setup
- [x] Initialize Python environment using `uv` and configure `pyproject.toml`
- [x] Initialize frontend project structure using Next.js, Tailwind CSS, and `framer-motion`
- [x] Configure database container/service for local development (SQLite/MySQL 8.0) and write initial schemas
- [x] Set up environment configuration files (`.env.example` and local `.env`)
- [x] Define helper commands and linting configurations (Ruff, ESLint)

## Milestone 2: Core Coordinator & Backend Infrastructure
- [x] Implement `app/config.py` to parse environment settings and initialize secret manager bindings
- [x] Set up the FastAPI entry point (`app/main.py` or equivalent API route)
- [x] Implement session manager service supporting database persistence and transaction logic
- [x] Build the core ADK 2.0 Coordinator Workflow structure in `app/agent.py`
- [x] Configure the SSE endpoint in FastAPI to stream agent execution trace events to client

## Milestone 3: Specialized Sub-Agents Development
- [x] **Travel Planner Agent:**
    - [x] Define input/output schemas (destination, dates, preferences -> JSON itineraries)
    - [x] Write prompt instructions for structured itinerary synthesis
- [x] **Weather Agent:**
    - [x] Define schemas and connect agent to weather data provider
    - [x] Write logic to process climate forecasts and suggest apparel/schedule revisions
- [x] **Budget Estimator Agent:**
    - [x] Create cost breakdown schemas and prompt rules for estimates
    - [x] Write budget aggregation logic
- [x] **Packing List Agent:**
    - [x] Establish categorized list schemas
    - [x] Write prompt reasoning to adapt items based on target location weather and duration
- [x] **Scheduler Agent:**
    - [x] Implement calendar event reservation schema
    - [x] Integrate calendar tools with Human-in-the-loop (HITL) gatekeepers
- [x] **Storage Agent:**
    - [x] Create utility to convert Pydantic outputs to CSV and PDF artifacts
    - [x] Connect storage agent to Google Cloud Storage (GCS) client

## Milestone 4: Model Context Protocol (MCP) Servers
- [x] Implement Google Calendar MCP Server in `mcp_servers/calendar_wrapper.py`
    - [x] Set up Google APIs Auth (OAuth 2.0 flow helper)
    - [x] Define `create_calendar_event` and `list_events` tools
- [x] Implement Weather API MCP Server wrapper
- [x] Set up the MCP runtime manager inside the ADK Runner to support stdio connections locally and SSE connections in production

## Milestone 5: Frontend Web Application & A2UI Renderer
- [x] Build the Next.js application wrapper with premium aesthetics (dark mode, glassmorphism, fonts)
- [x] Connect frontend components to real backend endpoints (`LoginForm`, `SignUpForm`, `ForgotPasswordForm`, `FooterSection`, `CtaSection`)
- [ ] Develop the SSE log listener/streamer to visualize agent progress in real time
- [ ] Create the **A2UI Render Engine** components:
    - [ ] Collapsible daily travel schedule widget
    - [ ] Weather analysis widget with custom weather icons
    - [ ] Interactive packing checklist synced to backend session state
    - [ ] SVG budget charts (cost breakdowns)
    - [ ] Interactive HITL authorization cards for Calendar booking confirmations
- [x] Implement OAuth callback routes and authentication flow

## Milestone 6: Quality Evaluation & Benchmark Testing
- [x] Set up unit and integration test suites in `tests/`
- [ ] Create test case scenarios (`datasets/test_cases.json`) representing common user requests
- [ ] Define evaluation metric hooks (e.g., itinerary correctness, budget mathematical alignment, schema adherence)
- [ ] Create and run `tests/eval/eval_runner.py` to compute benchmark reports

## Milestone 7: Deployment, Infrastructure & IaC
- [ ] Write Terraform files (`terraform/`) to deploy Cloud Run, Cloud SQL, Memorystore Redis, GCS, and Secret Manager
- [ ] Configure GitHub Actions workflow for CI/CD linting, testing, and deployment
- [ ] Create production Dockerfiles for the FastAPI backend and Next.js frontend
- [ ] Secure production database and set up row-level resource verification
