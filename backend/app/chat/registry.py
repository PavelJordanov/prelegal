"""Loads and validates the 11 document specs into a lookup by slug."""

from app.chat.field_spec import DocumentSpec
from app.chat.specs import ALL_SPECS

REGISTRY: dict[str, DocumentSpec] = {}
for _spec in ALL_SPECS:
    if _spec.key in REGISTRY:
        raise ValueError(f"Duplicate document spec key: {_spec.key!r}")
    if not _spec.key.replace("-", "").isalnum() or _spec.key.lower() != _spec.key:
        raise ValueError(f"Document spec key must be kebab-case: {_spec.key!r}")
    REGISTRY[_spec.key] = _spec
