import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/TodoItem";
import type { Todo } from "@/lib/types";

const baseTodo: Todo = {
  id: "t1",
  text: "Buy groceries",
  completed: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

describe("TodoItem", () => {
  it("renders todo text", () => {
    render(<TodoItem todo={baseTodo} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders completed todo with line-through styling", () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(<TodoItem todo={completedTodo} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    const textEl = screen.getByText("Buy groceries");
    expect(textEl.className).toContain("line-through");
  });

  it("renders header syntax as styled label", () => {
    const headerTodo = { ...baseTodo, text: "# Section Title" };
    render(<TodoItem todo={headerTodo} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Section Title")).toBeInTheDocument();
  });

  it("calls onUpdate with completed toggle on checkbox click", async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole("button", { name: "Mark complete" });
    await userEvent.click(checkbox);
    expect(onUpdate).toHaveBeenCalledWith("t1", { completed: true });
  });

  it("calls onUpdate to uncomplete a completed todo", async () => {
    const onUpdate = vi.fn();
    const completedTodo = { ...baseTodo, completed: true };
    render(<TodoItem todo={completedTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole("button", { name: "Mark incomplete" });
    await userEvent.click(checkbox);
    expect(onUpdate).toHaveBeenCalledWith("t1", { completed: false });
  });

  it("enters edit mode on click and saves on Enter", async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("Buy groceries"));

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Buy groceries");

    await userEvent.clear(input);
    await userEvent.type(input, "Buy milk{Enter}");
    expect(onUpdate).toHaveBeenCalledWith("t1", { text: "Buy milk" });
  });

  it("cancels edit on Escape", async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("Buy groceries"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Changed{Escape}");

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("shows delete confirmation and deletes on confirm", async () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={vi.fn()} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete todo" });
    await userEvent.click(deleteBtn);

    // Should show confirm button
    const confirmBtn = screen.getByRole("button", { name: "Confirm delete" });
    await userEvent.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith("t1");
  });

  it("can cancel delete with undo button", async () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={vi.fn()} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete todo" });
    await userEvent.click(deleteBtn);

    const cancelBtn = screen.getByRole("button", { name: "Cancel delete" });
    await userEvent.click(cancelBtn);

    expect(onDelete).not.toHaveBeenCalled();
    // Delete button should be back
    expect(screen.getByRole("button", { name: "Delete todo" })).toBeInTheDocument();
  });

  it("does not save if edited text is empty", async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("Buy groceries"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "{Enter}");

    // Should not call onUpdate with empty text
    expect(onUpdate).not.toHaveBeenCalledWith("t1", { text: "" });
  });

  it("does not save if text is unchanged", async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={baseTodo} onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("Buy groceries"));

    const input = screen.getByRole("textbox");
    // Just press Enter without changing
    await userEvent.type(input, "{Enter}");

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("renders markdown formatting in text", () => {
    const mdTodo = { ...baseTodo, text: "**bold** and *italic*" };
    render(<TodoItem todo={mdTodo} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
  });

  it("auto-dismisses delete confirmation after timeout", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TodoItem todo={baseTodo} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete todo" });
    await user.click(deleteBtn);

    expect(screen.getByRole("button", { name: "Confirm delete" })).toBeInTheDocument();

    await act(() => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Delete todo" })).toBeInTheDocument();

    vi.useRealTimers();
  });
});
