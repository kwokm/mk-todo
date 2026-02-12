import { render, screen } from "@testing-library/react";
import { renderMarkdown } from "@/lib/markdown";

function RenderMarkdown({ text }: { text: string }) {
  return <span data-testid="md">{renderMarkdown(text)}</span>;
}

describe("renderMarkdown", () => {
  it("renders plain text unchanged", () => {
    render(<RenderMarkdown text="Hello world" />);
    expect(screen.getByTestId("md")).toHaveTextContent("Hello world");
  });

  it("renders bold text", () => {
    render(<RenderMarkdown text="**bold text**" />);
    const strong = screen.getByText("bold text");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders italic text", () => {
    render(<RenderMarkdown text="*italic text*" />);
    const em = screen.getByText("italic text");
    expect(em.tagName).toBe("EM");
  });

  it("renders strikethrough text", () => {
    render(<RenderMarkdown text="~~deleted~~" />);
    const del = screen.getByText("deleted");
    expect(del.tagName).toBe("DEL");
  });

  it("renders inline code", () => {
    render(<RenderMarkdown text="`some code`" />);
    const code = screen.getByText("some code");
    expect(code.tagName).toBe("CODE");
  });

  it("renders markdown links", () => {
    render(<RenderMarkdown text="[Click me](https://example.com)" />);
    const link = screen.getByText("Click me") as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.href).toBe("https://example.com/");
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  });

  it("auto-links URLs", () => {
    render(<RenderMarkdown text="Visit https://example.com today" />);
    const link = screen.getByText("https://example.com") as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.target).toBe("_blank");
  });

  it("handles mixed markdown", () => {
    render(<RenderMarkdown text="**bold** and *italic*" />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
  });
});
