# PrioNudge — landing site

One-page marketing site for [PrioNudge](https://github.com/IzzaldinSamir/prionudge-releases),
a keyboard-first Windows desktop task manager.

Plain HTML, CSS and a small amount of vanilla JavaScript. No build step, no
dependencies, no backend, no analytics, no cookies.

## Files

```
index.html          the whole page
styles.css          design system + layout
script.js           nav backdrop, reveal-on-scroll, latest-release lookup
robots.txt
assets/
  favicon.svg       the real PrioNudge app mark
  fonts/
    geist-variable.woff2
  img/
    hero-today.webp     the main app screenshot (Today view)
    detail-optimize.webp
    detail-capture.webp
    detail-focus.webp
    og.jpg              social preview card, 1200x630
```

## Preview locally

```bash
cd prionudge-site
python -m http.server 8080
# then open http://localhost:8080
```

Any static server works — `npx serve`, `npx http-server`, VS Code Live Server, etc.
Opening `index.html` directly with `file://` also works, though the browser will
block the GitHub API request (the pinned download links still function).

## Deploying

It is a static folder, so anything works. Easiest options:

- **Cloudflare Pages** — connect the repo, build command: *(none)*, output dir: `/`
- **Netlify** — drag the folder onto the Netlify dashboard (or set publish dir to `.`)
- **GitHub Pages** — push the folder to a repo, then Settings → Pages → deploy from branch root
- **Vercel** — `vercel --prod` with framework preset "Other"

After deploying, update the placeholder domain in `index.html`:

- `<link rel="canonical">`
- `og:url`, `og:image`, `twitter:image`
- the `url` / `downloadUrl` fields in the JSON-LD block

## Download links

The buttons ship with pinned `v0.1.11` asset URLs so they work with JavaScript
disabled. On load, `script.js` asks the GitHub API for the latest release in
`IzzaldinSamir/prionudge-releases`, finds the asset ending in `_x64-setup.exe`
and the matching `.msi`, and rewrites the links and the on-page version label.
If that request fails for any reason — offline, rate limited, blocked — the
pinned links stay exactly as they are.

A plain `releases/latest/download/<file>` URL is deliberately *not* used: the
installer filename contains the version, so that path breaks the moment a new
release is published.

To change the version advertised as the fallback, update these places:

- `index.html` — every `data-dl="exe"` / `data-dl="msi"` href, and the two
  `<span data-version>` elements
- `index.html` — `softwareVersion` in the JSON-LD block
- `script.js` — `FALLBACK_VERSION`

## Notes

- The PrioNudge source repository is private; all GitHub links point to the
  public `prionudge-releases` repository. If the source repo is made public
  later, it is a single find-and-replace in `index.html` and `script.js`.
- The Windows installers are not Authenticode-signed, so the copy says the
  *update* bundle is signature-verified (which it is — Tauri minisign) rather
  than claiming a signed installer.
- Screenshots are captured from the real application UI, not mocked up.
- `geist-variable.woff2` is the font the desktop app itself uses; Geist is
  licensed under the SIL Open Font License 1.1.
