# Aivora Coding Standards & Conventions

These standards must be followed on all development work within this repository to maintain code quality, maintainability, and compatibility with the Google ADK and MCP frameworks.

---

## 1. Python Style Guidelines (PEP 8+)

*   **Version:** Python 3.11+
*   **Tooling:** Use `ruff` for linting and formatting. Run `ruff check .` and `ruff format .` before pushing changes.
*   **Type Hinting:** Mandatory for all functions and class signatures.
    ```python
    def calculate_totals(items: list[dict], tax_rate: float) -> float:
        ...
    ```
*   **Pydantic (v2):** Used for all data models, environment configurations, and agent schemas. Enforce strict validation:
    ```python
    from pydantic import BaseModel, Field

    class Activity(BaseModel):
        title: str = Field(description="Name of the activity")
        duration_minutes: int = Field(gt=0, description="Duration in minutes")
    ```

---

## 2. Next.js & React Coding Standards

*   **Version:** Next.js (App Router or Page Router as specified by layout), TypeScript.
*   **Styling:** Use Vanilla CSS or Tailwind CSS where indicated. Avoid ad-hoc styling; use CSS theme tokens (colors, spacings, border-radii) defined in global styles.
*   **Animations:** Use `framer-motion` for micro-animations and route transitions. Keep animations smooth, subtle (e.g., transition durations between `0.15s` and `0.3s`), and performant.
*   **Component Structure:** Focus on modular, reusable, and single-responsibility components. Put presentation elements in `components/ui/` and compound widget renderers in `components/widgets/`.
*   **State Hooks:** Minimize state prop-drilling; leverage React Context or custom hooks for SSE streams and session orchestration.

---

## 3. Google ADK 2.0 Architecture Patterns

*   **Coordinator Workflow:** Set up the root orchestration agent as an ADK `Workflow`. Connect sub-agents explicitly using the `edges` property.
*   **Sub-Agents in Task Mode:** Sub-agents must run in `mode="task"`. They must have:
    1.  An `input_schema` (Pydantic model) defining all inputs.
    2.  An `output_schema` (Pydantic model) returning the structured result.
    3.  Instructions that mandate executing `finish_task` to complete processing.
*   **Long-Term Memory Integration:** 
    *   Preload user context into the prompt using the `PreloadMemoryTool`.
    *   Update user context at the end of runs via callback hooks (`after_agent_callback`).
*   **Variable Isolation:**
    *   Prefix transient variables with `temp:` (e.g., `temp:weather_payload`) in the shared state context.
    *   Keep permanent variables clean and concise to save LLM tokens.
*   **Human-in-the-Loop (HITL) Gatekeepers:**
    *   Any action mutating external state must interrupt the runner.
    *   Register the interrupt card details in the session context, then trigger the interrupt.
    *   Wait for the user's `resume` request before proceeding.
*   **Transaction Safety & Rewinds:**
    *   Handle backend/API failures by catching exceptions and executing `runner.rewind_async(rewind_before_invocation_id=...)` to roll back to the last stable state.

---

## 4. Model Context Protocol (MCP) Standards

*   **Server Language:** TypeScript is preferred for integrations like Google Calendar. Python is acceptable for simple API wrappers.
*   **Tool Definitions:** Define clear descriptions and parameter JSON schemas for each tool. If the prompt fails to clarify a tool parameter, instruct the tool to return an error rather than guessing values.
*   **Secrets Handling:** NEVER hardcode credentials, client secrets, or tokens. Load secrets from environment variables or Google Secret Manager.
*   **Transport Mode:** Standard Input/Output (`stdio`) for local development runs. Server-Sent Events (`sse`) over HTTPS for production deployments.

---

## 5. Database Schema & Migration Rules

*   **Naming Conventions:** Table and column names must use `snake_case`.
*   **Primary Keys:** Use standard `VARCHAR(36)` fields containing UUIDs.
*   **Foreign Keys:** Define explicit foreign keys with cascade policies (`ON DELETE CASCADE`) to maintain database integrity.
*   **JSON Columns:** Use JSON fields for unstructured state payloads (e.g., ADK context, session variables) to allow schema-less evolution.
*   **Migrations:** All database modifications must be managed through structured migrations (e.g., Alembic for Python or raw SQL migration runners). No direct database patching.
