import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { signIn } from "@/lib/auth-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: vi.fn(),
}));

const mockedSignIn = vi.mocked(signIn);

describe("LoginPage", () => {
  afterEach(() => {
    mockedSignIn.mockReset();
    push.mockReset();
  });

  it("signs in with the entered credentials and navigates to the dashboard", async () => {
    mockedSignIn.mockResolvedValueOnce({ id: 1, email: "a@example.com" });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockedSignIn).toHaveBeenCalledWith("a@example.com", "password123");
    expect(push).toHaveBeenCalledWith("/dashboard/");
  });

  it("shows an error message and does not navigate when sign-in fails", async () => {
    mockedSignIn.mockRejectedValueOnce(new Error("Incorrect email or password."));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("links to the signup page", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
  });
});
