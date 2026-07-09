from app.chat.field_spec import DocumentSpec, FieldSpec, party_fields

_PARTY_FIELDS = party_fields("provider", "customer", topic="Parties")

SPEC = DocumentSpec(
    key="sla",
    catalog_names=("Service Level Agreement",),
    catalog_filenames=("SLA.md",),
    catalog_description=(
        "Standard terms defining uptime and support response time commitments, and the "
        "service credits owed if those targets are not met, designed to be used alongside "
        "the Cloud Service Agreement."
    ),
    topics=(
        "Parties",
        "Uptime and support commitments",
        "Service credits",
    ),
    party_role_labels={"provider": "Provider", "customer": "Customer"},
    fields=(
        FieldSpec(
            key="targetUptime",
            label="Target Uptime",
            topic="Uptime and support commitments",
            order=0,
            description="the minimum percentage of time the Cloud Service must be available each calendar month, e.g. '99.9%'",
        ),
        FieldSpec(
            key="targetResponseTime",
            label="Target Response Time",
            topic="Uptime and support commitments",
            order=1,
            description="the maximum time Provider commits to acknowledge a support request, e.g. '24 hours'",
        ),
        FieldSpec(
            key="supportChannel",
            label="Support Channel",
            topic="Uptime and support commitments",
            order=2,
            description="how Customer should submit support requests, e.g. an email address or support portal URL",
        ),
        FieldSpec(
            key="scheduledDowntime",
            label="Scheduled Downtime",
            topic="Uptime and support commitments",
            order=3,
            required=False,
            default="None",
            description="any recurring maintenance windows excluded from uptime calculations - state the default of 'None' and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="subscriptionPeriod",
            label="Subscription Period",
            topic="Uptime and support commitments",
            order=4,
            required=False,
            default="12 months",
            description="the length of the subscription term the Cloud Service Fees and credits are measured against - state the default and ask the user to confirm or change it",
        ),
        FieldSpec(
            key="uptimeCredit",
            label="Uptime Credit",
            topic="Service credits",
            order=0,
            description="the service credit Customer receives if the Target Uptime is missed, e.g. '5% of monthly Fees'",
        ),
        FieldSpec(
            key="responseTimeCredit",
            label="Response Time Credit",
            topic="Service credits",
            order=1,
            description="the service credit Customer receives if the Target Response Time is missed, e.g. '2% of monthly Fees'",
        ),
        *_PARTY_FIELDS,
    ),
)
