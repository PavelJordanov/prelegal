import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardLayout from "@/app/dashboard/layout";
import { getCurrentUser } from "@/lib/auth-client";

const replace = vi.fn();
// A stable object, not a new literal per call - DashboardLayout's effect
// depends on `router`, and next/navigation's real useRouter() returns a
// stable reference, so a fresh object here would re-fire the effect forever.
const router = { replace, push: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/dashboard/",
}));

vi.mock("@/lib/auth-client", () => ({
  getCurrentUser: vi.fn(),
  signOut: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe("DashboardLayout", () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    replace.mockReset();
  });

  it("redirects to login when there is no signed-in user", async () => {
    mockedGetCurrentUser.mockResolvedValueOnce(null);
    render(
      <DashboardLayout>
        <p>Protected content</p>
      </DashboardLayout>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login/"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the sidebar and children once a user is signed in", async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({ id: 1, email: "a@example.com" });
    render(
      <DashboardLayout>
        <p>Protected content</p>
      </DashboardLayout>,
    );

    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
