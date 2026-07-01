// @vitest-environment node
//
// @react-pdf/renderer's Node build only exposes toBuffer()/toString()
// (not toBlob(), which needs a browser Blob). Running this file under the
// node environment lets us render a real PDF and extract its text with
// pdf-parse, so we assert on the actual bytes a user would download --
// not just the React tree, which is what let the "survive for in
// perpetuity" grammar bug ship in the first place.
import { describe, expect, it } from "vitest";
import { pdf } from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import MndaPdfDocument from "@/components/MndaPdfDocument";
import { defaultMndaFormData, type MndaFormData } from "@/lib/mnda-content";

function makeFormData(overrides: Partial<MndaFormData> = {}): MndaFormData {
  return {
    ...structuredClone(defaultMndaFormData),
    ...overrides,
  };
}

async function renderPdfText(data: MndaFormData): Promise<string> {
  const stream = await pdf(<MndaPdfDocument data={data} />).toBuffer();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  const buffer = Buffer.concat(chunks);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

describe("MndaPdfDocument", () => {
  it("produces a valid, non-empty PDF", async () => {
    const buffer = await pdf(<MndaPdfDocument data={makeFormData()} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer) {
      chunks.push(chunk as Buffer);
    }
    const result = Buffer.concat(chunks);
    expect(result.subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(result.length).toBeGreaterThan(1000);
  });

  it("includes the filled-in party details, purpose, and governing law/jurisdiction in the actual PDF text", async () => {
    const data = makeFormData({
      party1: {
        name: "Acme Corp",
        title: "CEO",
        company: "Acme Corporation Inc.",
        noticeAddress: "legal@acme.com",
      },
      party2: { name: "Jane Doe", title: "Founder", company: "Beta LLC", noticeAddress: "jane@beta.com" },
      purpose: "Evaluating a joint venture",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
    });

    const text = await renderPdfText(data);

    expect(text).toContain("Acme Corp");
    expect(text).toContain("Jane Doe");
    expect(text).toContain("Evaluating a joint venture");
    expect(text).toContain("Delaware");
    expect(text).toContain("New Castle, DE");
  });

  it("does not ship the 'survive for in perpetuity' grammar bug in the generated PDF text", async () => {
    const data = makeFormData({ confidentialityTerm: "perpetuity" });
    const text = await renderPdfText(data);

    expect(text).toMatch(/will survive\s+in perpetuity/);
    expect(text).not.toMatch(/survive\s+for in perpetuity/);
  });

  it("renders a fixed-years confidentiality term correctly in the PDF text", async () => {
    const data = makeFormData({ confidentialityTerm: "years", confidentialityTermYears: 5 });
    const text = await renderPdfText(data);

    expect(text).toMatch(/will survive\s+for 5 year\(s\)/);
  });

  it("renders Cyrillic and Latin Extended party names correctly (Noto Sans coverage)", async () => {
    // Regression guard: the default PDF standard font (Helvetica) only
    // covers WinAnsi/Latin-1, so these previously came out as garbled
    // mojibake with no error. Registering Noto Sans (lib/pdf-fonts.ts)
    // fixes this range.
    const data = makeFormData({
      party1: { ...defaultMndaFormData.party1, company: "ООО Тест" },
      party2: { ...defaultMndaFormData.party2, company: "Müller & Söhne GmbH" },
    });

    const text = await renderPdfText(data);

    expect(text).toContain("ООО Тест");
    expect(text).toContain("Müller & Söhne GmbH");
  });

  it("documents CJK as a known, unfixed limitation of the current font", async () => {
    // Not a desired behavior -- a documented gap. Noto Sans has no CJK
    // glyph coverage, and a CJK font is a separate, much larger dependency
    // (see MANUAL_TESTING.md). This test exists so a future change to the
    // font setup that silently starts covering (or further breaking) CJK
    // text gets noticed instead of drifting unnoticed.
    const data = makeFormData({
      party1: { ...defaultMndaFormData.party1, company: "株式会社テスト" },
    });

    const text = await renderPdfText(data);

    expect(text).not.toContain("株式会社テスト");
  });
});
