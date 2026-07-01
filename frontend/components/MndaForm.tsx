"use client";

import type { MndaFormData, PartyDetails } from "@/lib/mnda-content";

interface MndaFormProps {
  value: MndaFormData;
  onChange: (data: MndaFormData) => void;
}

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";
const labelClass = "block text-sm font-medium text-zinc-700 mb-1";
const fieldsetClass = "space-y-4 border-t border-zinc-200 pt-4 first:border-t-0 first:pt-0";
const legendClass = "text-base font-semibold text-zinc-900";

function clampYears(rawValue: string): number {
  const parsed = Math.round(Number(rawValue));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function PartyFields({
  legend,
  party,
  onChange,
}: {
  legend: string;
  party: PartyDetails;
  onChange: (party: PartyDetails) => void;
}) {
  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={labelClass}>Name</span>
          <input
            className={inputClass}
            value={party.name}
            onChange={(e) => onChange({ ...party, name: e.target.value })}
          />
        </label>
        <label>
          <span className={labelClass}>Title</span>
          <input
            className={inputClass}
            value={party.title}
            onChange={(e) => onChange({ ...party, title: e.target.value })}
          />
        </label>
        <label>
          <span className={labelClass}>Company</span>
          <input
            className={inputClass}
            value={party.company}
            onChange={(e) => onChange({ ...party, company: e.target.value })}
          />
        </label>
        <label>
          <span className={labelClass}>Notice Address</span>
          <input
            className={inputClass}
            value={party.noticeAddress}
            onChange={(e) => onChange({ ...party, noticeAddress: e.target.value })}
            placeholder="Email or postal address"
          />
        </label>
      </div>
    </fieldset>
  );
}

// Renders a "N year(s) from Effective Date" vs. a fixed alternative choice
// (e.g. MNDA Term's expires/continues, or Term of Confidentiality's years/perpetuity).
function YearsOrFixedField({
  legend,
  description,
  name,
  yearsPrefix,
  yearsSuffix,
  yearsSelected,
  onSelectYears,
  years,
  onYearsChange,
  fixedLabel,
  fixedSelected,
  onSelectFixed,
}: {
  legend: string;
  description: string;
  name: string;
  yearsPrefix?: string;
  yearsSuffix: string;
  yearsSelected: boolean;
  onSelectYears: () => void;
  years: number;
  onYearsChange: (years: number) => void;
  fixedLabel: string;
  fixedSelected: boolean;
  onSelectFixed: () => void;
}) {
  const yearsInputId = `${name}-years`;
  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>{legend}</legend>
      <span className={labelClass}>{description}</span>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              checked={yearsSelected}
              onChange={onSelectYears}
            />
            {yearsPrefix}
          </label>
          <input
            id={yearsInputId}
            type="number"
            min={1}
            step={1}
            className={`${inputClass} w-20`}
            value={years}
            disabled={!yearsSelected}
            onChange={(e) => onYearsChange(clampYears(e.target.value))}
          />
          <label htmlFor={yearsInputId}>{yearsSuffix}</label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            checked={fixedSelected}
            onChange={onSelectFixed}
          />
          {fixedLabel}
        </label>
      </div>
    </fieldset>
  );
}

export default function MndaForm({ value, onChange }: MndaFormProps) {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <PartyFields
        legend="Party 1"
        party={value.party1}
        onChange={(party1) => onChange({ ...value, party1 })}
      />
      <PartyFields
        legend="Party 2"
        party={value.party2}
        onChange={(party2) => onChange({ ...value, party2 })}
      />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Purpose</legend>
        <label>
          <span className={labelClass}>How Confidential Information may be used</span>
          <textarea
            className={inputClass}
            rows={2}
            value={value.purpose}
            onChange={(e) => onChange({ ...value, purpose: e.target.value })}
          />
        </label>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Effective Date</legend>
        <label>
          <span className={labelClass}>Effective Date</span>
          <input
            type="date"
            className={inputClass}
            value={value.effectiveDate}
            onChange={(e) => onChange({ ...value, effectiveDate: e.target.value })}
          />
        </label>
      </fieldset>

      <YearsOrFixedField
        legend="MNDA Term"
        description="The length of this MNDA"
        name="mndaTerm"
        yearsPrefix="Expires"
        yearsSuffix="year(s) from Effective Date"
        yearsSelected={value.mndaTerm === "expires"}
        onSelectYears={() => onChange({ ...value, mndaTerm: "expires" })}
        years={value.mndaTermYears}
        onYearsChange={(mndaTermYears) => onChange({ ...value, mndaTermYears })}
        fixedLabel="Continues until terminated in accordance with the terms of the MNDA"
        fixedSelected={value.mndaTerm === "continues"}
        onSelectFixed={() => onChange({ ...value, mndaTerm: "continues" })}
      />

      <YearsOrFixedField
        legend="Term of Confidentiality"
        description="How long Confidential Information is protected"
        name="confidentialityTerm"
        yearsSuffix="year(s) from Effective Date (trade secrets protected until no longer a trade secret)"
        yearsSelected={value.confidentialityTerm === "years"}
        onSelectYears={() => onChange({ ...value, confidentialityTerm: "years" })}
        years={value.confidentialityTermYears}
        onYearsChange={(confidentialityTermYears) =>
          onChange({ ...value, confidentialityTermYears })
        }
        fixedLabel="In perpetuity"
        fixedSelected={value.confidentialityTerm === "perpetuity"}
        onSelectFixed={() => onChange({ ...value, confidentialityTerm: "perpetuity" })}
      />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Governing Law & Jurisdiction</legend>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>Governing Law (state)</span>
            <input
              className={inputClass}
              value={value.governingLaw}
              onChange={(e) => onChange({ ...value, governingLaw: e.target.value })}
              placeholder="e.g. Delaware"
            />
          </label>
          <label>
            <span className={labelClass}>Jurisdiction (city/county and state)</span>
            <input
              className={inputClass}
              value={value.jurisdiction}
              onChange={(e) => onChange({ ...value, jurisdiction: e.target.value })}
              placeholder="e.g. New Castle, DE"
            />
          </label>
        </div>
      </fieldset>
    </form>
  );
}
