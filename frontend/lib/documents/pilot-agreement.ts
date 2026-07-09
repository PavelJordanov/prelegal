import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  DEFAULT_PARTY_FIELD_CONFIG,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export interface PilotAgreementFields {
  provider: PartyDetails;
  customer: PartyDetails;
  pilotPeriod: string;
  evaluationPurposes: string;
  effectiveDate: string;
  generalCapAmount: string;
  governingLaw: string;
  chosenCourts: string;
}

const emptyParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

const effectiveDateFallback = "[Today's date]";

const defaultFields: PilotAgreementFields = {
  provider: { ...emptyParty },
  customer: { ...emptyParty },
  pilotPeriod: "",
  evaluationPurposes: "",
  effectiveDate: todayAsLocalIsoDate(),
  generalCapAmount: "",
  governingLaw: "",
  chosenCourts: "",
};

const pilotPeriodFallback = "[Fill in pilot period]";
const evaluationPurposesFallback = "[Fill in evaluation purposes]";
const generalCapAmountFallback = "[Fill in general cap amount]";
const governingLawFallback = "[Fill in governing law]";
const chosenCourtsFallback = "[Fill in chosen courts]";
const providerCompanyFallback = "[Provider Company]";
const customerCompanyFallback = "[Customer Company]";
const providerNoticeAddressFallback = "[Provider Notice Address]";
const customerNoticeAddressFallback = "[Customer Notice Address]";

function providerCompany(data: PilotAgreementFields): string {
  return data.provider.company || providerCompanyFallback;
}

function customerCompany(data: PilotAgreementFields): string {
  return data.customer.company || customerCompanyFallback;
}

function summarySections(data: PilotAgreementFields): FieldSummaryItem[] {
  return [
    { label: "Pilot Period", value: data.pilotPeriod || pilotPeriodFallback },
    { label: "Evaluation Purposes", value: data.evaluationPurposes || evaluationPurposesFallback },
    { label: "Effective Date", value: formatDisplayDate(data.effectiveDate, effectiveDateFallback) },
    { label: "General Cap Amount", value: data.generalCapAmount || generalCapAmountFallback },
    { label: "Governing Law", value: data.governingLaw || governingLawFallback },
    { label: "Chosen Courts", value: data.chosenCourts || chosenCourtsFallback },
  ];
}

function parties(data: PilotAgreementFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
    { label: "Customer", data: data.customer, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/Pilot-Agreement.md with the
// Order Form variables substituted directly (no {{placeholder}} tokens - each
// document module is responsible for its own substitution so the shared
// renderer never needs to know about template syntax). Nested numbering
// (e.g. "1.1 Access and Use") is flattened into each section's title.
function bodySections(data: PilotAgreementFields): DocumentSection[] {
  const provider = providerCompany(data);
  const customer = customerCompany(data);
  const providerPossessive = `${provider}'s`;
  const customerPossessive = `${customer}'s`;
  const pilotPeriod = data.pilotPeriod || pilotPeriodFallback;
  const evaluationPurposes = data.evaluationPurposes || evaluationPurposesFallback;
  const effectiveDate = formatDisplayDate(data.effectiveDate, effectiveDateFallback);
  const generalCapAmount = data.generalCapAmount || generalCapAmountFallback;
  const governingLaw = data.governingLaw || governingLawFallback;
  const chosenCourts = data.chosenCourts || chosenCourtsFallback;
  const providerNoticeAddress = data.provider.noticeAddress || providerNoticeAddressFallback;
  const customerNoticeAddress = data.customer.noticeAddress || customerNoticeAddressFallback;

  return [
    {
      title: "1.1 Access and Use",
      body: `During the ${pilotPeriod} and subject to the terms of this Agreement, ${customer} may access and use the Product solely for ${customerPossessive} Evaluation Purposes (${evaluationPurposes}).`,
    },
    {
      title: "1.2 License",
      body: `If the Product contains Software, then, during the ${pilotPeriod} and subject to the terms of this Agreement, ${provider} grants ${customer} a limited, non-exclusive, non-sublicensable, non-transferable license to install and use such Software on systems owned or controlled by ${customer} solely for ${customerPossessive} Evaluation Purposes.`,
    },
    {
      title: "1.3 User Accounts",
      body: `${customer} is responsible for all actions on Users’ accounts and for all Users’ compliance with this Agreement. ${customer} and Users must protect the confidentiality of their passwords and login credentials. ${customer} will promptly notify ${provider} if it suspects or knows of any fraudulent activity with its accounts, passwords, or credentials, or if they become compromised.`,
    },
    {
      title: "1.4 Customer Content",
      body: `${provider} may copy, display, modify, and use Customer Content only as needed to provide and maintain the Product and related offerings. ${customer} is responsible for the accuracy and content of Customer Content.`,
    },
    {
      title: "1.5 Feedback and Usage Data",
      body: `${customer} may, but is not required to, give ${provider} Feedback, in which case ${customer} gives Feedback "AS IS". ${provider} may use all Feedback freely without any restriction or obligation. In addition, ${provider} may collect and analyze Usage Data, and ${provider} may freely use Usage Data to maintain, improve, enhance, and promote ${providerPossessive} products and services without restriction or obligation. However, ${provider} may only disclose Usage Data to others if the Usage Data is aggregated and does not identify ${customer} or Users.`,
    },
    {
      title: "1.6 Restrictions",
      body: `Except as expressly permitted by this Agreement, ${customer} will not (and will not allow anyone else to): (i) reverse engineer, decompile, or attempt to discover any source code or underlying ideas or algorithms of the Product (except to the extent Applicable Laws prohibit this restriction); (ii) provide, sell, transfer, sublicense, lend, distribute, rent, or otherwise allow others to access or use the Product; (iii) remove any proprietary notices or labels; (iv) copy, modify, or create derivative works of the Product; (v) conduct security or vulnerability tests on, interfere with the operation of, cause performance degradation of, or circumvent access restrictions of the Product; (vi) access accounts, information, data, or portions of the Product to which ${customer} does not have explicit authorization; (vii) use the Product to develop a competing service or product; (viii) use the Product with any High Risk Activities or with any activity prohibited by Applicable Laws; (ix) use the Product to obtain unauthorized access to anyone else’s networks or equipment; or (x) upload, submit, or otherwise make available to the Product any Customer Content to which ${customer} and Users do not have the proper rights.`,
    },
    {
      title: "1.7 Reservation of Rights",
      body: `Except for the limited license to install and use Software in Section 1.2 (License), ${provider} retains all right, title, and interest in and to the Product, whether developed before or after the ${effectiveDate}. Except for the limited rights in Section 1.4 (Customer Content), ${customer} retains all right, title, and interest in and to the Customer Content.`,
    },
    {
      title: "2.1 Agreement",
      body: `The Agreement will start on the ${effectiveDate} and, unless terminated earlier according to the terms of this Agreement, will continue through the ${pilotPeriod}.`,
    },
    {
      title: "2.2 Termination",
      body: `Either party may terminate the Agreement immediately: (a) if the other party fails to cure a material breach of the Agreement following 30 days notice; (b) upon notice if the other party (i) materially breaches the Agreement in a manner that cannot be cured; (ii) dissolves or stops conducting business without a successor; (iii) makes an assignment for the benefit of creditors; or (iv) becomes the debtor in insolvency, receivership, or bankruptcy proceedings that continue for more than 60 days; or (c) for any or no reason following 30 days notice to the other party.`,
    },
    {
      title: "2.3 Effect of Termination",
      body: `If the parties do not have a Definitive Agreement, then upon the expiration or termination of this Agreement: (a) ${customer} will no longer have any right to use the Product. If the Product contains Software, ${customer} will immediately and permanently uninstall or delete all such Software and will certify to ${provider} that ${customer} has complied with this obligation. (b) Upon ${customerPossessive} request, ${provider} will delete Customer Content within 60 days. (c) Each Recipient will return or destroy Discloser’s Confidential Information in its possession or control.`,
    },
    {
      title: "2.4 Survival",
      body: `(a) The following sections will survive expiration or termination of the Agreement: Section 1.5 (Feedback and Usage Data), Section 1.6 (Restrictions), Section 1.7 (Reservation of Rights), Section 2.3 (Effect of Termination), Section 2.4 (Survival), Section 3 (Representations), Section 4 (Disclaimer of Warranties), Section 5 (Limitation of Liability), Section 6 (Confidentiality), Section 7 (General Terms), Section 8 (Definitions), and the portions of an Order Form referenced by these sections. (b) Each Recipient may retain Discloser’s Confidential Information in accordance with its standard backup or record retention policies maintained in the ordinary course of business or as required by Applicable Laws, in which case Section 6 (Confidentiality) will continue to apply to retained Confidential Information.`,
    },
    {
      title: "3.1 Representations",
      body: `Each party represents to the other that: (a) it has the legal power and authority to enter into this Agreement; and (b) it is duly organized, validly existing, and in good standing under the Applicable Laws of the jurisdiction of its origin.`,
    },
    {
      title: "4.1 Disclaimer of Warranties",
      body: `${provider} makes no guarantees that the Product will always be safe, secure, or error-free, or that it will function without disruptions, delays, or imperfections. The Product is provided on an "AS IS" and "AS AVAILABLE" basis. ${provider} disclaims all warranties and conditions, whether express or implied, including the implied warranties and conditions of merchantability, fitness for a particular purpose, title, and non-infringement. These disclaimers apply to the maximum extent permitted by Applicable Laws.`,
    },
    {
      title: "5.1 General Liability Cap",
      body: `Each party’s total cumulative liability for all claims arising out of or relating to this Agreement will not be more than the ${generalCapAmount}.`,
    },
    {
      title: "5.2 Damages Waiver",
      body: `Except for a breach of Section 6 (Confidentiality), under no circumstances will either party be liable to the other for lost profits or revenues (whether direct or indirect), or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement, even if the party is informed of the possibility of this type of damage in advance.`,
    },
    {
      title: "5.3 Applicability",
      body: `The limitations and waivers contained in Sections 5.1 (General Liability Cap) and 5.2 (Damages Waiver) apply to all liability, whether in tort (including negligence), contract, breach of statutory duty, or otherwise. However, nothing in this Agreement will limit, exclude, or restrict a party's liability to the extent prohibited by Applicable Laws.`,
    },
    {
      title: "6.1 Non-Use and Non-Disclosure",
      body: `Except as otherwise authorized in the Agreement or as needed to fulfill its obligations or exercise its rights under this Agreement, Recipient will not (a) use Discloser’s Confidential Information; nor (b) disclose Discloser’s Confidential Information to anyone else. In addition, Recipient will protect Discloser’s Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.`,
    },
    {
      title: "6.2 Exclusions",
      body: `Confidential Information does not include information that (a) Recipient knew without any obligation of confidentiality before disclosure by Discloser; (b) is or becomes publicly known and generally available through no fault of Recipient; (c) Recipient receives under no obligation of confidentiality from someone else who is authorized to make the disclosure; or (d) Recipient independently developed without use of or reference to Discloser’s Confidential Information.`,
    },
    {
      title: "6.3 Required Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to the extent required by Applicable Laws if, unless prohibited by Applicable Laws, Recipient provides Discloser reasonable advance notice of the required disclosure and reasonably cooperates, at Discloser’s expense, with Discloser’s efforts to obtain confidential treatment for the Confidential Information.`,
    },
    {
      title: "6.4 Permitted Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to Users, employees, advisors, contractors, and representatives who each have a need to know the Confidential Information, but only if the person or entity is bound by confidentiality obligations at least as protective as those in this Section 6 (Confidentiality) and Recipient remains responsible for everyone’s compliance with the terms of this Section 6 (Confidentiality).`,
    },
    {
      title: "7.1 Entire Agreement",
      body: `This Agreement is the only agreement between the parties about its subject and this Agreement supersedes all prior or contemporaneous statements (whether in writing or not) about its subject. ${provider} expressly rejects any terms included in ${customerPossessive} purchase order or similar document, which may only be used for accounting or administrative purposes. No terms or conditions in any ${customer} documentation or online vendor portal will apply to ${customerPossessive} use of the Product unless expressly agreed to in a legally binding written agreement signed by an authorized ${provider} representative, regardless of what such terms may say.`,
    },
    {
      title: "7.2 Modifications, Severability, and Waiver",
      body: `Any waiver, modification, or change to the Agreement must be in writing and signed or electronically accepted by each party. If any term of this Agreement is determined to be invalid or unenforceable by a relevant court or governing body, the remaining terms of this Agreement will remain in full force and effect. The failure of a party to enforce a term or to exercise an option or right in this Agreement will not constitute a waiver by that party of the term, option, or right.`,
    },
    {
      title: "7.3 Governing Law and Chosen Courts",
      body: `The ${governingLaw} will govern all interpretations and disputes about this Agreement, without regard to its conflict of laws provisions. The parties will bring any legal suit, action, or proceeding about this Agreement in the ${chosenCourts} and each party irrevocably submits to the exclusive jurisdiction of the ${chosenCourts}.`,
    },
    {
      title: "7.4 Injunctive Relief",
      body: `Despite Section 7.3 (Governing Law and Chosen Courts), a breach of Section 6 (Confidentiality) or the violation of a party’s intellectual property rights may cause irreparable harm for which monetary damages cannot adequately compensate. As a result, upon the actual or threatened breach of Section 6 (Confidentiality) or violation of a party’s intellectual property rights, the non-breaching or non-violating party may seek appropriate equitable relief, including an injunction, in any court of competent jurisdiction without the need to post a bond and without limiting its other rights or remedies.`,
    },
    {
      title: "7.5 Non-Exhaustive Remedies",
      body: `Except where the Agreement provides for an exclusive remedy, seeking or exercising a remedy does not limit the other rights or remedies available to a party.`,
    },
    {
      title: "7.6 Assignment",
      body: `Neither party may assign any rights or obligations under this Agreement without the prior written consent of the other party. However, ${provider} may assign this Agreement upon notice if ${provider} undergoes a merger, change of control, reorganization, or sale of all or substantially all its equity, business, or assets to which this Agreement relates. Any attempted but non-permitted assignment is void. This Agreement will be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    },
    {
      title: "7.7 Notices",
      body: `Any notice, request, or approval about the Agreement must be in writing and sent to the applicable party's Notice Address set out above (${provider} Notice Address: ${providerNoticeAddress}; ${customer} Notice Address: ${customerNoticeAddress}). Notices will be deemed given (a) upon confirmed delivery if by email, registered or certified mail, or personal delivery; or (b) two days after mailing if by overnight commercial delivery.`,
    },
    {
      title: "7.8 Taxes",
      body: `${customer} is responsible for all duties, taxes, and levies that apply to any Fees paid under this Agreement, including sales, use, VAT, GST, or withholding, that ${provider} itemizes and includes in an invoice. However, ${customer} is not responsible for ${providerPossessive} income taxes.`,
    },
    {
      title: "7.9 Independent Contractors",
      body: `The parties are independent contractors, not agents, partners, or joint venturers. Neither party is authorized to bind the other to any liability or obligation.`,
    },
    {
      title: "7.10 No Third-Party Beneficiary",
      body: `There are no third-party beneficiaries of this Agreement.`,
    },
    {
      title: "7.11 Force Majeure",
      body: `Neither party will be liable for a delay or failure to perform its obligations of this Agreement if caused by a Force Majeure Event. However, this section does not excuse ${customerPossessive} obligations to pay Fees.`,
    },
    {
      title: "7.12 Titles and Interpretation",
      body: `Section titles are for convenience and reference only. All uses of "including" and similar phrases are non-exhaustive and without limitation. The United Nations Convention for the International Sale of Goods and the Uniform Computer Information Transaction Act do not apply to this Agreement.`,
    },
    {
      title: "7.13 Signature",
      body: `This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism. Each copy will be deemed an original and all copies, when taken together, will be the same agreement.`,
    },
    {
      title: "8.1 Defining Variables",
      body: `Variables have the meanings or descriptions given on the Order Form. However, if the Order Form omits or does not define a Variable, the default meaning will be "none" or "not applicable" and the correlating clause, sentence, or section does not apply to that Agreement.`,
    },
    {
      title: "8.2 “Agreement”",
      body: `"Agreement" means the Standard Terms, the Order Form between ${provider} and ${customer}, and any policies and documents referenced in or attached to the Order Form.`,
    },
    {
      title: "8.3 “Applicable Laws”",
      body: `"Applicable Laws" means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that apply to or govern ${provider} or ${customer}.`,
    },
    {
      title: "8.4 “Confidential Information”",
      body: `"Confidential Information" means information in any form disclosed by or on behalf of a Discloser, including before the ${effectiveDate}, to a Recipient in connection with this Agreement that (a) the Discloser identifies as "confidential", "proprietary", or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure. Confidential Information includes the existence of this Agreement and the information on the Order Form. ${customerPossessive} Confidential Information includes non-public Customer Content and ${providerPossessive} Confidential Information includes non-public information about the Product.`,
    },
    {
      title: "8.5 “Customer Content”",
      body: `"Customer Content" means data, information, or materials submitted by or on behalf of ${customer} or Users to the Product but excludes Feedback.`,
    },
    {
      title: "8.6 “Definitive Agreement”",
      body: `"Definitive Agreement" means a separate, mutually agreed agreement between ${provider} and ${customer} for longer-term access to the Product.`,
    },
    {
      title: "8.7 “Discloser”",
      body: `"Discloser" means a party to this Agreement when the party is providing or disclosing Confidential Information to the other party.`,
    },
    {
      title: "8.8 “Evaluation Purposes”",
      body: `"Evaluation Purposes" means the internal use of the Product solely to test and evaluate the Product to determine whether to enter into a Definitive Agreement with ${provider}. For this Agreement, Evaluation Purposes means: ${evaluationPurposes}.`,
    },
    {
      title: "8.9 “Feedback”",
      body: `"Feedback" means suggestions, feedback, or comments about the Product or related offerings.`,
    },
    {
      title: "8.10 “Fees”",
      body: `"Fees" means the applicable amounts described in an Order Form.`,
    },
    {
      title: "8.11 “Force Majeure Event”",
      body: `"Force Majeure Event" means an unforeseen event outside a party’s reasonable control where the affected party took reasonable measures to avoid or mitigate the impacts of the event. Examples of these kinds of events include unpredicted natural disasters like a major earthquake, war, pandemic, riot, act of terrorism, or public utility or internet failure.`,
    },
    {
      title: "8.12 “High Risk Activity”",
      body: `"High Risk Activity" means any situation where the use or failure of the Product could be reasonably expected to lead to death, bodily injury, or environmental damage. Examples include full or partial autonomous vehicle technology, medical life-support technology, emergency response services, nuclear facilities operation, and air traffic control.`,
    },
    {
      title: "8.13 “Order Form”",
      body: `"Order Form" means a document that is signed or electronically accepted by the parties, incorporates these Standard Terms, and ${provider} and ${customer}, and includes the key business details and Variables for this Agreement. An Order Form includes and incorporates by reference the policies and documents referenced in or attached to the Order Form.`,
    },
    {
      title: "8.14 “Product”",
      body: `"Product" means the product described in the Order Form.`,
    },
    {
      title: "8.15 “Recipient”",
      body: `"Recipient" means a party to this Agreement when the party receives Confidential Information from the other party.`,
    },
    {
      title: "8.16 “Software”",
      body: `"Software" means the client-side software or applications made available by ${provider} for ${customer} to install, download (whether onto a machine or in a browser), or execute as part of the Product.`,
    },
    {
      title: "8.17 “Standard Terms”",
      body: `"Standard Terms" means these Common Paper Pilot Agreement Standard Terms Version 1.1, which are posted at https://commonpaper.com/standards/pilot-agreement/1.1. This Agreement does not model conversion into a future Definitive Agreement; the parties may separately negotiate one at the end of the Pilot Period.`,
    },
    {
      title: "8.18 “User”",
      body: `"User" means any individual who uses the Product on ${customerPossessive} behalf or through ${customerPossessive} account.`,
    },
  ];
}

const content: DocumentContent<PilotAgreementFields> = {
  documentType: "pilot-agreement",
  title: "Pilot Agreement",
  pdfFilename: "Pilot-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    customer: readGroup(raw, "customer", defaultFields.customer),
    pilotPeriod: asString(raw.pilotPeriod, defaultFields.pilotPeriod),
    evaluationPurposes: asString(raw.evaluationPurposes, defaultFields.evaluationPurposes),
    effectiveDate: asString(raw.effectiveDate, defaultFields.effectiveDate),
    generalCapAmount: asString(raw.generalCapAmount, defaultFields.generalCapAmount),
    governingLaw: asString(raw.governingLaw, defaultFields.governingLaw),
    chosenCourts: asString(raw.chosenCourts, defaultFields.chosenCourts),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
