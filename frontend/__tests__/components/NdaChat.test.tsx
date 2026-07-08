import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaChat from "@/components/NdaChat";
import { postNdaChatTurn } from "@/lib/nda-chat-client";
import { defaultMndaFormData } from "@/lib/mnda-content";

vi.mock("@/lib/nda-chat-client", () => ({
  postNdaChatTurn: vi.fn(),
}));

const mockedPostNdaChatTurn = vi.mocked(postNdaChatTurn);

describe("NdaChat", () => {
  afterEach(() => {
    mockedPostNdaChatTurn.mockReset();
  });

  it("greets the user without making a network call", () => {
    render(
      <NdaChat fields={defaultMndaFormData} onFieldsChange={vi.fn()} onCompleteChange={vi.fn()} />,
    );

    expect(screen.getByRole("log")).toHaveTextContent(/set up your Mutual NDA/i);
    expect(mockedPostNdaChatTurn).not.toHaveBeenCalled();
  });

  it("sends the user's reply and renders the assistant's response", async () => {
    let resolveTurn!: (value: Awaited<ReturnType<typeof postNdaChatTurn>>) => void;
    mockedPostNdaChatTurn.mockReturnValue(
      new Promise((resolve) => {
        resolveTurn = resolve;
      }),
    );
    const onFieldsChange = vi.fn();
    const onCompleteChange = vi.fn();
    const user = userEvent.setup();

    render(
      <NdaChat
        fields={defaultMndaFormData}
        onFieldsChange={onFieldsChange}
        onCompleteChange={onCompleteChange}
      />,
    );

    await user.type(screen.getByLabelText("Your reply"), "Acme Inc and Beta LLC");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByRole("log")).toHaveTextContent("Acme Inc and Beta LLC");
    expect(screen.getByText("Prelegal is thinking…")).toBeInTheDocument();

    const nextFields = { ...defaultMndaFormData, governingLaw: "Delaware" };
    resolveTurn({
      assistantMessage: "Got it — what's the purpose of this NDA?",
      fields: nextFields,
      isComplete: false,
    });

    expect(await screen.findByText("Got it — what's the purpose of this NDA?")).toBeInTheDocument();
    expect(onFieldsChange).toHaveBeenCalledWith(nextFields);
    expect(onCompleteChange).toHaveBeenCalledWith(false);
  });

  it("shows a retry option when the request fails, and resends on retry", async () => {
    mockedPostNdaChatTurn.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();

    render(
      <NdaChat fields={defaultMndaFormData} onFieldsChange={vi.fn()} onCompleteChange={vi.fn()} />,
    );

    await user.type(screen.getByLabelText("Your reply"), "Acme Inc");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Something went wrong.")).toBeInTheDocument();

    mockedPostNdaChatTurn.mockResolvedValueOnce({
      assistantMessage: "Thanks!",
      fields: defaultMndaFormData,
      isComplete: false,
    });
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Thanks!")).toBeInTheDocument();
    expect(mockedPostNdaChatTurn).toHaveBeenCalledTimes(2);
  });
});
