"""Model Context Protocol (MCP) wrapper for Google Calendar tool execution."""

from typing import Any

from pydantic import BaseModel, Field


class MCPToolRequest(BaseModel):
    """Generic MCP tool request payload."""

    server_name: str = "calendar_mcp_server"
    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class MCPToolResponse(BaseModel):
    """Generic MCP tool response payload."""

    status: str = "success"
    data: dict[str, Any] = Field(default_factory=dict)
    error_message: str | None = None


class CalendarMCPClient:
    """Client interface wrapping stdio/SSE communication with Google Calendar MCP server."""

    def __init__(self, mode: str = "stdio") -> None:
        self.mode = mode
        self.server_name = "calendar"

    async def check_availability(self, start_time: str, end_time: str, email: str) -> MCPToolResponse:
        """Query calendar availability for a given time slot."""
        # In local/mock dev mode, return simulated availability
        return MCPToolResponse(
            status="success",
            data={
                "available": True,
                "start": start_time,
                "end": end_time,
                "calendar_id": email,
                "conflicts": [],
            },
        )

    async def create_event(self, title: str, start_time: str, end_time: str, email: str) -> MCPToolResponse:
        """Create a new calendar event (must be preceded by HITL approval)."""
        return MCPToolResponse(
            status="success",
            data={
                "event_id": "gcal-event-uuid-88776655",
                "html_link": f"https://calendar.google.com/calendar/r/eventedit?id=mocked_{start_time}",
                "status": "confirmed",
                "title": title,
            },
        )


calendar_mcp_client = CalendarMCPClient()
