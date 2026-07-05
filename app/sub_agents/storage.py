"""Storage Sub-Agent for generating CSV and PDF artifacts."""

from typing import Any

from pydantic import BaseModel, Field


class StorageInput(BaseModel):
    """Input schema for Storage sub-agent."""

    session_id: str
    artifact_type: str = Field(description="'csv' or 'pdf'")
    data_payload: dict[str, Any]
    filename: str


class StorageOutput(BaseModel):
    """Output schema for Storage sub-agent."""

    filename: str
    download_url: str = Field(description="Presigned cloud storage URL or local relative URL")
    file_size_bytes: int = 1024
    status: str = "generated"


STORAGE_INSTRUCTIONS = """
You are the Aivora Storage Agent operating in ADK task mode.
Package structured itineraries, budgets, or packing lists into formatted static artifacts (CSV or PDF).
Return short-lived download URLs for client retrieval.
When complete, execute finish_task to return the structured StorageOutput.
"""


def run_storage_agent(input_data: StorageInput) -> StorageOutput:
    """Execute artifact generation and return download link."""
    return StorageOutput(
        filename=input_data.filename,
        download_url=f"/api/sessions/{input_data.session_id}/artifacts/{input_data.filename}",
        file_size_bytes=2048,
    )
