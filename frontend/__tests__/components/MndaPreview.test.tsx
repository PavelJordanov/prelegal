import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MndaPreview from "@/components/MndaPreview";
import { defaultMndaFormData, type MndaFormData } from "@/lib/mnda-content";

function makeFormData(overrides: Partial<MndaFormData> = {}): MndaFormData {
  return {
    ...structuredClone(defaultMndaFormData),
    ...overrides,
  };
}

describe("MndaPreview", () => {
  it("renders all 11 Standard Terms section headings", () => {
    render(<MndaPreview data={makeFormData()} />);
    expect(screen.getByText("1. Introduction")).toBeInTheDocument();
    expect(screen.getByText("11. General")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      // 6 cover page summary items + 11 standard terms sections
      6 + 11,
    );
  });

  it("substitutes filled-in party, purpose, and governing law values into the document", () => {
    const data = makeFormData({
      party1: { name: "Acme Corp", title: "CEO", company: "Acme Corporation Inc.", noticeAddress: "legal@acme.com" },
      party2: { name: "Jane Doe", title: "Founder", company: "Beta LLC", noticeAddress: "jane@beta.com" },
      purpose: "Evaluating a joint venture",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
    });
    render(<MndaPreview data={data} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getAllByText(/Evaluating a joint venture/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Delaware/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/New Castle, DE/).length).toBeGreaterThan(0);
  });

  it("shows bracketed fallback placeholders for empty party and cover page fields", () => {
    render(<MndaPreview data={makeFormData()} />);

    expect(screen.getAllByText("[Name]")).toHaveLength(2);
    expect(screen.getAllByText("[Title]")).toHaveLength(2);
    expect(screen.getAllByText("[Company]")).toHaveLength(2);
    expect(screen.getAllByText("[Notice Address]")).toHaveLength(2);
    expect(screen.getByText("[Fill in state]")).toBeInTheDocument();
    expect(screen.getByText("[Fill in city or county and state]")).toBeInTheDocument();
  });

  it("renders the perpetuity confidentiality term without the 'survive for in perpetuity' grammar bug", () => {
    const data = makeFormData({ confidentialityTerm: "perpetuity" });
    render(<MndaPreview data={data} />);

    const termSection = screen.getByText(/will survive/);
    expect(termSection.textContent).toContain("will survive in perpetuity");
    expect(termSection.textContent).not.toContain("survive for in perpetuity");
  });
});
