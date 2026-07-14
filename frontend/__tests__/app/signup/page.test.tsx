import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/signup/page";
import { signUp } from "@/lib/auth-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth-client", () => ({
  signUp: vi.fn(),
}));

const mockedSignUp = vi.mocked(signUp);

describe("SignupPage", () => {
  afterEach(() => {
    mockedSignUp.mockReset();
    push.mockReset();
  });

  it("creates an account with the entered credentials and navigates to the dashboard", async () => {
    mockedSignUp.mockResolvedValueOnce({ id: 1, email: "new@example.com" });
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(mockedSignUp).toHaveBeenCalledWith("new@example.com", "password123");
    expect(push).toHaveBeenCalledWith("/dashboard/");
  });

  it("rejects a short password before calling the API", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it("shows an error message when the email is already taken", async () => {
    mockedSignUp.mockRejectedValueOnce(new Error("An account with this email already exists."));
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "dup@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("An account with this email already exists."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("links to the login page", () => {
    render(<SignupPage />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });
});
