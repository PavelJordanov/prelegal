import { extractErrorMessage } from "@/lib/api-error";

export interface AuthUser {
  id: number;
  email: string;
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Couldn't create your account. Please try again."),
    );
  }
  return response.json();
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Incorrect email or password."));
  }
  return response.json();
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" });
}

/** Returns null when there's no signed-in user, rather than throwing - callers
 * use this to decide whether to redirect to /login, not to surface an error. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  return response.json();
}
