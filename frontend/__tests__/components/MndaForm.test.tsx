import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MndaForm from "@/components/MndaForm";
import { defaultMndaFormData, type MndaFormData } from "@/lib/mnda-content";

// MndaForm is a controlled component; wrap it in local state so that typing
// through user-event actually round-trips through onChange like it would in
// the real app (a static onChange no-op would leave inputs frozen).
function ControlledForm({ initial }: { initial?: Partial<MndaFormData> }) {
  const [value, setValue] = useState<MndaFormData>({
    ...structuredClone(defaultMndaFormData),
    ...initial,
  });
  return <MndaForm value={value} onChange={setValue} />;
}

describe("MndaForm", () => {
  it("renders labeled fields for both parties, scoped to their own fieldset", async () => {
    render(<ControlledForm />);
    const party1 = screen.getByRole("group", { name: "Party 1" });
    const party2 = screen.getByRole("group", { name: "Party 2" });

    expect(within(party1).getByLabelText("Name")).toBeInTheDocument();
    expect(within(party1).getByLabelText("Notice Address")).toBeInTheDocument();
    expect(within(party2).getByLabelText("Name")).toBeInTheDocument();
    expect(within(party2).getByLabelText("Notice Address")).toBeInTheDocument();
  });

  it("updates Party 1 name as the user types, independently of Party 2", async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    const party1 = screen.getByRole("group", { name: "Party 1" });
    const party2 = screen.getByRole("group", { name: "Party 2" });

    await user.type(within(party1).getByLabelText("Name"), "Acme Corp");

    expect(within(party1).getByLabelText("Name")).toHaveValue("Acme Corp");
    expect(within(party2).getByLabelText("Name")).toHaveValue("");
  });

  it("gives the Effective Date input an accessible label", () => {
    render(<ControlledForm />);
    // Regression guard: the date input previously had an empty <label>,
    // leaving it with no accessible name for screen reader users.
    expect(screen.getByLabelText("Effective Date")).toHaveAttribute("type", "date");
  });

  it("gives the MNDA Term year input its own accessible name via a sibling label", () => {
    render(<ControlledForm />);
    // Regression guard: the radio and the year input previously shared a
    // single <label>, which the HTML spec disallows for two labelable
    // elements and left the year input without a clear accessible name.
    const yearsInput = screen.getByLabelText("year(s) from Effective Date");
    expect(yearsInput).toHaveAttribute("type", "number");
  });

  it("toggles between MNDA Term options and disables the year input when not selected", async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);

    const expiresRadio = screen.getByRole("radio", { name: "Expires" });
    const continuesRadio = screen.getByRole("radio", {
      name: "Continues until terminated in accordance with the terms of the MNDA",
    });
    const yearsInput = screen.getByLabelText("year(s) from Effective Date");

    expect(expiresRadio).toBeChecked();
    expect(yearsInput).toBeEnabled();

    await user.click(continuesRadio);

    expect(continuesRadio).toBeChecked();
    expect(expiresRadio).not.toBeChecked();
    expect(yearsInput).toBeDisabled();
  });

  it.each([
    ["0", 1],
    ["-5", 1],
    ["2.7", 3],
    ["4", 4],
  ])("clamps MNDA Term years input %s to %i once the field is blurred", async (typed, expected) => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    const yearsInput = screen.getByLabelText("year(s) from Effective Date");

    await user.clear(yearsInput);
    await user.type(yearsInput, typed);
    await user.tab();

    expect(yearsInput).toHaveValue(expected);
  });

  it("does not mangle a negative sign typed character-by-character before the field is blurred", async () => {
    // Regression guard: clamping used to run on every keystroke, which
    // stomped the leading "-" before the rest of the number could be typed
    // (typing "-5" one character at a time produced "15" instead of
    // clamping to 1 on blur). See lib/mnda-content and MndaForm review notes.
    const user = userEvent.setup();
    render(<ControlledForm />);
    const yearsInput = screen.getByLabelText("year(s) from Effective Date");

    await user.clear(yearsInput);
    await user.type(yearsInput, "-5");

    // While still focused, the field reflects exactly what was typed.
    expect(yearsInput).toHaveValue(-5);

    await user.tab();

    // Once blurred, it's normalized to a valid positive integer.
    expect(yearsInput).toHaveValue(1);
  });

  it("does not round a decimal mid-typing before the field is blurred", async () => {
    // Regression guard: an earlier fix that resynced local input state from
    // the `years` prop on every render (to satisfy an eslint effect-cleanup
    // rule) round-tripped each valid keystroke's Math.round()'d value back
    // down as a prop update, which snapped "2.7" to "3" while still
    // focused -- the same class of bug the -5 test above guards against,
    // just reached via a different path. See MndaForm.tsx's YearsInput.
    const user = userEvent.setup();
    render(<ControlledForm />);
    const yearsInput = screen.getByLabelText("year(s) from Effective Date");

    await user.clear(yearsInput);
    await user.type(yearsInput, "2.7");

    expect(yearsInput).toHaveValue(2.7);

    await user.tab();

    expect(yearsInput).toHaveValue(3);
  });

  it("selects 'In perpetuity' for Term of Confidentiality and disables its year input", async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);

    const perpetuityRadio = screen.getByRole("radio", { name: "In perpetuity" });
    const confidentialityYearsInput = screen.getByLabelText(
      "year(s) from Effective Date (trade secrets protected until no longer a trade secret)",
    );

    await user.click(perpetuityRadio);

    expect(perpetuityRadio).toBeChecked();
    expect(confidentialityYearsInput).toBeDisabled();
  });

  it("updates Governing Law and Jurisdiction independently", async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);

    await user.type(screen.getByLabelText("Governing Law (state)"), "Delaware");
    await user.type(
      screen.getByLabelText("Jurisdiction (city/county and state)"),
      "New Castle, DE",
    );

    expect(screen.getByLabelText("Governing Law (state)")).toHaveValue("Delaware");
    expect(screen.getByLabelText("Jurisdiction (city/county and state)")).toHaveValue(
      "New Castle, DE",
    );
  });
});
