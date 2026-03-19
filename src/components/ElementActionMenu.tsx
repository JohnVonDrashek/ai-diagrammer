import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { BoxElement, BoxStyle } from '../store/types'

const RADIUS = 56
const BTN = 38

// Shared button style + hover logic
function RadialButton({ ox, oy, title, onClick, children }: {
  ox: number; oy: number; title: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(${ox}px - 50%), calc(${oy}px - 50%))`,
        width: BTN,
        height: BTN,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-overlay)',
        border: '1px solid var(--border-muted)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: 0,
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        boxShadow: 'var(--shadow-md)',
        transition: 'background 0.1s, border-color 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget
        b.style.background = 'var(--accent-bg-subtle)'
        b.style.borderColor = 'var(--accent)'
        b.style.color = 'var(--accent-light)'
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget
        b.style.background = 'var(--surface-overlay)'
        b.style.borderColor = 'var(--border-muted)'
        b.style.color = 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  )
}

function angleToOffset(angle: number) {
  const rad = (angle * Math.PI) / 180
  return { ox: Math.round(RADIUS * Math.cos(rad)), oy: Math.round(RADIUS * Math.sin(rad)) }
}

function evenAngles(count: number) {
  return Array.from({ length: count }, (_, i) => -90 + (360 / count) * i)
}

function Label({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 8, fontFamily: 'var(--font-ui)', lineHeight: 1 }}>
      {text}
    </span>
  )
}

export function ElementActionMenu() {
  const {
    elementActionMenuPos,
    closeElementActionMenu,
    elements,
    openRename,
    openIconSearch,
    openColorPicker,
    startConnecting,
    deleteElement,
    updateElement,
    setSelected,
  } = useAppStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [subMenu, setSubMenu] = useState<'main' | 'style'>('main')

  // Reset sub-menu when menu opens/closes
  useEffect(() => { setSubMenu('main') }, [elementActionMenuPos])

  const handleOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      closeElementActionMenu()
    }
  }, [closeElementActionMenu])

  useEffect(() => {
    if (!elementActionMenuPos) return
    window.addEventListener('mousedown', handleOutside)
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [elementActionMenuPos, handleOutside])

  if (!elementActionMenuPos) return null

  const { screenX, screenY, elementId } = elementActionMenuPos
  const el = elements.find((e) => e.id === elementId)
  if (!el) return null

  const close = () => closeElementActionMenu()
  const containerSize = (RADIUS + BTN / 2 + 8) * 2
  const currentStyle = el.type === 'box' ? ((el as BoxElement).style ?? 'solid') : null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        width: containerSize,
        height: containerSize,
        pointerEvents: 'none',
      }}
    >
      {/* Glass circle background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'var(--surface-glass)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--backdrop-blur)',
        boxShadow: 'var(--shadow-lg)',
        pointerEvents: 'all',
      }} />

      {/* Center label — clickable to go back when in sub-menu */}
      <div
        onClick={subMenu !== 'main' ? () => setSubMenu('main') : undefined}
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 9,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-ui)',
          textAlign: 'center',
          pointerEvents: subMenu !== 'main' ? 'all' : 'none',
          cursor: subMenu !== 'main' ? 'pointer' : 'default',
          lineHeight: 1.2,
        }}
      >
        {subMenu === 'style' ? <>&#8592; style</> : el.type}
      </div>

      {subMenu === 'main' && <MainItems
        el={el} elementId={elementId} screenX={screenX} screenY={screenY}
        close={close} openRename={openRename} openIconSearch={openIconSearch}
        openColorPicker={openColorPicker} startConnecting={startConnecting}
        deleteElement={deleteElement} setSelected={setSelected}
        onStyleClick={() => setSubMenu('style')}
      />}

      {subMenu === 'style' && <StyleItems
        elementId={elementId} currentStyle={currentStyle!}
        updateElement={updateElement} close={close}
      />}
    </div>
  )
}

// ── Main radial items ──────────────────────────────────────────────────────────

function MainItems({ el, elementId, screenX, screenY, close, openRename, openIconSearch, openColorPicker, startConnecting, deleteElement, setSelected, onStyleClick }: {
  el: ReturnType<typeof useAppStore.getState>['elements'][number]
  elementId: string; screenX: number; screenY: number
  close: () => void
  openRename: (id: string) => void
  openIconSearch: (pos?: { x: number; y: number }, swapId?: string) => void
  openColorPicker: (x: number, y: number) => void
  startConnecting: (id: string) => void
  deleteElement: (id: string) => void
  setSelected: (id: string | null) => void
  onStyleClick: () => void
}) {
  type Item = { key: string; label: string; sublabel: string; action: () => void; content: React.ReactNode }
  const items: Item[] = []

  items.push({
    key: 'rename', label: 'Rename', sublabel: 'rename',
    action: () => { close(); openRename(elementId) },
    content: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
    ),
  })

  if (el.type === 'icon') {
    items.push({
      key: 'swap', label: 'Swap icon', sublabel: 'swap',
      action: () => { close(); openIconSearch(undefined, elementId) },
      content: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
      ),
    })
  } else if (el.type === 'box') {
    items.push({
      key: 'style', label: 'Style', sublabel: 'style',
      action: onStyleClick,
      content: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      ),
    })
  }

  items.push({
    key: 'color', label: 'Color', sublabel: 'color',
    action: () => { close(); openColorPicker(screenX, screenY) },
    content: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
      </svg>
    ),
  })

  items.push({
    key: 'connect', label: 'Connect', sublabel: 'connect',
    action: () => { close(); setSelected(elementId); startConnecting(elementId) },
    content: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
      </svg>
    ),
  })

  items.push({
    key: 'delete', label: 'Delete', sublabel: 'delete',
    action: () => { close(); deleteElement(elementId) },
    content: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
  })

  const angles = evenAngles(items.length)

  return <>
    {items.map((item, i) => {
      const { ox, oy } = angleToOffset(angles[i])
      return (
        <RadialButton key={item.key} ox={ox} oy={oy} title={item.label} onClick={item.action}>
          {item.content}
          <Label text={item.sublabel} />
        </RadialButton>
      )
    })}
  </>
}

// ── Style sub-menu ─────────────────────────────────────────────────────────────

function StyleItems({ elementId, currentStyle, updateElement, close }: {
  elementId: string; currentStyle: BoxStyle
  updateElement: (id: string, partial: Partial<BoxElement>) => void
  close: () => void
}) {
  const styles: { key: BoxStyle; label: string; content: React.ReactNode }[] = [
    {
      key: 'solid', label: 'Solid',
      content: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      ),
    },
    {
      key: 'dashed', label: 'Dashed',
      content: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      ),
    },
    {
      key: 'filled', label: 'Filled',
      content: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.3"/>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      ),
    },
  ]

  const angles = evenAngles(styles.length)

  return <>
    {styles.map((s, i) => {
      const { ox, oy } = angleToOffset(angles[i])
      const isActive = s.key === currentStyle
      return (
        <button
          key={s.key}
          title={s.label}
          onClick={() => {
            updateElement(elementId, { style: s.key } as Partial<BoxElement>)
            close()
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(${ox}px - 50%), calc(${oy}px - 50%))`,
            width: BTN,
            height: BTN,
            borderRadius: 'var(--radius-md)',
            background: isActive ? 'var(--accent-bg-subtle)' : 'var(--surface-overlay)',
            border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-muted)',
            color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 0,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            boxShadow: 'var(--shadow-md)',
            transition: 'background 0.1s, border-color 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget
            b.style.background = 'var(--accent-bg-subtle)'
            b.style.borderColor = 'var(--accent)'
            b.style.color = 'var(--accent-light)'
          }}
          onMouseLeave={(e) => {
            if (isActive) return
            const b = e.currentTarget
            b.style.background = 'var(--surface-overlay)'
            b.style.borderColor = 'var(--border-muted)'
            b.style.color = 'var(--text-secondary)'
          }}
        >
          {s.content}
          <Label text={s.label.toLowerCase()} />
        </button>
      )
    })}
  </>
}
