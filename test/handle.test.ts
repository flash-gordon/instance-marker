import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const host = () => document.querySelector('[data-instance-marker]')
const badge = () => host()!.shadowRoot!.querySelector('[data-badge]')!
const frame = () => host()!.shadowRoot!.querySelector('[data-frame]') as HTMLElement

describe('handle', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('destroy removes the marker from the document', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    marker.destroy()

    expect(host()).toBeNull()
  })

  test('update replaces the label in place', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    marker.update({ label: 'RU-CENTRAL' })

    expect(badge().textContent).toBe('RU-CENTRAL')
  })

  test('update keeps options that were not passed', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    marker.update({ label: 'RU-CENTRAL' })

    expect(frame().style.getPropertyValue('--im-color')).toBe('#e11d48')
  })

  test('update to an empty label unmounts the marker', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    marker.update({ label: '' })

    expect(host()).toBeNull()
  })

  test('update with a label mounts a marker that started without one', () => {
    const marker = mount({ color: '#e11d48' })

    marker.update({ label: 'EU-WEST' })

    expect(badge().textContent).toBe('EU-WEST')
  })

  test('mounting twice leaves a single marker in the document', () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })
    mount({ label: 'RU-CENTRAL', color: '#2563eb' })

    expect(document.querySelectorAll('[data-instance-marker]')).toHaveLength(1)
    expect(badge().textContent).toBe('RU-CENTRAL')
  })

  test('replaces a marker left behind by another copy of the library', () => {
    const stale = document.createElement('div')
    stale.setAttribute('data-instance-marker', '')
    document.body.appendChild(stale)

    mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(document.querySelectorAll('[data-instance-marker]')).toHaveLength(1)
    expect(badge().textContent).toBe('EU-WEST')
  })

  test('destroy is safe to call twice', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    marker.destroy()

    expect(() => marker.destroy()).not.toThrow()
  })
})
