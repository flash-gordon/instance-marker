import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const labelColor = () =>
  (document
    .querySelector('[data-instance-marker]')!
    .shadowRoot!.querySelector('[data-frame]') as HTMLElement).style.getPropertyValue('--im-label-color')

describe('label contrast', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('uses dark text on a light frame color', () => {
    mount({ label: 'EU-WEST', color: '#fde047' })

    expect(labelColor()).toBe('#111827')
  })

  test('uses light text on a dark frame color', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(labelColor()).toBe('#ffffff')
  })

  test('understands shorthand hex colors', () => {
    mount({ label: 'EU-WEST', color: '#ff0' })

    expect(labelColor()).toBe('#111827')
  })

  test('understands rgb() colors', () => {
    mount({ label: 'EU-WEST', color: 'rgb(253, 224, 71)' })

    expect(labelColor()).toBe('#111827')
  })

  test('falls back to light text for colors it cannot parse', () => {
    mount({ label: 'EU-WEST', color: 'rebeccapurple' })

    expect(labelColor()).toBe('#ffffff')
  })
})
