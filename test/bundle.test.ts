// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, test } from 'vitest'

const BUNDLE = new URL('../dist/instance-marker.global.js', import.meta.url)

let bundle: string

beforeAll(() => {
  execFileSync('npx', ['tsup'], { stdio: 'ignore' })
  bundle = readFileSync(BUNDLE, 'utf8')
}, 60_000)

const pageWith = (attributes: string): JSDOM =>
  new JSDOM(
    `<!doctype html><html><head><title>Billing</title></head><body>
       <script ${attributes}>${bundle}</script>
     </body></html>`,
    { runScripts: 'dangerously', url: 'https://billing.example.com/' },
  )

describe('the standalone script bundle', () => {
  test('marks the page using its own script tag attributes', () => {
    const { window } = pageWith('data-label="EU-WEST" data-color="#e11d48"')

    const host = window.document.querySelector('[data-instance-marker]')
    expect(host).not.toBeNull()
    expect(host!.shadowRoot!.querySelector('[data-badge]')!.textContent).toBe('EU-WEST')
  })

  test('leaves the page untouched when no label is configured', () => {
    const { window } = pageWith('')

    expect(window.document.querySelector('[data-instance-marker]')).toBeNull()
  })

  test('waits for the body when included from the document head', async () => {
    const dom = new JSDOM(
      `<!doctype html><html><head><title>Billing</title>
         <script data-label="EU-WEST" data-color="#e11d48">${bundle}</script>
       </head><body><p>content</p></body></html>`,
      { runScripts: 'dangerously', url: 'https://billing.example.com/' },
    )
    await new Promise((resolve) => dom.window.addEventListener('load', resolve))

    const host = dom.window.document.querySelector('[data-instance-marker]')
    expect(host).not.toBeNull()
    expect(host!.shadowRoot!.querySelector('[data-badge]')!.textContent).toBe('EU-WEST')
  })

  test('exposes the API as a window global for manual use', () => {
    const { window } = pageWith('')

    expect(typeof (window as any).InstanceMarker.mount).toBe('function')
  })
})
