# @flash-gordon/instance-marker

Marks a web app instance with a colored frame and a label, so you never confuse
one deployment with another. Same idea as the account color AWS puts around its
console: a glance at the screen tells you which datacenter, region or
environment you are looking at.

- Four fixed bars at the viewport edges — **no layout shift**, nothing reflows
- A corner badge with the label; click it to move it to the next corner
- Everything lives in a **shadow root**, so the host app's CSS cannot break it
  and it cannot break the host app
- **No label, no marker** — the production instance stays untouched
- **Survives apps that rewrite the DOM** — if the host app replaces the body
  while booting (Kibana does), the marker puts itself back
- Zero dependencies, ~2.4 kB gzipped, SSR-safe, hidden when printing

## Install

```sh
npm install @flash-gordon/instance-marker
```

## Use it from a bundled app

```js
import { mount } from '@flash-gordon/instance-marker'

mount({ label: 'EU-WEST', color: '#e11d48' })
```

Pass the label and color from your runtime config. When the config carries no
label — the primary instance — `mount` renders nothing at all.

## Use it from a server-rendered page

Include the standalone build and configure it on the script tag itself. No
bundler, no inline JS:

```html
<script src="/vendor/instance-marker.global.js"
        data-label="EU-WEST"
        data-color="#e11d48"></script>
```

It works from `<head>` as well as from the end of `<body>`. The API is also on
`window.InstanceMarker` if you would rather call it yourself.

The file to copy is `node_modules/@flash-gordon/instance-marker/dist/instance-marker.global.js`,
or serve it straight from a CDN:

```html
<script src="https://unpkg.com/@flash-gordon/instance-marker"
        data-label="EU-WEST" data-color="#e11d48"></script>
```

## Options

| Option        | Script attribute     | Default        | Meaning                                                      |
| ------------- | -------------------- | -------------- | ------------------------------------------------------------ |
| `label`       | `data-label`         | —              | Text in the badge. Empty or missing renders nothing.          |
| `color`       | `data-color`         | `#e11d48`      | Any CSS color. Badge text picks black or white for contrast.  |
| `corner`      | `data-corner`        | `top-left`     | `top-left`, `top-right`, `bottom-right`, `bottom-left`.       |
| `thickness`   | `data-thickness`     | `5`            | Frame thickness in pixels.                                    |
| `zIndex`      | `data-z-index`       | `2147483000`   | Stacking order of frame and badge.                            |
| `titlePrefix` | `data-title-prefix`  | `false`        | Also prefix `document.title` with `[LABEL]`, for tab clarity. |

`corner` sets the starting corner only — once someone clicks the badge, their
choice is remembered in `localStorage` and wins on later page loads.

`mount` returns a handle:

```js
const marker = mount({ label: 'EU-WEST', color: '#e11d48' })

marker.update({ label: 'RU-CENTRAL' }) // re-render; omitted options are kept
marker.destroy()                       // remove it
```

`update` is what you want when config arrives after boot: mount with whatever
you have, then update once the config is loaded. Updating to an empty label
removes the marker.

Mounting twice replaces the first marker, so a hot reload or a re-run of your
bootstrap code never stacks frames.

## Per-app notes

**React / Next.js.** Mount in an effect so it runs on the client only.
`mount` is safe to call during SSR too — it does nothing without a `document`.

```jsx
useEffect(() => {
  const marker = mount({ label: process.env.NEXT_PUBLIC_INSTANCE_LABEL, color: '#e11d48' })
  return () => marker.destroy()
}, [])
```

**ReScript.** A binding is three lines:

```rescript
type options = {label: string, color: string}
@module("@flash-gordon/instance-marker") external mount: options => unit = "mount"

mount({label: instanceLabel, color: instanceColor})
```

**Rails / ERB, or any server-rendered layout.** Render the attributes from your
config and let the script tag do the rest:

```erb
<script src="/vendor/instance-marker.global.js"
        data-label="<%= Config.instance_label %>"
        data-color="<%= Config.instance_color %>"></script>
```

With an empty `data-label` the tag is inert, so the same layout serves every
instance.

## Picking colors

Anything readable works. One convention that ages well: leave production in the
primary datacenter unmarked, and give every other instance a color you would not
mistake for it.

| Instance             | Color     |
| -------------------- | --------- |
| production (primary) | *no label* |
| production (second DC) | `#7c3aed` |
| staging              | `#0891b2` |
| local / development  | `#65a30d` |

## Development

```sh
npm test        # vitest, jsdom, includes a test against the built bundle
npm run build   # ESM + CJS + IIFE + types into dist/
npm run typecheck
```

`demo/index.html` is a plain page for eyeballing the frame — run `npm run build`
first, then open it in a browser.

## License

MIT
