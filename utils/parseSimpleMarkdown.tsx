/**
 * parseSimpleMarkdown — lightweight Markdown → React element converter.
 *
 * Handles the patterns most commonly emitted by Gemini in executive summaries:
 *   **bold text**  → <strong>
 *   *italic text*  → <em>
 *   `inline code`  → <code>
 *
 * Safe: returns React elements — no dangerouslySetInnerHTML.
 */

import React from 'react';

export function parseSimpleMarkdown(text: string): React.ReactNode {
  if (!text) return text;

  // Regex: **bold**, then *italic*, then `code`
  const TOKEN_RE = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={key++} className="font-bold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-[#F4F4F5] text-[0.9em] font-mono"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
