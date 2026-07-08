"""API request/response models for the NDA chat endpoint.

Field names mirror ``frontend/lib/mnda-content.ts``'s ``MndaFormData`` 1:1,
serialized as camelCase on the wire so the frontend can consume the JSON
without a translation layer.
"""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

DEFAULT_PURPOSE = "Evaluating whether to enter into a business relationship with the other party."


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PartyDetails(CamelModel):
    name: str = ""
    title: str = ""
    company: str = ""
    notice_address: str = ""


class MndaFields(CamelModel):
    party1: PartyDetails = PartyDetails()
    party2: PartyDetails = PartyDetails()
    purpose: str = DEFAULT_PURPOSE
    effective_date: str = Field(default_factory=lambda: date.today().isoformat())
    mnda_term: Literal["expires", "continues"] = "expires"
    mnda_term_years: int = 1
    confidentiality_term: Literal["years", "perpetuity"] = "years"
    confidentiality_term_years: int = 1
    governing_law: str = ""
    jurisdiction: str = ""


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str


class NdaChatRequest(CamelModel):
    messages: list[ChatMessage]
    current_fields: MndaFields = MndaFields()


class NdaChatResponse(CamelModel):
    assistant_message: str
    fields: MndaFields
    is_complete: bool
