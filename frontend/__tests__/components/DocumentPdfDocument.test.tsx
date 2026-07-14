// @vitest-environment node
//
// @react-pdf/renderer's Node build only exposes toBuffer()/toString()
// (not toBlob(), which needs a browser Blob). Running this file under the
// node environment lets us render a real PDF and extract its text with
// pdf-parse, so we assert on the actual bytes a user would download.
import { describe, expect, it } from "vitest";
import { pdf } from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import DocumentPdfDocument from "@/components/DocumentPdfDocument";
import mutualNda, { type MutualNdaFields } from "@/lib/documents/mutual-nda";

function makeFormData(overrides: Partial<MutualNdaFields> = {}): MutualNdaFields {
  return {
    ...structuredClone(mutualNda.defaultFields),
    ...overrides,
  };
}

async function renderPdfText(data: MutualNdaFields): Promise<string> {
  const stream = await pdf(<DocumentPdfDocument content={mutualNda} data={data} />).toBuffer();
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

describe("DocumentPdfDocument with the Mutual NDA content module", () => {
  it("produces a valid, non-empty PDF", async () => {
    const buffer = await pdf(<DocumentPdfDocument content={mutualNda} data={makeFormData()} />).toBuffer();
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

  it("includes the DRAFT stamp and the legal-review disclaimer in the PDF text", async () => {
    const text = await renderPdfText(makeFormData());

    expect(text).toContain("DRAFT");
    expect(text).toMatch(/must be reviewed by a qualified\s+attorney/);
  });

  it("renders Cyrillic and Latin Extended party names correctly (Noto Sans coverage)", async () => {
    const data = makeFormData({
      party1: { ...mutualNda.defaultFields.party1, company: "ООО Тест" },
      party2: { ...mutualNda.defaultFields.party2, company: "Müller & Söhne GmbH" },
    });

    const text = await renderPdfText(data);

    expect(text).toContain("ООО Тест");
    expect(text).toContain("Müller & Söhne GmbH");
  });
});
