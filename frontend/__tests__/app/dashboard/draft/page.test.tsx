import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { pdf } from "@react-pdf/renderer";
import DraftPage from "@/app/dashboard/draft/page";
import type { DraftTurnResult } from "@/components/DraftChat";
import { getDocument } from "@/lib/documents-client";

// The chat conversation flow itself is covered by __tests__/components/DraftChat.test.tsx.
// Here we only care about page.tsx's wiring: does the preview appear once a document type
// resolves, does it reflect fields DraftChat reports, is Download correctly gated, and does
// a ?id= query param hydrate an existing draft.
let resolveToBlob: (blob: Blob) => void;
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

vi.mock("@/lib/documents-client", () => ({
  getDocument: vi.fn(),
}));

const mockedGetDocument = vi.mocked(getDocument);

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
  default: ({
    documentId,
    initialMessages,
    onTurnComplete,
  }: {
    documentId: number | null;
    initialMessages?: unknown[];
    onTurnComplete: (result: DraftTurnResult) => void;
  }) => (
    <div>
      <p data-testid="document-id">{String(documentId)}</p>
      <p data-testid="initial-message-count">{initialMessages?.length ?? 0}</p>
      <button
        onClick={() =>
          onTurnComplete({
            documentId: 42,
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
            documentId: 42,
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
    searchParams = new URLSearchParams();
    createObjectURL = vi.fn(() => "blob:mock-url");
    revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clickSpy.mockRestore();
    mockedGetDocument.mockReset();
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

  it("loads and hydrates an existing draft when ?id= is present", async () => {
    searchParams = new URLSearchParams("id=5");
    mockedGetDocument.mockResolvedValueOnce({
      id: 5,
      documentType: "mutual-nda",
      isComplete: false,
      createdAt: "2026-07-01 00:00:00",
      updatedAt: "2026-07-01 00:00:00",
      fields: { "party1.name": "Acme Corp" },
      messages: [{ role: "assistant", content: "Welcome back" }],
    });

    render(<DraftPage />);

    expect(screen.getByText(/loading your draft/i)).toBeInTheDocument();
    expect(await screen.findByTestId("document-id")).toHaveTextContent("5");
    expect(screen.getByTestId("initial-message-count")).toHaveTextContent("1");
    const preview = screen.getByRole("article");
    expect(within(preview).getByText("Acme Corp")).toBeInTheDocument();
  });

  it("resets all draft state when navigating from a resumed draft to a fresh document", async () => {
    searchParams = new URLSearchParams("id=5");
    mockedGetDocument.mockResolvedValueOnce({
      id: 5,
      documentType: "mutual-nda",
      isComplete: false,
      createdAt: "2026-07-01 00:00:00",
      updatedAt: "2026-07-01 00:00:00",
      fields: { "party1.name": "Acme Corp" },
      messages: [{ role: "assistant", content: "Welcome back" }],
    });

    const { rerender } = render(<DraftPage />);
    expect(await screen.findByTestId("document-id")).toHaveTextContent("5");

    // Simulate clicking the sidebar's "New Document" link while a draft is
    // open: the App Router re-renders this same route without unmounting it,
    // it just resolves a new (empty) query string.
    searchParams = new URLSearchParams();
    rerender(<DraftPage />);

    expect(await screen.findByTestId("document-id")).toHaveTextContent("null");
    expect(screen.getByTestId("initial-message-count")).toHaveTextContent("0");
    expect(screen.getByText(/preview will appear here/i)).toBeInTheDocument();
  });

  it("shows an error and starts fresh when loading a draft fails", async () => {
    searchParams = new URLSearchParams("id=999");
    mockedGetDocument.mockRejectedValueOnce(new Error("not found"));

    render(<DraftPage />);

    expect(await screen.findByText(/couldn't load that draft/i)).toBeInTheDocument();
    expect(screen.getByTestId("document-id")).toHaveTextContent("null");
  });
});
