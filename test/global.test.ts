import { afterEach, describe, expect, test } from 'vitest'
import { optionsFromScript, initFromScript } from '../src/global'

const scriptWith = (attributes: Record<string, string>): HTMLScriptElement => {
  const script = document.createElement('script')
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value)
  document.body.appendChild(script)
  return script
}

const shadow = () => document.querySelector('[data-instance-marker]')!.shadowRoot!

describe('script tag configuration', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('reads the label and color from data attributes', () => {
    const options = optionsFromScript(scriptWith({ 'data-label': 'EU-WEST', 'data-color': '#e11d48' }))

    expect(options).toMatchObject({ label: 'EU-WEST', color: '#e11d48' })
  })

  test('reads the corner, thickness and z-index', () => {
    const options = optionsFromScript(
      scriptWith({
        'data-label': 'EU-WEST',
        'data-corner': 'bottom-right',
        'data-thickness': '8',
        'data-z-index': '500',
      }),
    )

    expect(options).toMatchObject({ corner: 'bottom-right', thickness: 8, zIndex: 500 })
  })

  test('treats a bare data-title-prefix attribute as enabled', () => {
    const options = optionsFromScript(scriptWith({ 'data-label': 'EU-WEST', 'data-title-prefix': '' }))

    expect(options.titlePrefix).toBe(true)
  })

  test('treats data-title-prefix="false" as disabled', () => {
    const options = optionsFromScript(
      scriptWith({ 'data-label': 'EU-WEST', 'data-title-prefix': 'false' }),
    )

    expect(options.titlePrefix).toBe(false)
  })

  test('ignores a thickness that is not a number', () => {
    const options = optionsFromScript(scriptWith({ 'data-label': 'EU-WEST', 'data-thickness': 'thick' }))

    expect(options.thickness).toBeUndefined()
  })

  test('ignores an unknown corner', () => {
    const options = optionsFromScript(scriptWith({ 'data-label': 'EU-WEST', 'data-corner': 'middle' }))

    expect(options.corner).toBeUndefined()
  })
})

describe('auto-init', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('mounts the marker described by the script tag', () => {
    initFromScript(scriptWith({ 'data-label': 'EU-WEST', 'data-color': '#e11d48' }))

    expect(shadow().querySelector('[data-badge]')!.textContent).toBe('EU-WEST')
  })

  test('does nothing when there is no script tag to read', () => {
    initFromScript(null)

    expect(document.querySelector('[data-instance-marker]')).toBeNull()
  })
})
