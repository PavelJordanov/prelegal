from app.chat.field_spec import DocumentSpec, FieldSpec

SPEC = DocumentSpec(
    key="dpa",
    catalog_names=("Data Processing Agreement",),
    catalog_filenames=("DPA.md",),
    catalog_description=(
        "Standard terms governing the processing of personal data between a controller and "
        "processor (or processor and subprocessor), including international data transfer "
        "mechanisms and security incident response."
    ),
    topics=(
        "Parties and parent agreement",
        "Data processing details",
        "Security",
    ),
    fields=(
        # This DPA is a rider that supplements an already-existing, already-signed
        # commercial agreement (e.g. a CSA or PSA) - there is no independent
        # signature block here, just company identification for the two roles
        # ("Customer" and "Provider") the Standard Terms refer to throughout.
        FieldSpec(
            key="customerCompany",
            label="Customer",
            topic="Parties and parent agreement",
            order=0,
            description="the legal name of the Customer company (the party disclosing personal data)",
        ),
        FieldSpec(
            key="providerCompany",
            label="Provider",
            topic="Parties and parent agreement",
            order=1,
            description="the legal name of the Provider company (the party processing personal data on Customer's behalf)",
        ),
        FieldSpec(
            key="parentAgreementReference",
            label="Agreement",
            topic="Parties and parent agreement",
            order=2,
            description=(
                "the name/reference of the existing signed agreement this DPA supplements, "
                "e.g. 'the Cloud Service Agreement between the parties dated January 1, 2026'"
            ),
        ),
        FieldSpec(
            key="categoriesOfPersonalData",
            label="Categories of Personal Data",
            topic="Data processing details",
            order=0,
            description="the kinds of personal data Provider will process on Customer's behalf, e.g. 'names, email addresses, and IP addresses'",
        ),
        FieldSpec(
            key="categoriesOfDataSubjects",
            label="Categories of Data Subjects",
            topic="Data processing details",
            order=1,
            description="the individuals the personal data relates to, e.g. 'Customer's employees and end users'",
        ),
        FieldSpec(
            key="governingMemberState",
            label="Governing Member State",
            topic="Data processing details",
            order=2,
            description=(
                "the EEA member state whose law governs the EEA Standard Contractual Clauses and "
                "resolves disputes under them if Customer Personal Data is transferred outside the EEA"
            ),
        ),
        FieldSpec(
            key="securityPolicyReference",
            label="Security Policy",
            topic="Security",
            order=0,
            description="the name or location of Provider's security policy/standard that its independent audit Report is measured against, e.g. 'Provider's SOC 2 Security Policy, available on request'",
        ),
        FieldSpec(
            key="providerSecurityContact",
            label="Provider Security Contact",
            topic="Security",
            order=1,
            description="an email address Customer can use to send security due-diligence and audit questionnaire requests to Provider",
        ),
    ),
)
