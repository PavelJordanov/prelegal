"""API request/response models for the generic multi-document chat endpoint.

Field values travel as a flat, string-keyed dict rather than a typed model
per document - the 11 supported document types have too different a field
shape (5 to 34 fields, some grouped like ``party1.name``) to share one
Pydantic model. Each document's shape is instead defined declaratively by its
``DocumentSpec`` (see ``chat/field_spec.py``).
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

FieldValue = str | int | bool | None


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str


class ChatTurnRequest(CamelModel):
    document_type: str | None = None
    messages: list[ChatMessage]
    current_fields: dict[str, FieldValue] = {}


class ChatTurnResponse(CamelModel):
    document_type: str | None
    assistant_message: str
    fields: dict[str, FieldValue]
    is_complete: bool
