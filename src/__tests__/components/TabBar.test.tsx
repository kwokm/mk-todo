import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabBar } from "@/components/TabBar";
import type { Tab } from "@/lib/types";

const mockTabs: Tab[] = [
  { id: "t1", name: "WORK", sortOrder: 0 },
  { id: "t2", name: "PERSONAL", sortOrder: 1 },
];

describe("TabBar", () => {
  it("renders all tabs", () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={vi.fn()}
      />
    );
    expect(screen.getByText("WORK")).toBeInTheDocument();
    expect(screen.getByText("PERSONAL")).toBeInTheDocument();
  });

  it("calls onSelectTab when a tab is clicked", async () => {
    const onSelectTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={onSelectTab}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText("PERSONAL"));
    expect(onSelectTab).toHaveBeenCalledWith("t2");
  });

  it("calls onCreateTab when add button is clicked", async () => {
    const onCreateTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={onCreateTab}
        onUpdateTab={vi.fn()}
        onDeleteTab={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Add tab" }));
    expect(onCreateTab).toHaveBeenCalled();
  });

  it("shows delete confirmation dialog", async () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={vi.fn()}
      />
    );
    const deleteBtn = screen.getByRole("button", { name: "Delete WORK tab" });
    await userEvent.click(deleteBtn);

    expect(screen.getByText("Delete tab")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  it("calls onDeleteTab when confirmed", async () => {
    const onDeleteTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={onDeleteTab}
      />
    );
    const deleteBtn = screen.getByRole("button", { name: "Delete WORK tab" });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: "Delete" });
    await userEvent.click(confirmBtn);

    expect(onDeleteTab).toHaveBeenCalledWith("t1");
  });

  it("cancels delete when Cancel is clicked", async () => {
    const onDeleteTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={onDeleteTab}
      />
    );
    const deleteBtn = screen.getByRole("button", { name: "Delete WORK tab" });
    await userEvent.click(deleteBtn);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelBtn);

    expect(onDeleteTab).not.toHaveBeenCalled();
  });

  it("enters rename mode on double-click", async () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={vi.fn()}
        onDeleteTab={vi.fn()}
      />
    );
    await userEvent.dblClick(screen.getByText("WORK"));

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("WORK");
  });

  it("saves rename on Enter", async () => {
    const onUpdateTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={onUpdateTab}
        onDeleteTab={vi.fn()}
      />
    );
    await userEvent.dblClick(screen.getByText("WORK"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "PROJECTS{Enter}");

    expect(onUpdateTab).toHaveBeenCalledWith("t1", "PROJECTS");
  });

  it("cancels rename on Escape", async () => {
    const onUpdateTab = vi.fn();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="t1"
        onSelectTab={vi.fn()}
        onCreateTab={vi.fn()}
        onUpdateTab={onUpdateTab}
        onDeleteTab={vi.fn()}
      />
    );
    await userEvent.dblClick(screen.getByText("WORK"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "CHANGED{Escape}");

    expect(onUpdateTab).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
