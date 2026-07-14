import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DraftChat from "@/components/DraftChat";
import { postChatTurn } from "@/lib/chat-client";

vi.mock("@/lib/chat-client", () => ({
  postChatTurn: vi.fn(),
}));

const mockedPostChatTurn = vi.mocked(postChatTurn);

describe("DraftChat", () => {
  afterEach(() => {
    mockedPostChatTurn.mockReset();
  });

  it("greets the user without making a network call", () => {
    render(
      <DraftChat documentId={null} documentType={null} fields={{}} onTurnComplete={vi.fn()} />,
    );

    expect(screen.getByRole("log")).toHaveTextContent(/what kind of agreement/i);
    expect(mockedPostChatTurn).not.toHaveBeenCalled();
  });

  it("resumes from an existing transcript instead of greeting", () => {
    render(
      <DraftChat
        documentId={7}
        documentType="mutual-nda"
        fields={{}}
        initialMessages={[
          { role: "assistant", content: "What's the purpose of this NDA?" },
          { role: "user", content: "Evaluating a partnership" },
        ]}
        onTurnComplete={vi.fn()}
      />,
    );

    expect(screen.getByRole("log")).toHaveTextContent("What's the purpose of this NDA?");
    expect(screen.getByRole("log")).toHaveTextContent("Evaluating a partnership");
    expect(screen.queryByText(/what kind of agreement/i)).not.toBeInTheDocument();
  });

  it("sends the user's reply with the document id and reports the resolved fields", async () => {
    let resolveTurn!: (value: Awaited<ReturnType<typeof postChatTurn>>) => void;
    mockedPostChatTurn.mockReturnValue(
      new Promise((resolve) => {
        resolveTurn = resolve;
      }),
    );
    const onTurnComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <DraftChat documentId={3} documentType="mutual-nda" fields={{}} onTurnComplete={onTurnComplete} />,
    );

    await user.type(screen.getByLabelText("Your reply"), "I need an NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByRole("log")).toHaveTextContent("I need an NDA");
    expect(screen.getByText("Prelegal is thinking…")).toBeInTheDocument();
    expect(mockedPostChatTurn).toHaveBeenCalledWith(
      [
        { role: "assistant", content: expect.stringContaining("what kind of agreement") },
        { role: "user", content: "I need an NDA" },
      ],
      3,
      "mutual-nda",
      {},
    );

    resolveTurn({
      documentId: 3,
      documentType: "mutual-nda",
      assistantMessage: "Let's draft your NDA — what's the purpose?",
      fields: { governingLaw: "Delaware" },
      isComplete: false,
    });

    expect(await screen.findByText("Let's draft your NDA — what's the purpose?")).toBeInTheDocument();
    expect(onTurnComplete).toHaveBeenCalledWith({
      documentId: 3,
      documentType: "mutual-nda",
      fields: { governingLaw: "Delaware" },
      isComplete: false,
    });
  });

  it("shows a retry option when the request fails, and resends on retry", async () => {
    mockedPostChatTurn.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();

    render(
      <DraftChat documentId={null} documentType={null} fields={{}} onTurnComplete={vi.fn()} />,
    );

    await user.type(screen.getByLabelText("Your reply"), "Acme Inc");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("network error")).toBeInTheDocument();

    mockedPostChatTurn.mockResolvedValueOnce({
      documentId: null,
      documentType: null,
      assistantMessage: "Thanks!",
      fields: {},
      isComplete: false,
    });
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Thanks!")).toBeInTheDocument();
    expect(mockedPostChatTurn).toHaveBeenCalledTimes(2);
  });

  it("surfaces a session-expired message distinctly from a generic failure", async () => {
    mockedPostChatTurn.mockRejectedValueOnce(
      new Error("Your session has expired. Please sign in again."),
    );
    const user = userEvent.setup();

    render(
      <DraftChat documentId={null} documentType={null} fields={{}} onTurnComplete={vi.fn()} />,
    );

    await user.type(screen.getByLabelText("Your reply"), "Acme Inc");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Your session has expired. Please sign in again."),
    ).toBeInTheDocument();
  });

  it("falls back to a generic message for a non-Error rejection", async () => {
    mockedPostChatTurn.mockRejectedValueOnce("not an Error instance");
    const user = userEvent.setup();

    render(
      <DraftChat documentId={null} documentType={null} fields={{}} onTurnComplete={vi.fn()} />,
    );

    await user.type(screen.getByLabelText("Your reply"), "Acme Inc");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Something went wrong.")).toBeInTheDocument();
  });
});
