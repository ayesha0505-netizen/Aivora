# Aivora Project Profile

Aivora is a production-quality, multi-agent personal life manager (Concierge Agent). It is designed to consume a single complex, high-level natural language request, orchestrate multiple specialized AI agents, interact with external systems, and synthesize a cohesive response/action plan.

## Project Vision & Description
Modern life is fragmented across calendars, weather apps, travel planners, budgeting tools, and note-taking apps. Aivora acts as an autonomous digital chief of staff. Rather than acting as a simple conversational chatbot, Aivora takes a high-level goal (e.g., *"I want to visit Delhi next weekend for sightseeing. I need a budget plan, packing tips, and calendar reminders booked."*), breaks it down, coordinates specialized sub-agents, gathers external context, requests confirmation for actions, and delivers a consolidated response.

---

## Core Product Requirements

### 1. Autonomous Planning & Multi-Agent Coordination
*   **Request Decomposition:** A master Coordinator agent breaks down a single input into sub-tasks (e.g., weather analysis, travel itinerary, budget estimation, packing list, calendar scheduling).
*   **Parallel Execution:** Orchestrates independent tasks concurrently to minimize response latency.
*   **Shared Session State:** Tracks intermediate execution results in a shared session context so sub-agents can access and build upon each other's outputs.

### 2. Rich User Interface (A2UI)
*   **Structured Content over Raw Text:** Rather than rendering raw markdown text, Aivora leverages Agent-to-User Interface (A2UI) components. 
*   **Interactive Cards:** Renders responsive packing checklists, weather forecasts with icons, travel maps, and cost breakdown charts.
*   **Real-time Streaming:** Streams both execution logs (e.g., *"Weather Agent is querying the forecast..."*) and partial agent responses to the user interface.

### 3. Human-in-the-Loop (HITL) Gatekeeping
*   **Safe Mutation of State:** External actions that change state (e.g., modifying Google Calendar, sending emails, initiating payments) must halt execution.
*   **Interactive Confirmation Cards:** Generates preview cards requesting explicit user approval.
*   **State Pause & Resume:** Pauses the agent run, waits for the user interaction, and resumes execution seamlessly without loss of session context.

### 4. Long-Term Memory & Personalization
*   **Preference Accumulation:** Remembers user preferences over multiple sessions (e.g., *"I prefer vegetarian food"*, *"Do not schedule travel on Sundays"*, *"I prefer morning flights"*).
*   **Memory Bank Synchronization:** Automatically preloads user preferences into the coordinator prompt and updates the memory store at the end of each session.
*   **Temporary vs. Permanent Context:** Excludes transient variables (like raw API payloads) from being stored in the user's permanent memory bank.

### 5. Robust Operations & Recovery
*   **Transaction Safety:** Features state rewind capabilities (`runner.rewind_async`) to rollback session state if downstream steps fail.
*   **Systematic Evaluation:** Includes an evaluation suite to verify agent output quality against predetermined benchmarks.

---

## Functional Scope & Features

| Feature | Sub-Agent | Description |
| :--- | :--- | :--- |
| **Itinerary Planning** | Travel Planner Agent | Drafts structured daily itineraries with locations, activities, and hotel/restaurant recommendations based on user constraints. |
| **Weather Analysis** | Weather Agent | Fetches and analyzes weather predictions to recommend clothing and influence travel schedules. |
| **Budgeting & Cost** | Budget Estimator Agent | Estimates travel costs, accommodation, food, and activities, and exports a visual cost breakdown. |
| **Packing Lists** | Packing List Agent | Generates a categorized, interactive checklist of recommended packing items based on itinerary and weather. |
| **Calendar Scheduling** | Scheduler Agent | Interfaces with Google Calendar via MCP to verify availability, reserve time slots, and schedule reminders. |
| **Storage & Artifacts** | Storage Agent | Packages final reports, itineraries, and lists into structured files (PDF/CSV) and saves them in Cloud Storage. |
