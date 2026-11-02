// Preserve source line numbers, including when fenced examples contain smaller fences.
export function scanMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const prose = [...lines];
  let firstLine = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end !== -1) {
      firstLine = end + 1;
      prose.fill('', 0, firstLine);
    }
  }
  let open = null;
  let blocks = 0;
  for (let i = firstLine; i < lines.length; i++) {
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[i]);
    if (!open) {
      if (!match || (match[1][0] === '`' && match[2].includes('`'))) continue;
      open = { char: match[1][0], length: match[1].length, index: i };
      blocks++;
    } else if (match && match[1][0] === open.char && match[1].length >= open.length && !match[2].trim()) {
      prose.fill('', open.index, i + 1);
      open = null;
    }
  }
  // Keep an unclosed block in the audit text so it cannot hide untranslated content.
  return { prose: prose.join('\n'), unclosedLine: open ? open.index + 1 : 0, blocks };
}
