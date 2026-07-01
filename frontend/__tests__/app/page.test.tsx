import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// PDF content correctness (substitution, grammar) is covered by
// __tests__/components/MndaPdfDocument.test.tsx, which renders real PDF
// bytes. Here we only care about page.tsx's wiring: does clicking Download
// trigger generation, disable the button while pending, and hand the
// browser a correctly-named download. jsdom doesn't implement
// URL.createObjectURL, and letting @react-pdf/renderer actually render in
// a DOM environment is slow/flaky, so both are mocked.
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

describe("Home page", () => {
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

  it("updates the live preview as the user fills in the form", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const party1 = screen.getByRole("group", { name: "Party 1" });
    await user.type(within(party1).getByLabelText("Name"), "Acme Corp");

    const preview = screen.getByRole("article");
    expect(within(preview).getByText("Acme Corp")).toBeInTheDocument();
  });

  it("disables the Download button while generating, then triggers a correctly-named download", async () => {
    const user = userEvent.setup();
    const createElementSpy = vi.spyOn(document, "createElement");
    render(<Home />);

    const downloadButton = screen.getByRole("button", { name: "Download PDF" });
    expect(downloadButton).toBeEnabled();

    await user.click(downloadButton);

    expect(await screen.findByRole("button", { name: "Generating..." })).toBeDisabled();
    expect(clickSpy).not.toHaveBeenCalled();

    resolveToBlob!(new Blob(["fake-pdf"], { type: "application/pdf" }));

    await screen.findByRole("button", { name: "Download PDF" });
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    const anchor = createElementSpy.mock.results.find(
      (r) => r.value instanceof HTMLAnchorElement,
    )?.value as HTMLAnchorElement;
    expect(anchor.download).toBe("Mutual-NDA.pdf");
    expect(anchor.href).toContain("blob:mock-url");
  });
});
