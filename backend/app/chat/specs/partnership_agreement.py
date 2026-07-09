from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields("company", "partner", topic="Parties", company_key="companyName")

SPEC = DocumentSpec(
    key="partnership-agreement",
    catalog_names=("Partnership Agreement",),
    catalog_filenames=("Partnership-Agreement.md",),
    catalog_description=(
        "Standard terms for a business partnership between two companies, including "
        "cooperation obligations, trademark licensing, and fee arrangements."
    ),
    topics=(
        "Parties",
        "Partnership terms",
        "Payment",
        "Liability and warranties",
        "Governing law and jurisdiction",
    ),
    party_role_labels={"company": "Company", "partner": "Partner"},
    fields=(
        *_PARTY_FIELDS,
        FieldSpec(
            key="obligations",
            label="Obligations",
            topic="Partnership terms",
            order=0,
            description=(
                "each party's obligations under the partnership, e.g. joint marketing "
                "activities, co-selling, or product integration work"
            ),
        ),
        FieldSpec(
            key="territory",
            label="Territory",
            topic="Partnership terms",
            order=1,
            description=(
                "the geographic territory where the Trademark License applies, "
                "e.g. 'the United States' or 'worldwide'"
            ),
        ),
        FieldSpec(
            key="effectiveDate",
            label="Effective Date",
            topic="Partnership terms",
            type="date",
            order=2,
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the partnership starts - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="endDate",
            label="End Date",
            topic="Partnership terms",
            type="date",
            order=3,
            description="the date the partnership term ends, unless earlier terminated",
        ),
        FieldSpec(
            key="brandGuidelines",
            label="Brand Guidelines",
            topic="Partnership terms",
            order=4,
            required=False,
            default="None.",
            description=(
                "a reference to any brand guidelines a party must follow when using the "
                "other party's Brand Elements under the Trademark License"
            ),
        ),
        FieldSpec(
            key="dpaReference",
            label="Data Processing Agreement",
            topic="Partnership terms",
            order=5,
            required=False,
            default="No Data Processing Agreement is in place.",
            description="whether the parties have a Data Processing Agreement governing Personal Data, and which one",
        ),
        FieldSpec(
            key="paymentProcess",
            label="Payment Process",
            topic="Payment",
            order=0,
            description=(
                "how and when the party receiving payment will bill or invoice the other "
                "party for Fees, e.g. invoiced net 30"
            ),
        ),
        FieldSpec(
            key="paymentSchedule",
            label="Payment Schedule",
            topic="Payment",
            order=1,
            description="how and when the paying party will pay Fees, e.g. within 30 days of invoice",
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
