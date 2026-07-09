from app.chat.engine import (
    build_extraction_model,
    build_system_prompt,
    default_fields,
    is_complete,
    merge_fields,
    run_field_turn,
)
from app.chat.field_spec import DocumentSpec, FieldSpec

SPEC = DocumentSpec(
    key="test-doc",
    catalog_names=("Test Document",),
    catalog_filenames=("Test-Document.md",),
    catalog_description="A document used only in tests.",
    topics=("Basics", "Term", "Party details"),
    party_role_labels={"party1": "Provider"},
    fields=(
        FieldSpec(key="purpose", label="Purpose", topic="Basics", required=False, default="Testing."),
        FieldSpec(
            key="term",
            label="Term",
            topic="Term",
            type="enum",
            enum_values=("short", "long"),
            required=False,
            default="short",
        ),
        FieldSpec(key="years", label="Years", topic="Term", type="int", min_value=1, max_value=10, required=False, default=1),
        FieldSpec(key="startDate", label="Start Date", topic="Term", type="date", required=False, default="2026-01-01"),
        FieldSpec(key="party1.name", label="Name", topic="Party details"),
        FieldSpec(key="party1.company", label="Company", topic="Party details"),
        FieldSpec(key="governingLaw", label="Governing Law", topic="Basics"),
    ),
)


def test_default_fields_uses_defaults_and_default_factories():
    fields = default_fields(SPEC)

    assert fields["purpose"] == "Testing."
    assert fields["term"] == "short"
    assert fields["years"] == 1
    assert fields["party1.name"] == ""
    assert fields["governingLaw"] == ""


def test_build_extraction_model_exposes_dotted_keys_as_double_underscore():
    model = build_extraction_model(SPEC)

    properties = model.model_json_schema()["properties"]
    assert "party1__name" in properties
    assert "party1__company" in properties
    assert "assistant_message" in properties
    assert "document_complete" in properties


def test_build_system_prompt_mentions_document_name_and_topics():
    prompt = build_system_prompt(SPEC)

    assert "Test Document" in prompt
    assert "1. Basics" in prompt
    assert "Provider Name" in prompt


def test_merge_fields_fills_blanks_and_keeps_prior_values():
    model = build_extraction_model(SPEC)
    extraction = model.model_validate(
        {
            "assistant_message": "Got it.",
            "governingLaw": "Delaware",
            "party1__name": "Jane Doe",
        }
    )
    current = default_fields(SPEC)

    merged = merge_fields(current, extraction, SPEC)

    assert merged["governingLaw"] == "Delaware"
    assert merged["party1.name"] == "Jane Doe"
    assert merged["party1.company"] == ""


def test_merge_fields_does_not_clobber_known_values_with_nulls():
    model = build_extraction_model(SPEC)
    extraction = model.model_validate({"assistant_message": "..."})
    current = default_fields(SPEC) | {"governingLaw": "Delaware"}

    merged = merge_fields(current, extraction, SPEC)

    assert merged["governingLaw"] == "Delaware"


def test_merge_fields_rejects_out_of_range_int():
    model = build_extraction_model(SPEC)
    extraction = model.model_validate({"assistant_message": "...", "years": 99})
    current = default_fields(SPEC) | {"years": 3}

    merged = merge_fields(current, extraction, SPEC)

    assert merged["years"] == 3


def test_merge_fields_rejects_malformed_date():
    model = build_extraction_model(SPEC)
    extraction = model.model_validate({"assistant_message": "...", "startDate": "not-a-date"})
    current = default_fields(SPEC) | {"startDate": "2026-05-05"}

    merged = merge_fields(current, extraction, SPEC)

    assert merged["startDate"] == "2026-05-05"


def test_is_complete_requires_all_required_fields():
    fields = default_fields(SPEC) | {
        "governingLaw": "Delaware",
        "party1.name": "Jane Doe",
        "party1.company": "Acme Inc",
    }

    assert is_complete(fields, SPEC) is True


def test_is_complete_ignores_fields_with_defaults():
    fields = default_fields(SPEC) | {
        "governingLaw": "Delaware",
        "party1.name": "Jane Doe",
        "party1.company": "Acme Inc",
        "purpose": "",
    }

    assert is_complete(fields, SPEC) is True


def test_is_complete_false_when_required_field_blank():
    fields = default_fields(SPEC) | {"governingLaw": "Delaware"}

    assert is_complete(fields, SPEC) is False


def test_run_field_turn_wraps_completion_failures(monkeypatch):
    import app.chat.engine as engine_module

    def fake_completion(**kwargs):
        raise RuntimeError("network down")

    monkeypatch.setattr(engine_module, "completion", fake_completion)

    try:
        run_field_turn(SPEC, [], default_fields(SPEC))
        assert False, "expected ChatError"
    except engine_module.ChatError:
        pass
