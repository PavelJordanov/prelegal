from app.chat.field_spec import DocumentSpec, FieldSpec

SPEC = DocumentSpec(
    key="ai-addendum",
    catalog_names=("AI Addendum",),
    catalog_filenames=("AI-Addendum.md",),
    catalog_description=(
        "Standard terms supplementing an existing agreement to govern the use of AI or machine "
        "learning features, including input/output ownership, model training restrictions, and "
        "AI-specific disclaimers."
    ),
    topics=(
        "Parties",
        "AI training terms",
    ),
    fields=(
        # This AI Addendum is a rider that supplements an already-existing, already-signed
        # commercial agreement (e.g. a CSA or Software License Agreement) - the template says
        # the AI Services are "part of the Product and subject to the Agreement as supplemented
        # by this AI Addendum". There is no independent signature block here, just company
        # identification for the two roles ("Customer" and "Provider") the Standard Terms refer
        # to throughout, plus a reference to the agreement being supplemented.
        FieldSpec(
            key="customerCompany",
            label="Customer",
            topic="Parties",
            order=0,
            description="the legal name of the Customer company (the party using the AI Services)",
        ),
        FieldSpec(
            key="providerCompany",
            label="Provider",
            topic="Parties",
            order=1,
            description="the legal name of the Provider company (the party providing the AI Services)",
        ),
        FieldSpec(
            key="parentAgreementReference",
            label="Agreement",
            topic="Parties",
            order=2,
            description=(
                "the name/reference of the existing signed agreement this AI Addendum supplements, "
                "e.g. 'the Cloud Service Agreement between the parties dated January 1, 2026'"
            ),
        ),
        # Per the template's Section 1.3 (Model Training), Provider may NOT use Customer's
        # Input/Output to train any Model unless the Cover Page identifies Training Data and
        # Training Purposes. That "no training unless affirmatively opted in" behavior is a
        # safe, meaningful default, so these four fields are optional and default to blank -
        # a blank Training Data/Training Purposes means training is prohibited, which mirrors
        # the template's own default-deny logic rather than inventing a fallback value.
        FieldSpec(
            key="trainingData",
            label="Training Data",
            topic="AI training terms",
            order=0,
            required=False,
            default="",
            description=(
                "the specific Input/Output data Provider may use to train Models, if any - ask the "
                "user whether they want to permit any model training at all; leaving this blank means "
                "Provider is not permitted to train Models on Customer's Input/Output, which is the "
                "template's default"
            ),
        ),
        FieldSpec(
            key="trainingPurposes",
            label="Training Purposes",
            topic="AI training terms",
            order=1,
            required=False,
            default="",
            description=(
                "the purposes for which Provider may use Training Data to train Models, required for "
                "training to be permitted at all - leave blank if no training is permitted"
            ),
        ),
        FieldSpec(
            key="trainingRestrictions",
            label="Training Restrictions",
            topic="AI training terms",
            order=2,
            required=False,
            default="",
            description=(
                "any restrictions on how Provider may use Training Data for the Training Purposes, "
                "e.g. de-identification requirements - leave blank if there are none beyond the "
                "Training Purposes themselves"
            ),
        ),
        FieldSpec(
            key="improvementRestrictions",
            label="Improvement Restrictions",
            topic="AI training terms",
            order=3,
            required=False,
            default="",
            description=(
                "any restrictions on Provider's use of Input, Output, and Training Data to provide, "
                "maintain, develop, and improve the AI System outside of Training - leave blank if "
                "there are none"
            ),
        ),
    ),
)
