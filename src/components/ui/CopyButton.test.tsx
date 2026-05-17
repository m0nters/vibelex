import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton } from "./CopyButton";

// CopyButton clipboard code paths:
//  1. chrome.runtime.id truthy → DOM textarea + execCommand
//  2. chrome.runtime.id absent → navigator.clipboard.writeText
//
// Our chrome stub in setup.ts has NO runtime.id, so tests use path 2.

const mockClipboardWrite = vi.fn();

describe("CopyButton", () => {
  beforeEach(() => {
    // Fake timers prevent the 2s reset timer from leaking
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockClipboardWrite },
      writable: true,
      configurable: true,
    });
    mockClipboardWrite.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders a button with an SVG icon initially", () => {
    render(<CopyButton text="hello" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  // ─── Clipboard interaction ───────────────────────────────────────────────────

  it("does not call clipboard before the button is clicked", () => {
    render(<CopyButton text="hello" />);
    expect(mockClipboardWrite).not.toHaveBeenCalled();
  });

  it("calls navigator.clipboard.writeText with the correct text on click", () => {
    render(<CopyButton text="Hello world" />);
    // Use fireEvent which is sync, avoiding userEvent deadlocks with fake timers
    fireEvent.click(screen.getByRole("button"));
    expect(mockClipboardWrite).toHaveBeenCalledTimes(1);
    expect(mockClipboardWrite).toHaveBeenCalledWith("Hello world");
  });

  // ─── Copied state ────────────────────────────────────────────────────────────

  it("shows the 'copied' visual state immediately after a successful copy", async () => {
    render(<CopyButton text="hello" />);

    // flush React state for the async catch/then blocks
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    // isCopied=true → cursor-not-allowed
    expect(screen.getByRole("button").className).toContain(
      "cursor-not-allowed",
    );
  });

  it("reverts the 'copied' state after the 2 second timeout fires", async () => {
    render(<CopyButton text="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByRole("button").className).toContain(
      "cursor-not-allowed",
    );

    // Advance past 2000ms reset timeout and flush state
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByRole("button").className).not.toContain(
      "cursor-not-allowed",
    );
  });
});
