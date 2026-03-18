/**
 * Reads CSS custom properties from the current theme and returns them
 * as plain strings for use in canvas rendering contexts.
 * Cached per data-theme value so getComputedStyle is called at most once per theme switch.
 */

export interface ThemeColors {
  // Canvas
  canvasGrid: string
  canvasGridAccent: string
  canvasBoxStroke: string
  canvasBoxFill: string
  canvasBoxGlow: string
  canvasBoxText: string
  canvasConnection: string
  canvasConnectionPreview: string
  canvasLabelBg: string
  canvasLabelText: string
  canvasLabelTextSecondary: string
  canvasPlaceholderFill: string
  canvasPlaceholderStroke: string
  canvasPlaceholderDot: string
  canvasMarqueeFill: string
  canvasOrigin: string
  canvasTextStrong: string
  // Selection
  accent: string
  handleFill: string
}

let _cached: ThemeColors | null = null
let _cachedTheme: string | null = null

function read(prop: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
}

export function getThemeColors(): ThemeColors {
  const current = document.documentElement.getAttribute('data-theme')
  if (_cached && _cachedTheme === current) return _cached

  _cached = {
    canvasGrid: read('--canvas-grid'),
    canvasGridAccent: read('--canvas-grid-accent'),
    canvasBoxStroke: read('--canvas-box-stroke'),
    canvasBoxFill: read('--canvas-box-fill'),
    canvasBoxGlow: read('--canvas-box-glow'),
    canvasBoxText: read('--canvas-box-text'),
    canvasConnection: read('--canvas-connection'),
    canvasConnectionPreview: read('--canvas-connection-preview'),
    canvasLabelBg: read('--canvas-label-bg'),
    canvasLabelText: read('--canvas-label-text'),
    canvasLabelTextSecondary: read('--canvas-label-text-secondary'),
    canvasPlaceholderFill: read('--canvas-placeholder-fill'),
    canvasPlaceholderStroke: read('--canvas-placeholder-stroke'),
    canvasPlaceholderDot: read('--canvas-placeholder-dot'),
    canvasMarqueeFill: read('--canvas-marquee-fill'),
    canvasOrigin: read('--canvas-origin'),
    canvasTextStrong: read('--text-strong'),
    accent: read('--accent'),
    handleFill: '#ffffff',
  }
  _cachedTheme = current
  return _cached
}

/** Invalidate the cache (call on theme switch). */
export function invalidateThemeColors(): void {
  _cached = null
  _cachedTheme = null
}
