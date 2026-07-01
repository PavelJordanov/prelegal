import { describe, expect, it } from "vitest";
import {
  coverPageSummary,
  confidentialityTermClause,
  confidentialityTermDisplay,
  defaultMndaFormData,
  fillPlaceholders,
  formatDisplayDate,
  mndaTermDisplay,
  partyFieldConfig,
  standardTermsSections,
  type MndaFormData,
} from "@/lib/mnda-content";

function makeFormData(overrides: Partial<MndaFormData> = {}): MndaFormData {
  return {
    ...structuredClone(defaultMndaFormData),
    ...overrides,
  };
}

describe("formatDisplayDate", () => {
  it("formats an ISO date as a long-form US date", () => {
    expect(formatDisplayDate("2026-07-01")).toBe("July 1, 2026");
  });

  it("does not shift the date across a UTC day boundary", () => {
    // Regression guard: parsing "YYYY-MM-DD" must not apply local-timezone
    // offsets, or dates near midnight would display as the wrong day.
    expect(formatDisplayDate("2026-01-01")).toBe("January 1, 2026");
    expect(formatDisplayDate("2026-12-31")).toBe("December 31, 2026");
  });

  it("falls back to a placeholder for an empty date", () => {
    expect(formatDisplayDate("")).toBe("[Today's date]");
  });
});

describe("defaultMndaFormData.effectiveDate", () => {
  it("matches the local calendar date, not the UTC date", () => {
    // Regression guard for the UTC-vs-local-timezone default-date bug:
    // the stored default must be today's date in the machine's local
    // timezone, computed the same way a human reading a calendar would.
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(defaultMndaFormData.effectiveDate).toBe(expected);
  });
});

describe("mndaTermDisplay", () => {
  it("describes a fixed-years term", () => {
    const data = makeFormData({ mndaTerm: "expires", mndaTermYears: 3 });
    expect(mndaTermDisplay(data)).toBe("3 year(s) from the Effective Date");
  });

  it("describes a continues-until-terminated term", () => {
    const data = makeFormData({ mndaTerm: "continues" });
    expect(mndaTermDisplay(data)).toBe(
      "the date this MNDA is terminated in accordance with its terms",
    );
  });
});

describe("confidentialityTermDisplay", () => {
  it("describes a fixed-years confidentiality term", () => {
    const data = makeFormData({ confidentialityTerm: "years", confidentialityTermYears: 2 });
    expect(confidentialityTermDisplay(data)).toContain("2 year(s) from the Effective Date");
    expect(confidentialityTermDisplay(data)).toContain("trade secret");
  });

  it("describes a perpetuity confidentiality term", () => {
    const data = makeFormData({ confidentialityTerm: "perpetuity" });
    expect(confidentialityTermDisplay(data)).toBe("In perpetuity");
  });
});

describe("confidentialityTermClause", () => {
  it("prefixes 'for' when years are selected, reading correctly after 'will survive'", () => {
    const data = makeFormData({ confidentialityTerm: "years", confidentialityTermYears: 5 });
    const clause = confidentialityTermClause(data);
    expect(clause.startsWith("for ")).toBe(true);
    expect(`will survive ${clause}`).toContain("will survive for 5 year(s)");
  });

  it("does not double up a preposition for the perpetuity option", () => {
    // Regression guard for the "will survive for in perpetuity" grammar bug.
    const data = makeFormData({ confidentialityTerm: "perpetuity" });
    const clause = confidentialityTermClause(data);
    expect(clause).toBe("in perpetuity");
    expect(`will survive ${clause}`).toBe("will survive in perpetuity");
    expect(`will survive ${clause}`).not.toContain("for in perpetuity");
  });
});

describe("fillPlaceholders", () => {
  it("substitutes purpose, effective date, MNDA term, and governing law/jurisdiction", () => {
    const data = makeFormData({
      purpose: "Evaluating a partnership",
      effectiveDate: "2026-03-01",
      mndaTerm: "expires",
      mndaTermYears: 2,
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
    });
    const introduction = standardTermsSections[0].body;
    expect(fillPlaceholders(introduction, data)).toContain("Evaluating a partnership");

    const governingLawSection = standardTermsSections.find((s) =>
      s.title.includes("Governing Law"),
    )!.body;
    const rendered = fillPlaceholders(governingLawSection, data);
    expect(rendered).toContain("laws of the State of Delaware");
    expect(rendered).toContain("courts located in New Castle, DE");
  });

  it("renders the Term and Termination section without a grammar bug for perpetuity", () => {
    const data = makeFormData({
      effectiveDate: "2026-01-01",
      mndaTerm: "expires",
      mndaTermYears: 1,
      confidentialityTerm: "perpetuity",
    });
    const termSection = standardTermsSections.find((s) => s.title.includes("Term and Termination"))!
      .body;
    const rendered = fillPlaceholders(termSection, data);
    expect(rendered).toContain("will survive in perpetuity");
    expect(rendered).not.toContain("survive for in perpetuity");
  });

  it("falls back to bracketed placeholder text for empty governing law and jurisdiction", () => {
    const data = makeFormData({ governingLaw: "", jurisdiction: "" });
    const governingLawSection = standardTermsSections.find((s) =>
      s.title.includes("Governing Law"),
    )!.body;
    const rendered = fillPlaceholders(governingLawSection, data);
    expect(rendered).toContain("[Fill in state]");
    expect(rendered).toContain("[Fill in city or county and state]");
  });

  it("falls back to bracketed placeholder text for an empty purpose", () => {
    const data = makeFormData({ purpose: "" });
    const introduction = standardTermsSections[0].body;
    expect(fillPlaceholders(introduction, data)).toContain("[Purpose not specified]");
  });
});

describe("coverPageSummary", () => {
  it("uses the same fallback text as fillPlaceholders for governing law/jurisdiction", () => {
    // Regression guard: the Cover Page summary and the Standard Terms body
    // previously used different fallback text for the same underlying
    // fields, which could read as an inconsistency to the user.
    const data = makeFormData({ governingLaw: "", jurisdiction: "" });
    const summary = coverPageSummary(data);
    const governingLaw = summary.find((s) => s.label === "Governing Law");
    const jurisdiction = summary.find((s) => s.label === "Jurisdiction");
    expect(governingLaw?.value).toBe("[Fill in state]");
    expect(jurisdiction?.value).toBe("[Fill in city or county and state]");

    const governingLawSection = standardTermsSections.find((s) =>
      s.title.includes("Governing Law"),
    )!.body;
    expect(fillPlaceholders(governingLawSection, data)).toContain(governingLaw!.value);
  });

  it("includes all six cover page fields with non-empty values for filled-in data", () => {
    const data = makeFormData({
      purpose: "Evaluating a partnership",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
    });
    const summary = coverPageSummary(data);
    expect(summary).toHaveLength(6);
    for (const item of summary) {
      expect(item.value.length).toBeGreaterThan(0);
    }
  });
});

describe("partyFieldConfig", () => {
  it("has a label and bracketed placeholder for every PartyDetails key", () => {
    const keys = partyFieldConfig.map((f) => f.key).sort();
    expect(keys).toEqual(["company", "name", "noticeAddress", "title"].sort());
    for (const field of partyFieldConfig) {
      expect(field.placeholder).toMatch(/^\[.+\]$/);
    }
  });
});

describe("standardTermsSections", () => {
  it("contains all 11 sections of the Common Paper Mutual NDA Standard Terms", () => {
    expect(standardTermsSections).toHaveLength(11);
    expect(standardTermsSections[0].title).toContain("Introduction");
    expect(standardTermsSections[10].title).toContain("General");
  });
});
