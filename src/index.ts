export type Corner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

export interface InstanceMarkerOptions {
  label?: string | null
  color?: string
  corner?: Corner
  thickness?: number
  zIndex?: number
  /** Prefix `document.title` with the label, so browser tabs are distinguishable too. */
  titlePrefix?: boolean
}

export const CORNERS: readonly Corner[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']
const STORAGE_KEY = 'instance-marker:corner'

const DEFAULT_COLOR = '#e11d48'
const DEFAULT_CORNER: Corner = 'top-left'
const DEFAULT_THICKNESS = 5
const DEFAULT_Z_INDEX = 2147483000

const CSS = `
:host { all: initial; }
[data-bar] {
  position: fixed;
  background: var(--im-color);
  pointer-events: none;
  z-index: var(--im-z);
}
[data-bar='top'], [data-bar='bottom'] { left: 0; right: 0; height: var(--im-thickness); }
[data-bar='left'], [data-bar='right'] { top: 0; bottom: 0; width: var(--im-thickness); }
[data-bar='top'] { top: 0; }
[data-bar='bottom'] { bottom: 0; }
[data-bar='left'] { left: 0; }
[data-bar='right'] { right: 0; }
[data-badge] {
  position: fixed;
  z-index: var(--im-z);
  margin: 0;
  border: 0;
  padding: 4px 9px;
  background: var(--im-color);
  color: var(--im-label-color);
  font: 600 11px/1.2 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
}
[data-corner='top-left'] [data-badge] { top: 0; left: 0; border-radius: 0 0 4px 0; }
[data-corner='top-right'] [data-badge] { top: 0; right: 0; border-radius: 0 0 0 4px; }
[data-corner='bottom-right'] [data-badge] { bottom: 0; right: 0; border-radius: 4px 0 0 0; }
[data-corner='bottom-left'] [data-badge] { bottom: 0; left: 0; border-radius: 0 4px 0 0; }
@media print { :host { display: none; } }
`

const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#111827'

/** Parses `#rgb`, `#rrggbb` and `rgb()/rgba()` colors. Anything else is unknown. */
function parseRgb(color: string): [number, number, number] | null {
  const value = color.trim()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const digits = hex[1]!
    const full = digits.length === 3 ? digits.replace(/./g, (d) => d + d) : digits
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ]
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value)
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  }

  return null
}

/** Picks the badge text color with the better contrast against `color`. */
function labelColorFor(color: string): string {
  const rgb = parseRgb(color)
  if (!rgb) return LIGHT_TEXT

  // WCAG relative luminance.
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  return luminance > 0.4 ? DARK_TEXT : LIGHT_TEXT
}

function readStoredCorner(): Corner | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Corner | null
    return stored && CORNERS.includes(stored) ? stored : null
  } catch {
    // Storage can be denied (private mode, blocked cookies) - the marker still works.
    return null
  }
}

function storeCorner(corner: Corner): void {
  try {
    localStorage.setItem(STORAGE_KEY, corner)
  } catch {
    // See readStoredCorner.
  }
}

function nextCorner(corner: Corner): Corner {
  return CORNERS[(CORNERS.indexOf(corner) + 1) % CORNERS.length]!
}

function render(
  shadow: ShadowRoot,
  label: string,
  options: InstanceMarkerOptions,
  corner: Corner,
  onBadgeClick: () => void,
): void {
  const style = document.createElement('style')
  style.textContent = CSS

  const frame = document.createElement('div')
  frame.setAttribute('data-frame', '')
  frame.setAttribute('data-corner', corner)
  const color = options.color ?? DEFAULT_COLOR
  frame.style.setProperty('--im-color', color)
  frame.style.setProperty('--im-label-color', labelColorFor(color))
  frame.style.setProperty('--im-thickness', `${options.thickness ?? DEFAULT_THICKNESS}px`)
  frame.style.setProperty('--im-z', String(options.zIndex ?? DEFAULT_Z_INDEX))

  for (const edge of ['top', 'right', 'bottom', 'left']) {
    const bar = document.createElement('div')
    bar.setAttribute('data-bar', edge)
    bar.setAttribute('aria-hidden', 'true')
    frame.appendChild(bar)
  }

  const badge = document.createElement('button')
  badge.setAttribute('data-badge', '')
  badge.type = 'button'
  badge.textContent = label
  badge.title = 'Click to move this label to the next corner'
  badge.setAttribute('aria-label', `Instance: ${label}`)
  badge.addEventListener('click', onBadgeClick)
  frame.appendChild(badge)

  shadow.replaceChildren(style, frame)
}

export interface InstanceMarkerHandle {
  /** Re-render with changed options. Omitted options keep their current value. */
  update(options: InstanceMarkerOptions): void
  /** Remove the marker from the page. Safe to call more than once. */
  destroy(): void
}

let active: InstanceMarkerHandle | null = null

const INERT_HANDLE: InstanceMarkerHandle = {
  update() {},
  destroy() {},
}

export function mount(options: InstanceMarkerOptions = {}): InstanceMarkerHandle {
  // Server-side rendering: nothing to mark, and nothing to blow up on.
  if (typeof document === 'undefined') return INERT_HANDLE

  active?.destroy()
  // A second copy of the library (or a stale bundle) may have left its own marker behind.
  document.querySelectorAll('[data-instance-marker]').forEach((stale) => stale.remove())

  let current: InstanceMarkerOptions = { ...options }
  let destroyed = false
  let waitingForBody = false
  let chosenCorner: Corner | null = readStoredCorner()
  let host: HTMLElement | null = null
  // The app's own title, without our prefix, and the exact title we last wrote.
  let baseTitle: string | null = null
  let appliedTitle: string | null = null
  let titleObserver: MutationObserver | null = null

  const corner = (): Corner => chosenCorner ?? current.corner ?? DEFAULT_CORNER

  const cycleCorner = (): void => {
    chosenCorner = nextCorner(corner())
    storeCorner(chosenCorner)
    sync()
  }

  const unmount = (): void => {
    host?.remove()
    host = null
  }

  const restoreTitle = (): void => {
    titleObserver?.disconnect()
    titleObserver = null
    if (baseTitle !== null) document.title = baseTitle
    baseTitle = null
    appliedTitle = null
  }

  const syncTitle = (label: string | undefined): void => {
    if (!current.titlePrefix || !label) {
      restoreTitle()
      return
    }

    if (baseTitle === null) baseTitle = document.title
    appliedTitle = `[${label}] ${baseTitle}`
    document.title = appliedTitle

    if (!titleObserver) {
      // SPAs rewrite the title on navigation; put the prefix back when they do.
      titleObserver = new MutationObserver(() => {
        if (document.title === appliedTitle) return
        baseTitle = document.title
        syncTitle(current.label?.trim())
      })
      titleObserver.observe(document.head, { childList: true, subtree: true, characterData: true })
    }
  }

  const sync = (): void => {
    if (destroyed) return

    const label = current.label?.trim()
    syncTitle(label)
    if (!label) {
      unmount()
      return
    }
    if (!host) {
      // Included from <head>: there is no body to attach to yet.
      if (!document.body) {
        if (!waitingForBody) {
          waitingForBody = true
          document.addEventListener(
            'DOMContentLoaded',
            () => {
              waitingForBody = false
              sync()
            },
            { once: true },
          )
        }
        return
      }
      host = document.createElement('div')
      host.setAttribute('data-instance-marker', '')
      host.attachShadow({ mode: 'open' })
      document.body.appendChild(host)
    }
    render(host.shadowRoot!, label, current, corner(), cycleCorner)
  }

  const handle: InstanceMarkerHandle = {
    update(options: InstanceMarkerOptions): void {
      current = { ...current, ...options }
      sync()
    },
    destroy(): void {
      destroyed = true
      unmount()
      restoreTitle()
      if (active === handle) active = null
    },
  }

  active = handle
  sync()
  return handle
}
