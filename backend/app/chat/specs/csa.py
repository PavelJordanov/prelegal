from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields("provider", "customer", topic="Parties")

SPEC = DocumentSpec(
    key="csa",
    catalog_names=("Cloud Service Agreement",),
    catalog_filenames=("CSA.md",),
    catalog_description=(
        "Standard terms for selling and buying cloud software and SaaS products, covering "
        "service access, support, payment, confidentiality, warranties, and liability."
    ),
    topics=(
        "Parties",
        "Subscription and fees",
        "Support",
        "Use limitations and data protection",
        "Liability and warranties",
        "Governing law and jurisdiction",
    ),
    party_role_labels={"provider": "Provider", "customer": "Customer"},
    fields=(
        *_PARTY_FIELDS,
        FieldSpec(
            key="subscriptionPeriod",
            label="Subscription Period",
            topic="Subscription and fees",
            order=0,
            description="how long each Order Form's subscription to the Cloud Service runs, e.g. '12 months'",
        ),
        FieldSpec(
            key="orderDate",
            label="Order Date",
            topic="Subscription and fees",
            type="date",
            order=1,
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description=(
                "the date the Order Form (and the Framework Terms) start - state the default and "
                "ask the user to confirm or change it"
            ),
        ),
        FieldSpec(
            key="nonRenewalNoticeDate",
            label="Non-Renewal Notice Date",
            topic="Subscription and fees",
            order=2,
            required=False,
            default="60 days before the end of the then-current Subscription Period.",
            description="the deadline by which a party must give notice to stop the subscription from auto-renewing",
        ),
        FieldSpec(
            key="paymentProcess",
            label="Payment Process",
            topic="Subscription and fees",
            order=3,
            description="how and when Customer pays Fees, e.g. invoiced net 30 or automatic card charge annually",
        ),
        FieldSpec(
            key="feesDescription",
            label="Fees",
            topic="Subscription and fees",
            order=4,
            description=(
                "a free-text description of the Fees and how they are calculated, e.g. subscription price, "
                "usage-based pricing, or a summary of line items - not a structured line-item table"
            ),
        ),
        FieldSpec(
            key="technicalSupport",
            label="Technical Support",
            topic="Support",
            required=False,
            default="Email support during Provider's standard business hours, with a response within one business day.",
            description="the level of technical support Provider commits to during the Subscription Period",
        ),
        FieldSpec(
            key="useLimitations",
            label="Use Limitations",
            topic="Use limitations and data protection",
            order=0,
            required=False,
            default="None.",
            description="any limits on Customer's use of the Product, e.g. a maximum number of seats or API calls",
        ),
        FieldSpec(
            key="dpaReference",
            label="Data Processing Agreement",
            topic="Use limitations and data protection",
            order=1,
            required=False,
            default="No separate Data Processing Agreement is in place.",
            description="whether the parties have a Data Processing Agreement governing Personal Data, and which one",
        ),
        FieldSpec(
            key="generalCapAmount",
            label="General Cap Amount",
            topic="Liability and warranties",
            order=0,
            description="each party's overall liability cap for ordinary claims, e.g. 'Fees paid in the preceding 12 months'",
        ),
        FieldSpec(
            key="increasedCapAmount",
            label="Increased Cap Amount",
            topic="Liability and warranties",
            order=1,
            description="the higher liability cap that applies to Increased Claims, e.g. confidentiality breaches",
        ),
        FieldSpec(
            key="additionalWarranties",
            label="Additional Warranties",
            topic="Liability and warranties",
            order=2,
            required=False,
            default="None.",
            description="any extra warranties either party makes beyond the standard mutual representations",
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
            description="the courts (city/county and state, or federal district) where disputes must be brought",
        ),
    ),
)
