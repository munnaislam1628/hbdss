# hbdss — Happy Birthday Sheikh Sanzida 🎂

A cinematic, single-page birthday surprise website with microphone-based candle-blow detection, confetti, background music, and Vercel event tracking.

---

## Features

| Feature | Details |
|---|---|
| **4-screen flow** | Intro → Cake → Transition message → Final message |
| **Cinematic intro** | Three lines fade in sequentially with a staggered reveal |
| **Audio preloading** | Both MP3s are fetched on page load; Start button appears only after they're ready |
| **Background music** | `src/music.mp3` — loops, fades in from 0 to volume 0.22 over 5 s |
| **Mic blow detection** | Uses the Web Audio API with a 2-second adaptive noise-floor calibration |
| **Pop sound** | `src/pop.mp3` — played via a dedicated `AudioContext` (never clashes with music) |
| **Confetti** | `canvas-confetti` fires from both sides for 2.5 s |
| **Floating emojis** | 8 slow background floaties (🌻 🪻 🌸 💜) + 38 hearts on the final screen |
| **Wish popup** | Slides up 4.5 s after the final screen appears |
| **Event tracking** | Serverless function logs `page-opened`, `started`, `candle-blown`, `final-seen` |
| **Events dashboard** | Password-protected HTML page at `/api/events?key=hbdss2026` |
| **Mobile-friendly** | Responsive `clamp()` sizing, tap-to-blow fallback if mic unavailable |
| **Vignette overlay** | Subtle dark radial vignette for a cinematic feel |

---

## Project Structure

```
hbdss/
├── index.html          # Entire birthday website (inline CSS + JS)
├── package.json        # Node 20 engine declaration (suppresses Vercel ESM warning)
├── src/
│   ├── music.mp3       # Background music (looping, soft)
│   └── pop.mp3         # Short celebratory pop sound
└── api/
    ├── track.js        # Serverless function — records events to Vercel logs + /tmp
    └── events.js       # Serverless function — password-protected event dashboard
```

> **Note:** `api/` functions only work on Vercel (and partially on Netlify with adaptation). For GitHub Pages (static only), the tracking features are silently skipped.

---

## Audio Files

Place your own files at these exact paths if you replace the defaults:

| Path | Purpose | Recommended length |
|---|---|---|
| `src/music.mp3` | Looping background track | 2–5 min |
| `src/pop.mp3` | One-shot celebratory pop | < 2 s |

---

## Mic Blow Detection

1. On the Cake screen the browser requests microphone access.
2. A 60-frame (~2 s) calibration phase measures the ambient noise floor.
3. Threshold = `noiseFloor + 47`, clamped to `[63, 120]`.
4. Four consecutive frames above the threshold trigger the blow.
5. If mic access is denied, a tap-to-blow fallback activates automatically.

To tune sensitivity, edit these values in `index.html` inside the `calibrate()` function:
```js
var MARGIN    = 47;   // increase → harder to blow; decrease → easier
var threshold = Math.min(120, Math.max(63, noiseFloor + MARGIN));
var holdNeeded = 4;   // frames above threshold required
```

---

## Event Tracking (Vercel only)

Four events are tracked automatically:

| Event | When |
|---|---|
| `page-opened` | On page load (bots filtered by UA) |
| `started` | Start button clicked |
| `candle-blown` | Candles successfully blown |
| `final-seen` | Final message screen shown |

**View logs two ways:**

1. **Vercel Dashboard** → Project → Functions → `track` → Logs → filter by `[BIRTHDAY]`  
   *(Free tier keeps logs for 1 day)*

2. **Events dashboard** → `https://YOUR-DOMAIN.vercel.app/api/events?key=hbdss2026`  
   *(Uses `/tmp` — resets between cold starts, but good for a quick check)*

To change the dashboard password, edit `api/events.js`:
```js
if (url.searchParams.get('key') !== 'hbdss2026')
```

---

## Deploying

### Vercel (recommended — includes event tracking)

1. Install the [Vercel CLI](https://vercel.com/docs/cli) or use the web dashboard.

   ```bash
   npm i -g vercel
   ```

2. Log in and deploy from the project root:

   ```bash
   cd hbdss
   vercel
   ```

3. Follow the prompts (Framework: **Other**, Root: `/`, Output: leave blank).

4. For production:

   ```bash
   vercel --prod
   ```

5. Your site is live at `https://YOUR-PROJECT.vercel.app`.  
   Event dashboard: `https://YOUR-PROJECT.vercel.app/api/events?key=hbdss2026`

> Vercel automatically detects the `api/` folder and deploys each `.js` file as a serverless function.

---

### Netlify (static site — no event tracking)

> The `api/` folder uses Node.js CommonJS. Netlify Functions require a different setup, so tracking is silently skipped (the `fetch('/api/track')` calls fail quietly).

1. Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

   ```bash
   npm i -g netlify-cli
   ```

2. Deploy from the project root:

   ```bash
   cd hbdss
   netlify deploy --dir .
   ```

3. Preview the draft URL, then publish:

   ```bash
   netlify deploy --dir . --prod
   ```

   Or drag-and-drop the folder onto [app.netlify.com](https://app.netlify.com).

4. Your site is live at `https://YOUR-SITE.netlify.app`.

---

### GitHub Pages (static site — no event tracking)

> GitHub Pages serves only static files. The `api/` functions will not run; tracking calls fail silently.

**Option A — Deploy via GitHub UI**

1. Push the repository to GitHub.
2. Go to **Settings** → **Pages**.
3. Under *Branch*, select `main` and folder `/` (root), then click **Save**.
4. Your site will be at `https://YOUR-USERNAME.github.io/hbdss/`.

**Option B — Deploy via `gh-pages` CLI**

1. Install the tool:

   ```bash
   npm i -g gh-pages
   ```

2. Deploy:

   ```bash
   gh-pages -d . -b gh-pages
   ```

3. In GitHub → Settings → Pages, set the source branch to `gh-pages`.

> **Important:** GitHub Pages serves from a sub-path (`/hbdss/`). Audio paths `src/music.mp3` and `src/pop.mp3` are relative so they will work correctly.

---

## Local Preview

No build step needed. Just open `index.html` in a browser:

```bash
# Python 3 (recommended — needed for mic API over localhost)
python3 -m http.server 8080
# then open http://localhost:8080
```

> Microphone access requires either `localhost` or `https://`. Opening `index.html` directly as a `file://` URL will block mic access in most browsers.

---

## Customisation Quick Reference

| What to change | Where |
|---|---|
| Names / messages | `index.html` — `#intro`, `#transition-screen`, `#final` content |
| Blow threshold | `index.html` → `calibrate()` → `MARGIN`, `holdNeeded` |
| Music volume | `index.html` → `startMusicFadeIn()` → `TARGET_VOL` |
| Pop sound volume | `index.html` → `playPop()` → `gain.gain.value` |
| Confetti colours | `index.html` → `fireConfetti()` → `colors` array |
| Floating emojis | `index.html` → `floatyList` array |
| Dashboard password | `api/events.js` → `key !== 'hbdss2026'` |
| Tracking events | `api/track.js` — add/remove event names as needed |