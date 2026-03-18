/** Convert our simple markdown to HTML for contentEditable display. */
export function markdownToHtml(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return escaped
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
    })
    .join('<br>')
}

/** Convert contentEditable innerHTML back to our simple markdown. */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<div><br\s*\/?><\/div>/gi, '\n')
    .replace(/<div>([\s\S]*?)<\/div>/gi, '\n$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>\s*<em>([\s\S]*?)<\/em>\s*<\/strong>/gi, '***$1***')
    .replace(/<em>\s*<strong>([\s\S]*?)<\/strong>\s*<\/em>/gi, '***$1***')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}
