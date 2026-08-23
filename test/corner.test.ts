import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { mount } from '../src/index'

const host = () => document.querySelector('[data-instance-marker]')
const frame = () => host()!.shadowRoot!.querySelector('[data-frame]') as HTMLElement
const badge = () => host()!.shadowRoot!.querySelector('[data-badge]') as HTMLButtonElement
const corner = () => frame().getAttribute('data-corner')

describe('badge corner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  test('starts in the configured corner', () => {
    mount({ label: 'EU-WEST', corner: 'bottom-right' })

    expect(corner()).toBe('bottom-right')
  })

  test('clicking the badge moves it clockwise to the next corner', () => {
    mount({ label: 'EU-WEST', corner: 'top-left' })

    badge().click()

    expect(corner()).toBe('top-right')
  })

  test('cycles back to the first corner after the last one', () => {
    mount({ label: 'EU-WEST', corner: 'bottom-left' })

    badge().click()

    expect(corner()).toBe('top-left')
  })

  test('remembers the chosen corner for the next mount', () => {
    const marker = mount({ label: 'EU-WEST', corner: 'top-left' })
    badge().click()
    marker.destroy()

    mount({ label: 'EU-WEST', corner: 'top-left' })

    expect(corner()).toBe('top-right')
  })

  test('survives localStorage being unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })

    expect(() => {
      mount({ label: 'EU-WEST', corner: 'top-left' })
      badge().click()
    }).not.toThrow()
    expect(corner()).toBe('top-right')
  })
})
