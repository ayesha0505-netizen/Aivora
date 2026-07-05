import logging
from typing import Any

from pydantic import BaseModel, Field

logger = logging.getLogger("aivora.tools.notification")


class NotificationInput(BaseModel):
    """Parameter schema for sending user notifications via MCP."""

    recipient_email: str = Field(description="Email address of the notification recipient")
    subject: str = Field(description="Subject line or title of the notification")
    message_body: str = Field(description="Full text content of the message body")
    notification_type: str = Field(default="email", description="Type of notification (email, sms, push)")


class NotificationOutput(BaseModel):
    """Output result schema from notification dispatch."""

    status: str = Field(description="Status of dispatch (success or failed)")
    message_id: str = Field(description="Unique tracking identifier for dispatched notification")
    recipient: str = Field(description="Confirmed recipient address")


async def send_notification_tool(
    recipient_email: str,
    subject: str,
    message_body: str,
    notification_type: str = "email",
) -> dict[str, Any]:
    """MCP Tool to send notifications (welcome emails, password resets, alerts).

    If required parameters are missing or invalid, raises ValueError.
    During local development, logs message dispatch securely.
    """
    if not recipient_email or "@" not in recipient_email:
        raise ValueError("Invalid parameter: recipient_email must be a valid email address.")
    if not subject or not message_body:
        raise ValueError("Invalid parameter: subject and message_body cannot be empty.")

    logger.info(f"[MCP Notification Dispatch] Type: {notification_type} | To: {recipient_email} | Subject: {subject}")

    import uuid

    msg_id = f"notif_{uuid.uuid4().hex[:12]}"
    result = NotificationOutput(
        status="success",
        message_id=msg_id,
        recipient=recipient_email,
    )
    return result.model_dump()
