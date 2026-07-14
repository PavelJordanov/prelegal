"""API request/response models for the generic multi-document chat endpoint.

Field values travel as a flat, string-keyed dict rather than a typed model
per document - the 11 supported document types have too different a field
shape (5 to 34 fields, some grouped like ``party1.name``) to share one
Pydantic model. Each document's shape is instead defined declaratively by its
``DocumentSpec`` (see ``chat/field_spec.py``).
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel

FieldValue = str | int | bool | None


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str


class ChatTurnRequest(CamelModel):
    document_id: int | None = None
    document_type: str | None = None
    messages: list[ChatMessage]
    current_fields: dict[str, FieldValue] = {}


class ChatTurnResponse(CamelModel):
    document_id: int | None
    document_type: str | None
    assistant_message: str
    fields: dict[str, FieldValue]
    is_complete: bool


class AuthRequest(CamelModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address.")
        return value

    @field_validator("password")
    @classmethod
    def _validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class UserResponse(CamelModel):
    id: int
    email: str


class DocumentSummary(CamelModel):
    id: int
    document_type: str
    is_complete: bool
    created_at: str
    updated_at: str


class DocumentDetail(DocumentSummary):
    fields: dict[str, FieldValue]
    messages: list[ChatMessage]
