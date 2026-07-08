import { afterEach, describe, expect, it, vi } from "vitest";
import { postNdaChatTurn } from "@/lib/nda-chat-client";
import { defaultMndaFormData } from "@/lib/mnda-content";

describe("postNdaChatTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the conversation and current fields, returning the parsed response", async () => {
    const responseBody = {
      assistantMessage: "And party 2?",
      fields: { ...defaultMndaFormData, governingLaw: "Delaware" },
      isComplete: false,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Acme Inc" }];
    const result = await postNdaChatTurn(messages, defaultMndaFormData);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/nda/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages, currentFields: defaultMndaFormData }),
      }),
    );
    expect(result).toEqual(responseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }),
    );

    await expect(postNdaChatTurn([], defaultMndaFormData)).rejects.toThrow(
      "temporarily unavailable",
    );
  });
});
