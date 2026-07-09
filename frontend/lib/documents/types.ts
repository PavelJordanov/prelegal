// The 11 document types Prelegal can draft. Must match the `key` of each
// DocumentSpec in backend/app/chat/specs/*.py exactly - it's the wire
// contract between the two (the backend has no visibility into this file).
export type DocumentType =
  | "mutual-nda"
  | "csa"
  | "sla"
  | "psa"
  | "dpa"
  | "software-license-agreement"
  | "partnership-agreement"
  | "pilot-agreement"
  | "design-partner-agreement"
  | "baa"
  | "ai-addendum";

export interface DocumentSection {
  title: string;
  body: string;
}

export interface FieldSummaryItem {
  label: string;
  value: string;
}

export type PartyDetails = Record<string, string>;

export interface PartyFieldConfig {
  key: string;
  label: string;
  placeholder: string;
}

export interface PartyBlock {
  label: string;
  data: PartyDetails;
  fieldConfig: PartyFieldConfig[];
}

/** Bespoke per-document content, hand-transcribed from templates/*.md. One
 * generic DocumentPreview/DocumentPdfDocument pair renders any module that
 * implements this shape - see components/DocumentPreview.tsx. */
export interface DocumentContent<TFields> {
  documentType: DocumentType;
  title: string;
  pdfFilename: string;
  summaryHeading: string;
  defaultFields: TFields;
  /** Reconstructs typed fields from the flat, string-keyed dict the backend
   * sends on the wire (grouped fields arrive dotted, e.g. "party1.name").
   * Defensive: always falls back to defaultFields for anything missing. */
  hydrate: (raw: Record<string, unknown>) => TFields;
  summarySections: (data: TFields) => FieldSummaryItem[];
  parties: (data: TFields) => PartyBlock[];
  bodySections: (data: TFields) => DocumentSection[];
}
