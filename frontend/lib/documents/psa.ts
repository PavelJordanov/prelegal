import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  DEFAULT_PARTY_FIELD_CONFIG,
  asEnum,
  asInt,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export type TimeOfAssignmentOption = "upon-delivery" | "upon-full-payment";

export interface PsaFields {
  provider: PartyDetails;
  customer: PartyDetails;
  effectiveDate: string;
  customerPolicies: string;
  sowTerm: string;
  deliverablesDescription: string;
  reviewPeriodDays: number;
  customerObligations: string;
  timeOfAssignment: TimeOfAssignmentOption;
  fees: string;
  paymentPeriodDays: number;
  generalCapAmount: string;
  increasedCapAmount: string;
  additionalWarranties: string;
  dpaReference: string;
  insuranceMinimums: string;
  governingLaw: string;
  chosenCourts: string;
}

const emptyParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

const effectiveDateFallback = "[Today's date]";

const defaultFields: PsaFields = {
  provider: { ...emptyParty },
  customer: { ...emptyParty },
  effectiveDate: todayAsLocalIsoDate(),
  customerPolicies: "None.",
  sowTerm: "",
  deliverablesDescription: "",
  reviewPeriodDays: 10,
  customerObligations: "None.",
  timeOfAssignment: "upon-full-payment",
  fees: "",
  paymentPeriodDays: 0,
  generalCapAmount: "",
  increasedCapAmount: "",
  additionalWarranties: "None.",
  dpaReference: "No DPA is in place between the parties.",
  insuranceMinimums: "None specified.",
  governingLaw: "",
  chosenCourts: "",
};

function timeOfAssignmentDisplay(data: PsaFields): string {
  return data.timeOfAssignment === "upon-delivery"
    ? "Provider's delivery of the Deliverables to Customer"
    : "Provider's receipt of Customer's full payment of the Fees for the applicable SOW";
}

const sowTermFallback = "[Fill in SOW Term]";
const deliverablesDescriptionFallback = "[Fill in Deliverables description]";
const feesFallback = "[Fill in Fees]";
const paymentPeriodFallback = "[Fill in Payment Period]";
const generalCapAmountFallback = "[Fill in General Cap Amount]";
const increasedCapAmountFallback = "[Fill in Increased Cap Amount]";
const governingLawFallback = "[Fill in state]";
const chosenCourtsFallback = "[Fill in city or county and state]";

function summarySections(data: PsaFields): FieldSummaryItem[] {
  const paymentPeriod = data.paymentPeriodDays ? `${data.paymentPeriodDays} days` : paymentPeriodFallback;

  return [
    { label: "Effective Date", value: formatDisplayDate(data.effectiveDate, effectiveDateFallback) },
    { label: "Governing Law", value: data.governingLaw || governingLawFallback },
    { label: "Chosen Courts", value: data.chosenCourts || chosenCourtsFallback },
    { label: "SOW Term", value: data.sowTerm || sowTermFallback },
    { label: "Deliverables", value: data.deliverablesDescription || deliverablesDescriptionFallback },
    { label: "Time of Assignment", value: timeOfAssignmentDisplay(data) },
    { label: "Rejection/Resubmission Period", value: `${data.reviewPeriodDays} days` },
    { label: "Customer Obligations", value: data.customerObligations || "None." },
    { label: "Customer Policies", value: data.customerPolicies || "None." },
    { label: "Fees", value: data.fees || feesFallback },
    { label: "Payment Period", value: paymentPeriod },
    { label: "General Cap Amount", value: data.generalCapAmount || generalCapAmountFallback },
    { label: "Increased Cap Amount", value: data.increasedCapAmount || increasedCapAmountFallback },
    { label: "Additional Warranties", value: data.additionalWarranties || "None." },
    { label: "DPA", value: data.dpaReference || "No DPA is in place between the parties." },
    { label: "Insurance Minimums", value: data.insuranceMinimums || "None specified." },
  ];
}

function parties(data: PsaFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
    { label: "Customer", data: data.customer, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/PSA.md with the Key
// Terms/SOW variables substituted directly (no {{placeholder}} tokens - each
// document module is responsible for its own substitution so the shared
// renderer never needs to know about template syntax). Nested numbering
// (e.g. "1.1 Providing Services") is flattened into the section title.
//
// Simplifications made when transcribing (see PL-6 report for detail):
// - Rejection Period and Resubmission Period are captured as one combined
//   field (reviewPeriodDays) rather than two separate periods.
// - "Security Policy" (Section 3.2) and the claim-category defined terms
//   used only for liability carve-outs (Increased Claims, Unlimited Claims,
//   Provider/Customer Covered Claims) are Key-Terms-level concepts that
//   PSA.md itself never defines in its Standard Terms; they are left as
//   literal defined terms rather than modeled as fields.
function bodySections(data: PsaFields): DocumentSection[] {
  const effectiveDate = formatDisplayDate(data.effectiveDate, effectiveDateFallback);
  const customerPolicies = data.customerPolicies || "None.";
  const sowTerm = data.sowTerm || sowTermFallback;
  const deliverablesDescription = data.deliverablesDescription || deliverablesDescriptionFallback;
  const reviewPeriod = data.reviewPeriodDays ? `${data.reviewPeriodDays} days` : "[Fill in Rejection/Resubmission Period]";
  const customerObligations = data.customerObligations || "None.";
  const timeOfAssignment = timeOfAssignmentDisplay(data);
  const fees = data.fees || feesFallback;
  const paymentPeriod = data.paymentPeriodDays ? `${data.paymentPeriodDays} days` : paymentPeriodFallback;
  const generalCapAmount = data.generalCapAmount || generalCapAmountFallback;
  const increasedCapAmount = data.increasedCapAmount || increasedCapAmountFallback;
  const additionalWarranties = data.additionalWarranties || "None.";
  const dpaReference = data.dpaReference || "No DPA is in place between the parties.";
  const insuranceMinimums = data.insuranceMinimums || "None specified.";
  const governingLaw = data.governingLaw || governingLawFallback;
  const chosenCourts = data.chosenCourts || chosenCourtsFallback;

  return [
    {
      title: "1.1 Providing Services",
      body: `Customer or its Affiliates may enter SOWs with Provider. Provider will perform the Services as detailed in an applicable SOW. Each SOW together with the Key Terms and Standard Terms will constitute a separate agreement. Provider will comply with Customer Policies, if any (${customerPolicies}). If a Customer Affiliate enters an SOW with Provider, references to Customer in the SOW, Key Terms, or Standard Terms will mean that Affiliate for that agreement.`,
    },
    {
      title: "1.2 Cooperation",
      body: `Customer will reasonably cooperate with Provider to allow the performance of Services. Provider is not responsible for an inability to perform the Services caused by Customer's failure to cooperate as reasonably requested. Provider will provide its own equipment and tools to perform the Services.`,
    },
    {
      title: "1.3 Change Orders",
      body: `Provider or Customer may amend any SOW by entering a Change Order. If a party requests a Change Order, the other party will review and consider the proposed changes in good faith and respond to the Change Order request within a reasonable timeframe. However, a Change Order will not be binding until Provider and Customer agree in writing on the Change Order.`,
    },
    {
      title: "1.4 Acceptance",
      body: `If according to the SOW Deliverables are subject to this section, Customer will be deemed to have approved a Deliverable if Customer does not reject the Deliverable within the Rejection Period (${reviewPeriod}). If Customer rejects a Deliverable, Customer must notify Provider in writing with reasonable detail about why the Deliverable did not meet the requirements in the SOW. Provider will correct the issue and resubmit the Deliverable within the Resubmission Period (${reviewPeriod}).`,
    },
    {
      title: "1.5 Subcontractors",
      body: `Provider may use Subcontractors to perform the Services only with Customer's prior permission. However, Provider may use its Affiliates to perform Services without Customer's prior permission. If Provider uses Subcontractors to perform Services, Provider is responsible for (a) all acts and omissions of its Subcontractors, (b) ensuring its Subcontractors' compliance with this Agreement and the applicable SOW, and (c) making all payments owed to its Subcontractors for their portion of the Services.`,
    },
    {
      title: "1.6 Customer Obligations",
      body: `Customer will comply with Customer Obligations, if any (${customerObligations}).`,
    },
    {
      title: "2.1 Deliverables",
      body: `Except for Pre-Existing Materials and Third-Party Materials, Provider assigns all right, title, and interest in the Deliverables (if any) (${deliverablesDescription}) to Customer at the Time of Assignment (${timeOfAssignment}). Upon the Time of Assignment, Provider will assert no rights over such Deliverables.`,
    },
    {
      title: "2.2 Customer Materials",
      body: `Provider may copy, display, modify, and use Customer Materials only as needed to provide the Services. Customer is responsible for the accuracy and content of Customer Materials.`,
    },
    {
      title: "2.3 Pre-Existing Materials",
      body: `To the extent Provider incorporates Pre-Existing Materials into Deliverables, Provider grants Customer a non-exclusive, non-transferrable, perpetual, irrevocable, worldwide license to use Pre-Existing Materials only as necessary to use the Deliverables according to this Agreement.`,
    },
    {
      title: "2.4 Third-Party Materials",
      body: `a. Provider may incorporate Third-Party Materials into Deliverables only if allowed in the SOW and as authorized by Customer in writing (including by email).

b. Provider is responsible for obtaining all rights, licenses, consents, approvals, and authorizations necessary to use and incorporate the Third-Party Materials procured by Provider and incorporated into the Deliverables. This includes securing the ability to grant Customer rights in the Deliverables under this Agreement and ensuring that Customer has all rights necessary in these Provider-procured Third-Party Materials so that Customer may use Deliverables according to this Agreement.

c. Customer is responsible for obtaining all rights, licenses, consents, approvals, and authorizations necessary to use and incorporate the Third-Party Materials procured by Customer and incorporated into the Deliverables. This includes securing the ability to grant Provider rights in the Customer-procured Third-Party Materials so Provider can incorporate these Third-Party Materials into Deliverables. Provider will reasonably assist Customer in obtaining the necessary rights, licenses, consents, approvals, and authorizations for the Third-Party Materials that Provider recommends but that Customer procures.`,
    },
    {
      title: "2.5 Feedback and Usage Data",
      body: `Customer may, but is not required to, give Provider Feedback, in which case Customer gives Feedback "AS IS". Provider may use all Feedback freely without any restriction or obligation. In addition, Provider may collect and analyze Usage Data, and Provider may freely use Usage Data to maintain, improve, and enhance Provider's products and services without restriction or obligation. However, Provider may only share Usage Data with others if the Usage Data is aggregated and does not identify Customer.`,
    },
    {
      title: "2.6 Reservation of Rights",
      body: `Except for (a) Customer's ownership of Deliverables (if any) under Section 2.1 (Deliverables); (b) Provider's rights to use Customer Materials in Section 2.2 (Customer Materials); and (c) Customer's rights to Pre-Existing Materials in Section 2.3 (Pre-Existing Materials), neither party transfers any rights in any of their products, data, or any other intellectual property.`,
    },
    {
      title: "3.1 Personal Data",
      body: `If the parties have a DPA (${dpaReference}), each party will comply with its obligations in the DPA, the terms of the DPA will control each party's rights and obligations as to Personal Data, and the terms of the DPA will control in the event of any conflict with this Agreement.`,
    },
    {
      title: "3.2 Security",
      body: `Provider will comply with the Security Policy, if any.`,
    },
    {
      title: "4.1 Fees and Invoices",
      body: `Unless the currency is specified in the SOW, all Fees (${fees}) are in U.S. Dollars and are exclusive of taxes. Except for the prorated refund of prepaid Fees allowed with specific termination rights, Fees are non-refundable. Provider will send invoices for Fees as described in the SOW.`,
    },
    {
      title: "4.2 Payment",
      body: `Customer will pay Provider the Fees (${fees}) and taxes in each invoice in U.S. Dollars, unless the SOW specifies a different currency, within the Payment Period (${paymentPeriod}).`,
    },
    {
      title: "4.3 Taxes",
      body: `Customer is responsible for all duties, taxes, and levies that apply to Fees, including sales, use, VAT, GST, or withholding, that Provider itemizes and includes in an invoice. However, Customer is not responsible for Provider's income taxes.`,
    },
    {
      title: "4.4 Payment Dispute",
      body: `If Customer has a good-faith disagreement about the amounts charged on an invoice, Customer must notify Provider about the dispute during the Payment Period (${paymentPeriod}) for the invoice and must pay all undisputed amounts on time. The parties will work together to resolve the dispute within 15 days after the end of the Payment Period. If no resolution is agreed, each party may pursue any remedies available under the Agreement, the applicable SOW, or Applicable Laws.`,
    },
    {
      title: "5.1 Term",
      body: `This Agreement will start on the Effective Date (${effectiveDate}) and continue until 12 months have elapsed since the end of the latest SOW Term (${sowTerm}) end date.`,
    },
    {
      title: "5.2 Termination",
      body: `a. Either party may terminate this Agreement or an SOW immediately if the other party (i) fails to cure a material breach of the Agreement or SOW within 30 days after receiving notice of the breach; (ii) materially breaches the Agreement or SOW in a manner that cannot be cured; (iii) dissolves or stops conducting business without a successor; (iv) makes an assignment for the benefit of creditors; or (v) becomes the debtor in insolvency, receivership, or bankruptcy proceedings that continue for more than 60 days.

b. Either party may terminate an affected SOW immediately if a Force Majeure Event prevents Provider from providing the Services for 30 or more consecutive days.

c. Either party may terminate this Agreement for any or no reason if there are no active SOWs.

d. A party must notify the other of its reason for termination.`,
    },
    {
      title: "5.3 Effect of Termination",
      body: `Upon any expiration or termination:

a. Termination of the Agreement pursuant to Section 5.2(a) or the Key Terms will automatically terminate all SOWs.

b. Provider will no longer have to provide the Services.

c. Each Recipient will return or destroy Discloser's Confidential Information in its possession or control.

d. Except where Customer terminates pursuant to Section 5.2(a), Provider will submit a final invoice for all outstanding Fees (${fees}) accrued before termination and Customer will pay the invoice according to Section 4 (Payment & Taxes).

e. Except where Provider terminates pursuant to Section 5.2(a), Provider will issue a refund for any unearned, prepaid Fees.`,
    },
    {
      title: "5.4 Survival",
      body: `a. The following sections will survive expiration or termination of the Agreement: Section 2.1 (Deliverables), Section 2.3 (Pre-Existing Materials), Section 2.5 (Feedback and Usage Data), Section 2.6 (Reservation of Rights), Section 4 (Payment & Taxes) for fees accrued or payable before expiration or termination, Section 5.3 (Effect of Termination), Section 5.4 (Survival), Section 6 (Representations & Warranties), Section 7 (Disclaimer of Warranties), Section 8 (Limitation of Liability), Section 9 (Indemnification), Section 10 (Insurance) for the time period specified, Section 11 (Confidentiality), Section 12 (General Terms), Section 13 (Definitions), and the portions of a Cover Page referenced by these sections.

b. Each Recipient may retain Discloser's Confidential Information in accordance with its standard backup or record retention policies maintained in the ordinary course of business or as required by Applicable Laws, in which case Section 3 (Privacy & Security) and Section 11 (Confidentiality) will continue to apply to retained Confidential Information.`,
    },
    {
      title: "6.1 Mutual",
      body: `Each party represents and warrants to the other that: (a) it has the legal power and authority to enter into this Agreement; (b) it is duly organized, validly existing, and in good standing under the Applicable Laws of the jurisdiction of its origin; (c) it will comply with all Applicable Laws in performing its obligations or exercising its rights in this Agreement; and (d) it will comply with the Additional Warranties, if any (${additionalWarranties}).`,
    },
    {
      title: "6.2 From Customer",
      body: `Customer represents and warrants to Provider that (a) Provider's use of Customer Materials and Customer-procured Third-Party Materials under this Agreement does not and will not infringe or misappropriate anyone else's copyright, trademark, trade secret, or right of publicity; and (b) it has all rights necessary to provide Customer Materials and Customer-procured Third-Party Materials under Section 2.`,
    },
    {
      title: "6.3 From Provider",
      body: `Provider represents and warrants to Customer that: (a) it will perform the Services in a timely, competent, and professional manner; (b) the Deliverables (if any, however excluding Customer Materials and Customer-procured Third-Party Materials) do not and will not infringe or misappropriate anyone else's copyright, trademark, trade secret, or right of publicity; (c) the Deliverables (if any) will conform to the requirements in the SOW; and (d) it has all rights necessary to perform the Services and convey the Deliverables (if any, however excluding Customer Materials and Customer-procured Third-Party Materials) under Section 2 (Intellectual Property).`,
    },
    {
      title: "6.4 Warranty Remedy",
      body: `If Provider breaches the warranty in Section 6.3(c), Customer must give Provider notice (with enough detail for Provider to understand or replicate the issue) within 45 days of discovering the issue. Within 45 days of receiving sufficient details of the warranty issue, Provider will reperform the Services. If Provider cannot resolve the issue, Customer may terminate the affected SOW and Provider will pay to Customer a prorated refund of prepaid Fees for the remainder of the SOW Term (${sowTerm}). Provider's reperformance obligations and Customer's termination right are Customer's only remedies if Provider does not meet the warranty in Section 6.3(c).`,
    },
    {
      title: "7. Disclaimer of Warranties",
      body: `Except for the warranties in Section 6 (Representations & Warranties), Provider and Customer each disclaim all other warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. These disclaimers apply to the maximum extent permitted by Applicable Laws.`,
    },
    {
      title: "8.1 Liability Caps",
      body: `If there are Increased Claims, each party's total cumulative liability for the Increased Claims arising out of or relating to this Agreement will not be more than the Increased Cap Amount (${increasedCapAmount}). Each party's total cumulative liability for all other claims arising out of or relating to this Agreement will not be more than the General Cap Amount (${generalCapAmount}).`,
    },
    {
      title: "8.2 Damages Waiver",
      body: `Each party's liability for any claim or liability arising out of or relating to this Agreement will be limited to the fullest extent permitted by Applicable Laws. Under no circumstances will either party be liable to the other for lost profits or revenues, or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement, even if the party is informed of the possibility of this type of damage in advance.`,
    },
    {
      title: "8.3 Exceptions",
      body: `The liability caps in Section 8.1 do not apply to any Unlimited Claims. The damages waiver in Section 8.2 does not apply to any Increased Claims or a breach of Section 11 (Confidentiality).`,
    },
    {
      title: "9.1 Protection by Provider",
      body: `Provider will indemnify, defend, and hold harmless Customer from and against all Provider Covered Claims made by someone other than Customer or its Affiliates, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys' fees and other legal expenses, that arise from the Provider Covered Claim.`,
    },
    {
      title: "9.2 Protection by Customer",
      body: `Customer will indemnify, defend, and hold harmless Provider from and against all Customer Covered Claims made by someone other than Provider or its Affiliates, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys' fees and other legal expenses, that arise from the Customer Covered Claim.`,
    },
    {
      title: "9.3 Procedure",
      body: `The Indemnifying Party's obligations in this section are contingent upon the Protected Party: (a) promptly notifying the Indemnifying Party of each Covered Claim for which it seeks protection; (b) providing reasonable assistance to the Indemnifying Party at the Indemnifying Party's expense; and (c) giving the Indemnifying Party sole control over the defense and settlement of each Covered Claim. A Protected Party may participate in a Covered Claim for which it seeks protection with its own attorneys only at its own expense. The Indemnifying Party may not agree to any settlement of a Covered Claim that contains an admission of fault or otherwise materially and adversely impacts the Protected Party without the prior written consent of the Protected Party.`,
    },
    {
      title: "9.4 Exclusive Remedy",
      body: `This Section 9 (Indemnification) describes each Protected Party's exclusive remedy and each Indemnifying Party's entire liability for a Covered Claim.`,
    },
    {
      title: "10. Insurance",
      body: `During the term of the Agreement and for six months after, each party will carry commercial insurance policies with coverage limits that meet the relevant Insurance Minimums (${insuranceMinimums}) required in the SOW, if any. Upon request, each party will give the other a certificate of insurance evidencing its insurance policies that meet the required Insurance Minimums. A party's insurance policies will not be considered as evidence of its liability. Insurance coverage will be on a date of occurrence form and waive rights of subrogation or crossclaim.`,
    },
    {
      title: "11.1 Non-Use and Non-Disclosure",
      body: `Unless otherwise authorized in the Agreement, Recipient will (a) only use Discloser's Confidential Information to fulfill its obligations or exercise its rights under this Agreement; and (b) not disclose Discloser's Confidential Information to anyone else. In addition, Recipient will protect Discloser's Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.`,
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
      body: `This Agreement is the only agreement between the parties about its subject and this Agreement supersedes all prior or contemporaneous statements (whether in writing or not) about its subject. Provider expressly rejects any terms included in Customer's purchase order or similar document, which may only be used for accounting or administrative purposes.`,
    },
    {
      title: "12.2 Modifications, Severability, and Waiver",
      body: `Any waiver, modification, or change to the Agreement must be in writing and signed or electronically accepted by each party. However, this does not limit Provider's or Customer's ability to update an SOW by following the Change Order procedures. If any term of this Agreement is determined to be invalid or unenforceable by a relevant court or governing body, the remaining terms of this Agreement will remain in full force and effect. The failure of a party to enforce a term or to exercise an option or right in this Agreement will not constitute a waiver by that party of the term, option, or right.`,
    },
    {
      title: "12.3 Governing Law and Chosen Courts",
      body: `The laws of the State of ${governingLaw} will govern all interpretations and disputes about this Agreement, without regard to its conflict of laws provisions. The parties will bring any legal suit, action, or proceeding about this Agreement or an SOW in the federal or state courts located in ${chosenCourts}, and each party irrevocably submits to the exclusive jurisdiction of such courts.`,
    },
    {
      title: "12.4 Injunctive Relief",
      body: `Despite Section 12.3 (Governing Law and Chosen Courts), a breach of Section 11 (Confidentiality) or the violation of a party's intellectual property rights may cause irreparable harm for which monetary damages cannot adequately compensate. As a result, upon the actual or threatened breach of Section 11 (Confidentiality) or violation of a party's intellectual property rights, the non-breaching or non-violating party may seek appropriate equitable relief, including an injunction, in any court of competent jurisdiction without the need to post a bond and without limiting its other rights or remedies.`,
    },
    {
      title: "12.5 Non-Exhaustive Remedies",
      body: `Except where the Agreement provides for an exclusive remedy, seeking or exercising a remedy does not limit the other rights or remedies available to a party.`,
    },
    {
      title: "12.6 Assignment",
      body: `Neither party may assign any rights or obligations under this Agreement or any SOW without the prior written consent of the other party. However, Customer may assign this Agreement upon notice if Customer undergoes a merger, change of control, reorganization, or sale of all or substantially all its equity, business, or assets to which this Agreement relates. Any attempted but non-permitted assignment is void. This Agreement will be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    },
    {
      title: "12.7 No Publicity",
      body: `Neither party may publicly announce the existence of this Agreement or any SOW without the prior written approval of the other party.`,
    },
    {
      title: "12.8 Notices",
      body: `Any notice, request, or approval about the Agreement must be in writing and sent to the Notice Address. Notices will be deemed given (a) upon confirmed delivery if by email, registered or certified mail, or personal delivery; or (b) two days after mailing if by overnight commercial delivery.`,
    },
    {
      title: "12.9 Independent Contractors",
      body: `The parties are independent contractors, not agents, partners, or joint venturers. Neither party is authorized to bind the other to any liability or obligation.`,
    },
    {
      title: "12.10 No Third-Party Beneficiary",
      body: `There are no third-party beneficiaries of this Agreement.`,
    },
    {
      title: "12.11 Force Majeure",
      body: `Neither party will be liable for a delay or failure to perform its obligations of this Agreement if caused by a Force Majeure Event. However, this section does not excuse Customer's obligations to pay Fees (${fees}).`,
    },
    {
      title: "12.12 Export Controls",
      body: `Customer may not remove or export from the United States or allow the export or re-export of the Service, Deliverables, or any related technology or materials in violation of any restrictions, laws, or regulations of the United States Department of Commerce, the United States Department of Treasury Office of Foreign Assets Control, or any other United States or foreign agency or authority.`,
    },
    {
      title: "12.13 Anti-Bribery",
      body: `Neither party will take any action that would be a violation of any Applicable Laws that prohibit the offering, giving, promising to offer or give, or receiving, directly or indirectly, money or anything of value to any third party to assist Provider or Customer in retaining or obtaining business. Examples of these kinds of laws include the U.S. Foreign Corrupt Practices Act and the UK Bribery Act 2010.`,
    },
    {
      title: "12.14 Titles and Interpretation",
      body: `Section titles are for convenience and reference only. All uses of "including" and similar phrases are non-exhaustive and without limitation.`,
    },
    {
      title: "12.15 Signature",
      body: `This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism. Each copy will be deemed an original and all copies, when taken together, will be the same agreement.`,
    },
    {
      title: "13. Definitions",
      body: `"Affiliate" means an entity that, directly or indirectly, controls, is under the control of, or is under common control with a party, where control means having more than fifty percent (50%) of the voting stock or other ownership interest.

"Agreement" means these Standard Terms, the Key Terms between Provider and Customer, and the policies and documents referenced in or attached to the Key Terms.

"Applicable Laws" means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority.

"Change Order" means a document that identifies the SOW being changed, describes what the parties are changing, and is approved by an authorized representative of each party.

"Confidential Information" means information in any form disclosed by or on behalf of a Discloser, including before the Effective Date (${effectiveDate}), to a Recipient in connection with this Agreement that (a) the Discloser identifies as "confidential", "proprietary", or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure. Confidential Information includes the existence of this Agreement and the information on each Cover Page.

"Cover Page" means a document that is signed or electronically accepted by the parties that incorporates these Standard Terms, identifies Provider and Customer, and may include a SOW, Key Terms, or both.

"Covered Claim" means either a Provider Covered Claim or Customer Covered Claim.

"Customer Materials" means data, information, or materials owned or provided by or on behalf of Customer for use with the Services, but excludes Feedback and Customer-procured Third-Party Materials.

"Discloser" means a party to this Agreement when the party is providing or disclosing Confidential Information to the other party.

"Feedback" means suggestions, feedback, or comments about the Services or related offerings.

"Force Majeure Event" means an unforeseen event outside a party's reasonable control where the affected party took reasonable measures to avoid or mitigate the impacts of the event. Examples of these kinds of events include unpredicted natural disaster like a major earthquake, war, pandemic, riot, act of terrorism, or public utility or internet failure.

"Indemnifying Party" means a party to this Agreement when the party is providing protection for a particular Covered Claim.

"Key Terms" means a Cover Page that includes the key legal details and definitions for this Agreement that are not defined in the SOW or Standard Terms. The Key Terms may include details about Covered Claims, set the Governing Law (the laws of the State of ${governingLaw}), or contain other legal details about this Agreement.

"Pre-Existing Materials" means any information, tools, materials, or intellectual property that Provider developed or owned before the Effective Date (${effectiveDate}) or developed after the Effective Date that are independent from or outside the scope of the Agreement, and any derivatives of these items that are not unique to Customer or that have generally applicable use and do not incorporate or disclose any Customer Confidential Information.

"Protected Party" means a party to this Agreement when the party is receiving the benefit of protection for a particular Covered Claim.

"Recipient" means a party to this Agreement when the party receives Confidential Information from the other party.

"Services" means the services described in a SOW, including the creation of Deliverables (if any).

"SOW" means a Cover Page that includes the key business details and definitions for this Agreement that are not defined in the Key Terms or Standard Terms. A SOW may include details about the Deliverables (${deliverablesDescription}), Fees (${fees}), or other details about the Services.

"Subcontractors" means other people or companies engaged by Provider to perform some of the Services, including Provider's Affiliates.

"Third-Party Materials" means any information, tools, materials, or intellectual property owned by anyone other than Provider, its Affiliates, or Customer.

"Usage Data" means data and information about the provision, use, and performance of the Services based on Customer's use of the Services.`,
    },
  ];
}

const content: DocumentContent<PsaFields> = {
  documentType: "psa",
  title: "Professional Services Agreement",
  pdfFilename: "Professional-Services-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    customer: readGroup(raw, "customer", defaultFields.customer),
    effectiveDate: asString(raw.effectiveDate, defaultFields.effectiveDate),
    customerPolicies: asString(raw.customerPolicies, defaultFields.customerPolicies),
    sowTerm: asString(raw.sowTerm, defaultFields.sowTerm),
    deliverablesDescription: asString(raw.deliverablesDescription, defaultFields.deliverablesDescription),
    reviewPeriodDays: asInt(raw.reviewPeriodDays, defaultFields.reviewPeriodDays),
    customerObligations: asString(raw.customerObligations, defaultFields.customerObligations),
    timeOfAssignment: asEnum(
      raw.timeOfAssignment,
      ["upon-delivery", "upon-full-payment"] as const,
      defaultFields.timeOfAssignment,
    ),
    fees: asString(raw.fees, defaultFields.fees),
    paymentPeriodDays: asInt(raw.paymentPeriodDays, defaultFields.paymentPeriodDays),
    generalCapAmount: asString(raw.generalCapAmount, defaultFields.generalCapAmount),
    increasedCapAmount: asString(raw.increasedCapAmount, defaultFields.increasedCapAmount),
    additionalWarranties: asString(raw.additionalWarranties, defaultFields.additionalWarranties),
    dpaReference: asString(raw.dpaReference, defaultFields.dpaReference),
    insuranceMinimums: asString(raw.insuranceMinimums, defaultFields.insuranceMinimums),
    governingLaw: asString(raw.governingLaw, defaultFields.governingLaw),
    chosenCourts: asString(raw.chosenCourts, defaultFields.chosenCourts),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
