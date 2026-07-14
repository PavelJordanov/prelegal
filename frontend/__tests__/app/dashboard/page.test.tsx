import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

describe("DashboardPage", () => {
  it("shows a link to start a new document", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "Start a new document" })).toHaveAttribute(
      "href",
      "/dashboard/draft",
    );
  });

  it("shows a link to view previously drafted documents", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "View my documents" })).toHaveAttribute(
      "href",
      "/dashboard/documents",
    );
  });
});
