import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null)
  const [adjustedLeft, setAdjustedLeft] = useState<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!pos || !tooltipRef.current) { setAdjustedLeft(null); return }
    const tt = tooltipRef.current.getBoundingClientRect()
    const margin = 6
    if (tt.left < margin) {
      setAdjustedLeft(margin)
    } else if (tt.right > window.innerWidth - margin) {
      setAdjustedLeft(window.innerWidth - margin - tt.width)
    } else {
      setAdjustedLeft(null)
    }
  }, [pos])

  const show = useCallback((e: React.MouseEvent) => {
    // display:contents spans have no box — use the actual hovered child element
    const el = (e.currentTarget as HTMLElement).firstElementChild as HTMLElement ?? e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    const below = r.top < window.innerHeight / 3
    setPos({
      x: Math.round(r.left + r.width / 2),
      y: Math.round(below ? r.bottom + 6 : r.top - 6),
      below,
    })
  }, [])

  const hide = useCallback(() => { setPos(null); setAdjustedLeft(null) }, [])

  return (
    <span style={{ display: 'contents' }} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {pos && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: adjustedLeft ?? pos.x,
            top: pos.y,
            transform: adjustedLeft != null
              ? (pos.below ? 'none' : 'translateY(-100%)')
              : (pos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'),
            zIndex: 9999,
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-muted)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'var(--backdrop-blur)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  )
}
