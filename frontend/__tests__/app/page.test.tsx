import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Home from "@/app/page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("Home page", () => {
  it("redirects to the login screen", () => {
    render(<Home />);

    expect(replace).toHaveBeenCalledWith("/login/");
  });
});
