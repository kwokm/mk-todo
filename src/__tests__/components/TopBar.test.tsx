import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopBar } from "@/components/TopBar";

describe("TopBar", () => {
  const defaultProps = {
    currentStartDate: new Date(2025, 0, 15),
    onNavigate: vi.fn(),
    onToday: vi.fn(),
    onDateSelect: vi.fn(),
  };

  it("renders the MK-TODO branding", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText("MK-")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
  });

  it("calls onToday when TODAY button is clicked", async () => {
    const onToday = vi.fn();
    render(<TopBar {...defaultProps} onToday={onToday} />);
    await userEvent.click(screen.getByText("TODAY"));
    expect(onToday).toHaveBeenCalled();
  });

  it("calls onNavigate(-1) for previous day", async () => {
    const onNavigate = vi.fn();
    render(<TopBar {...defaultProps} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous day" }));
    expect(onNavigate).toHaveBeenCalledWith(-1);
  });

  it("calls onNavigate(1) for next day", async () => {
    const onNavigate = vi.fn();
    render(<TopBar {...defaultProps} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("calls onNavigate(-7) for previous week", async () => {
    const onNavigate = vi.fn();
    render(<TopBar {...defaultProps} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous week" }));
    expect(onNavigate).toHaveBeenCalledWith(-7);
  });

  it("calls onNavigate(7) for next week", async () => {
    const onNavigate = vi.fn();
    render(<TopBar {...defaultProps} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(onNavigate).toHaveBeenCalledWith(7);
  });

  it("has a date picker button", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  });
});
