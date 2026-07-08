import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

describe("DashboardPage", () => {
  it("shows a sign out link back to the login screen", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "Sign out" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("shows a link to start a new Mutual NDA", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "New Mutual NDA" })).toHaveAttribute(
      "href",
      "/dashboard/nda",
    );
  });
});
