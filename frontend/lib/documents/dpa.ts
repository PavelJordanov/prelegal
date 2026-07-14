import type { DocumentContent, DocumentSection, FieldSummaryItem } from "@/lib/documents/types";
import { asString } from "@/lib/documents/hydrate-utils";

export interface DpaFields {
  customerCompany: string;
  providerCompany: string;
  parentAgreementReference: string;
  categoriesOfPersonalData: string;
  categoriesOfDataSubjects: string;
  governingMemberState: string;
  securityPolicyReference: string;
  providerSecurityContact: string;
}

const defaultFields: DpaFields = {
  customerCompany: "",
  providerCompany: "",
  parentAgreementReference: "",
  categoriesOfPersonalData: "",
  categoriesOfDataSubjects: "",
  governingMemberState: "",
  securityPolicyReference: "",
  providerSecurityContact: "",
};

const customerCompanyFallback = "[Customer company name]";
const providerCompanyFallback = "[Provider company name]";
const parentAgreementFallback = "[Name/date of the agreement this DPA supplements]";
const categoriesOfPersonalDataFallback = "[Categories of Personal Data not specified]";
const categoriesOfDataSubjectsFallback = "[Categories of Data Subjects not specified]";
const governingMemberStateFallback = "[Fill in EEA member state]";
const securityPolicyReferenceFallback = "[Security Policy reference not specified]";
const providerSecurityContactFallback = "[Provider security contact not specified]";

function summarySections(data: DpaFields): FieldSummaryItem[] {
  return [
    { label: "Customer", value: data.customerCompany || customerCompanyFallback },
    { label: "Provider", value: data.providerCompany || providerCompanyFallback },
    { label: "Agreement", value: data.parentAgreementReference || parentAgreementFallback },
    { label: "Categories of Personal Data", value: data.categoriesOfPersonalData || categoriesOfPersonalDataFallback },
    { label: "Categories of Data Subjects", value: data.categoriesOfDataSubjects || categoriesOfDataSubjectsFallback },
    { label: "Governing Member State", value: data.governingMemberState || governingMemberStateFallback },
    { label: "Security Policy", value: data.securityPolicyReference || securityPolicyReferenceFallback },
    { label: "Provider Security Contact", value: data.providerSecurityContact || providerSecurityContactFallback },
  ];
}

// DPA.md is a rider that supplements an already-signed parent agreement (e.g.
// a CSA or PSA) - there is no independent signature block here, just the
// Customer/Provider company names captured above in summarySections(). No
// PartyBlock is warranted, so parties() returns an empty array.

// Standard Terms prose, transcribed from templates/DPA.md with the Cover
// Page variables substituted directly (no {{placeholder}} tokens). Extremely
// dense boilerplate GDPR/SCC subsections are summarized rather than
// reproduced verbatim, while the substantive obligations and variable
// substitutions are preserved.
function bodySections(data: DpaFields): DocumentSection[] {
  const customer = data.customerCompany || customerCompanyFallback;
  const provider = data.providerCompany || providerCompanyFallback;
  const agreement = data.parentAgreementReference || parentAgreementFallback;
  const categoriesOfPersonalData = data.categoriesOfPersonalData || categoriesOfPersonalDataFallback;
  const categoriesOfDataSubjects = data.categoriesOfDataSubjects || categoriesOfDataSubjectsFallback;
  const governingMemberState = data.governingMemberState || governingMemberStateFallback;
  const securityPolicy = data.securityPolicyReference || securityPolicyReferenceFallback;
  const securityContact = data.providerSecurityContact || providerSecurityContactFallback;

  return [
    {
      title: "1. Processor and Subprocessor Relationships",
      body: `1.1 Provider as Processor. In situations where ${customer} is a Controller of the Customer Personal Data, ${provider} will be deemed a Processor that is Processing Personal Data on behalf of ${customer}. 1.2 Provider as Subprocessor. In situations where ${customer} is a Processor of the Customer Personal Data, ${provider} will be deemed a Subprocessor of the Customer Personal Data.`,
    },
    {
      title: "2. Processing",
      body: `2.1 Processing Details. The Cover Page describes the subject matter, nature, purpose, and duration of this Processing, as well as the Categories of Personal Data collected (${categoriesOfPersonalData}) and the Categories of Data Subjects (${categoriesOfDataSubjects}). 2.2 Processing Instructions. ${customer} instructs ${provider} to Process Customer Personal Data: (a) to provide and maintain the Service; (b) as may be further specified through ${customer}'s use of the Service; (c) as documented in ${agreement}; and (d) as documented in any other written instructions given by ${customer} and acknowledged by ${provider} about Processing Customer Personal Data under this DPA. ${provider} will abide by these instructions unless prohibited from doing so by Applicable Laws, and will immediately inform ${customer} if it is unable to follow them. ${customer} has given and will only give instructions that comply with Applicable Laws. 2.3 Processing by Provider. ${provider} will only Process Customer Personal Data in accordance with this DPA, including the details in the Cover Page. If ${provider} updates the Service, ${provider} may change the Categories of Data Subjects, Categories of Personal Data, Special Category Data, Special Category Data Restrictions or Safeguards, Frequency of Transfer, Nature and Purpose of Processing, and Duration of Processing as needed to reflect the updates, by notifying ${customer}. 2.4 Customer Processing. Where ${customer} is a Processor and ${provider} is a Subprocessor, ${customer} will comply with all Applicable Laws that apply to ${customer}'s Processing of Customer Personal Data, including the Subprocessor requirements in ${customer}'s agreement with its Controller. 2.5 Consent to Processing. ${customer} has complied with and will continue to comply with all Applicable Data Protection Laws concerning its provision of Customer Personal Data to ${provider} and/or the Service, including making all disclosures, obtaining all consents, providing adequate choice, and implementing relevant safeguards required under Applicable Data Protection Laws. 2.6 Subprocessors. ${provider} will not provide, transfer, or hand over any Customer Personal Data to a Subprocessor unless ${customer} has approved the Subprocessor. ${provider} will inform ${customer} at least 10 business days in advance and in writing of any intended changes to the Approved Subprocessors, and ${customer} has 30 days after notice to object, after which the parties will cooperate in good faith to resolve the objection. When engaging a Subprocessor, ${provider} will have a written agreement with the Subprocessor imposing data protection obligations at least as protective as this DPA and consistent with ${agreement}, and, if the GDPR applies, will share a copy of that agreement with ${customer} on request (subject to redaction of business secrets). ${provider} remains fully liable for all obligations it subcontracts to its Subprocessors.`,
    },
    {
      title: "3. Restricted Transfers",
      body: `3.1 Authorization. ${customer} agrees that ${provider} may transfer Customer Personal Data outside the EEA, the United Kingdom, or other relevant territory as necessary to provide the Service, implementing appropriate safeguards consistent with Applicable Data Protection Laws where no adequacy decision applies. 3.2 Ex-EEA Transfers. If the GDPR protects a transfer of Customer Personal Data from ${customer} within the EEA to ${provider} outside the EEA that is not covered by an adequacy decision, the parties are deemed to have signed the EEA Standard Contractual Clauses ("EEA SCCs") annexed to European Commission Implementing Decision 2021/914, incorporated by reference and completed so that: Module Two (Controller to Processor) applies when ${customer} is a Controller, and Module Three (Processor to Sub-Processor) applies when ${customer} is a Processor; the optional docking clause in Clause 7 does not apply; Clause 9 Option 2 (general written authorization) applies with 10 business days' notice of Subprocessor changes; the optional language in Clause 11 does not apply; all square brackets in Clause 13 are removed; and under Clause 17 (Option 1) and Clause 18(b) the EEA SCCs are governed by, and disputes are resolved in the courts of, ${governingMemberState}. The Cover Page contains the information required in Annex I, II, and III of the EEA SCCs. 3.3 Ex-UK Transfers. If the UK GDPR protects a transfer of Customer Personal Data from ${customer} within the United Kingdom to ${provider} outside the United Kingdom that is not covered by a UK adequacy decision, the parties are deemed to have signed the UK Addendum to the EEA SCCs issued by the Information Commissioner, incorporated by reference, with neither party able to end the UK Addendum under its Section 19 and the parties agreeing to work in good faith to revise this DPA if the ICO issues a revised Approved Addendum. The Cover Page contains the information required by Annex 1A, 1B, II, and III of the UK Addendum. 3.4 Other International Transfers. For transfers to which Swiss law applies (rather than EEA or UK law), references to the GDPR in Clause 4 of the EEA SCCs are read to include the Swiss Federal Data Protection Act, and the Swiss Federal Data Protection and Information Commissioner is included among the relevant supervisory authorities.`,
    },
    {
      title: "4. Security Incident Response",
      body: `Upon becoming aware of any Security Incident, ${provider} will: (a) notify ${customer} without undue delay when feasible, but no later than 72 hours after becoming aware; (b) provide timely information about the Security Incident as it becomes known or as reasonably requested by ${customer}; and (c) promptly take reasonable steps to contain and investigate the Security Incident. ${provider}'s notification of or response to a Security Incident will not be construed as an acknowledgment of fault or liability.`,
    },
    {
      title: "5. Audit & Reports",
      body: `5.1 Audit Rights. ${provider} will give ${customer} the information reasonably necessary to demonstrate compliance with this DPA and will allow for and contribute to audits and inspections by ${customer}, subject to restricting access where it would negatively impact ${provider}'s intellectual property, confidentiality, or other legal obligations. ${customer} will exercise its audit rights only by instructing ${provider} to comply with the reporting and due diligence requirements below. ${provider} will maintain records of its compliance with this DPA for 3 years after the DPA ends. 5.2 Security Reports. ${customer} acknowledges that ${provider} is regularly audited against the standards defined in ${securityPolicy} by independent third-party auditors. Upon written request, ${provider} will give ${customer}, on a confidential basis, a summary copy of its then-current audit Report so ${customer} can verify ${provider}'s compliance with ${securityPolicy}. 5.3 Security Due Diligence. In addition to the Report, ${provider} will respond, no more than once a year, to reasonable written requests for information sent to ${securityContact} to confirm ${provider}'s compliance with this DPA, including security, due diligence, and audit questionnaires.`,
    },
    {
      title: "6. Coordination & Cooperation",
      body: `6.1 Response to Inquiries. If ${provider} receives any inquiry or request from anyone else about the Processing of Customer Personal Data (such as a judicial, administrative, or regulatory order, or a data subject request), ${provider} will notify ${customer} and will not respond without ${customer}'s prior consent unless prohibited by Applicable Law, and will follow ${customer}'s reasonable instructions about the request, including assisting with valid data subject deletion or opt-out requests. ${provider} will cooperate with and provide reasonable assistance to ${customer}, at ${customer}'s expense, in any related legal or procedural action. 6.2 DPIAs and DTIAs. If required by Applicable Data Protection Laws, ${provider} will reasonably assist ${customer} in conducting data protection impact assessments or data transfer impact assessments and consultations with relevant data protection authorities.`,
    },
    {
      title: "7. Deletion of Customer Personal Data",
      body: `7.1 Deletion by Customer. ${provider} will enable ${customer} to delete Customer Personal Data consistent with the functionality of the Services, and will comply with such deletion instructions as soon as reasonably practicable except where further storage is required by Applicable Law. 7.2 Deletion at DPA Expiration. After the DPA expires, ${provider} will return or delete Customer Personal Data at ${customer}'s instruction unless further storage is required or authorized by Applicable Law; if return or destruction is impracticable or prohibited, ${provider} will make reasonable efforts to prevent further Processing and continue to protect the remaining data. If the parties have entered the EEA SCCs or the UK Addendum as part of this DPA, ${provider} will give ${customer} the certification of deletion described in Clause 8.1(d) and Clause 8.5 of the EEA SCCs only if ${customer} asks for one.`,
    },
    {
      title: "8. Limitation of Liability",
      body: `8.1 Liability Caps and Damages Waiver. To the maximum extent permitted under Applicable Data Protection Laws, each party's total cumulative liability to the other party arising out of or related to this DPA will be subject to the waivers, exclusions, and limitations of liability stated in ${agreement}. 8.2 Related-Party Claims. Any claims made against ${provider} or its Affiliates arising out of or related to this DPA may only be brought by the ${customer} entity that is a party to ${agreement}. 8.3 Exceptions. This DPA does not limit any liability to an individual about the individual's data protection rights under Applicable Data Protection Laws, nor any liability between the parties for violations of the EEA SCCs or UK Addendum.`,
    },
    {
      title: "9. Conflicts Between Documents",
      body: `This DPA forms part of and supplements ${agreement}. If there is any inconsistency between this DPA, ${agreement}, or any of their parts, the part listed earlier controls over the part listed later: (1) the EEA SCCs or the UK Addendum, (2) this DPA, and then (3) ${agreement}.`,
    },
    {
      title: "10. Term of Agreement",
      body: `This DPA starts when ${provider} and ${customer} agree to a Cover Page for the DPA and sign or electronically accept ${agreement}, and continues until ${agreement} expires or is terminated. ${provider} and ${customer} will each remain subject to the obligations in this DPA and Applicable Data Protection Laws until ${customer} stops transferring Customer Personal Data to ${provider} and ${provider} stops Processing Customer Personal Data.`,
    },
    {
      title: "11. Definitions",
      body: `"Applicable Laws" means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that apply to or govern a party. "Applicable Data Protection Laws" means the Applicable Laws that govern how the Service may process or use an individual's personal information. "Controller" and "Processor" have the meaning(s) given in Applicable Data Protection Laws. "Cover Page" means the document signed or electronically accepted by the parties that incorporates these Standard Terms and identifies ${provider}, ${customer}, and the subject matter and details of the data processing. "Customer Personal Data" means Personal Data that ${customer} uploads or provides to ${provider} as part of the Service and that is governed by this DPA. "DPA" means these Standard Terms, the Cover Page between ${provider} and ${customer}, and the policies and documents referenced in or attached to the Cover Page. "EEA SCCs" means the standard contractual clauses annexed to European Commission Implementing Decision 2021/914 of 4 June 2021. "European Economic Area" or "EEA" means the member states of the European Union, Norway, Iceland, and Liechtenstein. "GDPR" means European Union Regulation 2016/679 as implemented by local law in the relevant EEA member nation. "Personal Data", "Processing"/"Process", and "Subprocessor" have the meaning(s) given in Applicable Data Protection Laws. "Report" means audit reports prepared according to the standards defined in ${securityPolicy} on behalf of ${provider}. "Restricted Transfer" means a transfer of personal data from the EEA (or, under the UK GDPR, the United Kingdom) to a country not covered by an applicable adequacy decision. "Security Incident" means a Personal Data Breach as defined in Article 4 of the GDPR. "Service" means the product and/or services described in ${agreement}. "Special Category Data" has the meaning given in Article 9 of the GDPR. "UK GDPR" means European Union Regulation 2016/679 as implemented by section 3 of the United Kingdom's European Union (Withdrawal) Act of 2018. "UK Addendum" means the international data transfer addendum to the EEA SCCs issued by the Information Commissioner for parties making Restricted Transfers under S119A(1) of the Data Protection Act 2018.`,
    },
  ];
}

const content: DocumentContent<DpaFields> = {
  documentType: "dpa",
  title: "Data Processing Agreement",
  pdfFilename: "Data-Processing-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    customerCompany: asString(raw.customerCompany, defaultFields.customerCompany),
    providerCompany: asString(raw.providerCompany, defaultFields.providerCompany),
    parentAgreementReference: asString(raw.parentAgreementReference, defaultFields.parentAgreementReference),
    categoriesOfPersonalData: asString(raw.categoriesOfPersonalData, defaultFields.categoriesOfPersonalData),
    categoriesOfDataSubjects: asString(raw.categoriesOfDataSubjects, defaultFields.categoriesOfDataSubjects),
    governingMemberState: asString(raw.governingMemberState, defaultFields.governingMemberState),
    securityPolicyReference: asString(raw.securityPolicyReference, defaultFields.securityPolicyReference),
    providerSecurityContact: asString(raw.providerSecurityContact, defaultFields.providerSecurityContact),
  }),
  summarySections,
  parties: () => [],
  bodySections,
};

export default content;
