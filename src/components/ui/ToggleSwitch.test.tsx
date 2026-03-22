import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleSwitch } from "./ToggleSwitch";

// react-i18next is globally mocked in src/test/setup.ts
// t("common:on") → "common:on", t("common:off") → "common:off"

describe("ToggleSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders as enabled by default (initialValue defaults to true)", () => {
    render(<ToggleSwitch />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("renders as disabled when initialValue is false", () => {
    render(<ToggleSwitch initialValue={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("uses the label prop as aria-label on the button", () => {
    render(<ToggleSwitch label="Dark mode" />);
    expect(screen.getByRole("button", { name: "Dark mode" })).toBeInTheDocument();
  });

  it("uses the default aria-label 'Enable Extension' when no label provided", () => {
    render(<ToggleSwitch />);
    expect(
      screen.getByRole("button", { name: "Enable Extension" }),
    ).toBeInTheDocument();
  });

  it("shows the i18n on-key text when enabled", () => {
    render(<ToggleSwitch initialValue={true} />);
    // t("common:on") returns "common:on" in test environment
    expect(screen.getByText("common:on")).toBeInTheDocument();
  });

  it("shows the i18n off-key text when disabled", () => {
    render(<ToggleSwitch initialValue={false} />);
    expect(screen.getByText("common:off")).toBeInTheDocument();
  });

  // ─── Interaction ────────────────────────────────────────────────────────────

  it("toggles from enabled to disabled on click", async () => {
    const user = userEvent.setup();
    render(<ToggleSwitch initialValue={true} />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles from disabled to enabled on click", async () => {
    const user = userEvent.setup();
    render(<ToggleSwitch initialValue={false} />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the new state on every click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch initialValue={true} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("does not throw when onChange is not provided", async () => {
    const user = userEvent.setup();
    render(<ToggleSwitch />);
    // Should not throw
    await user.click(screen.getByRole("button"));
  });

  it("syncs internal state when initialValue prop changes", () => {
    // Verifies the useEffect([initialValue]) sync behaviour
    const { rerender } = render(<ToggleSwitch initialValue={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

    rerender(<ToggleSwitch initialValue={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
