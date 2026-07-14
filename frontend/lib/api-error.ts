/** Pulls the backend's `detail` message out of a non-ok JSON response, e.g.
 * `{"detail": "Document not found."}` - falls back to a generic message
 * when the body isn't JSON or doesn't have that shape. Shared by every
 * lib/*-client.ts fetch wrapper so error messages stay consistent. */
export async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // Response body wasn't JSON - fall through to the generic message.
  }
  return fallback;
}
