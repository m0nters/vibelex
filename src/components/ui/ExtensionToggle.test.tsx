import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExtensionToggle } from "./ExtensionToggle";

// react-i18next is globally mocked in src/test/setup.ts
// t("common:enableExtension") → "common:enableExtension", t("common:disableExtension") → "common:disableExtension"

describe("ExtensionToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders as enabled by default (initialValue defaults to true)", () => {
    render(<ExtensionToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("renders as disabled when initialValue is false", () => {
    render(<ExtensionToggle initialValue={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("uses the i18n disableExtension-key as aria-label when enabled", () => {
    render(<ExtensionToggle initialValue={true} />);
    expect(
      screen.getByRole("button", { name: "common:disableExtension" }),
    ).toBeInTheDocument();
  });

  it("uses the i18n enableExtension-key as aria-label when disabled", () => {
    render(<ExtensionToggle initialValue={false} />);
    expect(
      screen.getByRole("button", { name: "common:enableExtension" }),
    ).toBeInTheDocument();
  });

  it("shows the i18n disableExtension-key title when enabled", () => {
    render(<ExtensionToggle initialValue={true} />);
    expect(screen.getByTitle("common:disableExtension")).toBeInTheDocument();
  });

  it("shows the i18n enableExtension-key title when disabled", () => {
    render(<ExtensionToggle initialValue={false} />);
    expect(screen.getByTitle("common:enableExtension")).toBeInTheDocument();
  });

  // ─── Interaction ────────────────────────────────────────────────────────────

  it("toggles from enabled to disabled on click", async () => {
    const user = userEvent.setup();
    render(<ExtensionToggle initialValue={true} />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles from disabled to enabled on click", async () => {
    const user = userEvent.setup();
    render(<ExtensionToggle initialValue={false} />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the new state on every click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ExtensionToggle initialValue={true} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("does not throw when onChange is not provided", async () => {
    const user = userEvent.setup();
    render(<ExtensionToggle />);
    // Should not throw
    await user.click(screen.getByRole("button"));
  });

  it("syncs internal state when initialValue prop changes", () => {
    // Verifies the useEffect([initialValue]) sync behaviour
    const { rerender } = render(<ExtensionToggle initialValue={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

    rerender(<ExtensionToggle initialValue={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
