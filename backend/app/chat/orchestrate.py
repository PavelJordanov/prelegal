"""Top-level entry point for one chat turn: runs intake classification while
the document type is still unknown, then hands off to the generic
field-gathering engine once it is."""

from typing import Any

from app.chat import registry
from app.chat.engine import ChatError, default_fields, run_field_turn
from app.chat.intake import classify
from app.schemas import ChatMessage


def run_turn(
    document_key: str | None, history: list[ChatMessage], current_fields: dict[str, Any]
) -> tuple[str | None, str, dict[str, Any], bool]:
    if document_key is None:
        matched_key, intake_message = classify(history)
        if matched_key is None:
            return None, intake_message, {}, False
        spec = registry.REGISTRY[matched_key]
        fields = default_fields(spec) | current_fields
        message, fields, complete = run_field_turn(spec, history, fields)
        return spec.key, message, fields, complete

    spec = registry.REGISTRY.get(document_key)
    if spec is None:
        raise ChatError(f"Unknown document type: {document_key!r}")
    message, fields, complete = run_field_turn(spec, history, current_fields)
    return spec.key, message, fields, complete
