export interface TextBlock {
  text: string;
  frame: { top: number; bottom: number; left: number };
}

const ROW_SEPARATOR = ' · ';

/**
 * Rebuild screenshot text row by row. OCR returns blocks column by column, so
 * a card's date box ("MON 26 OCT") ends up far from its title. Blocks whose
 * vertical spans mostly overlap are treated as one visual row and joined left
 * to right, keeping each item's date, title and time on the same line.
 */
export function joinBlocksByRow(blocks: TextBlock[]): string {
  const rows: { top: number; bottom: number; blocks: TextBlock[] }[] = [];

  for (const block of [...blocks].sort((a, b) => a.frame.top - b.frame.top)) {
    const height = block.frame.bottom - block.frame.top;
    const row = rows.find((r) => {
      const overlap = Math.min(r.bottom, block.frame.bottom) - Math.max(r.top, block.frame.top);
      return overlap > 0.5 * Math.min(height, r.bottom - r.top);
    });
    if (row) {
      row.blocks.push(block);
      row.top = Math.min(row.top, block.frame.top);
      row.bottom = Math.max(row.bottom, block.frame.bottom);
    } else {
      rows.push({ top: block.frame.top, bottom: block.frame.bottom, blocks: [block] });
    }
  }

  return rows
    .sort((a, b) => a.top - b.top)
    .map((r) =>
      r.blocks
        .sort((a, b) => a.frame.left - b.frame.left)
        .map((b) => b.text.replace(/\s*\n\s*/g, ' ').trim())
        .join(ROW_SEPARATOR),
    )
    .join('\n');
}

/** Fix common OCR slips in dates, e.g. "0CT" (zero) for "OCT". */
export function normaliseOcrText(text: string): string {
  return text.replace(/\b0(?=CT)/gi, 'O').replace(/(\d{1,2}):\s+(\d{2})/g, '$1:$2');
}
