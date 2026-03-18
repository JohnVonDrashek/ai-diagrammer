// Shared constants for text element layout
export const TEXT_PAD_X = 12
export const TEXT_PAD_Y = 8
export const TEXT_LINE_H = 1.5 // multiplier of fontSize

// ── Markdown segment parsing ──────────────────────────────────────────────────

export interface TextSegment {
  text: string
  bold: boolean
  italic: boolean
}

/** Parse a single line into styled segments. Supports **bold**, *italic*, ***both***. */
export function parseMarkdownLine(line: string): TextSegment[] {
  const segments: TextSegment[] = []
  // Order matters: try ***...*** before **...** before *...*
  const re = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|([^*_]+|[*_]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m[1] != null) segments.push({ text: m[1], bold: true, italic: true })
    else if (m[2] != null) segments.push({ text: m[2], bold: true, italic: false })
    else if (m[3] != null) segments.push({ text: m[3], bold: false, italic: true })
    else if (m[4] != null) segments.push({ text: m[4], bold: false, italic: true })
    else if (m[5] != null) segments.push({ text: m[5], bold: false, italic: false })
  }
  return segments.length ? segments : [{ text: line, bold: false, italic: false }]
}

export function segmentFont(seg: TextSegment, fontSize: number, fontUi: string): string {
  return `${seg.italic ? 'italic ' : ''}${seg.bold ? 'bold ' : ''}${fontSize}px ${fontUi}`
}

export function measureMarkdownLine(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  fontSize: number,
  fontUi: string
): number {
  return segments.reduce((w, seg) => {
    ctx.font = segmentFont(seg, fontSize, fontUi)
    return w + ctx.measureText(seg.text).width
  }, 0)
}

// ── Element size measurement ───────────────────────────────────────────────────

let _ctx: CanvasRenderingContext2D | null = null
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')!
  return _ctx
}

/** Measure the rendered width and height of a (possibly multi-line, markdown) text element. */
export function measureTextElement(text: string, fontSize: number): { width: number; height: number } {
  const ctx = getMeasureCtx()
  const fontUi = getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim() || 'sans-serif'
  const lines = text.split('\n')
  const maxLineW = Math.max(...lines.map((l) =>
    measureMarkdownLine(ctx, parseMarkdownLine(l || ' '), fontSize, fontUi)
  ))
  return {
    width: Math.max(120, Math.ceil(maxLineW + TEXT_PAD_X * 2)),
    height: Math.max(40, Math.ceil(lines.length * fontSize * TEXT_LINE_H + TEXT_PAD_Y * 2)),
  }
}
