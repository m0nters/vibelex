import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PopupLanguageSelector } from "./PopupLanguageSelector";

// react-i18next and chrome API are globally mocked in setup.ts

// ─── Mock heavy dependencies ──────────────────────────────────────────────
// The real component imports SUPPORTED_SOURCE_LANGUAGE / SUPPORTED_TRANSLATED_LANGUAGE
// which have ~200 entries each. Rendering 400+ option buttons in jsdom is very
// slow and causes timeouts. We mock the constants module to provide a tiny list.

vi.mock("@/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants")>();
  const SMALL_LANGUAGE_LIST = [
    { code: "en", englishName: "English", nativeName: "English" },
    { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "fr", englishName: "French", nativeName: "Français" },
  ];
  return {
    ...actual,
    SUPPORTED_SOURCE_LANGUAGE: SMALL_LANGUAGE_LIST,
    SUPPORTED_TRANSLATED_LANGUAGE: SMALL_LANGUAGE_LIST,
  };
});

// Mock transliteration to avoid pulling in the full library
vi.mock("transliteration", () => ({
  transliterate: (s: string) => s,
}));

const defaultProps = {
  sourceLangCode: "auto",
  translatedLangCode: "en",
  onChangeSource: vi.fn(),
  onChangeTarget: vi.fn(),
};

describe("PopupLanguageSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders the component with source and target dropdowns", () => {
    render(<PopupLanguageSelector {...defaultProps} />);

    const container = document.getElementById("popup-language-selector");
    expect(container).toBeInTheDocument();
  });

  it("renders two dropdown trigger buttons (source + target)", () => {
    render(<PopupLanguageSelector {...defaultProps} />);

    // The trigger buttons have cursor-pointer class
    const triggers = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("cursor-pointer"));
    expect(triggers).toHaveLength(2);
  });

  it("displays the selected source language label in the first trigger", () => {
    render(
      <PopupLanguageSelector {...defaultProps} sourceLangCode="auto" />,
    );

    // The "auto" option uses t("mainScreen:autoDetect") → "mainScreen:autoDetect"
    const triggers = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("cursor-pointer"));
    expect(triggers[0].textContent).toContain("mainScreen:autoDetect");
  });

  // ─── Callbacks ──────────────────────────────────────────────────────────────

  it("calls onChangeSource when a source language option is clicked", async () => {
    const user = userEvent.setup();
    render(<PopupLanguageSelector {...defaultProps} />);

    // Click the first trigger (source dropdown)
    const triggers = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("cursor-pointer"));
    await user.click(triggers[0]); // open source dropdown

    // Find an option in source dropdown by container
    const container = document.getElementById("popup-language-selector")!;
    const dropdownContainers = container.querySelectorAll<HTMLDivElement>(
      ":scope > div.flex-1",
    );
    const sourceContainer = dropdownContainers[0];

    const englishOption = Array.from(
      sourceContainer.querySelectorAll("button"),
    ).find((b) => b.textContent?.includes("(English)"));

    expect(englishOption).toBeDefined();
    await user.click(englishOption!);
    expect(defaultProps.onChangeSource).toHaveBeenCalledWith("en");
  });

  it("calls onChangeTarget when a target language option is clicked", async () => {
    const user = userEvent.setup();
    render(<PopupLanguageSelector {...defaultProps} />);

    const container = document.getElementById("popup-language-selector")!;
    const dropdownContainers = container.querySelectorAll<HTMLDivElement>(
      ":scope > div.flex-1",
    );
    const targetContainer = dropdownContainers[1];

    // Click the target trigger
    const targetTrigger =
      targetContainer.querySelector<HTMLButtonElement>("button")!;
    await user.click(targetTrigger);

    // Find Vietnamese option in the target dropdown
    const vietnameseOption = Array.from(
      targetContainer.querySelectorAll("button"),
    ).find((b) => b.textContent?.includes("(Tiếng Việt)"));

    expect(vietnameseOption).toBeDefined();
    await user.click(vietnameseOption!);
    expect(defaultProps.onChangeTarget).toHaveBeenCalledWith("vi");
  });

  // ─── Compact styling ───────────────────────────────────────────────────────

  it("renders dropdown triggers with compact styling", () => {
    render(<PopupLanguageSelector {...defaultProps} />);

    // The trigger buttons should have compact class "p-2" (from size="compact")
    const triggers = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("cursor-pointer"));

    triggers.forEach((trigger) => {
      expect(trigger.className).toContain("p-2");
      expect(trigger.className).toContain("text-sm");
    });
  });
});
