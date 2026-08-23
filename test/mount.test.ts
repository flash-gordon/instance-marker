import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const host = () => document.querySelector('[data-instance-marker]')

describe('mount', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('renders a frame host with a shadow root attached to the body', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(host()).not.toBeNull()
    expect(host()!.shadowRoot).not.toBeNull()
  })

  test('renders nothing when the label is empty', () => {
    mount({ label: '', color: '#e11d48' })

    expect(host()).toBeNull()
  })

  test('renders nothing when the label is absent', () => {
    mount({ color: '#e11d48' })

    expect(host()).toBeNull()
  })
})

describe('frame contents', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const shadow = () => host()!.shadowRoot!

  test('draws four edge bars', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(shadow().querySelectorAll('[data-bar]')).toHaveLength(4)
  })

  test('applies the configured color to the frame', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    const frame = shadow().querySelector('[data-frame]') as HTMLElement
    expect(frame.style.getPropertyValue('--im-color')).toBe('#e11d48')
  })

  test('shows the label in the badge', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(shadow().querySelector('[data-badge]')!.textContent).toBe('EU-WEST')
  })
})
