import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  COMPANY_NAME_PARTY_FIELD_CONFIG,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export interface PartnershipAgreementFields {
  company: PartyDetails;
  partner: PartyDetails;
  obligations: string;
  territory: string;
  effectiveDate: string;
  endDate: string;
  brandGuidelines: string;
  dpaReference: string;
  paymentProcess: string;
  paymentSchedule: string;
  generalCapAmount: string;
  increasedCapAmount: string;
  additionalWarranties: string;
  governingLaw: string;
  chosenCourts: string;
}

const emptyParty: PartyDetails = { name: "", title: "", companyName: "", noticeAddress: "" };

const defaultFields: PartnershipAgreementFields = {
  company: { ...emptyParty },
  partner: { ...emptyParty },
  obligations: "",
  territory: "",
  effectiveDate: todayAsLocalIsoDate(),
  endDate: "",
  brandGuidelines: "None.",
  dpaReference: "No Data Processing Agreement is in place.",
  paymentProcess: "",
  paymentSchedule: "",
  generalCapAmount: "",
  increasedCapAmount: "",
  additionalWarranties: "None.",
  governingLaw: "",
  chosenCourts: "",
};

const obligationsFallback = "[Fill in Obligations]";
const territoryFallback = "[Fill in Territory]";
const effectiveDateFallback = "[Today's date]";
const endDateFallback = "[Fill in End Date]";
const brandGuidelinesFallback = "[Fill in Brand Guidelines]";
const dpaReferenceFallback = "[Fill in Data Processing Agreement]";
const paymentProcessFallback = "[Fill in Payment Process]";
const paymentScheduleFallback = "[Fill in Payment Schedule]";
const generalCapAmountFallback = "[Fill in General Cap Amount]";
const increasedCapAmountFallback = "[Fill in Increased Cap Amount]";
const additionalWarrantiesFallback = "[Fill in Additional Warranties]";
const governingLawFallback = "[Fill in state]";
const chosenCourtsFallback = "[Fill in Chosen Courts]";

function summarySections(data: PartnershipAgreementFields): FieldSummaryItem[] {
  return [
    { label: "Obligations", value: data.obligations || obligationsFallback },
    { label: "Territory", value: data.territory || territoryFallback },
    { label: "Effective Date", value: formatDisplayDate(data.effectiveDate, effectiveDateFallback) },
    { label: "End Date", value: formatDisplayDate(data.endDate, endDateFallback) },
    { label: "Payment Process", value: data.paymentProcess || paymentProcessFallback },
    { label: "Payment Schedule", value: data.paymentSchedule || paymentScheduleFallback },
    { label: "Brand Guidelines", value: data.brandGuidelines || brandGuidelinesFallback },
    { label: "Data Processing Agreement", value: data.dpaReference || dpaReferenceFallback },
    { label: "General Cap Amount", value: data.generalCapAmount || generalCapAmountFallback },
    { label: "Increased Cap Amount", value: data.increasedCapAmount || increasedCapAmountFallback },
    { label: "Additional Warranties", value: data.additionalWarranties || additionalWarrantiesFallback },
    { label: "Governing Law", value: data.governingLaw || governingLawFallback },
    { label: "Chosen Courts", value: data.chosenCourts || chosenCourtsFallback },
  ];
}

function parties(data: PartnershipAgreementFields): PartyBlock[] {
  return [
    { label: "Company", data: data.company, fieldConfig: COMPANY_NAME_PARTY_FIELD_CONFIG },
    { label: "Partner", data: data.partner, fieldConfig: COMPANY_NAME_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/Partnership-Agreement.md with
// the Cover Page variables substituted directly (no {{placeholder}} tokens - each
// document module is responsible for its own substitution so the shared renderer
// never needs to know about template syntax). Nested numbering (e.g. "2.1(a)") is
// flattened into the section title. "Company" and "Partner" are the Agreement's
// own defined party roles (mirroring the source template) and are not replaced
// with the parties' actual company names.
function bodySections(data: PartnershipAgreementFields): DocumentSection[] {
  const obligations = data.obligations || obligationsFallback;
  const territory = data.territory || territoryFallback;
  const effectiveDate = formatDisplayDate(data.effectiveDate, effectiveDateFallback);
  const endDate = formatDisplayDate(data.endDate, endDateFallback);
  const brandGuidelines = data.brandGuidelines || brandGuidelinesFallback;
  const dpaReference = data.dpaReference || dpaReferenceFallback;
  const paymentProcess = data.paymentProcess || paymentProcessFallback;
  const paymentSchedule = data.paymentSchedule || paymentScheduleFallback;
  const generalCapAmount = data.generalCapAmount || generalCapAmountFallback;
  const increasedCapAmount = data.increasedCapAmount || increasedCapAmountFallback;
  const additionalWarranties = data.additionalWarranties || additionalWarrantiesFallback;
  const governingLaw = data.governingLaw || governingLawFallback;
  const chosenCourts = data.chosenCourts || chosenCourtsFallback;

  return [
    {
      title: "1.1 Obligations",
      body: `Each party will perform its ${obligations} as detailed in the Cover Page.`,
    },
    {
      title: "1.2 Feedback",
      body: `Each party may, but is not required to, give Feedback to the other party. All Feedback is given "AS IS". The party receiving Feedback may use it freely without any restriction or obligation.`,
    },
    {
      title: "2.1(a) Fees and Billing",
      body: `If the ${obligations} include payment of Fees from one party to the other, the following terms apply: unless the Cover Page specifies a different currency, all Fees are in U.S. Dollars and are exclusive of taxes. Except for the prorated refund of prepaid Fees, Fees are non-refundable. The party receiving payment will bill or invoice the other party for Fees according to the following Payment Process: ${paymentProcess}.`,
    },
    {
      title: "2.1(b) Payment",
      body: `If the ${obligations} include payment of Fees from one party to the other, the paying party will pay the other party its applicable Fees and related taxes in U.S. Dollars, unless the Cover Page specifies a different currency, according to the following Payment Schedule: ${paymentSchedule}.`,
    },
    {
      title: "2.1(c) Taxes",
      body: `If the ${obligations} include payment of Fees from one party to the other, the paying party is responsible for all duties, taxes, and levies that apply to Fees, including sales, use, VAT, GST, or withholding. However, the paying party is not responsible for the other party's income taxes.`,
    },
    {
      title: "3.1 Trademark License",
      body: `Licensor grants to Licensee during the term of the Agreement a non-exclusive, non-transferrable, non-sublicensable, revocable, royalty-free, limited right and license in the ${territory} to use the Licensor's Brand Elements solely as necessary for Licensee to perform its ${obligations}, and only in accordance with the terms of the Agreement and any Brand Guidelines provided by Licensor: ${brandGuidelines}. "Licensor" and "Licensee" mean Company or Partner, as applicable, depending on which party is providing or receiving Brand Elements for marketing activities under this Agreement.`,
    },
    {
      title: "3.2 Reservation of Rights",
      body: `Licensee acknowledges that as between Licensee and Licensor, Licensor is the sole and exclusive owner of all right, title, and interest in and to the Brand Elements. Except for the limited license in Section 3.1 (Trademark License), neither party transfers any rights in any of its products, data, or any other intellectual property. All rights not expressly granted in this Agreement are retained by Licensor. All goodwill in the Brand Elements resulting from Licensee's use will inure to the benefit of Licensor.`,
    },
    {
      title: "3.3 Restrictions on Licensee",
      body: `Licensee will not (and will not allow anyone else to), except with Licensor's prior written permission: (a) alter or modify the Brand Elements or combine them with any other trademark, service mark, or logo; (b) use the Brand Elements in a way that implies endorsement or engagement beyond the scope of the Agreement except as required to fulfill the ${obligations} or to identify the parties' relationship under this Agreement; or (c) use the Brand Elements in any context that might harm Licensor's reputation or the goodwill associated with the Brand Elements or is inconsistent with Licensor's mission and values. In addition, each Licensee will promptly cease any use of the Licensor's Brand Elements upon written notice from Licensor.`,
    },
    {
      title: "3.4 Samples and Approvals",
      body: `Licensor has the right to inspect and approve all uses of the Brand Elements at any time. If requested by Licensor, Licensee will submit samples of its proposed uses of the Brand Elements to Licensor for prior written approval.`,
    },
    {
      title: "4. Privacy",
      body: `If the parties have a Data Processing Agreement (${dpaReference}), each party will comply with its obligations in the Data Processing Agreement, the terms of the Data Processing Agreement will control each party's rights and obligations as to Personal Data, and the terms of the Data Processing Agreement will control in the event of any conflict with this Agreement.`,
    },
    {
      title: "5. Escalation Procedure",
      body: `Each party agrees to give the other party written notice of specific issue(s) in dispute about the Agreement, including good faith disagreements about the amounts charged on a bill or invoice, prior to seeking any form of legal relief. Within 30 days after receipt of notice, at least one knowledgeable representative from each party will hold at least one meeting for the purpose of attempting in good faith to resolve the dispute. The parties agree to maintain the confidential nature of all disputes and disagreements between them as Confidential Information, including informal negotiations, mediation, or arbitration, except as may be necessary to prepare for or conduct these dispute resolution procedures or unless otherwise required by law or judicial decision.`,
    },
    {
      title: "6.1 Term",
      body: `This Agreement starts on the ${effectiveDate} and continues until ${endDate}, unless earlier terminated as provided below.`,
    },
    {
      title: "6.2 Termination",
      body: `Either party may terminate the Agreement immediately: (a) if the other party fails to cure a material breach of the Agreement upon 30 days notice; (b) if the other party fails to cure a breach of Section 3.3(c) upon 5 days notice; or (c) upon notice if the other party (i) materially breaches the Agreement in a manner that cannot be cured; (ii) dissolves or stops conducting business without a successor; (iii) makes an assignment for the benefit of creditors; or (iv) becomes the debtor in insolvency, receivership, or bankruptcy proceedings that continue for more than 60 days.`,
    },
    {
      title: "6.3 Force Majeure",
      body: `Either party may terminate the Agreement immediately on notice if a Force Majeure Event prevents either party from performing its ${obligations} for 30 or more consecutive days. However, this section does not excuse a party's obligations to pay Fees.`,
    },
    {
      title: "6.4 Effect of Termination",
      body: `Upon any expiration or termination: (a) all rights of Licensee under Section 3 (Trademark License) will immediately terminate and revert to Licensor, and Licensee will immediately cease all uses of Licensor's Brand Elements; (b) each Recipient will return or destroy Discloser's Confidential Information in its possession or control, however each Recipient may retain Discloser's Confidential Information in accordance with its standard backup or record retention policies maintained in the ordinary course of business or as required by Applicable Laws, in which case Section 4 (Privacy) and Section 11 (Confidentiality) will continue to apply to retained Confidential Information; and (c) if a party terminates the Agreement pursuant to Section 6.2, the party receiving payment will, as applicable, either (i) submit a final bill for all outstanding Fees accrued before termination, and the paying party will pay according to Section 2 (Payment & Taxes), or (ii) issue a refund for any unearned, prepaid Fees.`,
    },
    {
      title: "6.5 Survival",
      body: `The following sections will survive expiration or termination of the Agreement: Section 2 (Payment & Taxes) for fees accrued or payable before expiration or termination, Section 3.2 (Reservation of Rights), Section 3.3 (Restrictions on Licensee), Section 6.4 (Effect of Termination), Section 6.5 (Survival), Section 7 (Representations & Warranties), Section 8 (Disclaimer of Warranties), Section 9 (Limitation of Liability), Section 10 (Indemnification), Section 11 (Confidentiality), Section 12 (General Terms), Section 13 (Definitions), and the portions of the Cover Page referenced by these sections.`,
    },
    {
      title: "7. Representations & Warranties",
      body: `Each party represents and warrants to the other that: (a) it has the legal power and authority to enter into this Agreement and perform its ${obligations}; (b) it is duly organized, validly existing, and in good standing under the Applicable Laws of the jurisdiction of its origin; (c) it will comply with all Applicable Laws in performing its obligations or exercising its rights in this Agreement; (d) it has all necessary rights under its Applicable Laws to collect and share any Personal Data it may collect or share under this Agreement; (e) its Brand Elements do not and will not infringe the copyright, trademark, right of publicity, or other proprietary rights of any third party; and (f) it will comply with the following Additional Warranties: ${additionalWarranties}.`,
    },
    {
      title: "8. Disclaimer of Warranties",
      body: `Except for the warranties in Section 7 (Representations & Warranties), Company and Partner each disclaim all other warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and title. These disclaimers apply to the maximum extent permitted by Applicable Laws.`,
    },
    {
      title: "9.1 Liability Caps",
      body: `Except as provided in Section 9.3, each party's total cumulative liability for all claims arising out of or relating to this Agreement will not be more than the General Cap Amount: ${generalCapAmount}. If there are Increased Claims, each party's total cumulative liability for the Increased Claims arising out of or relating to this Agreement will not be more than the Increased Cap Amount: ${increasedCapAmount}.`,
    },
    {
      title: "9.2 Damages Waiver",
      body: `Except as provided in Section 9.3, under no circumstances will either party be liable to the other for lost profits or revenues, or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement, even if the party is informed of the possibility of this type of damage in advance.`,
    },
    {
      title: "9.3 Exceptions",
      body: `The liability cap in Section 9.1(a) does not apply to any Increased Claims. The liability caps in Section 9.1 do not apply to any Unlimited Claims. The damages waiver in Section 9.2 does not apply to any Increased Claims or a breach of Section 11 (Confidentiality). Nothing in this Agreement will limit a party's liability to the extent prohibited by Applicable Laws.`,
    },
    {
      title: "10.1 Protection by Company",
      body: `Company will indemnify, defend, and hold harmless Partner from and against all Company Covered Claims made by someone other than Partner or its Affiliates, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys' fees and other legal expenses, that arise from the Company Covered Claims.`,
    },
    {
      title: "10.2 Protection by Partner",
      body: `Partner will indemnify, defend, and hold harmless Company from and against all Partner Covered Claims made by someone other than Company or its Affiliates, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys' fees and other legal expenses, that arise from the Partner Covered Claims.`,
    },
    {
      title: "10.3 Procedure",
      body: `The Indemnifying Party's obligations in this section are contingent upon the Protected Party: (a) promptly notifying the Indemnifying Party of each Covered Claim for which it seeks protection; (b) providing reasonable assistance to the Indemnifying Party at the Indemnifying Party's expense; and (c) giving the Indemnifying Party sole control over the defense and settlement of each Covered Claim. A Protected Party may participate in a Covered Claim for which it seeks protection with its own attorneys only at its own expense. The Indemnifying Party may not agree to any settlement of a Covered Claim that contains an admission of fault or otherwise materially and adversely impacts the Protected Party without the prior written consent of the Protected Party.`,
    },
    {
      title: "10.4 Exclusive Remedy",
      body: `This Section 10 (Indemnification) describes each Protected Party's exclusive remedy and each Indemnifying Party's entire liability for a Covered Claim.`,
    },
    {
      title: "11.1 Non-Use and Non-Disclosure",
      body: `Unless otherwise authorized in the Agreement or except to fulfill its obligations or exercise its rights under this Agreement, Recipient will not (a) use Discloser's Confidential Information; nor (b) disclose Discloser's Confidential Information to anyone else. In addition, Recipient will protect Discloser's Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.`,
    },
    {
      title: "11.2 Exclusions",
      body: `Confidential Information does not include information that (a) Recipient knew without any obligation of confidentiality before disclosure by Discloser; (b) is or becomes publicly known and generally available through no fault of Recipient; (c) Recipient receives under no obligation of confidentiality from someone else who is authorized to make the disclosure; or (d) Recipient independently developed without use of or reference to Discloser's Confidential Information.`,
    },
    {
      title: "11.3 Required Disclosures",
      body: `Recipient may disclose Discloser's Confidential Information to the extent required by Applicable Laws if, unless prohibited by Applicable Laws, Recipient provides the Discloser reasonable advance notice of the required disclosure and reasonably cooperates, at the Discloser's expense, with the Discloser's efforts to obtain confidential treatment for the Confidential Information.`,
    },
    {
      title: "11.4 Permitted Disclosures",
      body: `Recipient may disclose Discloser's Confidential Information to employees, advisors, contractors, and representatives who each have a need to know the Confidential Information, but only if the person or entity is bound by confidentiality obligations at least as protective as those in this Section 11. Recipient agrees to be fully responsible for such person's or entity's compliance with the terms of this Section 11.`,
    },
    {
      title: "12.1 Entire Agreement",
      body: `This Agreement is the only agreement between the parties about its subject and supersedes all prior or contemporaneous statements (whether in writing or not) about its subject.`,
    },
    {
      title: "12.2 Modifications, Severability, and Waiver",
      body: `Any waiver, modification, or change to the Agreement must be in writing and signed by each party. If any term of this Agreement is determined to be invalid or unenforceable by a relevant court or governing body, the remaining terms of this Agreement will remain in full force and effect. The failure of a party to enforce a term or to exercise an option or right in this Agreement will not constitute a waiver by that party of the term, option, or right.`,
    },
    {
      title: "12.3 Governing Law and Chosen Courts",
      body: `The laws of ${governingLaw} will govern all interpretations and disputes about this Agreement, without regard to its conflict of laws provisions. The parties will bring any legal suit, action, or proceeding about this Agreement in ${chosenCourts} and each party irrevocably submits to the exclusive jurisdiction of ${chosenCourts}.`,
    },
    {
      title: "12.4 Injunctive Relief",
      body: `Despite Section 5 (Escalation Procedure) and Section 12.3 (Governing Law and Chosen Courts), a breach of Section 11 (Confidentiality) or the violation of a party's intellectual property rights may cause irreparable harm for which monetary damages cannot adequately compensate. As a result, upon the actual or threatened breach of Section 11 (Confidentiality) or violation of a party's intellectual property rights, the non-breaching or non-violating party may seek appropriate equitable relief, including an injunction, in any court of competent jurisdiction without the need to post a bond and without limiting its other rights or remedies.`,
    },
    {
      title: "12.5 Non-Exhaustive Remedies",
      body: `Except where the Agreement provides for an exclusive remedy, seeking or exercising a remedy does not limit the other rights or remedies available to a party.`,
    },
    {
      title: "12.6 Assignment",
      body: `Neither party may assign any rights or obligations under this Agreement without the prior written consent of the other party. Any attempted but non-permitted assignment is void. This Agreement will be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    },
    {
      title: "12.7 Notices",
      body: `Any notice, request, or approval about the Agreement must be in writing and sent to the Notice Address. Notices will be deemed given (a) upon confirmed delivery if by email, registered or certified mail, or personal delivery; or (b) two days after mailing if by overnight commercial delivery.`,
    },
    {
      title: "12.8 Independent Contractors",
      body: `The parties are independent contractors, not agents, partners, or joint venturers. Neither party is authorized to bind the other to any liability or obligation.`,
    },
    {
      title: "12.9 No Third-Party Beneficiary",
      body: `There are no third-party beneficiaries of this Agreement.`,
    },
    {
      title: "12.10 Force Majeure",
      body: `Neither party will be liable for a delay or failure to perform its obligations under this Agreement if caused by a Force Majeure Event. However, this section does not excuse a party's obligations to pay Fees.`,
    },
    {
      title: "12.11 Anti-Bribery",
      body: `Neither party will take any action that would be a violation of any Applicable Laws that prohibit the offering, giving, promising to offer or give, or receiving, directly or indirectly, money or anything of value to any third party to assist either party in retaining or obtaining business. Examples of these kinds of laws include the U.S. Foreign Corrupt Practices Act and the UK Bribery Act 2010.`,
    },
    {
      title: "12.12 Titles and Interpretation",
      body: `Section titles are for convenience and reference only. All uses of "including" and similar phrases are non-exhaustive and without limitation.`,
    },
    {
      title: "12.13 Signature",
      body: `This Agreement may be signed in counterparts, including by electronic signature. Each copy will be deemed an original, and all copies, when taken together, will be the same agreement.`,
    },
    {
      title: "13. Definitions",
      body: `"Affiliate" means an entity that, directly or indirectly, controls, is under the control of, or is under common control with a party, where control means having more than fifty percent (50%) of the voting stock or other ownership interest. "Agreement" means the Cover Page between Company and Partner that incorporates these Standard Terms and any policies and documents referenced in or attached to the Cover Page. "Applicable Laws" means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that govern a party's activities. "Brand Elements" means a party's trademarks, service marks, names, and logos. Brand Elements also include works of authorship such as marketing materials, images, documentation, collateral, or case studies that a party provides to the other party for use in connection with this Agreement. "Confidential Information" means information in any form disclosed by or on behalf of a Discloser, including before the ${effectiveDate}, to a Recipient in connection with this Agreement that (a) the Discloser identifies as "confidential", "proprietary", or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure. Confidential Information includes the existence of this Agreement and the information on a Cover Page. "Cover Page" means a document that is signed by the parties, identifies Company and Partner, incorporates these Standard Terms, and includes definitions or descriptions for Variables. "Covered Claim" means either a Company Covered Claim or Partner Covered Claim. "Discloser" means a party to this Agreement when the party is providing or disclosing Confidential Information to the other party. "Feedback" means suggestions, feedback, or comments made by one party about the other party's products, services, or related offerings. "Fees" means the amounts described in a Cover Page that one party owes to the other party, as applicable. "Force Majeure Event" means an unforeseen event outside a party's reasonable control where the affected party took reasonable measures to avoid or mitigate the impacts of the event. Examples of these kinds of events include unpredicted natural disasters like a major earthquake or pandemic; war, riot, or act of terrorism; or public utility or internet failure. "Indemnifying Party" means a party to this Agreement when the party is providing protection for a particular Covered Claim. "Licensor" means Company or Partner, as applicable, when it is providing Brand Elements to the other party as part of marketing activities under this Agreement. "Licensee" means Company or Partner, as applicable, when it is receiving Brand Elements from the other party to perform its ${obligations} for marketing activities under this Agreement. "Personal Data" has the meaning(s) set forth in the Applicable Laws regarding how a company must protect personal information, personal data, personally identifiable information, or other similar term. "Protected Party" means a party to this Agreement when the party is receiving the benefit of protection for a particular Covered Claim. "Recipient" means a party to this Agreement when the party receives Confidential Information from the other party. "Standard Terms" means these Common Paper Partnership Standard Terms Version 1.0, which are posted at commonpaper.com/standards/partnership-agreement/1.0. "Variable" means a word or phrase in the Standard Terms that is highlighted and capitalized, such as Obligations or Governing Law. Variables have the meanings or descriptions given on a Cover Page; however, if the Cover Page omits or does not define a Variable, the default meaning will be "none" or "not applicable" and the correlating clause, sentence, or section does not apply to the Agreement.`,
    },
  ];
}

const content: DocumentContent<PartnershipAgreementFields> = {
  documentType: "partnership-agreement",
  title: "Partnership Agreement",
  pdfFilename: "Partnership-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    company: readGroup(raw, "company", defaultFields.company),
    partner: readGroup(raw, "partner", defaultFields.partner),
    obligations: asString(raw.obligations, defaultFields.obligations),
    territory: asString(raw.territory, defaultFields.territory),
    effectiveDate: asString(raw.effectiveDate, defaultFields.effectiveDate),
    endDate: asString(raw.endDate, defaultFields.endDate),
    brandGuidelines: asString(raw.brandGuidelines, defaultFields.brandGuidelines),
    dpaReference: asString(raw.dpaReference, defaultFields.dpaReference),
    paymentProcess: asString(raw.paymentProcess, defaultFields.paymentProcess),
    paymentSchedule: asString(raw.paymentSchedule, defaultFields.paymentSchedule),
    generalCapAmount: asString(raw.generalCapAmount, defaultFields.generalCapAmount),
    increasedCapAmount: asString(raw.increasedCapAmount, defaultFields.increasedCapAmount),
    additionalWarranties: asString(raw.additionalWarranties, defaultFields.additionalWarranties),
    governingLaw: asString(raw.governingLaw, defaultFields.governingLaw),
    chosenCourts: asString(raw.chosenCourts, defaultFields.chosenCourts),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
