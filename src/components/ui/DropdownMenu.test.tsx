import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenu } from "./DropdownMenu";

// react-i18next is globally mocked in setup.ts: t(key) → key
//
// NOTE: DropdownMenu always mounts all option buttons in the DOM.
// Open/closed state is CSS-only (opacity + pointer-events on the panel div).
// We assert open/closed by checking the panel's className for "opacity-0".

const OPTIONS = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "fr", label: "French" },
];

const defaultProps = {
  value: "en",
  options: OPTIONS,
  onChange: vi.fn(),
};

/** The trigger is the first button (type="button") in the component. */
const getTrigger = () => screen.getAllByRole("button")[0];

/**
 * The options panel is the sibling div below the trigger.
 * It has class "opacity-0" when closed, "opacity-100" when open.
 */
const isPanelOpen = (container: HTMLElement) => {
  const panel = container.querySelector<HTMLElement>(".absolute.top-full");
  return panel ? !panel.className.includes("opacity-0") : false;
};

describe("DropdownMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders the currently selected option label in the trigger button", () => {
    render(<DropdownMenu {...defaultProps} />);
    expect(getTrigger().textContent).toContain("English");
  });

  it("renders the panel in closed state initially", () => {
    const { container } = render(<DropdownMenu {...defaultProps} />);
    expect(isPanelOpen(container)).toBe(false);
  });

  it("always mounts all option buttons regardless of open state", () => {
    render(<DropdownMenu {...defaultProps} />);
    // All 3 options + 1 trigger = 4 buttons always in DOM
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  // ─── Open / Close ───────────────────────────────────────────────────────────

  it("opens the panel when the trigger is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<DropdownMenu {...defaultProps} />);

    await user.click(getTrigger());

    expect(isPanelOpen(container)).toBe(true);
  });

  it("closes the panel after an option is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<DropdownMenu {...defaultProps} />);

    await user.click(getTrigger()); // open
    expect(isPanelOpen(container)).toBe(true);

    const optionButtons = screen.getAllByRole("button").slice(1);
    const french = optionButtons.find((b) => b.textContent === "French")!;
    await user.click(french);

    expect(isPanelOpen(container)).toBe(false);
  });

  it("closes the panel when Escape is pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<DropdownMenu {...defaultProps} />);

    await user.click(getTrigger()); // open
    expect(isPanelOpen(container)).toBe(true);

    await user.keyboard("{Escape}");
    expect(isPanelOpen(container)).toBe(false);
  });

  // ─── onChange ───────────────────────────────────────────────────────────────

  it("calls onChange with the value when an option is clicked", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu {...defaultProps} />);

    await user.click(getTrigger()); // open
    const vietnamese = screen
      .getAllByRole("button")
      .find((b) => b.textContent === "Vietnamese")!;
    await user.click(vietnamese);

    expect(defaultProps.onChange).toHaveBeenCalledWith("vi");
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
  });

  it("calls onChange even when the already-selected option is re-clicked", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu {...defaultProps} value="en" />);

    await user.click(getTrigger()); // open
    const english = screen
      .getAllByRole("button")
      .slice(1) // skip the trigger button
      .find((b) => b.textContent === "English")!;
    await user.click(english);

    expect(defaultProps.onChange).toHaveBeenCalledWith("en");
  });

  // ─── Sorting ────────────────────────────────────────────────────────────────

  it("renders options in alphabetical order by default (isSorted=true)", () => {
    render(<DropdownMenu {...defaultProps} />);
    // Option buttons are buttons 1-3 (index 0 is trigger)
    const labels = screen
      .getAllByRole("button")
      .slice(1)
      .map((b) => b.textContent);
    expect(labels).toEqual(["English", "French", "Vietnamese"]);
  });

  it("preserves original option order when isSorted is false", () => {
    render(<DropdownMenu {...defaultProps} isSorted={false} />);
    const labels = screen
      .getAllByRole("button")
      .slice(1)
      .map((b) => b.textContent);
    expect(labels).toEqual(["English", "Vietnamese", "French"]);
  });

  // ─── Pinned option ──────────────────────────────────────────────────────────

  it("places the pinned option first even when alphabetical sort is on", () => {
    render(
      <DropdownMenu {...defaultProps} pin={{ value: "vi", label: "Vietnamese" }} />,
    );
    // Option buttons are 1-3; index 1 should be the pinned option
    const firstOption = screen.getAllByRole("button")[1];
    expect(firstOption.textContent).toBe("Vietnamese");
  });

  // ─── Search ─────────────────────────────────────────────────────────────────

  it("shows a search input when canSearch is true and panel is open", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu {...defaultProps} canSearch />);

    await user.click(getTrigger()); // open
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("filters visible option buttons by search term", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu {...defaultProps} canSearch />);

    await user.click(getTrigger()); // open
    await user.type(screen.getByRole("textbox"), "fren");

    // Only "French" should remain as an option button
    // Buttons: trigger(1) + textbox is not a button + remaining option buttons
    const optionButtons = screen
      .getAllByRole("button")
      .filter((b) => b !== getTrigger());
    expect(optionButtons.map((b) => b.textContent)).toEqual(["French"]);
  });

  it("shows 'no options found' i18n key when search yields no results", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu {...defaultProps} canSearch />);

    await user.click(getTrigger()); // open
    await user.type(screen.getByRole("textbox"), "xyzxyzxyz");

    // t("dropdown.noOptionsFound") → "dropdown.noOptionsFound" in test env
    expect(screen.getByText("dropdown.noOptionsFound")).toBeInTheDocument();
    // No option buttons remain (only the trigger)
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  // ─── searchTerms (transliteration) ─────────────────────────────────────────

  it("matches options by searchTerms when label does not match", async () => {
    const user = userEvent.setup();
    const optionsWithSearchTerms = [
      { value: "zh", label: "中文", searchTerms: ["Zhong Wen", "Chinese"] },
      { value: "ja", label: "日本語", searchTerms: ["Ri Ben Yu", "Japanese"] },
      { value: "en", label: "English" },
    ];
    render(
      <DropdownMenu
        {...defaultProps}
        options={optionsWithSearchTerms}
        canSearch
      />,
    );

    await user.click(getTrigger()); // open
    await user.type(screen.getByRole("textbox"), "Zhong");

    const optionButtons = screen
      .getAllByRole("button")
      .filter((b) => b !== getTrigger());
    expect(optionButtons.map((b) => b.textContent)).toEqual(["中文"]);
  });

  it("matches options by English name in searchTerms", async () => {
    const user = userEvent.setup();
    const optionsWithSearchTerms = [
      { value: "zh", label: "中文", searchTerms: ["Zhong Wen", "Chinese"] },
      { value: "ja", label: "日本語", searchTerms: ["Ri Ben Yu", "Japanese"] },
      { value: "ko", label: "한국어", searchTerms: ["hangugeo", "Korean"] },
    ];
    render(
      <DropdownMenu
        {...defaultProps}
        options={optionsWithSearchTerms}
        canSearch
      />,
    );

    await user.click(getTrigger()); // open
    await user.type(screen.getByRole("textbox"), "Japanese");

    const optionButtons = screen
      .getAllByRole("button")
      .filter((b) => b !== getTrigger());
    expect(optionButtons.map((b) => b.textContent)).toEqual(["日本語"]);
  });
});
