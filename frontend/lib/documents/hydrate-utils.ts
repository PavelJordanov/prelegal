// Shared helpers for DocumentContent implementations: defensively read a
// loosely-typed value off the backend's flat fields dict (falling back to a
// default whenever the shape doesn't match what's expected), plus small
// display-formatting and party-field-config helpers reused across the 11
// per-document content modules.
import type { PartyDetails, PartyFieldConfig } from "@/lib/documents/types";

export function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function asInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) ? value : fallback;
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Reconstructs a nested party object from the backend's dotted keys, e.g.
 * `{ "party1.name": "Acme" }` -> `{ name: "Acme", ... }` for prefix "party1". */
export function readGroup(
  raw: Record<string, unknown>,
  prefix: string,
  defaults: PartyDetails,
): PartyDetails {
  const result: PartyDetails = { ...defaults };
  for (const key of Object.keys(defaults)) {
    result[key] = asString(raw[`${prefix}.${key}`], defaults[key]);
  }
  return result;
}

export function todayAsLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string, fallback: string): string {
  if (!isoDate) return fallback;
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const DEFAULT_PARTY_FIELD_CONFIG: PartyFieldConfig[] = [
  { key: "name", label: "Name", placeholder: "[Name]" },
  { key: "title", label: "Title", placeholder: "[Title]" },
  { key: "company", label: "Company", placeholder: "[Company]" },
  { key: "noticeAddress", label: "Notice Address", placeholder: "[Notice Address]" },
];

export const COMPANY_NAME_PARTY_FIELD_CONFIG: PartyFieldConfig[] = [
  { key: "name", label: "Name", placeholder: "[Name]" },
  { key: "title", label: "Title", placeholder: "[Title]" },
  { key: "companyName", label: "Company Name", placeholder: "[Company Name]" },
  { key: "noticeAddress", label: "Notice Address", placeholder: "[Notice Address]" },
];
