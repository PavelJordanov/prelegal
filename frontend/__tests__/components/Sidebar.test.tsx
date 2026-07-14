import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/Sidebar";
import { signOut } from "@/lib/auth-client";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard/draft/",
}));

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

const mockedSignOut = vi.mocked(signOut);

describe("Sidebar", () => {
  it("marks the current route as active and leaves others inactive", () => {
    render(<Sidebar userEmail="a@example.com" />);

    expect(screen.getByRole("link", { name: "New Document" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("shows the signed-in user's email", () => {
    render(<Sidebar userEmail="a@example.com" />);

    expect(screen.getByText("a@example.com")).toBeInTheDocument();
  });

  it("signs out and redirects to login", async () => {
    mockedSignOut.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<Sidebar userEmail="a@example.com" />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mockedSignOut).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/login/");
  });
});
