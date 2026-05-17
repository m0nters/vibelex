import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DarkModeToggle } from "./DarkModeToggle";
import { useDarkMode } from "@/hooks";

// Mock the hook
vi.mock("@/hooks", () => ({
  useDarkMode: vi.fn(),
}));

describe("DarkModeToggle", () => {
  const mockToggleDarkMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Sun icon when isDarkMode is true", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);

    const button = screen.getByRole("button", { name: "Toggle Dark Mode" });
    expect(button).toBeInTheDocument();

    // Check if the Sun icon is rendered (it has the text-amber-500 class)
    const icon = button.querySelector("svg");
    expect(icon).toHaveClass("text-amber-500");
  });

  it("should render Moon icon when isDarkMode is false", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);

    const button = screen.getByRole("button", { name: "Toggle Dark Mode" });
    expect(button).toBeInTheDocument();

    // Check if the Moon icon is rendered (it has the text-indigo-600 class)
    const icon = button.querySelector("svg");
    expect(icon).toHaveClass("text-indigo-600");
  });

  it("should call toggleDarkMode when clicked", async () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Toggle Dark Mode" });

    await user.click(button);

    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle className="custom-class" />);
    const button = screen.getByRole("button", { name: "Toggle Dark Mode" });

    expect(button).toHaveClass("custom-class");
  });
});
