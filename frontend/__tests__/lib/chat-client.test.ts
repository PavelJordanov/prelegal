import { afterEach, describe, expect, it, vi } from "vitest";
import { postChatTurn } from "@/lib/chat-client";

describe("postChatTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the conversation, document type, and current fields, returning the parsed response", async () => {
    const responseBody = {
      documentType: "mutual-nda",
      assistantMessage: "And party 2?",
      fields: { governingLaw: "Delaware" },
      isComplete: false,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Acme Inc" }];
    const result = await postChatTurn(messages, "mutual-nda", { purpose: "Testing." });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          messages,
          documentType: "mutual-nda",
          currentFields: { purpose: "Testing." },
        }),
      }),
    );
    expect(result).toEqual(responseBody);
  });

  it("posts a null document type while intake is unresolved", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ documentType: null, assistantMessage: "...", fields: {}, isComplete: false }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await postChatTurn([], null, {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        body: JSON.stringify({ messages: [], documentType: null, currentFields: {} }),
      }),
    );
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }),
    );

    await expect(postChatTurn([], null, {})).rejects.toThrow("temporarily unavailable");
  });
});
