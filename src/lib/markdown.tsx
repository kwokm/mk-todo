import { type ReactNode } from "react";

export function renderMarkdown(text: string): ReactNode {
  let nodes: ReactNode[] = [text];

  nodes = processNodes(nodes, parseMarkdownLinks);
  nodes = processNodes(nodes, parseInlineCode);
  nodes = processNodes(nodes, parseBold);
  nodes = processNodes(nodes, parseItalic);
  nodes = processNodes(nodes, parseStrikethrough);
  nodes = processNodes(nodes, parseAutoLinks);

  return nodes.length === 1 ? nodes[0] : nodes;
}

function processNodes(
  nodes: ReactNode[],
  parser: (text: string, keyOffset: number) => ReactNode[]
): ReactNode[] {
  let keyOffset = 0;
  const result: ReactNode[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const parsed = parser(node, keyOffset);
      result.push(...parsed);
      keyOffset += parsed.length;
    } else {
      result.push(node);
    }
  }
  return result;
}

function parseMarkdownLinks(text: string, keyOffset: number): ReactNode[] {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  return splitByRegex(text, regex, (match, i) => (
    <a
      key={`mdlink-${keyOffset}-${i}`}
      href={match[2]}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {match[1]}
    </a>
  ));
}

function parseInlineCode(text: string, keyOffset: number): ReactNode[] {
  const regex = /`([^`]+)`/g;
  return splitByRegex(text, regex, (match, i) => (
    <code
      key={`code-${keyOffset}-${i}`}
      className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs"
    >
      {match[1]}
    </code>
  ));
}

function parseBold(text: string, keyOffset: number): ReactNode[] {
  const regex = /\*\*(.+?)\*\*|__(.+?)__/g;
  return splitByRegex(text, regex, (match, i) => (
    <strong key={`bold-${keyOffset}-${i}`} className="font-bold text-white">
      {match[1] || match[2]}
    </strong>
  ));
}

function parseItalic(text: string, keyOffset: number): ReactNode[] {
  const regex = /\*(.+?)\*|_(.+?)_/g;
  return splitByRegex(text, regex, (match, i) => (
    <em key={`italic-${keyOffset}-${i}`} className="italic">
      {match[1] || match[2]}
    </em>
  ));
}

function parseStrikethrough(text: string, keyOffset: number): ReactNode[] {
  const regex = /~~(.+?)~~/g;
  return splitByRegex(text, regex, (match, i) => (
    <del
      key={`del-${keyOffset}-${i}`}
      className="text-muted-foreground line-through"
    >
      {match[1]}
    </del>
  ));
}

function parseAutoLinks(text: string, keyOffset: number): ReactNode[] {
  const regex = /https?:\/\/[^\s]+/g;
  return splitByRegex(text, regex, (match, i) => (
    <a
      key={`autolink-${keyOffset}-${i}`}
      href={match[0]}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {match[0]}
    </a>
  ));
}

function splitByRegex(
  text: string,
  regex: RegExp,
  render: (match: RegExpExecArray, index: number) => ReactNode
): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(render(match, matchIndex));
    lastIndex = match.index + match[0].length;
    matchIndex++;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}
