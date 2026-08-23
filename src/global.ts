import { CORNERS, mount, type Corner, type InstanceMarkerHandle, type InstanceMarkerOptions } from './index'

function numberAttribute(element: Element, name: string): number | undefined {
  const raw = element.getAttribute(name)
  if (raw === null) return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

function booleanAttribute(element: Element, name: string): boolean | undefined {
  const raw = element.getAttribute(name)
  if (raw === null) return undefined
  return raw !== 'false' && raw !== '0'
}

/** Reads marker options from a `<script data-label="..." data-color="...">` tag. */
export function optionsFromScript(script: Element): InstanceMarkerOptions {
  const corner = script.getAttribute('data-corner') as Corner | null

  return {
    label: script.getAttribute('data-label') ?? undefined,
    color: script.getAttribute('data-color') ?? undefined,
    corner: corner && CORNERS.includes(corner) ? corner : undefined,
    thickness: numberAttribute(script, 'data-thickness'),
    zIndex: numberAttribute(script, 'data-z-index'),
    titlePrefix: booleanAttribute(script, 'data-title-prefix'),
  }
}

/** Mounts the marker described by a script tag, if there is one. */
export function initFromScript(script: Element | null): InstanceMarkerHandle | undefined {
  if (!script) return undefined
  return mount(optionsFromScript(script))
}

export { mount }
export type { Corner, InstanceMarkerHandle, InstanceMarkerOptions }

if (typeof document !== 'undefined') {
  initFromScript(document.currentScript)
}
