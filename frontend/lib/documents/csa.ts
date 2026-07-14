import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import {
  DEFAULT_PARTY_FIELD_CONFIG,
  asString,
  formatDisplayDate,
  readGroup,
  todayAsLocalIsoDate,
} from "@/lib/documents/hydrate-utils";

export interface CsaFields {
  provider: PartyDetails;
  customer: PartyDetails;
  subscriptionPeriod: string;
  orderDate: string;
  nonRenewalNoticeDate: string;
  paymentProcess: string;
  feesDescription: string;
  technicalSupport: string;
  useLimitations: string;
  dpaReference: string;
  generalCapAmount: string;
  increasedCapAmount: string;
  additionalWarranties: string;
  governingLaw: string;
  chosenCourts: string;
}

const emptyParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

const orderDateFallback = "[Fill in Order Date]";

const defaultFields: CsaFields = {
  provider: { ...emptyParty },
  customer: { ...emptyParty },
  subscriptionPeriod: "",
  orderDate: todayAsLocalIsoDate(),
  nonRenewalNoticeDate: "60 days before the end of the then-current Subscription Period.",
  paymentProcess: "",
  feesDescription: "",
  technicalSupport: "Email support during Provider's standard business hours, with a response within one business day.",
  useLimitations: "None.",
  dpaReference: "No separate Data Processing Agreement is in place.",
  generalCapAmount: "",
  increasedCapAmount: "",
  additionalWarranties: "None.",
  governingLaw: "",
  chosenCourts: "",
};

function summarySections(data: CsaFields): FieldSummaryItem[] {
  return [
    { label: "Subscription Period", value: data.subscriptionPeriod || "[Fill in Subscription Period]" },
    { label: "Order Date", value: formatDisplayDate(data.orderDate, orderDateFallback) },
    { label: "Non-Renewal Notice Date", value: data.nonRenewalNoticeDate || "[Fill in Non-Renewal Notice Date]" },
    { label: "Payment Process", value: data.paymentProcess || "[Fill in Payment Process]" },
    { label: "Fees", value: data.feesDescription || "[Fill in Fees]" },
    { label: "Technical Support", value: data.technicalSupport || "[Fill in Technical Support]" },
    { label: "Use Limitations", value: data.useLimitations || "[Fill in Use Limitations]" },
    { label: "Data Processing Agreement", value: data.dpaReference || "[Fill in Data Processing Agreement]" },
    { label: "General Cap Amount", value: data.generalCapAmount || "[Fill in General Cap Amount]" },
    { label: "Increased Cap Amount", value: data.increasedCapAmount || "[Fill in Increased Cap Amount]" },
    { label: "Additional Warranties", value: data.additionalWarranties || "[Fill in Additional Warranties]" },
    { label: "Governing Law", value: data.governingLaw || "[Fill in Governing Law]" },
    { label: "Chosen Courts", value: data.chosenCourts || "[Fill in Chosen Courts]" },
  ];
}

function parties(data: CsaFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
    { label: "Customer", data: data.customer, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/CSA.md with the Order
// Form / Key Terms variables substituted directly (no {{placeholder}}
// tokens). "Provider" and "Customer" are left as literal role names in the
// body text, matching how mutual-nda.ts leaves "Disclosing Party" /
// "Receiving Party" literal - only the actual fill-in variables (Subscription
// Period, Payment Process, cap amounts, etc.) are substituted with the
// current field values or a bracketed fallback when empty.
function bodySections(data: CsaFields): DocumentSection[] {
  const subscriptionPeriod = data.subscriptionPeriod || "[Fill in Subscription Period]";
  const orderDateDisplay = formatDisplayDate(data.orderDate, orderDateFallback);
  const nonRenewalNoticeDate = data.nonRenewalNoticeDate || "[Fill in Non-Renewal Notice Date]";
  const paymentProcess = data.paymentProcess || "[Fill in Payment Process]";
  const feesDescription = data.feesDescription || "[Fill in Fees]";
  const technicalSupport = data.technicalSupport || "[Fill in Technical Support]";
  const useLimitations = data.useLimitations || "[Fill in Use Limitations]";
  const dpaReference = data.dpaReference || "[Fill in Data Processing Agreement]";
  const generalCapAmount = data.generalCapAmount || "[Fill in General Cap Amount]";
  const increasedCapAmount = data.increasedCapAmount || "[Fill in Increased Cap Amount]";
  const additionalWarranties = data.additionalWarranties || "[Fill in Additional Warranties]";
  const governingLaw = data.governingLaw || "[Fill in Governing Law]";
  const chosenCourts = data.chosenCourts || "[Fill in Chosen Courts]";

  return [
    {
      title: "1.1 Access and Use",
      body: `During the ${subscriptionPeriod} and subject to the terms of this Agreement, Customer may (a) access and use the Cloud Service; and (b) copy and use the included Software and Documentation only as needed to access and use the Cloud Service, in each case, for its internal business purposes. If a Customer Affiliate enters a separate Order Form with Provider, the Customer’s Affiliate creates a separate agreement between Provider and that Affiliate, where Provider’s responsibility to the Affiliate is individual and separate from Customer and Customer is not responsible for its Affiliates’ agreement.`,
    },
    {
      title: "1.2 Support",
      body: `During the ${subscriptionPeriod}, Provider will provide the following Technical Support: ${technicalSupport}`,
    },
    {
      title: "1.3 User Accounts",
      body: `Customer is responsible for all actions on Users’ accounts and for all Users’ compliance with this Agreement. Customer and Users must protect the confidentiality of their passwords and login credentials. Customer will promptly notify Provider if it suspects or knows of any fraudulent activity with its accounts, passwords, or credentials, or if they become compromised.`,
    },
    {
      title: "1.4 Feedback and Usage Data",
      body: `Customer may, but is not required to, give Provider Feedback, in which case Customer gives Feedback “AS IS”. Provider may use all Feedback freely without any restriction or obligation. In addition, Provider may collect and analyze Usage Data, and Provider may freely use Usage Data to maintain, improve, enhance, and promote Provider’s products and services without restriction or obligation. However, Provider may only disclose Usage Data to others if the Usage Data is aggregated and does not identify Customer or Users.`,
    },
    {
      title: "1.5 Customer Content",
      body: `Provider may copy, display, modify, and use Customer Content only as needed to provide and maintain the Product and related offerings. Customer is responsible for the accuracy and content of Customer Content.`,
    },
    {
      title: "1.6 Machine Learning",
      body: `Usage Data and Customer Content may be used to develop, train, or enhance artificial intelligence or machine learning models that are part of Provider’s products and services, including third-party components of the Product, and Customer authorizes Provider to process its Usage Data and Customer Content for such purposes. However, (a) Usage Data and Customer Content must be aggregated before it can be used for these purposes, and (b) Provider will use commercially reasonable efforts consistent with industry standard technology to de-identify Usage Data and Customer Content before such use. Nothing in this section will reduce or limit Provider’s obligations regarding Personal Data that may be contained in Usage Data or Customer Content under Applicable Data Protection Laws. Due to the nature of artificial intelligence and machine learning, information generated by these features may be incorrect or inaccurate. Product features that include artificial intelligence or machine learning models are not human and are not a substitute for human oversight.`,
    },
    {
      title: "2.1 Restrictions on Customer",
      body: `a. Except as expressly permitted by this Agreement, Customer will not (and will not allow anyone else to): (i) reverse engineer, decompile, or attempt to discover any source code or underlying ideas or algorithms of the Product (except to the extent Applicable Laws prohibit this restriction); (ii) provide, sell, transfer, sublicense, lend, distribute, rent, or otherwise allow others to access or use the Product; (iii) remove any proprietary notices or labels; (iv) copy, modify, or create derivative works of the Product; (v) conduct security or vulnerability tests on, interfere with the operation of, cause performance degradation of, or circumvent access restrictions of the Product; (vi) access accounts, information, data, or portions of the Product to which Customer does not have explicit authorization; (vii) use the Product to develop a competing service or product; (viii) use the Product with any High Risk Activities or with any activity prohibited by Applicable Laws; (ix) use the Product to obtain unauthorized access to anyone else’s networks or equipment; or (x) upload, submit, or otherwise make available to the Product any Customer Content to which Customer and Users do not have the proper rights.\n\nb. Use of the Product must comply with all Documentation and the following Use Limitations: ${useLimitations}`,
    },
    {
      title: "2.2 Suspension",
      body: `If Customer (a) has an outstanding, undisputed balance on its account for more than 30 days; (b) breaches Section 2.1 (Restrictions on Customer); or (c) uses the Product in violation of the Agreement or in a way that materially and negatively impacts the Product or others, then Provider may temporarily suspend Customer’s access to the Product with or without notice. However, Provider will try to inform Customer before suspending Customer’s account when practical. Provider will reinstate Customer’s access to the Product only if Customer resolves the underlying issue.`,
    },
    {
      title: "3.1 Personal Data",
      body: `Before submitting Personal Data governed by GDPR, Customer must enter into a data processing agreement with Provider. Data Processing Agreement: ${dpaReference} If the parties have a DPA, each party will comply with its obligations in the DPA, the terms of the DPA will control each party’s rights and obligations as to Personal Data, and the terms of the DPA will control in the event of any conflict with this Agreement.`,
    },
    {
      title: "3.2 Prohibited Data",
      body: `Customer will not (and will not allow anyone else to) submit Prohibited Data to the Product unless authorized by the Order Form or Key Terms.`,
    },
    {
      title: "4.1 Fees",
      body: `The Fees for this Order Form are: ${feesDescription} Unless the Order Form specifies a different currency, all Fees are in U.S. Dollars and are exclusive of taxes. Except for the prorated refund of prepaid Fees allowed with specific termination rights given in the Agreement, Fees are non-refundable.`,
    },
    {
      title: "4.2 Invoicing",
      body: `For a Payment Process with invoicing, Provider will send invoices for usage-based Fees in arrears and for all other Fees in advance, in each case according to the following Payment Process: ${paymentProcess}`,
    },
    {
      title: "4.3 Automatic Payment",
      body: `For a Payment Process with automatic payment, Provider will automatically charge the credit card, debit card, or other payment method on file for Fees according to the Payment Process (${paymentProcess}) and Customer authorizes all such charges. In this case, Provider will make a copy of Customer’s bills or transaction history available to Customer.`,
    },
    {
      title: "4.4 Taxes",
      body: `Customer is responsible for all duties, taxes, and levies that apply to Fees, including sales, use, VAT, GST, or withholding, that Provider itemizes and includes in an invoice. However, Customer is not responsible for Provider’s income taxes.`,
    },
    {
      title: "4.5 Payment",
      body: `Customer will pay Provider Fees and taxes in U.S. Dollars, unless the Order Form specifies a different currency, according to the following Payment Process: ${paymentProcess}`,
    },
    {
      title: "4.6 Payment Dispute",
      body: `If Customer has a good-faith disagreement about the Fees charged or invoiced, Customer must notify Provider about the dispute before payment is due, or within 30 days of an automatic payment, and must pay all undisputed amounts on time. The parties will work together to resolve the dispute within 15 days. If no resolution is agreed, each party may pursue any remedies available under the Agreement or Applicable Laws.`,
    },
    {
      title: "5.1 Order Form and Agreement",
      body: `For each Order Form, the Agreement will start on the Order Date (${orderDateDisplay}), continue through the Subscription Period (${subscriptionPeriod}), and automatically renew for additional Subscription Periods unless one party gives notice of non-renewal to the other party before the Non-Renewal Notice Date: ${nonRenewalNoticeDate}`,
    },
    {
      title: "5.2 Framework Terms",
      body: `These Framework Terms will start on the Effective Date (${orderDateDisplay}) and continue for the longer of one year or until all Order Forms governed by the Framework Terms have ended.`,
    },
    {
      title: "5.3 Termination",
      body: `Either party may terminate the Framework Terms or an Order Form immediately:\n\na. if the other party fails to cure a material breach of the Framework Terms or an Order Form following 30 days notice;\n\nb. upon notice if the other party (i) materially breaches the Framework Terms or an Order Form in a manner that cannot be cured; (ii) dissolves or stops conducting business without a successor; (iii) makes an assignment for the benefit of creditors; or (iv) becomes the debtor in insolvency, receivership, or bankruptcy proceedings that continue for more than 60 days.`,
    },
    {
      title: "5.4 Force Majeure",
      body: `Either party may terminate an affected Order Form upon notice if a Force Majeure Event prevents the Product from materially operating for 30 or more consecutive days. Provider will pay to Customer a prorated refund of any prepaid Fees for the remainder of the Subscription Period (${subscriptionPeriod}). A Force Majeure Event does not excuse Customer’s obligation to pay Fees accrued prior to termination.`,
    },
    {
      title: "5.5 Effect of Termination",
      body: `Termination of the Framework Terms will automatically terminate all Order Forms governed by the Framework Terms. Upon any expiration or termination:\n\na. Customer will no longer have any right to use the Product.\n\nb. Upon Customer’s request, Provider will delete Customer Content within 60 days.\n\nc. Each Recipient will return or destroy Discloser’s Confidential Information in its possession or control.\n\nd. Provider will submit a final bill or invoice for all outstanding Fees accrued before termination and Customer will pay the invoice according to Section 4 (Payment & Taxes).`,
    },
    {
      title: "5.6 Survival",
      body: `a. The following sections will survive expiration or termination of the Agreement: Section 1.4 (Feedback and Usage Data), Section 1.6 (Machine Learning), Section 2.1 (Restrictions on Customer), Section 4 (Payment & Taxes) for Fees accrued or payable before expiration or termination, Section 5.5 (Effect of Termination), Section 5.6 (Survival), Section 6 (Representations & Warranties), Section 7 (Disclaimer of Warranties), Section 8 (Limitation of Liability), Section 9 (Indemnification), Section 10 (Confidentiality), Section 11 (Reservation of Rights), Section 12 (General Terms), Section 13 (Definitions), and the portions of a Cover Page referenced by these sections.\n\nb. Each Recipient may retain Discloser’s Confidential Information in accordance with its standard backup or record retention policies maintained in the ordinary course of business or as required by Applicable Laws, in which case Section 3 (Privacy & Security) and Section 10 (Confidentiality) will continue to apply to retained Confidential Information.`,
    },
    {
      title: "6.1 Mutual Representations and Warranties",
      body: `Each party represents and warrants to the other that: (a) it has the legal power and authority to enter into this Agreement; (b) it is duly organized, validly existing, and in good standing under the Applicable Laws of the jurisdiction of its origin; (c) it will comply with all Applicable Laws in performing its obligations or exercising its rights in this Agreement; and (d) it will comply with the following Additional Warranties: ${additionalWarranties}`,
    },
    {
      title: "6.2 Representations and Warranties From Customer",
      body: `Customer represents and warrants that it, all Users, and anyone submitting Customer Content each have and will continue to have all rights necessary to submit or make available Customer Content to the Product and to allow the use of Customer Content as described in the Agreement.`,
    },
    {
      title: "6.3 Representations and Warranties From Provider",
      body: `Provider represents and warrants to Customer that it will not materially reduce the general functionality of the Cloud Service during the Subscription Period (${subscriptionPeriod}).`,
    },
    {
      title: "6.4 Provider Warranty Remedy",
      body: `If Provider breaches the warranty in Section 6.3 (Representations & Warranties from Provider), Customer must give Provider notice (with enough detail for Provider to understand or replicate the issue) within 45 days of discovering the issue. Within 45 days of receiving sufficient details of the warranty issue, Provider will attempt to restore the general functionality of the Cloud Service. If Provider cannot resolve the issue, Customer may terminate the affected Order Form and Provider will pay to Customer a prorated refund of prepaid Fees for the remainder of the Subscription Period (${subscriptionPeriod}). Provider’s restoration obligation, and Customer’s termination right, are Customer’s only remedies if Provider does not meet the warranty in Section 6.3 (Representations & Warranties from Provider).`,
    },
    {
      title: "7. Disclaimer of Warranties",
      body: `Provider makes no guarantees that the Product will always be safe, secure, or error-free, or that it will function without disruptions, delays, or imperfections. The warranties in Section 6 (Representations & Warranties) do not apply to any misuse or unauthorized modification of the Product, nor to any product or service provided by anyone other than Provider. Except for the warranties in Section 6 (Representations & Warranties), Provider and Customer each disclaim all other warranties and conditions, whether express or implied, including the implied warranties and conditions of merchantability, fitness for a particular purpose, title, and non-infringement. These disclaimers apply to the maximum extent permitted by Applicable Laws.`,
    },
    {
      title: "8.1 Liability Caps",
      body: `a. Except as provided in Section 8.4 (Exceptions), each party’s total cumulative liability for all claims arising out of or relating to this Agreement will not be more than the General Cap Amount: ${generalCapAmount}\n\nb. If there are Increased Claims, each party’s total cumulative liability for all Increased Claims arising out of or relating to this Agreement will not be more than the Increased Cap Amount: ${increasedCapAmount}`,
    },
    {
      title: "8.2 Damages Waiver",
      body: `Except as provided in Section 8.4 (Exceptions), under no circumstances will either party be liable to the other for lost profits or revenues (whether direct or indirect), or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement, even if the party is informed of the possibility of this type of damage in advance.`,
    },
    {
      title: "8.3 Applicability",
      body: `The limitations and waivers contained in Sections 8.1 (Liability Caps) and 8.2 (Damages Waiver) apply to all liability, whether in tort (including negligence), contract, breach of statutory duty, or otherwise.`,
    },
    {
      title: "8.4 Exceptions",
      body: `The liability cap in Section 8.1(a) does not apply to any Increased Claims. Section 8.1 (Liability Caps) does not apply to any Unlimited Claims. Section 8.2 (Damages Waiver) does not apply to any Increased Claims or a breach of Section 10 (Confidentiality). Nothing in this Agreement will limit, exclude, or restrict a party's liability to the extent prohibited by Applicable Laws.`,
    },
    {
      title: "9.1 Protection by Provider",
      body: `Provider will indemnify, defend, and hold harmless Customer from and against all Provider Covered Claims made by someone other than Customer, Customer’s Affiliates, or Users, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys’ fees and other legal expenses, that arise from the Provider Covered Claims.`,
    },
    {
      title: "9.2 Protection by Customer",
      body: `Customer will indemnify, defend, and hold harmless Provider from and against all Customer Covered Claims made by someone other than Provider or its Affiliates, and all out-of-pocket damages, awards, settlements, costs, and expenses, including reasonable attorneys’ fees and other legal expenses, that arise from the Customer Covered Claims.`,
    },
    {
      title: "9.3 Procedure",
      body: `The Indemnifying Party’s obligations in this section are contingent upon the Protected Party: (a) promptly notifying the Indemnifying Party of each Covered Claim for which it seeks protection; (b) providing reasonable assistance to the Indemnifying Party at the Indemnifying Party’s expense; and (c) giving the Indemnifying Party sole control over the defense and settlement of each Covered Claim. A Protected Party may participate in a Covered Claim for which it seeks protection with its own attorneys only at its own expense. The Indemnifying Party may not agree to any settlement of a Covered Claim that contains an admission of fault or otherwise materially and adversely impacts the Protected Party without the prior written consent of the Protected Party.`,
    },
    {
      title: "9.4 Changes to Product",
      body: `If required by settlement or court order, or if deemed reasonably necessary in response to a Provider Covered Claim, Provider may: (a) obtain the right for Customer to continue using the Product; (b) replace or modify the affected component of the Product without materially reducing the general functionality of the Product; or (c) if neither (a) nor (b) are reasonable, terminate the affected Order Form and issue a pro-rated refund of prepaid Fees for the remainder of the Subscription Period (${subscriptionPeriod}).`,
    },
    {
      title: "9.5 Exclusions",
      body: `a. Provider’s obligations as an Indemnifying Party will not apply to Provider Covered Claims that result from (i) modifications to the Product that were not authorized by Provider or that were made in compliance with Customer’s instructions; (ii) unauthorized use of the Product, including use in violation of this Agreement; (iii) use of the Product in combination with items not provided by Provider; or (iv) use of an old version of the Product where a newer release would avoid the Provider Covered Claim.\n\nb. Customer’s obligations as an Indemnifying Party will not apply to Customer Covered Claims that result from the unauthorized use of the Customer Content, including use in violation of this Agreement.`,
    },
    {
      title: "9.6 Exclusive Remedy",
      body: `This Section 9 (Indemnification), together with any termination rights, describes each Protected Party’s exclusive remedy and each Indemnifying Party’s entire liability for a Covered Claim.`,
    },
    {
      title: "10.1 Non-Use and Non-Disclosure",
      body: `Except as otherwise authorized in the Agreement or as needed to fulfill its obligations or exercise its rights under this Agreement, Recipient will not (a) use Discloser’s Confidential Information; nor (b) disclose Discloser’s Confidential Information to anyone else. In addition, Recipient will protect Discloser’s Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.`,
    },
    {
      title: "10.2 Exclusions",
      body: `Confidential Information does not include information that (a) Recipient knew without any obligation of confidentiality before disclosure by Discloser; (b) is or becomes publicly known and generally available through no fault of Recipient; (c) Recipient receives under no obligation of confidentiality from someone else who is authorized to make the disclosure; or (d) Recipient independently developed without use of or reference to Discloser’s Confidential Information.`,
    },
    {
      title: "10.3 Required Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to the extent required by Applicable Laws if, unless prohibited by Applicable Laws, Recipient provides Discloser reasonable advance notice of the required disclosure and reasonably cooperates, at Discloser’s expense, with Discloser’s efforts to obtain confidential treatment for the Confidential Information.`,
    },
    {
      title: "10.4 Permitted Disclosures",
      body: `Recipient may disclose Discloser’s Confidential Information to Users, employees, advisors, contractors, and representatives who each have a need to know the Confidential Information, but only if the person or entity is bound by confidentiality obligations at least as protective as those in this Section 10 (Confidentiality) and Recipient remains responsible for everyone’s compliance with the terms of this Section 10 (Confidentiality).`,
    },
    {
      title: "11. Reservation of Rights",
      body: `Except for the limited license to copy and use Software and Documentation in Section 1.1 (Access and Use), Provider retains all right, title, and interest in and to the Product, whether developed before or after the Effective Date (${orderDateDisplay}). Except for the limited rights in Section 1.5 (Customer Content) and 1.6 (Machine Learning), Customer retains all right, title, and interest in and to the Customer Content.`,
    },
    {
      title: "12.1 Entire Agreement",
      body: `This Agreement is the only agreement between the parties about its subject and this Agreement supersedes all prior or contemporaneous statements (whether in writing or not) about its subject. Provider expressly rejects any terms included in Customer’s purchase order or similar document, which may only be used for accounting or administrative purposes. No terms or conditions in any Customer documentation or online vendor portal will apply to Customer’s use of the Product unless expressly agreed to in a legally binding written agreement signed by an authorized Provider representative, regardless of what such terms may say.`,
    },
    {
      title: "12.2 Modifications, Severability, and Waiver",
      body: `Any waiver, modification, or change to the Agreement must be in writing and signed or electronically accepted by each party. If any term of this Agreement is determined to be invalid or unenforceable by a relevant court or governing body, the remaining terms of this Agreement will remain in full force and effect. The failure of a party to enforce a term or to exercise an option or right in this Agreement will not constitute a waiver by that party of the term, option, or right.`,
    },
    {
      title: "12.3 Governing Law and Chosen Courts",
      body: `The Governing Law will govern all interpretations and disputes about this Agreement, without regard to its conflict of laws provisions. The Governing Law is: ${governingLaw} The parties will bring any legal suit, action, or proceeding about this Agreement in the Chosen Courts and each party irrevocably submits to the exclusive jurisdiction of the Chosen Courts. The Chosen Courts are: ${chosenCourts}`,
    },
    {
      title: "12.4 Injunctive Relief",
      body: `Despite Section 12.3 (Governing Law and Chosen Courts), a breach of Section 10 (Confidentiality) or the violation of a party’s intellectual property rights may cause irreparable harm for which monetary damages cannot adequately compensate. As a result, upon the actual or threatened breach of Section 10 (Confidentiality) or violation of a party’s intellectual property rights, the non-breaching or non-violating party may seek appropriate equitable relief, including an injunction, in any court of competent jurisdiction without the need to post a bond and without limiting its other rights or remedies.`,
    },
    {
      title: "12.5 Non-Exhaustive Remedies",
      body: `Except where the Agreement provides for an exclusive remedy, seeking or exercising a remedy does not limit the other rights or remedies available to a party.`,
    },
    {
      title: "12.6 Assignment",
      body: `Neither party may assign any rights or obligations under this Agreement without the prior written consent of the other party. However, either party may assign this Agreement upon notice if the assigning party undergoes a merger, change of control, reorganization, or sale of all or substantially all its equity, business, or assets to which this Agreement relates. Any attempted but non-permitted assignment is void. This Agreement will be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    },
    {
      title: "12.7 Beta Products",
      body: `If Provider gives Customer access to a Beta Product, the Beta Product is provided “AS IS” and Section 6.3 (Representations & Warranty From Provider) does not apply to any Beta Products. Customer acknowledges that Beta Products are experimental in nature and may be modified or removed at Provider’s discretion with or without notice.`,
    },
    {
      title: "12.8 Logo Rights",
      body: `Provider may identify Customer and use Customer’s name and logo in marketing to identify Customer as a user of Provider’s products and services.`,
    },
    {
      title: "12.9 Notices",
      body: `Any notice, request, or approval about the Agreement must be in writing and sent to the Notice Address. Notices will be deemed given (a) upon confirmed delivery if by email, registered or certified mail, or personal delivery; or (b) two days after mailing if by overnight commercial delivery.`,
    },
    {
      title: "12.10 Independent Contractors",
      body: `The parties are independent contractors, not agents, partners, or joint venturers. Neither party is authorized to bind the other to any liability or obligation.`,
    },
    {
      title: "12.11 No Third-Party Beneficiary",
      body: `There are no third-party beneficiaries of this Agreement.`,
    },
    {
      title: "12.12 Force Majeure",
      body: `Neither party will be liable for a delay or failure to perform its obligations of this Agreement if caused by a Force Majeure Event. However, this section does not excuse Customer’s obligations to pay Fees.`,
    },
    {
      title: "12.13 Export Controls",
      body: `Customer may not remove or export from the United States or allow the export or re-export of the Product or any related technology or materials in violation of any restrictions, laws, or regulations of the United States Department of Commerce, OFAC, or any other United States or foreign agency or authority. Customer represents and warrants that it is not (a) a resident or national of an Embargoed Country; (b) an entity organized under the laws of an Embargoed Country; (c) designated on any list of prohibited, restricted, or sanctioned parties maintained by the U.S. government or agencies or other applicable governments or agencies, including OFAC’s Specially Designated Nationals and Blocked Persons List and the UN Security Council Consolidated List; nor (d) 50% or more owned by any party designated on any of the above lists. Provider may terminate this Agreement immediately without notice or liability to comply, as determined in Provider’s sole discretion, with applicable export controls and sanctions laws and regulations.`,
    },
    {
      title: "12.14 Government Rights",
      body: `The Cloud Service and Software are deemed “commercial items” or “commercial computer software” according to FAR section 12.212 and DFAR section 227.7202, and the Documentation is “commercial computer software documentation” according to DFAR section 252.227-7014(a)(1) and (5). Any use, modification, reproduction, release, performance, display, or disclosure of the Product by the U.S. Government will be governed solely by the terms of this Agreement and all other use is prohibited.`,
    },
    {
      title: "12.15 Anti-Bribery",
      body: `Neither party will take any action that would be a violation of any Applicable Laws that prohibit the offering, giving, promising to offer or give, or receiving, directly or indirectly, money or anything of value to any third party to assist Provider or Customer in retaining or obtaining business. Examples of these kinds of laws include the U.S. Foreign Corrupt Practices Act and the UK Bribery Act 2010.`,
    },
    {
      title: "12.16 Titles and Interpretation",
      body: `Section titles are for convenience and reference only. All uses of “including” and similar phrases are non-exhaustive and without limitation. The United Nations Convention for the International Sale of Goods and the Uniform Computer Information Transaction Act do not apply to this Agreement.`,
    },
    {
      title: "12.17 Signature",
      body: `This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism. Each copy will be deemed an original and all copies, when taken together, will be the same agreement.`,
    },
    {
      title: "13. Definitions",
      body: `Variables have the meanings or descriptions given on a Cover Page. However, if the Order Form and the governing Framework Terms omit or do not define a Variable, the default meaning will be “none” or “not applicable” and the correlating clause, sentence, or section does not apply to that Agreement.\n\n“Affiliate” means an entity that, directly or indirectly, controls, is under the control of, or is under common control with a party, where control means having more than fifty percent (50%) of the voting stock or other ownership interest.\n\n“Agreement” means the Order Form between Provider and Customer as governed by the Framework Terms.\n\n“Applicable Data Protection Laws” means the Applicable Laws that govern how the Cloud Service may process or use an individual’s personal information, personal data, personally identifiable information, or other similar term.\n\n“Applicable Laws” means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that apply to or govern Provider or Customer.\n\n“Beta Product” means an early or prerelease feature or version of the Product that is identified as beta or similar, or a version of the Product that is not generally available.\n\n“Cloud Service” means the product described in the Order Form.\n\n“Confidential Information” means information in any form disclosed by or on behalf of a Discloser, including before the Effective Date (${orderDateDisplay}), to a Recipient in connection with this Agreement that (a) the Discloser identifies as “confidential”, “proprietary”, or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure. Confidential Information includes the existence of this Agreement and the information on each Cover Page. Customer’s Confidential Information includes non-public Customer Content and Provider’s Confidential Information includes non-public information about the Product.\n\n“Cover Page” means a document that is signed or electronically accepted by the parties, incorporates these Standard Terms or is governed by the Framework Terms, and identifies Provider and Customer. A Cover Page may include an Order Form, Key Terms, or both.\n\n“Covered Claim” means either a Provider Covered Claim or Customer Covered Claim.\n\n“Customer Content” means data, information, or materials submitted by or on behalf of Customer or Users to the Product but excludes Feedback.\n\n“Discloser” means a party to this Agreement when the party is providing or disclosing Confidential Information to the other party.\n\n“Documentation” means the usage manuals and instructional materials for the Cloud Service or Software that are made available by Provider.\n\n“Embargoed Country” means any country or region to or from where Applicable Laws generally restrict the export or import of goods, services, or money.\n\n“Feedback” means suggestions, feedback, or comments about the Product or related offerings.\n\n“Fees” means the applicable amounts described in an Order Form.\n\n“Force Majeure Event” means an unforeseen event outside a party’s reasonable control where the affected party took reasonable measures to avoid or mitigate the impacts of the event. Examples of these kinds of events include unpredicted natural disasters like a major earthquake, war, pandemic, riot, act of terrorism, or public utility or internet failure.\n\n“Framework Terms” means these Standard Terms, the Key Terms between Provider and Customer, and any policies and documents referenced in or attached to the Key Terms.\n\n“GDPR” means European Union Regulation 2016/679 as implemented by local law in the relevant European Union member nation, and by section 3 of the United Kingdom’s European Union (Withdrawal) Act of 2018 in the United Kingdom.\n\n“High Risk Activity” means any situation where the use or failure of the Product could be reasonably expected to lead to death, bodily injury, or environmental damage. Examples include full or partial autonomous vehicle technology, medical life-support technology, emergency response services, nuclear facilities operation, and air traffic control.\n\n“Indemnifying Party” means a party to this Agreement when the party is providing protection for a particular Covered Claim.\n\n“Key Terms” means a Cover Page that includes the key legal details and Variables for this Agreement. The Key Terms may include details about Covered Claims, set the Governing Law, or contain other details about this Agreement.\n\n“OFAC” means the United States Department of Treasury's Office of Foreign Assets Control.\n\n“Order Form” means a Cover Page that includes the key business details and Variables for this Agreement that are not defined in the Framework Terms. An Order Form includes the policies and documents referenced in or attached to the Order Form. An Order Form may include details about the level of access and use granted to the Cloud Service, length of Subscription Period (${subscriptionPeriod}), or other details about the Product.\n\n“Personal Data” will have the meaning(s) set forth in the Applicable Data Protection Laws for personal information, personal data, personally identifiable information, or other similar term.\n\n“Product” means the Cloud Service, Software, and Documentation.\n\n“Prohibited Data” means (a) patient, medical, or other protected health information regulated by the Health Insurance Portability and Accountability Act; (b) credit, debit, bank account, or other financial account numbers; (c) social security numbers, driver’s license numbers, or other unique and private government ID numbers; (d) special categories of data as defined in the GDPR; and (e) other similar categories of sensitive information as set forth in the Applicable Data Protection Laws.\n\n“Protected Party” means a party to this Agreement when the party is receiving the benefit of protection for a particular Covered Claim.\n\n“Recipient” means a party to this Agreement when the party receives Confidential Information from the other party.\n\n“Software” means the client-side software or applications made available by Provider for Customer to install, download (whether onto a machine or in a browser), or execute as part of the Product.\n\n“Standard Terms” means these Common Paper Cloud Service Agreement Standard Terms Version 2.1, which are posted at https://commonpaper.com/standards/cloud-service-agreement/2.1/.\n\n“Usage Data” means data and information about the provision, use, and performance of the Product and related offerings based on Customer’s or User’s use of the Product.\n\n“User” means any individual who uses the Product on Customer’s behalf or through Customer’s account.\n\n“Variable” means a word or phrase that is highlighted and capitalized, such as Subscription Period or Governing Law.`,
    },
  ];
}

const content: DocumentContent<CsaFields> = {
  documentType: "csa",
  title: "Cloud Service Agreement",
  pdfFilename: "Cloud-Service-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    customer: readGroup(raw, "customer", defaultFields.customer),
    subscriptionPeriod: asString(raw.subscriptionPeriod, defaultFields.subscriptionPeriod),
    orderDate: asString(raw.orderDate, defaultFields.orderDate),
    nonRenewalNoticeDate: asString(raw.nonRenewalNoticeDate, defaultFields.nonRenewalNoticeDate),
    paymentProcess: asString(raw.paymentProcess, defaultFields.paymentProcess),
    feesDescription: asString(raw.feesDescription, defaultFields.feesDescription),
    technicalSupport: asString(raw.technicalSupport, defaultFields.technicalSupport),
    useLimitations: asString(raw.useLimitations, defaultFields.useLimitations),
    dpaReference: asString(raw.dpaReference, defaultFields.dpaReference),
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
