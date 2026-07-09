"""Declarative per-document field specifications that drive the generic chat
engine (``engine.py``). Each of the 11 supported document types has one
``DocumentSpec`` (see ``specs/``), hand-authored by reading its template in
``templates/*.md`` - there is no coverpage/order-form file for 10 of the 11
document types, so the field list can't be derived automatically.
"""

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any, Literal

FieldType = Literal["str", "int", "enum", "date"]


@dataclass(frozen=True)
class FieldSpec:
    """One field the chat should gather.

    ``key`` is the wire-format dict key (e.g. ``"purpose"``), shared verbatim
    with the frontend. A dotted key (e.g. ``"party1.name"``) marks the field
    as belonging to a group - the frontend reconstructs a nested object from
    the dotted prefix, and the prompt builder uses ``DocumentSpec.party_role_labels``
    to phrase the group in human terms (e.g. "Provider" rather than "party1").
    """

    key: str
    label: str
    topic: str
    type: FieldType = "str"
    order: int = 0
    enum_values: tuple[str, ...] = ()
    required: bool = True
    default: Any = None
    default_factory: Callable[[], Any] | None = None
    min_value: int | None = None
    max_value: int | None = None
    description: str = ""


@dataclass(frozen=True)
class DocumentSpec:
    """One chat-able document type. ``key`` is a stable kebab-case slug
    shared with the frontend's ``DocumentType`` union - it must not change
    once shipped, since the frontend echoes it back on every chat turn.
    """

    key: str
    catalog_names: tuple[str, ...]
    catalog_filenames: tuple[str, ...]
    catalog_description: str
    topics: tuple[str, ...]
    fields: tuple[FieldSpec, ...]
    party_role_labels: dict[str, str] = field(default_factory=dict)


_PARTY_SUB_FIELDS = (
    ("name", "Name", "the signer's full name"),
    ("title", "Title", "the signer's job title"),
    ("noticeAddress", "Notice Address", "an email or postal address for legal notices"),
)


def party_fields(
    *parties: str, topic: str | dict[str, str], company_key: str = "company"
) -> tuple[FieldSpec, ...]:
    """Builds the standard 4-field signature-block group (name, title,
    company, notice address) for each party prefix in ``parties``. ``topic``
    is either one topic shared by every party, or a dict mapping each party
    prefix to its own topic (e.g. separate "Party 1 details"/"Party 2
    details" topics). ``company_key`` lets a party's company sub-field be
    named ``"companyName"`` instead of ``"company"``, for documents where a
    party role is itself named "Company" (e.g. Partnership Agreement).
    """
    company_label = "Company Name" if company_key != "company" else "Company"
    sub_fields = (
        *_PARTY_SUB_FIELDS[:2],
        (company_key, company_label, "the party's company name"),
        _PARTY_SUB_FIELDS[2],
    )
    return tuple(
        FieldSpec(
            key=f"{party}.{sub_key}",
            label=label,
            topic=topic[party] if isinstance(topic, dict) else topic,
            order=order,
            description=description,
        )
        for party in parties
        for order, (sub_key, label, description) in enumerate(sub_fields)
    )
