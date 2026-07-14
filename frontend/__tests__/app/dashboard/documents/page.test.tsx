import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentsPage from "@/app/dashboard/documents/page";
import { deleteDocument, listDocuments } from "@/lib/documents-client";

vi.mock("@/lib/documents-client", () => ({
  listDocuments: vi.fn(),
  deleteDocument: vi.fn(),
}));

const mockedList = vi.mocked(listDocuments);
const mockedDelete = vi.mocked(deleteDocument);

const SAMPLE_DOC = {
  id: 1,
  documentType: "mutual-nda" as const,
  isComplete: false,
  createdAt: "2026-07-01 10:00:00",
  updatedAt: "2026-07-02 12:30:00",
};

describe("DocumentsPage", () => {
  afterEach(() => {
    mockedList.mockReset();
    mockedDelete.mockReset();
  });

  it("shows the empty state with a CTA when there are no documents", async () => {
    mockedList.mockResolvedValueOnce([]);
    render(<DocumentsPage />);

    expect(await screen.findByText("No documents yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a new document" })).toHaveAttribute(
      "href",
      "/dashboard/draft",
    );
  });

  it("lists a document with its title, status, and a Continue link when incomplete", async () => {
    mockedList.mockResolvedValueOnce([SAMPLE_DOC]);
    render(<DocumentsPage />);

    expect(await screen.findByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/dashboard/draft?id=1",
    );
  });

  it("shows a View link and Complete status for a finished document", async () => {
    mockedList.mockResolvedValueOnce([{ ...SAMPLE_DOC, isComplete: true }]);
    render(<DocumentsPage />);

    expect(await screen.findByText("Complete")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/dashboard/draft?id=1",
    );
  });

  it("shows an error state with a retry that reloads the list", async () => {
    mockedList.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<DocumentsPage />);

    expect(await screen.findByText(/couldn't load your documents/i)).toBeInTheDocument();

    mockedList.mockResolvedValueOnce([SAMPLE_DOC]);
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
  });

  it("deletes a document after an inline confirmation", async () => {
    mockedList.mockResolvedValueOnce([SAMPLE_DOC]);
    mockedDelete.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<DocumentsPage />);

    await screen.findByText("Mutual Non-Disclosure Agreement");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
    expect(screen.queryByText("Mutual Non-Disclosure Agreement")).not.toBeInTheDocument();
  });

  it("cancels the delete confirmation without deleting", async () => {
    mockedList.mockResolvedValueOnce([SAMPLE_DOC]);
    const user = userEvent.setup();
    render(<DocumentsPage />);

    await screen.findByText("Mutual Non-Disclosure Agreement");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockedDelete).not.toHaveBeenCalled();
    expect(screen.getByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
  });
});
