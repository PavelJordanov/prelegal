from app.nda_chat import (
    NdaTurnExtraction,
    PartyExtraction,
    is_complete,
    merge_fields,
)
from app.schemas import MndaFields, PartyDetails

FILLED_PARTY = PartyDetails(
    name="Jane Doe", title="CEO", company="Acme Inc", notice_address="jane@acme.com"
)


def test_merge_fields_fills_blank_fields_from_extraction():
    current = MndaFields()
    extraction = NdaTurnExtraction(
        assistant_message="Got it.",
        party1=PartyExtraction(
            name="Jane Doe", title="CEO", company="Acme Inc", notice_address="jane@acme.com"
        ),
        governing_law="Delaware",
    )

    merged = merge_fields(current, extraction)

    assert merged.party1 == FILLED_PARTY
    assert merged.governing_law == "Delaware"
    # Untouched fields keep their prior values.
    assert merged.party2 == PartyDetails()
    assert merged.jurisdiction == ""


def test_merge_fields_does_not_clobber_known_values_with_nulls():
    current = MndaFields(party1=FILLED_PARTY, governing_law="Delaware")
    extraction = NdaTurnExtraction(assistant_message="And party 2?")

    merged = merge_fields(current, extraction)

    assert merged.party1 == FILLED_PARTY
    assert merged.governing_law == "Delaware"


def test_merge_fields_rejects_malformed_effective_date():
    current = MndaFields(effective_date="2026-01-01")
    extraction = NdaTurnExtraction(assistant_message="...", effective_date="not-a-date")

    merged = merge_fields(current, extraction)

    assert merged.effective_date == "2026-01-01"


def test_merge_fields_rejects_out_of_range_years():
    current = MndaFields(mnda_term_years=1)
    extraction = NdaTurnExtraction(assistant_message="...", mnda_term_years=0)

    merged = merge_fields(current, extraction)

    assert merged.mnda_term_years == 1


def test_is_complete_requires_both_parties_and_law_and_jurisdiction():
    fields = MndaFields(
        party1=FILLED_PARTY,
        party2=FILLED_PARTY,
        governing_law="Delaware",
        jurisdiction="New Castle, DE",
    )

    assert is_complete(fields) is True


def test_is_complete_false_when_a_required_field_is_blank():
    fields = MndaFields(party1=FILLED_PARTY, party2=FILLED_PARTY, governing_law="Delaware")

    assert is_complete(fields) is False


def test_is_complete_ignores_fields_with_sensible_defaults():
    # purpose/effectiveDate/mndaTerm/confidentialityTerm already have
    # non-blank defaults from the frontend, so they never block completion.
    fields = MndaFields(
        party1=FILLED_PARTY,
        party2=FILLED_PARTY,
        governing_law="Delaware",
        jurisdiction="New Castle, DE",
        purpose="",
    )

    assert is_complete(fields) is True
