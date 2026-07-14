import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  COMPANY_NAME_PARTY_FIELD_CONFIG,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export interface BaaFields {
  provider: PartyDetails;
  company: PartyDetails;
  limitations: string;
  breachNotificationPeriod: string;
  baaEffectiveDate: string;
}

// The "companyName" sub-key (rather than "company") avoids colliding with
// the "company" party role itself, matching the convention partnership-
// agreement.ts uses for its "company"/"partner" roles.
const emptyParty: PartyDetails = { name: "", title: "", companyName: "", noticeAddress: "" };

const baaEffectiveDateFallback = "[Fill in BAA Effective Date]";

const defaultFields: BaaFields = {
  provider: { ...emptyParty },
  company: { ...emptyParty },
  limitations: "",
  breachNotificationPeriod: "",
  baaEffectiveDate: todayAsLocalIsoDate(),
};

const limitationsFallback = "[Fill in Limitations]";
const breachNotificationPeriodFallback = "[Fill in Breach Notification Period]";

function summarySections(data: BaaFields): FieldSummaryItem[] {
  return [
    { label: "Limitations", value: data.limitations || limitationsFallback },
    { label: "Breach Notification Period", value: data.breachNotificationPeriod || breachNotificationPeriodFallback },
    { label: "BAA Effective Date", value: formatDisplayDate(data.baaEffectiveDate, baaEffectiveDateFallback) },
  ];
}

function parties(data: BaaFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: COMPANY_NAME_PARTY_FIELD_CONFIG },
    { label: "Company", data: data.company, fieldConfig: COMPANY_NAME_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/BAA.md with the
// genuinely fillable Variables substituted directly (no {{placeholder}}
// tokens). "Provider" and "Company" are left as literal role names in the
// body text, matching how mutual-nda.ts leaves "Disclosing Party" /
// "Receiving Party" literal and csa.ts leaves "Provider" / "Customer"
// literal - only Limitations, Breach Notification Period, and BAA Effective
// Date are substituted with the current field values or a bracketed
// fallback when empty. "Agreement" (the parent agreement this BAA
// supplements) is also left as literal prose - there is no cross-document
// linking in this system yet, so it is not modeled as a field. Nested
// numbering (e.g. "1.1") is flattened into the section title.
function bodySections(data: BaaFields): DocumentSection[] {
  const limitations = data.limitations || limitationsFallback;
  const breachNotificationPeriod = data.breachNotificationPeriod || breachNotificationPeriodFallback;
  const baaEffectiveDateDisplay = formatDisplayDate(data.baaEffectiveDate, baaEffectiveDateFallback);

  return [
    {
      title: "1.1 Obligations and Restrictions",
      body: `Provider may not use or disclose PHI other than as described in this BAA, as permitted under the Privacy Rule, or as otherwise required by applicable law.`,
    },
    {
      title: "1.2 Permitted Uses and Disclosures",
      body: `Except as otherwise permitted or required in this BAA, Provider may only use or disclose PHI as reasonably necessary to provide the Services or as otherwise required by applicable law.`,
    },
    {
      title: "1.3 Privacy and Information Security Program",
      body: `Provider will maintain a privacy and information security program that takes steps to ensure that employees or agents of Provider comply with this BAA. This includes giving training to Provider's workforce to ensure compliance with this BAA, implementing policies and practices that meet the current standards for the protection of PHI, and appointing Privacy and Security Officials as required under HIPAA.`,
    },
    {
      title: "1.4 Safeguards",
      body: `Provider will implement appropriate administrative, physical, and technical safeguards to protect the confidentiality, integrity, and availability of PHI that it receives, creates, maintains, or transmits on behalf of Company. Provider will maintain appropriate technical and organizational safeguards to reduce the risk of misuse or disclosure of PHI except as permitted under this BAA. In addition, Provider will comply with its obligations under the Security Rule.`,
    },
    {
      title: "1.5 Assessments",
      body: `Provider agrees to conduct regular assessments of its compliance with its obligations under the Privacy Rule and Security Rule. Provider will make available a summary of such assessments to Company upon Company's reasonable request.`,
    },
    {
      title: "1.6 Mitigation of Risks",
      body: `Provider agrees to mitigate, to the extent practicable, any harmful effect that is known to Provider of a use or disclosure of PHI by Provider and to promptly communicate to Company any actions taken pursuant to this paragraph.`,
    },
    {
      title: "1.7 Subcontractors",
      body: `Except as restricted by applicable Limitations (${limitations}), (a) Provider may disclose PHI to a Subcontractor; and (b) may allow the Subcontractor to create, receive, maintain, or transmit PHI on its behalf. However, Provider must first ensure that each Subcontractor executes a binding, written agreement requiring the Subcontractor to protect PHI under terms substantially similar to and no less stringent than this BAA. Provider will not be in compliance with this BAA if Provider knew of a pattern of activity or practice of a Subcontractor that constituted a material breach or violation of the Subcontractor's obligations under any agreement between Provider and the Subcontractor. Provider will conduct appropriate due diligence on all Subcontractors.`,
    },
    {
      title: "1.8 Books and Records to HHS",
      body: `Upon request, Provider will make its books, records, and internal policies and procedures relating to the use and disclosure of PHI available to the Secretary of HHS for the purpose of determining Company's and Provider's compliance with HIPAA.`,
    },
    {
      title: "1.9 Audit of Books and Records",
      body: `Upon reasonable request, Provider will make its books, records, and internal policies and procedures relating to its compliance with this BAA available to Company. However, Provider is not required to provide any information or records that interfere with Provider's confidentiality or proprietary rights or that would otherwise impact Provider's compliance with its legal obligations.`,
    },
    {
      title: "1.10 Individual Requests",
      body: `Provider will take reasonable efforts to support Company in completing requests related to individuals' rights under HIPAA as related to the Services in a timely manner, but in no event will Provider's response take more than ten business days. Examples of individual rights under HIPAA include the right to access PHI pursuant to 45 CFR §164.524, amend PHI pursuant to 45 CFR §164.526, and receive accounting of disclosures pursuant to 45 CFR §164.528. If relevant to the Services, Provider will maintain an accounting of disclosures it makes on Company's behalf as required under 45 CFR §164.528(a). Except as directed by Company or required by law, Provider will not respond directly to any individual requests regarding their rights under HIPAA.`,
    },
    {
      title: "1.11 Compliance with Covered Entity's Obligations",
      body: `To the extent that Provider carries out Company's obligations under the Privacy Rule, Provider will comply with the requirements of the relevant Privacy Rule regulations that apply to Company in the performance of such obligations.`,
    },
    {
      title: "2.1 Notice of Privacy Practices",
      body: `Upon request, Company will provide Provider with its current notice of privacy practices adopted as required by the Privacy Rule. Company will notify Provider if any limitations in its notice of privacy practices impact Provider's use or disclosure of PHI under the BAA.`,
    },
    {
      title: "2.2 Notice of Changes",
      body: `Company will notify Provider in a timely manner of any changes to how Company uses or discloses PHI to the extent that the changes impact how Provider uses or discloses PHI under the BAA.`,
    },
    {
      title: "2.3 Notice of Restrictions",
      body: `Company will notify Provider in a timely manner of any restrictions agreed upon with an individual or their legal representative to the extent that the restrictions may impact Provider's use or disclosure of PHI under the BAA.`,
    },
    {
      title: "2.4 Compliance with Laws",
      body: `Company will only use and disclose PHI to Provider in accordance with its obligations under HIPAA and with applicable law.`,
    },
    {
      title: "3.1 Offshoring PHI",
      body: `Except as restricted by applicable Limitations (${limitations}), Provider is permitted to use and disclose PHI outside of the United States to provide the Services.`,
    },
    {
      title: "3.2 De-Identification",
      body: `Except as restricted by applicable Limitations (${limitations}), Provider may de-identify PHI.`,
    },
    {
      title: "3.3 Aggregation",
      body: `Except as restricted by applicable Limitations (${limitations}), Provider may aggregate PHI for its own purposes.`,
    },
    {
      title: "4.1 Breach Reporting",
      body: `Provider will report to Company within the Breach Notification Period (${breachNotificationPeriod}) each use or disclosure of PHI not permitted under this BAA of which Provider becomes aware, including breaches of unsecured PHI as required by §164.410 of HIPAA and any Security Incident involving PHI. In addition, each party will comply with its notification obligations under HIPAA regarding a Security Incident involving PHI.`,
    },
    {
      title: "4.2 Unsuccessful Attempts",
      body: `Company agrees that this section will be deemed as sufficient notice under Section 4.1 if Provider periodically receives unsuccessful attempts for unauthorized access to, use of, or disclosure of PHI, or for general interference with the general operation of Provider's products and services.`,
    },
    {
      title: "4.3 Security Incident Reimbursement",
      body: `Provider will reimburse Company for costs reasonably associated with a Security Incident caused by Provider or one of its Subcontractors.`,
    },
    {
      title: "4.4 Confidentiality",
      body: `Provider will not disclose information related to a Security Incident except as required by applicable law.`,
    },
    {
      title: "5.1 Term",
      body: `This BAA will start on the BAA Effective Date (${baaEffectiveDateDisplay}) and will continue in effect until the later of when all obligations of the parties have been met under this BAA or when the Agreement ends or expires.`,
    },
    {
      title: "5.2 Termination",
      body: `Either party may terminate this BAA if the other party fails to cure a material breach of the BAA within 30 days after receiving notice of the breach. A material breach of the BAA will be deemed a material breach of the Agreement.`,
    },
    {
      title: "5.3 Effect of Termination",
      body: `a. Upon any expiration or termination of this BAA, or earlier if directed by Company, Provider will either return or destroy, at Company's discretion and according to Company's instructions, all PHI maintained in any form by Provider, its agents, or its Subcontractors.\n\nb. Provider may not retain any copies of PHI unless directed to do so by Company. However, if neither return nor destruction are feasible, Provider may retain PHI as long as Provider continues to comply with all provisions of this BAA for the time it retains PHI and limits the use or disclosure of retained PHI to those purposes that made the return or destruction of PHI infeasible.`,
    },
    {
      title: "6. Definitions",
      body: `Variables have the meanings or descriptions given in this chat. However, if a Variable is omitted or not defined, the default meaning will be "none" or "not applicable" and the correlating clause, sentence, or section does not apply to the BAA.\n\n"BAA" means the agreement between Provider and Company that incorporates these BAA Standard Terms and any policies and documents referenced in or attached to it.\n\n"BAA Standard Terms" means these Common Paper BAA Standard Terms Version 1.0, which are posted at https://commonpaper.com/standards/business-associate-agreement/1.0.\n\n"Breach" has the meaning given to it under HIPAA.\n\n"Business Associate" has the meaning given to it under HIPAA.\n\n"Covered Entity" has the meaning given to it under HIPAA.\n\n"Cover Page" means a document that is signed by the parties, identifies Provider and Company, incorporates these BAA Standard Terms, and includes definitions or descriptions for Variables.\n\n"Designated Record Set" has the meaning given to it under HIPAA.\n\n"HHS" means the U.S. Department of Health and Human Services.\n\n"HIPAA" means the Health Insurance Portability and Accountability Act of 1996 and the rules and regulations thereunder, as amended from time to time.\n\n"Privacy and Security Officials" has the meaning given to it under HIPAA.\n\n"Privacy Rule" means the federal privacy regulations issued pursuant to HIPAA, codified at 45 CFR Parts 160 and 164 (Subparts A & E).\n\n"Protected Health Information" or "PHI" has the meaning given to it under HIPAA.\n\n"Security Incident" has the meaning given to it under HIPAA.\n\n"Security Rule" means the federal security regulations issued pursuant to HIPAA, codified at 45 CFR Parts 160 and 164 (Subparts A & C).\n\n"Services" means the products and services provided by Provider under the Agreement.\n\n"Subcontractor" means a third party to whom Provider provides PHI under this BAA.\n\n"Variable" means a word or phrase in the BAA Standard Terms that is highlighted and capitalized, such as Limitations.`,
    },
  ];
}

const content: DocumentContent<BaaFields> = {
  documentType: "baa",
  title: "Business Associate Agreement",
  pdfFilename: "Business-Associate-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    company: readGroup(raw, "company", defaultFields.company),
    limitations: asString(raw.limitations, defaultFields.limitations),
    breachNotificationPeriod: asString(raw.breachNotificationPeriod, defaultFields.breachNotificationPeriod),
    baaEffectiveDate: asString(raw.baaEffectiveDate, defaultFields.baaEffectiveDate),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
