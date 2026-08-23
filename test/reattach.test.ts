import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const marker = () => document.querySelector('[data-instance-marker]')
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('surviving a host app that rewrites the DOM', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('comes back when the app removes it from the DOM', async () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    marker()!.remove()
    await flush()

    expect(marker()).not.toBeNull()
  })

  test('comes back when the app replaces the whole body content', async () => {
    mount({ label: 'EU-WEST', color: '#e11d48' })

    // What Kibana does while bootstrapping.
    document.body.innerHTML = '<div id="app"></div>'
    await flush()

    expect(marker()).not.toBeNull()
    expect(document.querySelector('#app')).not.toBeNull()
  })

  test('keeps the label and color when it comes back', async () => {
    mount({ label: 'EU-WEST', color: '#7c3aed' })

    document.body.innerHTML = ''
    await flush()

    const frame = marker()!.shadowRoot!.querySelector('[data-frame]') as HTMLElement
    expect(marker()!.shadowRoot!.querySelector('[data-badge]')!.textContent).toBe('EU-WEST')
    expect(frame.style.getPropertyValue('--im-color')).toBe('#7c3aed')
  })

  test('stays gone once destroyed', async () => {
    const instance = mount({ label: 'EU-WEST', color: '#e11d48' })

    instance.destroy()
    document.body.appendChild(document.createElement('div'))
    await flush()

    expect(marker()).toBeNull()
  })

  test('stays gone after the label is cleared', async () => {
    const instance = mount({ label: 'EU-WEST', color: '#e11d48' })

    instance.update({ label: '' })
    document.body.appendChild(document.createElement('div'))
    await flush()

    expect(marker()).toBeNull()
  })
})
