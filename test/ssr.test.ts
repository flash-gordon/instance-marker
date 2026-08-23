// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { mount } from '../src/index'

describe('server-side rendering', () => {
  test('mounting without a document does not throw', () => {
    expect(typeof document).toBe('undefined')
    expect(() => mount({ label: 'EU-WEST', color: '#e11d48' })).not.toThrow()
  })

  test('the returned handle stays usable without a document', () => {
    const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

    expect(() => marker.update({ label: 'RU-CENTRAL' })).not.toThrow()
    expect(() => marker.destroy()).not.toThrow()
  })
})
