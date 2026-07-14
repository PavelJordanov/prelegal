from app.chat.specs import (
    ai_addendum,
    baa,
    csa,
    design_partner_agreement,
    dpa,
    mutual_nda,
    partnership_agreement,
    pilot_agreement,
    psa,
    sla,
    software_license_agreement,
)

ALL_SPECS = (
    mutual_nda.SPEC,
    csa.SPEC,
    sla.SPEC,
    psa.SPEC,
    dpa.SPEC,
    software_license_agreement.SPEC,
    partnership_agreement.SPEC,
    pilot_agreement.SPEC,
    design_partner_agreement.SPEC,
    baa.SPEC,
    ai_addendum.SPEC,
)
