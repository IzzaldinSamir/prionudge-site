# PrioNudge — landing site

One-page marketing site for [PrioNudge](https://github.com/IzzaldinSamir/prionudge-releases),
a keyboard-first Windows desktop task manager.

Plain HTML, CSS and a small amount of vanilla JavaScript. No build step, no
dependencies, no backend, no analytics, no cookies.

## Files

```
index.html          the whole page
privacy.html        privacy policy
terms.html          software terms of service
styles.css          design system + layout
script.js           nav backdrop, reveal-on-scroll, latest-release lookup
robots.txt
assets/
  favicon.svg       the real PrioNudge app mark
  fonts/
    geist-variable.woff2
  img/
    hero-today.webp     the main app screenshot (Today view)
    detail-tracker.webp activity tracker with targets & history
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

The production site is https://prionudge.com/. The existing Cloudflare Pages
project **prionudge-site** is connected to `IzzaldinSamir/prionudge-site` and
automatically deploys `main`, with no build command and the repository root as
the output directory. Keep using this project for domain and site changes.

`prionudge.com`, `www.prionudge.com`, and `prionudge.ezzulddin.com` are custom
domains on the same project. Cloudflare Single Redirect rules match only
`www.prionudge.com` (in the `prionudge.com` zone) and
`prionudge.ezzulddin.com` (in the `ezzulddin.com` zone). Both return **301** to
`concat("https://prionudge.com", http.request.uri.path)`, with **Preserve query
string** enabled. Attach and verify the apex domain before enabling redirects;
keep the old hostname attached. Do not create a second project or deployment.

The canonical link, `og:url`, and SoftwareApplication JSON-LD `url` use
`https://prionudge.com/`. Both social image URLs use
`https://prionudge.com/assets/img/og.jpg`. The JSON-LD `downloadUrl` remains the
GitHub release installer URL, and the author's personal URL stays unchanged.

Website DNS coexists with Cloudflare Email Routing for `support@prionudge.com`.
Preserve the existing MX, SPF/TXT, DKIM records, destination address, and support
routing rule when changing website domains. Do not use wildcard DNS changes.

## Support

Public support and privacy questions: `support@prionudge.com`.

## Download links

The buttons ship with pinned `v0.1.17` asset URLs so they work with JavaScript
disabled. On load, `script.js` asks the GitHub API for the latest release in
`IzzaldinSamir/prionudge-releases`, finds the asset ending in `_x64-setup.exe`
and the matching `.msi`, and rewrites the links and the on-page version label.
If that request fails for any reason — offline, rate limited, blocked — the
pinned links stay exactly as they are.

A plain `releases/latest/download/<file>` URL is deliberately *not* used: the
installer filename contains the version, so that path breaks the moment a new
release is published.

To change the version advertised as the fallback, update these places:

- `index.html` — every `data-dl="exe"` / `data-dl="msi"` href, and the
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

- PrioNudge is launched under a paid **Founder Early Access** license at
  **€14.99 one-time** (perpetual license for the purchased version, up to three
  activations, no subscription, no lifetime-updates promise). Every download
  includes a full 14-day local trial with no account required.
- Checkout is powered by Creem as Merchant of Record via `pay.prionudge.com`.
