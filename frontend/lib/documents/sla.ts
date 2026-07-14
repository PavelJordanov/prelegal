import type { DocumentContent, DocumentSection, FieldSummaryItem, PartyBlock, PartyDetails } from "@/lib/documents/types";
import { DEFAULT_PARTY_FIELD_CONFIG, asString, readGroup } from "@/lib/documents/hydrate-utils";

export interface SlaFields {
  provider: PartyDetails;
  customer: PartyDetails;
  targetUptime: string;
  targetResponseTime: string;
  supportChannel: string;
  scheduledDowntime: string;
  subscriptionPeriod: string;
  uptimeCredit: string;
  responseTimeCredit: string;
}

const emptyParty: PartyDetails = { name: "", title: "", company: "", noticeAddress: "" };

const defaultFields: SlaFields = {
  provider: { ...emptyParty },
  customer: { ...emptyParty },
  targetUptime: "",
  targetResponseTime: "",
  supportChannel: "",
  scheduledDowntime: "None",
  subscriptionPeriod: "12 months",
  uptimeCredit: "",
  responseTimeCredit: "",
};

const targetUptimeFallback = "[Fill in Target Uptime]";
const targetResponseTimeFallback = "[Fill in Target Response Time]";
const supportChannelFallback = "[Fill in Support Channel]";
const scheduledDowntimeFallback = "[Fill in Scheduled Downtime]";
const subscriptionPeriodFallback = "[Fill in Subscription Period]";
const uptimeCreditFallback = "[Fill in Uptime Credit]";
const responseTimeCreditFallback = "[Fill in Response Time Credit]";

function summarySections(data: SlaFields): FieldSummaryItem[] {
  return [
    { label: "Target Uptime", value: data.targetUptime || targetUptimeFallback },
    { label: "Target Response Time", value: data.targetResponseTime || targetResponseTimeFallback },
    { label: "Support Channel", value: data.supportChannel || supportChannelFallback },
    { label: "Scheduled Downtime", value: data.scheduledDowntime || scheduledDowntimeFallback },
    { label: "Subscription Period", value: data.subscriptionPeriod || subscriptionPeriodFallback },
    { label: "Uptime Credit", value: data.uptimeCredit || uptimeCreditFallback },
    { label: "Response Time Credit", value: data.responseTimeCredit || responseTimeCreditFallback },
  ];
}

function parties(data: SlaFields): PartyBlock[] {
  return [
    { label: "Provider", data: data.provider, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
    { label: "Customer", data: data.customer, fieldConfig: DEFAULT_PARTY_FIELD_CONFIG },
  ];
}

// Standard Terms prose, transcribed from templates/SLA.md with the Order
// Form/Cover Page variables substituted directly (no {{placeholder}} tokens -
// each document module is responsible for its own substitution so the
// shared renderer never needs to know about template syntax). Nested
// numbering (e.g. "1.1") is flattened into the section title.
function bodySections(data: SlaFields): DocumentSection[] {
  const targetUptime = data.targetUptime || targetUptimeFallback;
  const targetResponseTime = data.targetResponseTime || targetResponseTimeFallback;
  const supportChannel = data.supportChannel || supportChannelFallback;
  const scheduledDowntime = data.scheduledDowntime || scheduledDowntimeFallback;
  const subscriptionPeriod = data.subscriptionPeriod || subscriptionPeriodFallback;
  const uptimeCredit = data.uptimeCredit || uptimeCreditFallback;
  const responseTimeCredit = data.responseTimeCredit || responseTimeCreditFallback;

  return [
    {
      title: "1.1 Target Uptime",
      body: `If there is a ${targetUptime}, Provider will use commercially reasonable efforts to make the Cloud Service available for at least the ${targetUptime} as calculated each calendar month.`,
    },
    {
      title: "1.2 Calculating Uptime",
      body: `Provider and Customer agree to calculate availability of the Cloud Service as the total number of Available Minutes minus the number of Downtime Minutes, divided by the total number of Available Minutes, measured in a calendar month. If the ${subscriptionPeriod} includes a partial month, the numerator and denominator will only include the days that are part of the ${subscriptionPeriod} for that month.`,
    },
    {
      title: "2.1 Target Response Time",
      body: `If there is a ${targetResponseTime}, Provider will use commercially reasonable efforts to respond to support requests sent to the ${supportChannel} within the ${targetResponseTime}.`,
    },
    {
      title: "2.2 Calculating Response Time",
      body: `Provider and Customer agree to calculate Provider’s response time as the total time between when Customer submits a support request to the ${supportChannel} and when Provider or Provider’s support representative specifically acknowledges the request. An automated response is not a specific acknowledgement for purposes of this SLA.`,
    },
    {
      title: "3.1 Service Credit",
      body: `If there is a ${targetUptime} and Cloud Service availability falls below the ${targetUptime}, Customer is eligible to receive an ${uptimeCredit}. If there is a ${targetResponseTime} and neither Provider nor Provider’s support representative acknowledge a support request submitted to the ${supportChannel} within the ${targetResponseTime}, Customer is eligible to receive a ${responseTimeCredit}. Service Credits only apply towards future Cloud Service Fees owed by Customer to Provider.`,
    },
    {
      title: "3.2 Requesting a Service Credit",
      body: `To receive a Service Credit, Customer must notify Provider within 7 days of the end of the month in which Customer believes the Service Credit was earned, otherwise Service Credit eligibility will expire for that month. For an ${uptimeCredit}, Customer must include information about when it was unable to access the Cloud Service. Customer may be required to provide additional details about its attempts to access the Cloud Service. If Provider can verify Cloud Service unavailability in its internal monitoring systems and the disruption does not qualify as Excluded Minutes or ${scheduledDowntime}, Provider will calculate and issue the applicable ${uptimeCredit} on Customer’s account to apply towards a future invoice. For a ${responseTimeCredit}, Customer must include information about when and how Customer contacted Provider. Customer may be required to provide additional details about the related incident and its attempts to receive support. If Provider can verify neither Provider nor Provider’s support representative responded to Customer’s support request within the ${targetResponseTime}, Provider will calculate and issue the applicable ${responseTimeCredit} on Customer’s account to apply towards a future invoice.`,
    },
    {
      title: "3.3 Service Credit Limitations",
      body: `Service Credits may not be exchanged for, or converted to, monetary amounts. Service Credits do not earn interest. Service Credits will not accumulate within a single ${subscriptionPeriod} in an amount more than 8% of Cloud Service Fees for that ${subscriptionPeriod}. Service Credits expire when the applicable Order Form ends.`,
    },
    {
      title: "3.4 Termination",
      body: `If the Cloud Service does not meet the ${targetUptime} for two (2) out of any three (3) consecutive months and Customer notified Provider of the failures within 7 days of the end of each impacted month, Customer may immediately terminate the affected Order Form by giving written notice to Provider. If Customer terminates an Order Form under this section, Provider will pay to Customer a prorated refund of prepaid fees for the remainder of the ${subscriptionPeriod}.`,
    },
    {
      title: "3.5 Exclusive Remedy",
      body: `This SLA describes Customer’s exclusive remedy and Provider’s entire liability for any failure of the Cloud Service to meet the ${targetUptime} and for any inability to meet the ${targetResponseTime}.`,
    },
    {
      title: "4. Definitions",
      body: `“Available Minutes” means the total number of minutes in a calendar month, minus Excluded Minutes and ${scheduledDowntime}. “Downtime Minutes” means the total number of minutes in a calendar month when the Cloud Service is not available to Customer, as confirmed by Provider’s internal monitoring systems, minus Excluded Minutes and ${scheduledDowntime}. “Excluded Minutes” means when the Cloud Service is not available because of (a) a Force Majeure Event; (b) general Internet connectivity issues; (c) equipment or software made available by anyone other than Provider and that is not within Provider’s reasonable control; or (d) Customer’s use of the Cloud Service in a manner not authorized by the Agreement. “Service Credit” means the accrued ${uptimeCredit} plus the accrued ${responseTimeCredit}. “SLA” means these SLA Standard Terms as incorporated into the applicable Order Form. “SLA Standard Terms” means these Common Paper Service Level Agreement Standard Terms Version 2.0, which are posted at https://commonpaper.com/standards/service-level-agreement/2.0/.`,
    },
  ];
}

const content: DocumentContent<SlaFields> = {
  documentType: "sla",
  title: "Service Level Agreement",
  pdfFilename: "Service-Level-Agreement.pdf",
  summaryHeading: "Key Terms",
  defaultFields,
  hydrate: (raw) => ({
    provider: readGroup(raw, "provider", defaultFields.provider),
    customer: readGroup(raw, "customer", defaultFields.customer),
    targetUptime: asString(raw.targetUptime, defaultFields.targetUptime),
    targetResponseTime: asString(raw.targetResponseTime, defaultFields.targetResponseTime),
    supportChannel: asString(raw.supportChannel, defaultFields.supportChannel),
    scheduledDowntime: asString(raw.scheduledDowntime, defaultFields.scheduledDowntime),
    subscriptionPeriod: asString(raw.subscriptionPeriod, defaultFields.subscriptionPeriod),
    uptimeCredit: asString(raw.uptimeCredit, defaultFields.uptimeCredit),
    responseTimeCredit: asString(raw.responseTimeCredit, defaultFields.responseTimeCredit),
  }),
  summarySections,
  parties,
  bodySections,
};

export default content;
