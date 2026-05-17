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

  it("should render sun styling when isDarkMode is false", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);

    const checkbox = screen.getByRole("checkbox", { name: "Toggle Dark Mode" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    const label = checkbox.nextElementSibling;
    expect(label).toHaveClass("bg-[#8FB5F5]");
  });

  it("should render moon styling when isDarkMode is true", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);

    const checkbox = screen.getByRole("checkbox", { name: "Toggle Dark Mode" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    const label = checkbox.nextElementSibling;
    expect(label).toHaveClass("bg-[#2B2B2B]");
  });

  it("should call toggleDarkMode when clicked", async () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<DarkModeToggle />);
    const user = userEvent.setup();
    const checkbox = screen.getByRole("checkbox", { name: "Toggle Dark Mode" });
    const label = checkbox.nextElementSibling!;

    await user.click(label);

    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    const { container } = render(<DarkModeToggle className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
