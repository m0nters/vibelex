import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "Delete item?",
  message: "This action cannot be undone.",
};

describe("ConfirmDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("renders nothing when isOpen is false", () => {
    render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Delete item?")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("renders default button labels when none are provided", () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders custom button labels when provided", () => {
    render(
      <ConfirmDialog {...baseProps} confirmText="Yes, delete" cancelText="No, keep" />,
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep")).toBeInTheDocument();
  });

  // ─── Callbacks ─────────────────────────────────────────────────────────────

  it("calls onConfirm and onClose when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    await user.click(screen.getByText("Confirm"));

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    await user.click(screen.getByText("Cancel"));

    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it("calls onClose when the X close button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    // The X button is the only button without visible text
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(
      (b) => !b.textContent?.includes("Confirm") && !b.textContent?.includes("Cancel"),
    )!;

    await user.click(closeButton);
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop overlay is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<ConfirmDialog {...baseProps} />);

    // The outermost fixed overlay div
    const overlay = container.firstChild as HTMLElement;
    await user.click(overlay);

    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when clicking inside the dialog panel", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    await user.click(screen.getByText("Delete item?"));

    expect(baseProps.onClose).not.toHaveBeenCalled();
  });
});
