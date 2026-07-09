from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields("provider", "partner", topic="Parties")

SPEC = DocumentSpec(
    key="design-partner-agreement",
    catalog_names=("Design Partner Agreement",),
    catalog_filenames=("Design-Partner-Agreement.md",),
    catalog_description=(
        "Standard terms granting an early customer access to a not-yet-generally-available "
        "product in exchange for feedback and participation in a design partner program."
    ),
    topics=(
        "Parties",
        "Program terms",
        "Governing law and jurisdiction",
    ),
    party_role_labels={"provider": "Provider", "partner": "Partner"},
    fields=(
        FieldSpec(
            key="effectiveDate",
            label="Effective Date",
            topic="Program terms",
            type="date",
            order=0,
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the Agreement starts - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="term",
            label="Term",
            topic="Program terms",
            order=1,
            required=True,
            description="how long the Agreement/Program lasts (e.g. '6 months', '1 year')",
        ),
        FieldSpec(
            key="program",
            label="Program Description",
            topic="Program terms",
            order=2,
            required=True,
            description=(
                "a description of the design partner Program - its purpose, activities, and how "
                "Partner will give Feedback to Provider"
            ),
        ),
        FieldSpec(
            key="fees",
            label="Fees",
            topic="Program terms",
            order=3,
            required=True,
            description="the fees, if any, Partner will pay Provider (e.g. a dollar amount or 'None')",
        ),
        FieldSpec(
            key="governingLaw",
            label="Governing Law",
            topic="Governing law and jurisdiction",
            order=0,
            required=True,
            description="a US state whose law governs the agreement",
        ),
        FieldSpec(
            key="chosenCourts",
            label="Chosen Courts",
            topic="Governing law and jurisdiction",
            order=1,
            required=True,
            description="the courts (city/county and state) with exclusive jurisdiction over disputes",
        ),
        *_PARTY_FIELDS,
    ),
)
