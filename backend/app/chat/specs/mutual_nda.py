from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields(
    "party1", "party2", topic={"party1": "Party 1 details", "party2": "Party 2 details"}
)

SPEC = DocumentSpec(
    key="mutual-nda",
    catalog_names=(
        "Mutual Non-Disclosure Agreement",
        "Mutual Non-Disclosure Agreement Cover Page",
    ),
    catalog_filenames=("Mutual-NDA.md", "Mutual-NDA-coverpage.md"),
    catalog_description=(
        "Standard terms allowing two parties to disclose confidential information to each other "
        "in connection with a potential business relationship."
    ),
    topics=(
        "Purpose",
        "Effective date",
        "MNDA term and confidentiality term",
        "Governing law and jurisdiction",
        "Party 1 details",
        "Party 2 details",
    ),
    party_role_labels={"party1": "Party 1", "party2": "Party 2"},
    fields=(
        FieldSpec(
            key="purpose",
            label="Purpose",
            topic="Purpose",
            required=False,
            default="Evaluating whether to enter into a business relationship with the other party.",
            description="why the parties are sharing confidential information",
        ),
        FieldSpec(
            key="effectiveDate",
            label="Effective Date",
            topic="Effective date",
            type="date",
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the NDA starts - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="mndaTerm",
            label="MNDA Term",
            topic="MNDA term and confidentiality term",
            type="enum",
            enum_values=("expires", "continues"),
            order=0,
            required=False,
            default="expires",
            description="whether the NDA expires after a set number of years or continues until terminated",
        ),
        FieldSpec(
            key="mndaTermYears",
            label="MNDA Term Years",
            topic="MNDA term and confidentiality term",
            type="int",
            order=1,
            required=False,
            default=1,
            min_value=1,
            max_value=99,
            description="how many years the NDA lasts, if it expires",
        ),
        FieldSpec(
            key="confidentialityTerm",
            label="Term of Confidentiality",
            topic="MNDA term and confidentiality term",
            type="enum",
            enum_values=("years", "perpetuity"),
            order=2,
            required=False,
            default="years",
            description="how long information stays protected after the NDA ends",
        ),
        FieldSpec(
            key="confidentialityTermYears",
            label="Term of Confidentiality Years",
            topic="MNDA term and confidentiality term",
            type="int",
            order=3,
            required=False,
            default=1,
            min_value=1,
            max_value=99,
            description="how many years information stays protected, if not perpetual",
        ),
        FieldSpec(
            key="governingLaw",
            label="Governing Law",
            topic="Governing law and jurisdiction",
            order=0,
            description="a US state whose law governs the agreement",
        ),
        FieldSpec(
            key="jurisdiction",
            label="Jurisdiction",
            topic="Governing law and jurisdiction",
            order=1,
            description="a city/county and state for disputes",
        ),
        *_PARTY_FIELDS,
    ),
)
