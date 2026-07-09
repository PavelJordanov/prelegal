import type { DocumentContent, DocumentType } from "@/lib/documents/types";
import mutualNda from "@/lib/documents/mutual-nda";
import csa from "@/lib/documents/csa";
import sla from "@/lib/documents/sla";
import psa from "@/lib/documents/psa";
import dpa from "@/lib/documents/dpa";
import softwareLicenseAgreement from "@/lib/documents/software-license-agreement";
import partnershipAgreement from "@/lib/documents/partnership-agreement";
import pilotAgreement from "@/lib/documents/pilot-agreement";
import designPartnerAgreement from "@/lib/documents/design-partner-agreement";
import baa from "@/lib/documents/baa";
import aiAddendum from "@/lib/documents/ai-addendum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous registry: each module's TFields differs.
export const DOCUMENT_REGISTRY: Record<DocumentType, DocumentContent<any>> = {
  "mutual-nda": mutualNda,
  csa,
  sla,
  psa,
  dpa,
  "software-license-agreement": softwareLicenseAgreement,
  "partnership-agreement": partnershipAgreement,
  "pilot-agreement": pilotAgreement,
  "design-partner-agreement": designPartnerAgreement,
  baa,
  "ai-addendum": aiAddendum,
};
