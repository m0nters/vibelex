import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PopupTopBar } from "./PopupTopBar";

// react-i18next is globally mocked in setup.ts: t(key) → key

const defaultProps = {
  finalLoadingTime: null,
  isLoading: false,
  isDarkMode: false,
  onToggleDarkMode: vi.fn(),
  onClose: vi.fn(),
};

describe("PopupTopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders both toggle and close buttons", () => {
    render(<PopupTopBar {...defaultProps} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("does not show loading time while loading", () => {
    render(<PopupTopBar {...defaultProps} isLoading={true} />);
    expect(screen.queryByText(/popup:thoughtFor/)).not.toBeInTheDocument();
  });

  it("does not show loading time when finalLoadingTime is null", () => {
    render(
      <PopupTopBar {...defaultProps} isLoading={false} finalLoadingTime={null} />,
    );
    expect(screen.queryByText(/popup:thoughtFor/)).not.toBeInTheDocument();
  });

  it("shows loading time when loading completes", () => {
    render(
      <PopupTopBar {...defaultProps} isLoading={false} finalLoadingTime={2.5} />,
    );
    expect(screen.getByText(/popup:thoughtFor/)).toBeInTheDocument();
  });

  // ─── Close Button ──────────────────────────────────────────────────────────

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(<PopupTopBar {...defaultProps} />);

    // Close button is the last button
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // ─── Dark Mode Toggle ─────────────────────────────────────────────────────

  it("renders the dark mode toggle button with an id", () => {
    render(<PopupTopBar {...defaultProps} />);
    expect(document.getElementById("popup-dark-mode-toggle")).toBeInTheDocument();
  });

  it("calls onToggleDarkMode when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<PopupTopBar {...defaultProps} />);

    const toggleBtn = document.getElementById("popup-dark-mode-toggle")!;
    await user.click(toggleBtn);

    expect(defaultProps.onToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it("renders an SVG icon inside the toggle button in light mode", () => {
    const { container } = render(
      <PopupTopBar {...defaultProps} isDarkMode={false} />,
    );
    const toggleBtn = container.querySelector("#popup-dark-mode-toggle")!;
    expect(toggleBtn.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an SVG icon inside the toggle button in dark mode", () => {
    const { container } = render(
      <PopupTopBar {...defaultProps} isDarkMode={true} />,
    );
    const toggleBtn = container.querySelector("#popup-dark-mode-toggle")!;
    expect(toggleBtn.querySelector("svg")).toBeInTheDocument();
  });
});
