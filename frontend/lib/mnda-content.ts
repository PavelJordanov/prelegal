export type MndaTermOption = "expires" | "continues";
export type ConfidentialityTermOption = "years" | "perpetuity";

export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export interface MndaFormData {
  party1: PartyDetails;
  party2: PartyDetails;
  purpose: string;
  effectiveDate: string;
  mndaTerm: MndaTermOption;
  mndaTermYears: number;
  confidentialityTerm: ConfidentialityTermOption;
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
}

const emptyParty: PartyDetails = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
};

function todayAsLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const defaultMndaFormData: MndaFormData = {
  party1: { ...emptyParty },
  party2: { ...emptyParty },
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: todayAsLocalIsoDate(),
  mndaTerm: "expires",
  mndaTermYears: 1,
  confidentialityTerm: "years",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
};

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "[Today's date]";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function mndaTermDisplay(data: MndaFormData): string {
  return data.mndaTerm === "expires"
    ? `${data.mndaTermYears} year(s) from the Effective Date`
    : "the date this MNDA is terminated in accordance with its terms";
}

export function confidentialityTermDisplay(data: MndaFormData): string {
  return data.confidentialityTerm === "years"
    ? `${data.confidentialityTermYears} year(s) from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable laws`
    : "In perpetuity";
}

// Same underlying term as confidentialityTermDisplay, phrased as a clause
// that reads correctly after "will survive ..." (avoids "survive for in
// perpetuity" when the user selects the perpetuity option).
export function confidentialityTermClause(data: MndaFormData): string {
  return data.confidentialityTerm === "years"
    ? `for ${confidentialityTermDisplay(data)}`
    : "in perpetuity";
}

// Standard Terms text, derived from templates/Mutual-NDA.md. Placeholders
// (e.g. {{purpose}}) mark the values that come from the Cover Page and are
// substituted with the user's filled-in values before display/PDF export.
export const standardTermsSections: { title: string; body: string }[] = [
  {
    title: "1. Introduction",
    body: `This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) (“MNDA”) allows each party (“Disclosing Party”) to disclose or make available information in connection with the {{purpose}} which (1) the Disclosing Party identifies to the receiving party (“Receiving Party”) as “confidential”, “proprietary”, or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure (“Confidential Information”). Each party’s Confidential Information also includes the existence and status of the parties’ discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms (“Cover Page”). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.`,
  },
  {
    title: "2. Use and Protection of Confidential Information",
    body: `The Receiving Party shall: (a) use Confidential Information solely for the {{purpose}}; (b) not disclose Confidential Information to third parties without the Disclosing Party’s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the {{purpose}}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.`,
  },
  {
    title: "3. Exceptions",
    body: `The Receiving Party’s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.`,
  },
  {
    title: "4. Disclosures Required by Law",
    body: `The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party’s expense, with the Disclosing Party’s efforts to obtain confidential treatment for the Confidential Information.`,
  },
  {
    title: "5. Term and Termination",
    body: `This MNDA commences on the {{effectiveDate}} and expires at the end of {{mndaTerm}}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party’s obligations relating to Confidential Information will survive {{confidentialityTermClause}}, despite any expiration or termination of this MNDA.`,
  },
  {
    title: "6. Return or Destruction of Confidential Information",
    body: `Upon expiration or termination of this MNDA or upon the Disclosing Party’s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party’s written request, destroy all Confidential Information in the Receiving Party’s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.`,
  },
  {
    title: "7. Proprietary Rights",
    body: `The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.`,
  },
  {
    title: "8. Disclaimer",
    body: `ALL CONFIDENTIAL INFORMATION IS PROVIDED “AS IS”, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`,
  },
  {
    title: "9. Governing Law and Jurisdiction",
    body: `This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of {{governingLaw}}, without regard to the conflict of laws provisions of such {{governingLaw}}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in {{jurisdiction}}. Each party irrevocably submits to the exclusive jurisdiction of such {{jurisdiction}} in any such suit, action, or proceeding.`,
  },
  {
    title: "10. Equitable Relief",
    body: `A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.`,
  },
  {
    title: "11. General",
    body: `Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party’s permitted successors and assigns. Waivers must be signed by the waiving party’s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.`,
  },
];

const governingLawFallback = "[Fill in state]";
const jurisdictionFallback = "[Fill in city or county and state]";

export function fillPlaceholders(text: string, data: MndaFormData): string {
  return text
    .replaceAll("{{purpose}}", data.purpose || "[Purpose not specified]")
    .replaceAll("{{effectiveDate}}", formatDisplayDate(data.effectiveDate))
    .replaceAll("{{mndaTerm}}", mndaTermDisplay(data))
    .replaceAll("{{confidentialityTermClause}}", confidentialityTermClause(data))
    .replaceAll("{{governingLaw}}", data.governingLaw || governingLawFallback)
    .replaceAll("{{jurisdiction}}", data.jurisdiction || jurisdictionFallback);
}

export const partyFieldConfig: {
  key: keyof PartyDetails;
  label: string;
  placeholder: string;
}[] = [
  { key: "name", label: "Name", placeholder: "[Name]" },
  { key: "title", label: "Title", placeholder: "[Title]" },
  { key: "company", label: "Company", placeholder: "[Company]" },
  { key: "noticeAddress", label: "Notice Address", placeholder: "[Notice Address]" },
];

export function coverPageSummary(data: MndaFormData): { label: string; value: string }[] {
  return [
    { label: "Purpose", value: data.purpose || "[Purpose not specified]" },
    { label: "Effective Date", value: formatDisplayDate(data.effectiveDate) },
    { label: "MNDA Term", value: mndaTermDisplay(data) },
    { label: "Term of Confidentiality", value: confidentialityTermDisplay(data) },
    { label: "Governing Law", value: data.governingLaw || governingLawFallback },
    { label: "Jurisdiction", value: data.jurisdiction || jurisdictionFallback },
  ];
}
