from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields("provider", "customer", topic="Parties")

SPEC = DocumentSpec(
    key="psa",
    catalog_names=("Professional Services Agreement",),
    catalog_filenames=("PSA.md",),
    catalog_description=(
        "Standard terms for engaging a services provider to perform work under one or more "
        "statements of work, covering deliverables, intellectual property, payment, and warranties."
    ),
    topics=(
        "Parties",
        "Effective date",
        "Statement of work",
        "Payment",
        "Liability and warranties",
        "Governing law and jurisdiction",
    ),
    party_role_labels={"provider": "Provider", "customer": "Customer"},
    fields=(
        FieldSpec(
            key="effectiveDate",
            label="Effective Date",
            topic="Effective date",
            type="date",
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the PSA starts - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="customerPolicies",
            label="Customer Policies",
            topic="Statement of work",
            order=0,
            required=False,
            default="None.",
            description=(
                "any policies (e.g. code of conduct, security policy) Provider must comply with "
                "while performing the Services, if any - default to none if not specified"
            ),
        ),
        FieldSpec(
            key="sowTerm",
            label="SOW Term",
            topic="Statement of work",
            order=1,
            description="the duration or end date of the Statement of Work term",
        ),
        FieldSpec(
            key="deliverablesDescription",
            label="Deliverables",
            topic="Statement of work",
            order=2,
            description="a description of the Deliverables (if any) Provider will produce under the SOW",
        ),
        FieldSpec(
            key="reviewPeriodDays",
            label="Rejection/Resubmission Period (days)",
            topic="Statement of work",
            type="int",
            order=3,
            required=False,
            default=10,
            min_value=1,
            max_value=365,
            description=(
                "number of days Customer has to reject a Deliverable, and the number of days "
                "Provider then has to correct and resubmit it"
            ),
        ),
        FieldSpec(
            key="customerObligations",
            label="Customer Obligations",
            topic="Statement of work",
            order=4,
            required=False,
            default="None.",
            description="obligations Customer must fulfill to support Provider's performance of the Services, if any",
        ),
        FieldSpec(
            key="timeOfAssignment",
            label="Time of Assignment",
            topic="Statement of work",
            type="enum",
            enum_values=("upon-delivery", "upon-full-payment"),
            order=5,
            required=False,
            default="upon-full-payment",
            description="when IP ownership in the Deliverables transfers from Provider to Customer",
        ),
        FieldSpec(
            key="fees",
            label="Fees",
            topic="Payment",
            order=0,
            description="the fees Customer will pay Provider for the Services under the SOW",
        ),
        FieldSpec(
            key="paymentPeriodDays",
            label="Payment Period",
            topic="Payment",
            type="int",
            order=1,
            min_value=1,
            max_value=365,
            description="number of days Customer has to pay an invoice after receipt",
        ),
        FieldSpec(
            key="generalCapAmount",
            label="General Cap Amount",
            topic="Liability and warranties",
            order=0,
            description=(
                "the liability cap for ordinary claims, e.g. a dollar amount or a multiple of fees "
                "paid such as '12 months of Fees paid under the applicable SOW'"
            ),
        ),
        FieldSpec(
            key="increasedCapAmount",
            label="Increased Cap Amount",
            topic="Liability and warranties",
            order=1,
            description=(
                "the higher liability cap that applies to Increased Claims (e.g. IP infringement, "
                "confidentiality breach), e.g. a dollar amount or a multiple of fees paid"
            ),
        ),
        FieldSpec(
            key="additionalWarranties",
            label="Additional Warranties",
            topic="Liability and warranties",
            order=2,
            required=False,
            default="None.",
            description="any additional warranty commitments each party makes beyond the standard mutual warranties, if any",
        ),
        FieldSpec(
            key="dpaReference",
            label="DPA",
            topic="Liability and warranties",
            order=3,
            required=False,
            default="No DPA is in place between the parties.",
            description="whether the parties have a Data Processing Agreement in place and, if so, a reference to it",
        ),
        FieldSpec(
            key="insuranceMinimums",
            label="Insurance Minimums",
            topic="Liability and warranties",
            order=4,
            required=False,
            default="None specified.",
            description="the minimum insurance coverage each party must carry, if any is required by the SOW",
        ),
        FieldSpec(
            key="governingLaw",
            label="Governing Law",
            topic="Governing law and jurisdiction",
            order=0,
            description="a US state whose law governs the agreement",
        ),
        FieldSpec(
            key="chosenCourts",
            label="Chosen Courts",
            topic="Governing law and jurisdiction",
            order=1,
            description="the courts (city/county and state) where legal disputes about the agreement will be brought",
        ),
        *_PARTY_FIELDS,
    ),
)
