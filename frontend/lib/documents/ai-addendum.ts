import type { DocumentContent, DocumentSection, FieldSummaryItem } from "@/lib/documents/types";
import { asString } from "@/lib/documents/hydrate-utils";

export interface AiAddendumFields {
  customerCompany: string;
  providerCompany: string;
  parentAgreementReference: string;
  trainingData: string;
  trainingPurposes: string;
  trainingRestrictions: string;
  improvementRestrictions: string;
}

const defaultFields: AiAddendumFields = {
  customerCompany: "",
  providerCompany: "",
  parentAgreementReference: "",
  trainingData: "",
  trainingPurposes: "",
  trainingRestrictions: "",
  improvementRestrictions: "",
};

const customerCompanyFallback = "[Customer company name]";
const providerCompanyFallback = "[Provider company name]";
const parentAgreementFallback = "[Name/date of the agreement this AI Addendum supplements]";
const trainingDataFallback = "[Not permitted - no Training Data identified on the Cover Page]";
const trainingPurposesFallback = "[Not permitted - no Training Purposes identified on the Cover Page]";
const trainingRestrictionsFallback = "[None specified]";
const improvementRestrictionsFallback = "[None specified]";

/** Per AI-Addendum.md Section 1.3: Provider may only Train a Model on
 * Customer's Input/Output if the Cover Page identifies BOTH Training Data
 * and Training Purposes. Blank is a valid, complete "no training" answer -
 * not a missing value - so this drives the conditional prose below rather
 * than falling back to a bracketed placeholder. */
function trainingPermitted(data: AiAddendumFields): boolean {
  return Boolean(data.trainingData.trim() && data.trainingPurposes.trim());
}

function modelTrainingClause(data: AiAddendumFields, customer: string, provider: string): string {
  if (!trainingPermitted(data)) {
    return `Unless the Cover Page identifies Training Data and Training Purposes, ${provider} may not use ${customer}'s Inputs or Outputs to Train any Model. No Training Data or Training Purposes have been identified on the Cover Page, so ${provider} is not permitted to Train any Model using ${customer}'s Inputs or Outputs.`;
  }
  const restrictionsClause = data.trainingRestrictions.trim()
    ? `the following Training Restrictions: ${data.trainingRestrictions}`
    : "no additional Training Restrictions";
  return `Unless the Cover Page identifies Training Data and Training Purposes, ${provider} may not use ${customer}'s Inputs or Outputs to Train any Model. The Cover Page identifies Training Data as: ${data.trainingData}. Subject to ${restrictionsClause}, ${provider} may copy, modify, distribute, and use this Training Data for the following Training Purposes: ${data.trainingPurposes}.`;
}

function nonTrainingImprovementClause(data: AiAddendumFields): string {
  const improvementRestrictionsClause = data.improvementRestrictions.trim()
    ? `the following Improvement Restrictions: ${data.improvementRestrictions}`
    : "no Improvement Restrictions";
  const trainingPurposesClause = trainingPermitted(data)
    ? `the Training Purposes described above (${data.trainingPurposes})`
    : "no authorized Training Purposes, since Training has not been permitted";
  return `Subject to ${improvementRestrictionsClause}, Provider may use Input, Output, and Training Data to provide, maintain, develop, and improve the AI System, provided that such usage does not constitute Training except to the extent authorized for ${trainingPurposesClause}.`;
}

function summarySections(data: AiAddendumFields): FieldSummaryItem[] {
  return [
    { label: "Customer", value: data.customerCompany || customerCompanyFallback },
    { label: "Provider", value: data.providerCompany || providerCompanyFallback },
    { label: "Agreement", value: data.parentAgreementReference || parentAgreementFallback },
    { label: "Training Data", value: data.trainingData || trainingDataFallback },
    { label: "Training Purposes", value: data.trainingPurposes || trainingPurposesFallback },
    { label: "Training Restrictions", value: data.trainingRestrictions || trainingRestrictionsFallback },
    { label: "Improvement Restrictions", value: data.improvementRestrictions || improvementRestrictionsFallback },
  ];
}

// AI-Addendum.md is a rider that supplements an already-signed parent
// agreement (e.g. a CSA or Software License Agreement) - there is no
// independent signature block here, just the Customer/Provider company
// names captured above in summarySections(). No PartyBlock is warranted, so
// parties() returns an empty array.

// Standard Terms prose, transcribed from templates/AI-Addendum.md with the
// Cover Page variables substituted directly (no {{placeholder}} tokens).
function bodySections(data: AiAddendumFields): DocumentSection[] {
  const customer = data.customerCompany || customerCompanyFallback;
  const provider = data.providerCompany || providerCompanyFallback;
  const agreement = data.parentAgreementReference || parentAgreementFallback;

  return [
    {
      title: "1. AI Services",
      body: `1.1 Using AI Services. The AI Services are part of the Product and subject to ${agreement} as supplemented by this AI Addendum. ${customer} may use AI Services by providing Input. The AI Services may generate Output in response to Input. ${provider} may copy, display, modify, distribute, and use Input to the extent necessary to provide the AI Services as contemplated by this AI Addendum. ${customer} authorizes ${provider} to process Input for all such purposes. 1.2 Restrictions. Without limiting the restrictions contained in ${agreement}, ${customer} will not (and will not allow anyone else to): (a) use the AI Services for decision-making in a regulated industry or capacity without proper human oversight and review in compliance with Applicable Laws and applicable professional ethics, guidelines, and rules; (b) use the AI Services to violate, misappropriate, or otherwise infringe the intellectual property or other proprietary rights of others; or (c) falsely state Output was created by a human. 1.3 Model Training. ${modelTrainingClause(data, customer, provider)} 1.4 Non-Training Improvement. ${nonTrainingImprovementClause(data)}`,
    },
    {
      title: "2. Intellectual Property and Privacy",
      body: `2.1 Ownership. As between the parties, ${customer} (a) retains all right, title, and interest in and to all Input, and (b) owns all Output. To the extent permitted by Applicable Laws, ${provider} hereby assigns to ${customer} all right, title, and interest - if any - in and to Output. 2.2 Personal Data. Nothing in this AI Addendum will reduce or limit ${provider}'s obligations under Applicable Data Protection Laws regarding Personal Data that may be contained in Input. 2.3 Rights to Input. ${customer} represents and warrants that it, all Users, and anyone submitting Input each have and will continue to have all rights necessary to submit Input to the AI Services.`,
    },
    {
      title: "3. Disclaimers",
      body: `3.1 Nature of AI. Due to the nature of artificial intelligence and machine learning, information generated by the AI Services may be incorrect or inaccurate. The AI Services are not human and are not a substitute for human oversight. Output generated by the AI Services may not be protectable as intellectual property. 3.2 Similarity of Output. Output may resemble or be duplicative of data, information, and materials created by the AI Services for others. ${provider} does not provide any representation or warranty that Output (a) does not and will not incorporate or reflect the data, information, prompts, or materials of others, (b) will not violate, misappropriate, or otherwise infringe upon the intellectual property or other proprietary rights of another person or entity, or (c) will not be reproduced in the same or similar way to another user of the AI Services.`,
    },
    {
      title: "4. Definitions",
      body: `"AI Addendum Standard Terms" means these Common Paper AI Addendum Standard Terms Version 1.0, which are posted at https://commonpaper.com/standards/ai-addendum/1.0/. "AI Services" means the artificial intelligence or machine learning components of the Product, including the AI System and underlying Model(s). "AI System" means the artificial intelligence or machine learning application, program, and services layers of the AI Services, excluding the underlying Models. "Input" means the data, information, prompts, or materials submitted by or on behalf of ${customer} or Users to the AI Services but excludes Feedback. "Model" means a large language, machine learning, or artificial intelligence model. "Output" means the data, information, or materials created by the AI Services in response to Input. "Train" or "Training" means the use of data, information, or materials to create or improve a Model.`,
    },
  ];
}

const content: DocumentContent<AiAddendumFields> = {
  documentType: "ai-addendum",
  title: "AI Addendum",
  pdfFilename: "AI-Addendum.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    customerCompany: asString(raw.customerCompany, defaultFields.customerCompany),
    providerCompany: asString(raw.providerCompany, defaultFields.providerCompany),
    parentAgreementReference: asString(raw.parentAgreementReference, defaultFields.parentAgreementReference),
    trainingData: asString(raw.trainingData, defaultFields.trainingData),
    trainingPurposes: asString(raw.trainingPurposes, defaultFields.trainingPurposes),
    trainingRestrictions: asString(raw.trainingRestrictions, defaultFields.trainingRestrictions),
    improvementRestrictions: asString(raw.improvementRestrictions, defaultFields.improvementRestrictions),
  }),
  summarySections,
  parties: () => [],
  bodySections,
};

export default content;
