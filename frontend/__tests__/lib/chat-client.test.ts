import { afterEach, describe, expect, it, vi } from "vitest";
import { postChatTurn } from "@/lib/chat-client";

describe("postChatTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the conversation, document id/type, and current fields, returning the parsed response", async () => {
    const responseBody = {
      documentId: 3,
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
    const result = await postChatTurn(messages, 3, "mutual-nda", { purpose: "Testing." });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          messages,
          documentId: 3,
          documentType: "mutual-nda",
          currentFields: { purpose: "Testing." },
        }),
      }),
    );
    expect(result).toEqual(responseBody);
  });

  it("posts a null document id/type while intake is unresolved", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          documentId: null,
          documentType: null,
          assistantMessage: "...",
          fields: {},
          isComplete: false,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await postChatTurn([], null, null, {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        body: JSON.stringify({ messages: [], documentId: null, documentType: null, currentFields: {} }),
      }),
    );
  });

  it("throws a session-expired message when the response is a 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 401, ok: false, json: () => Promise.resolve({}) }),
    );

    await expect(postChatTurn([], null, null, {})).rejects.toThrow("session has expired");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 500, ok: false, json: () => Promise.resolve({}) }),
    );

    await expect(postChatTurn([], null, null, {})).rejects.toThrow("temporarily unavailable");
  });
});
