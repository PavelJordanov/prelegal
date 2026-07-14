import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  DEFAULT_PARTY_FIELD_CONFIG,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export interface DesignPartnerAgreementFields {
  provider: PartyDetails;
  partner: PartyDetails;
  effectiveDate: string;
  term: string;
  program: string;
  fees: string;
  governingLaw: string;
  chosenCourts: string;
}

const emptyParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

const effectiveDateFallback = "[Today's date]";

const defaultFields: DesignPartnerAgreementFields = {
  provider: { ...emptyParty },
  partner: { ...emptyParty },
  effectiveDate: todayAsLocalIsoDate(),
  term: "",
  program: "",
  fees: "",
  governingLaw: "",
  chosenCourts: "",
};

const termFallback = "[Term not specified]";
const programFallback = "[Program description not specified]";
const feesFallback = "[Fees not specified]";
const governingLawFallback = "[Fill in state]";
const chosenCourtsFallback = "[Fill in courts]";

function summarySections(data: DesignPartnerAgreementFields): FieldSummaryItem[] {
  return [
    { label: "Effective Date", value: formatDisplayDate(data.effectiveDate, effectiveDateFallback) },
    { label: "Term", value: data.term || termFallback },
    { label: "Program", value: data.program || programFallback },
    { label: "Fees", value: data.fees || feesFallback },
    { label: "Governing Law", value: data.governingLaw || governingLawFallback },
    { label: "Chosen Courts", value: data.chosenCourts || chosenCourtsFallback },
  ];
}

function parties(data: DesignPartnerAgreementFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
    { label: "Partner", data: data.partner, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/Design-Partner-Agreement.md
// with the Cover Page variables substituted directly (no {{placeholder}}
// tokens - each document module is responsible for its own substitution so
// the shared renderer never needs to know about template syntax). The
// generic role words "Provider" and "Partner" are themselves marked as
// keyterms_link spans in the template, but - like "Disclosing Party" /
// "Receiving Party" in the Mutual NDA - they stay as literal role labels in
// the prose rather than being replaced with the parties' actual names.
function bodySections(data: DesignPartnerAgreementFields): DocumentSection[] {
  const effectiveDate = formatDisplayDate(data.effectiveDate, effectiveDateFallback);
  const term = data.term || termFallback;
  const program = data.program || programFallback;
  const fees = data.fees || feesFallback;
  const governingLaw = data.governingLaw || governingLawFallback;
  const chosenCourts = data.chosenCourts || chosenCourtsFallback;

  return [
    {
      title: "1.1 Product Access",
      body: `Partner would like to be one of the first users of the Product. During the ${term}, Partner will have early access to the Product for its internal business purposes and to give Feedback to Provider and participate in the ${program}, so long as Partner complies with the terms of this Agreement.`,
    },
    {
      title: "1.2 Program and Feedback",
      body: `The purpose of the ${program} is for Provider to develop, build, and improve the Product for general use by all of Provider's customers or users. Partner will give Feedback to Provider on a mutually agreed schedule and will participate in the ${program}.`,
    },
    {
      title: "1.3 Product Improvement",
      body: `Provider will develop and improve the Product and may use all Feedback and insight about the Product from the ${program} freely without any restriction or obligation. Partner will not give any Feedback that Provider cannot use in this manner or for the purpose.`,
    },
    {
      title: "2. Fees and Costs",
      body: `Partner will pay Provider the ${fees}.`,
    },
    {
      title: "3.1 Agreement Term",
      body: `This Agreement will start on the ${effectiveDate} and continue for the ${term}. Provider and Partner may mutually agree to extend the ${term}, including by email communication.`,
    },
    {
      title: "3.2 Termination",
      body: `Either party may terminate this Agreement for any or no reason. To terminate this Agreement, the terminating party must notify the other party about termination by giving the other party 30 days advance notice.`,
    },
    {
      title: "3.3 Effect of Termination",
      body: `Upon expiration or termination of the Agreement: (a) Partner will no longer have any right to access or use the Product. Partner will no longer be required to provide Feedback or participate in the ${program} under the Agreement. (b) Each Recipient will return or destroy Discloser’s Confidential Information in its possession or control.`,
    },
    {
      title: "3.4 Survival",
      body: `(a) The following sections will survive expiration or termination of the Agreement: Section 1.3 (Product Improvement), Section 3.3 (Effect of Termination), Section 3.4 (Survival), Section 4 (Disclaimer of Warranties), Section 5 (Confidentiality), Section 6 (Intellectual Property), Section 7 (General Terms), Section 8 (Definitions), and the portions of a Cover Page referenced by these sections. (b) Each Recipient may retain Discloser’s Confidential Information in accordance with its standard backup or record retention policies maintained in the ordinary course of business or as required by Applicable Laws, in which case Section 5 (Confidentiality) will continue to apply to retained Confidential Information.`,
    },
    {
      title: "4. Disclaimer of Warranties",
      body: `Provider and Partner each disclaim all warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. These disclaimers apply to the maximum extent permitted by Applicable Laws.`,
    },
    {
      title: "5.1 Non-Use and Non-Disclosure",
      body: `Unless otherwise authorized in the Agreement, Recipient will (a) only use Discloser’s Confidential Information to fulfill its obligations or exercise its rights under this Agreement; and (b) not disclose Discloser’s Confidential Information to anyone else. In addition, Recipient will protect Discloser’s Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.`,
    },
    {
      title: "5.2 Exclusions",
      body: `Confidential Information does not include information that (a) Recipient knew without any obligation of confidentiality before disclosure by Discloser; (b) is or becomes publicly known and generally available through no fault of Recipient; (c) Recipient receives under no obligation of confidentiality from someone else who is authorized to make the disclosure; or (d) Recipient independently developed without use of or reference to Discloser’s Confidential Information. In addition, Feedback does not constitute Partner's Confidential Information and Provider may use Partner's Confidential Information to provide the Product.`,
    },
    {
      title: "5.3 Required Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to the extent required by Applicable Laws if, unless prohibited by Applicable Laws, Recipient provides the Discloser reasonable advance notice of the required disclosure and reasonably cooperates, at the Discloser’s expense, with the Discloser’s efforts to obtain confidential treatment for the Confidential Information.`,
    },
    {
      title: "5.4 Permitted Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to Users, employees, advisors, contractors, and representatives who each have a need to know the Confidential Information, but only if the person or entity is bound by confidentiality obligations at least as protective as those in this Section 5 and Recipient remains responsible for everyone’s compliance with the terms of this Section 5.`,
    },
    {
      title: "6.1 Reservation of Rights",
      body: `Except for the limited license to access the Product in Section 1.1 (Product Access), Provider retains all right, title, and interest in and to the Product, including any aspects, features, or functionality created in response to Feedback or Partner's participation in the ${program}, whether developed before or after the ${effectiveDate}. Each Discloser retains all right, title, and interest in and to its Confidential Information.`,
    },
    {
      title: "6.2 Ownership",
      body: `Provider owns all Feedback. Partner hereby assigns to Provider all its right, title, and interest in and to Feedback and will reasonably cooperate with Provider as needed to establish, prove, or defend Provider's ownership of Feedback.`,
    },
    {
      title: "7.1 Entire Agreement",
      body: `This Agreement is the only agreement between the parties about its subject and this Agreement supersedes all prior or contemporaneous statements (whether in writing or not) about its subject.`,
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
      body: `Despite Section 7.3 (Governing Law and Chosen Courts), a breach of Section 5 (Confidentiality) or the violation of a party’s intellectual property rights may cause irreparable harm for which monetary damages cannot adequately compensate. As a result, upon the actual or threatened breach of Section 5 (Confidentiality) or violation of a party’s intellectual property rights, the non-breaching or non-violating party may seek appropriate equitable relief, including an injunction, in any court of competent jurisdiction without the need to post a bond and without limiting its other rights or remedies.`,
    },
    {
      title: "7.5 Restrictions",
      body: `Except as expressly permitted by this Agreement, Partner will not (and will not allow anyone else to): (a) reverse engineer, decompile, or attempt to discover any source code or underlying ideas or algorithms of the Product (except to the extent Applicable Laws prohibit this restriction); (b) provide, sell, transfer, sublicense, lend, distribute, rent, or otherwise allow others to access or use the Product; (c) remove any proprietary notices or labels; (d) copy, modify, or create derivative works of the Product; (e) conduct security or vulnerability tests on, interfere with the operation of, cause performance degradation of, or circumvent access restrictions of the Product; (f) access accounts, information, data, or portions of the Product to which Partner does not have explicit authorization; (g) use the Product to develop a competing service or product; (h) use the Product with activity prohibited by Applicable Laws; (i) use the Product to obtain unauthorized access to anyone else’s networks or equipment; or (j) upload, submit, or otherwise make available to the Product any information or content to which Partner does not have the proper rights.`,
    },
    {
      title: "7.6 Non-Exhaustive Remedies",
      body: `Except where the Agreement provides for an exclusive remedy, seeking or exercising a remedy does not limit the other rights or remedies available to a party.`,
    },
    {
      title: "7.7 Assignment",
      body: `Neither party may assign any rights or obligations under this Agreement without the prior written consent of the other party. However, either party may assign this Agreement upon notice if the assigning party undergoes a merger, change of control, reorganization, or sale of all or substantially all its equity, business, or assets to which this Agreement relates. Any attempted but non-permitted assignment is void. This Agreement will be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    },
    {
      title: "7.8 Notices",
      body: `Any notice, request, or approval about the Agreement must be in writing and sent to the recipient's Notice Address set forth above. Notices will be deemed given (a) upon confirmed delivery if by email, registered or certified mail, or personal delivery; or (b) two days after mailing if by overnight commercial delivery.`,
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
      title: "7.11 Titles and Interpretation",
      body: `Section titles are for convenience and reference only. All uses of "including" and similar phrases are non-exhaustive and without limitation. The United Nations Convention for the International Sale of Goods and the Uniform Computer Information Transaction Act do not apply to this Agreement.`,
    },
    {
      title: "7.12 Signature",
      body: `This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism. Each copy will be deemed an original and all copies, when taken together, will be the same agreement.`,
    },
    {
      title: "8. Definitions",
      body: `"Agreement" means these Standard Terms, the Cover Page between Provider and Partner, and the policies and documents referenced in or attached to the Cover Page. "Applicable Laws" means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that apply to or govern Provider or Partner. "Confidential Information" means information in any form disclosed by or on behalf of a Discloser, including before the ${effectiveDate}, to a Recipient in connection with this Agreement that (a) the Discloser identifies as "confidential", "proprietary", or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure. Confidential Information includes the existence of this Agreement and the information on each Cover Page. Provider's Confidential Information includes non-public information about the Product. "Cover Page" means a document that is signed or electronically accepted by the parties that incorporates these Standard Terms and identifies Provider and Partner. "Discloser" means a party to this Agreement when the party is providing or disclosing Confidential Information to the other party. "Feedback" means suggestions, feedback, or comments about the Product or related offerings. "Product" means the product or services described in the Cover Page. "Recipient" means a party to this Agreement when the party receives Confidential Information from the other party.`,
    },
  ];
}

const content: DocumentContent<DesignPartnerAgreementFields> = {
  documentType: "design-partner-agreement",
  title: "Design Partner Agreement",
  pdfFilename: "Design-Partner-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    partner: readGroup(raw, "partner", defaultFields.partner),
    effectiveDate: asString(raw.effectiveDate, defaultFields.effectiveDate),
    term: asString(raw.term, defaultFields.term),
    program: asString(raw.program, defaultFields.program),
    fees: asString(raw.fees, defaultFields.fees),
    governingLaw: asString(raw.governingLaw, defaultFields.governingLaw),
    chosenCourts: asString(raw.chosenCourts, defaultFields.chosenCourts),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
