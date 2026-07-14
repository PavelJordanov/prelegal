from datetime import date

from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

# BAA.md's prose says a material breach of the BAA is deemed a material
# breach of a parent "Agreement" (i.e. it supplements an already-existing
# commercial agreement between the parties). Unlike DPA.md, though, HIPAA
# BAAs are typically independently executed documents in their own right
# (they refer to a signed Cover Page identifying the parties), so - unlike
# the DPA rider, which only captures company names - this spec uses a full
# signature-block party group for each role. There is no cross-document
# linking in this system yet, so the parent "Agreement" is rendered in the
# frontend content module as generic prose rather than as a fillable field.
_PARTY_FIELDS = party_fields("provider", "company", topic="Parties", company_key="companyName")

SPEC = DocumentSpec(
    key="baa",
    catalog_names=("Business Associate Agreement",),
    catalog_filenames=("BAA.md",),
    catalog_description=(
        "Standard HIPAA-compliant terms governing a business associate's use and protection of "
        "protected health information (PHI) on behalf of a covered entity."
    ),
    topics=(
        "Parties",
        "BAA terms",
    ),
    party_role_labels={"provider": "Provider", "company": "Company"},
    fields=(
        *_PARTY_FIELDS,
        FieldSpec(
            key="limitations",
            label="Limitations",
            topic="BAA terms",
            order=0,
            description=(
                "any limitations Company places on Provider's ability to offshore PHI outside the "
                "United States, de-identify PHI, aggregate PHI, or disclose PHI to Subcontractors - "
                "state 'None' if Company does not want to impose any limitations"
            ),
        ),
        FieldSpec(
            key="breachNotificationPeriod",
            label="Breach Notification Period",
            topic="BAA terms",
            order=1,
            description=(
                "how quickly Provider must report to Company an impermissible use or disclosure of "
                "PHI or a Security Incident after becoming aware of it, e.g. '5 business days'"
            ),
        ),
        FieldSpec(
            key="baaEffectiveDate",
            label="BAA Effective Date",
            topic="BAA terms",
            type="date",
            order=2,
            required=False,
            default_factory=lambda: date.today().isoformat(),
            description="the date the BAA starts - state the default and ask the user to confirm or change it",
        ),
    ),
)
