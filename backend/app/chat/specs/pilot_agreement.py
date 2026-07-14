from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields(
    "provider", "customer", topic={"provider": "Provider details", "customer": "Customer details"}
)

SPEC = DocumentSpec(
    key="pilot-agreement",
    catalog_names=("Pilot Agreement",),
    catalog_filenames=("Pilot-Agreement.md",),
    catalog_description=(
        "Standard terms for a short-term trial or evaluation of a product or service before a "
        "customer commits to a longer-term commercial agreement."
    ),
    topics=(
        "Pilot terms",
        "Liability",
        "Governing law and jurisdiction",
        "Provider details",
        "Customer details",
    ),
    party_role_labels={"provider": "Provider", "customer": "Customer"},
    fields=(
        FieldSpec(
            key="pilotPeriod",
            label="Pilot Period",
            topic="Pilot terms",
            order=0,
            description=(
                "the length of the pilot/evaluation period during which Customer may access the "
                "Product (e.g. '30 days', '90 days', '3 months')"
            ),
        ),
        FieldSpec(
            key="evaluationPurposes",
            label="Evaluation Purposes",
            topic="Pilot terms",
            order=1,
            description=(
                "what Customer will use the Product for during the pilot, to determine whether "
                "to enter into a longer-term Definitive Agreement with Provider"
            ),
        ),
        FieldSpec(
            key="effectiveDate",
            label="Effective Date",
            topic="Pilot terms",
            type="date",
            order=2,
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the pilot starts - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="generalCapAmount",
            label="General Cap Amount",
            topic="Liability",
            description=(
                "each party's total cumulative liability cap under the agreement "
                "(e.g. a dollar amount or a multiple of fees paid)"
            ),
        ),
        FieldSpec(
            key="governingLaw",
            label="Governing Law",
            topic="Governing law and jurisdiction",
            order=0,
            description="a US state (or other jurisdiction) whose law governs the agreement",
        ),
        FieldSpec(
            key="chosenCourts",
            label="Chosen Courts",
            topic="Governing law and jurisdiction",
            order=1,
            description="the courts (city/county and state, or country) where disputes must be brought",
        ),
        *_PARTY_FIELDS,
    ),
)
