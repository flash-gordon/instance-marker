import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const shadow = () => document.querySelector('[data-instance-marker]')!.shadowRoot!

describe('accessibility', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('hides the decorative bars from assistive technology', () => {
    mount({ label: 'EU-WEST' })

    for (const bar of shadow().querySelectorAll('[data-bar]')) {
      expect(bar.getAttribute('aria-hidden')).toBe('true')
    }
  })

  test('announces which instance the page belongs to', () => {
    mount({ label: 'EU-WEST' })

    const badge = shadow().querySelector('[data-badge]')!
    expect(badge.getAttribute('aria-label')).toBe('Instance: EU-WEST')
  })
})
