import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { mount } from '../src/index'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('title prefix', () => {
  beforeEach(() => {
    document.title = 'Billing'
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.title = ''
  })

  test('leaves the title alone by default', () => {
    mount({ label: 'EU-WEST' })

    expect(document.title).toBe('Billing')
  })

  test('prefixes the title when asked to', () => {
    mount({ label: 'EU-WEST', titlePrefix: true })

    expect(document.title).toBe('[EU-WEST] Billing')
  })

  test('replaces the prefix instead of stacking it when the label changes', () => {
    const marker = mount({ label: 'EU-WEST', titlePrefix: true })

    marker.update({ label: 'RU-CENTRAL' })

    expect(document.title).toBe('[RU-CENTRAL] Billing')
  })

  test('restores the original title on destroy', () => {
    const marker = mount({ label: 'EU-WEST', titlePrefix: true })

    marker.destroy()

    expect(document.title).toBe('Billing')
  })

  test('re-applies the prefix when the app changes the title', async () => {
    mount({ label: 'EU-WEST', titlePrefix: true })

    document.title = 'Billing - Invoices'
    await flush()

    expect(document.title).toBe('[EU-WEST] Billing - Invoices')
  })
})
