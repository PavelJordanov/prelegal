import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { pdf } from "@react-pdf/renderer";
import DraftPage from "@/app/dashboard/draft/page";
import type { DraftTurnResult } from "@/components/DraftChat";

// The chat conversation flow itself is covered by __tests__/components/DraftChat.test.tsx.
// Here we only care about page.tsx's wiring: does the preview appear once a document type
// resolves, does it reflect fields DraftChat reports, and is Download correctly gated.
let resolveToBlob: (blob: Blob) => void;

vi.mock("@react-pdf/renderer", async () => {
  const actual = await vi.importActual<typeof import("@react-pdf/renderer")>(
    "@react-pdf/renderer",
  );
  return {
    ...actual,
    pdf: vi.fn(() => ({
      toBlob: () =>
        new Promise<Blob>((resolve) => {
          resolveToBlob = resolve;
        }),
    })),
  };
});

vi.mock("@/components/DraftChat", () => ({
  default: ({ onTurnComplete }: { onTurnComplete: (result: DraftTurnResult) => void }) => (
    <div>
      <button
        onClick={() =>
          onTurnComplete({
            documentType: "mutual-nda",
            fields: { "party1.name": "Acme Corp" },
            isComplete: false,
          })
        }
      >
        Simulate document match
      </button>
      <button
        onClick={() =>
          onTurnComplete({
            documentType: "mutual-nda",
            fields: { "party1.name": "Acme Corp" },
            isComplete: true,
          })
        }
      >
        Simulate complete
      </button>
    </div>
  ),
}));

describe("DraftPage", () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => "blob:mock-url");
    revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clickSpy.mockRestore();
  });

  it("shows a placeholder until the document type is known, then the preview", async () => {
    const user = userEvent.setup();
    render(<DraftPage />);

    expect(screen.getByText(/preview will appear here/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Simulate document match" }));

    const preview = screen.getByRole("article");
    expect(within(preview).getByText("Acme Corp")).toBeInTheDocument();
  });

  it("disables Download until the chat reports completion, then downloads the PDF", async () => {
    const user = userEvent.setup();
    const createElementSpy = vi.spyOn(document, "createElement");
    render(<DraftPage />);

    expect(screen.getByRole("button", { name: "Download PDF" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Simulate complete" }));
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(await screen.findByRole("button", { name: "Generating..." })).toBeDisabled();

    resolveToBlob!(new Blob(["fake-pdf"], { type: "application/pdf" }));

    await screen.findByRole("button", { name: "Download PDF" });
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const anchor = createElementSpy.mock.results.find(
      (r) => r.value instanceof HTMLAnchorElement && r.value.download,
    )?.value as HTMLAnchorElement;
    expect(anchor.download).toBe("Mutual-NDA.pdf");
  });

  it("shows an error message and re-enables Download when PDF generation fails", async () => {
    vi.mocked(pdf).mockReturnValueOnce({
      toBlob: () => Promise.reject(new Error("rendering failed")),
    } as ReturnType<typeof pdf>);
    const user = userEvent.setup();
    render(<DraftPage />);

    await user.click(screen.getByRole("button", { name: "Simulate complete" }));
    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(
      await screen.findByText("Something went wrong generating the PDF. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
