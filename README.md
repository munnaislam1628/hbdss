# hbdss — Happy Birthday Sheikh Sanzida 🎂

A cinematic, single-page birthday surprise website with microphone-based candle-blow detection, confetti, background music, and **persistent MongoDB Atlas event tracking** that works on Vercel and Netlify.

---

## Features

| Feature | Details |
|---|---|
| **4-screen flow** | Intro → Cake → Transition message → Final message |
| **Cinematic intro** | Three lines fade in sequentially, Start button unlocks only after audio is ready |
| **Audio preloading** | Both MP3s load on page open; button appears only after `canplaythrough` fires |
| **Background music** | `src/music.mp3` — loops, fades in to volume 0.22 over 5 s |
| **Mic blow detection** | Web Audio API with 2-second adaptive noise-floor calibration |
| **Pop sound** | `src/pop.mp3` — dedicated `AudioContext`, never clashes with music |
| **Confetti** | `canvas-confetti` fires from both sides for 2.5 s |
| **Floating emojis** | 8 slow background floaties + 38 hearts on final screen |
| **Wish popup** | Slides up 4.5 s after final screen appears |
| **Event tracking** | MongoDB Atlas — `page-opened`, `started`, `candle-blown`, `final-seen` |
| **Events dashboard** | `/api/events?key=hbdss2026` — badges + full event table |
| **Mobile-friendly** | Responsive `clamp()` sizing, tap-to-blow fallback if mic unavailable |

---

## Project Structure

```
hbdss/
├── index.html                  # Entire birthday website (inline CSS + JS)
├── package.json                # Node 20, mongodb dependency
├── netlify.toml                # Routes /api/* → Netlify Functions (Netlify only)
├── .env.example                # Template — copy to .env and fill in MONGODB_URI
├── .gitignore
├── src/
│   ├── music.mp3               # Background music (looping)
│   └── pop.mp3                 # Short celebratory pop sound
├── api/                        # Vercel serverless functions
│   ├── track.js                # Records events to MongoDB
│   └── events.js               # Password-protected event dashboard
└── netlify/
    └── functions/              # Netlify serverless functions (same logic, different export format)
        ├── track.js
        └── events.js
```

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free **M0** cluster.
2. Create a **database user** (username + password — no special characters in the password).
3. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere — required for serverless).
4. Click **Connect** → **Drivers** → **Node.js** → copy the connection string.
5. Replace `<password>` in the string with your actual password.
6. Copy `.env.example` to `.env` and paste the string:

```
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. Add `MONGODB_URI` as an **environment variable** in Vercel or Netlify (see deploy sections below). **Never commit `.env` to git** — it's already in `.gitignore`.

The functions will automatically create the `hbdss` database and `events` collection on first write.

---

## Audio Files

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

To tune sensitivity, edit in `index.html` inside `calibrate()`:
```js
var MARGIN     = 47;  // increase → harder to blow; decrease → easier
var holdNeeded = 4;   // consecutive frames required
```

---

## Event Tracking

Four events are saved to MongoDB automatically:

| Event | When triggered |
|---|---|
| `page-opened` | On page load (bots filtered) |
| `started` | Start button clicked |
| `candle-blown` | Candles successfully blown |
| `final-seen` | Final message screen shown |

### Viewing the dashboard

```
https://YOUR-DOMAIN/api/events?key=hbdss2026
```

Shows: total events, per-event counts (Started / Candles blown / Final seen), full event table newest-first.

To change the dashboard password, edit both `api/events.js` and `netlify/functions/events.js`:
```js
if (params.key !== 'hbdss2026')   // ← change this value
```

---

## Deploying

### Vercel (recommended)

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy from the project root:
   ```bash
   cd hbdss
   vercel
   ```
   - Framework: **Other**
   - Root directory: `/`
   - Output directory: leave blank

3. Add the environment variable in the Vercel dashboard:
   - Project → **Settings** → **Environment Variables**
   - Name: `MONGODB_URI` | Value: your Atlas connection string
   - Apply to: **Production**, **Preview**, **Development**

4. Redeploy or promote to production:
   ```bash
   vercel --prod
   ```

5. Live at `https://YOUR-PROJECT.vercel.app`  
   Dashboard: `https://YOUR-PROJECT.vercel.app/api/events?key=hbdss2026`

> Vercel auto-detects the `api/` folder and deploys each `.js` as a serverless function.

---

### Netlify (full tracking support ✅)

1. Install the Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy from the project root:
   ```bash
   cd hbdss
   netlify deploy --dir .
   ```
   Preview the draft URL first.

3. Publish to production:
   ```bash
   netlify deploy --dir . --prod
   ```

4. Add the environment variable:
   - Netlify Dashboard → Site → **Site configuration** → **Environment variables**
   - Key: `MONGODB_URI` | Value: your Atlas connection string

5. Trigger a redeploy from the dashboard (or run `netlify deploy --dir . --prod` again).

6. Live at `https://YOUR-SITE.netlify.app`  
   Dashboard: `https://YOUR-SITE.netlify.app/api/events?key=hbdss2026`

> `netlify.toml` is already configured to route `/api/track` and `/api/events` to the Netlify Functions in `netlify/functions/`.

---

### GitHub Pages (static — no tracking ⚠️)

> GitHub Pages serves only static files. There is no server to run Node.js, so MongoDB cannot be reached and all `fetch('/api/track')` calls fail silently. The birthday site itself works perfectly; only the tracking is unavailable.

**Option A — via GitHub UI**

1. Push the repository to GitHub.
2. Go to **Settings** → **Pages**.
3. Source: branch `main`, folder `/` (root) → **Save**.
4. Live at `https://YOUR-USERNAME.github.io/hbdss/`.

**Option B — via `gh-pages` CLI**

1. ```bash
   npm i -g gh-pages
   gh-pages -d . -b gh-pages
   ```
2. In GitHub → Settings → Pages, set source branch to `gh-pages`.

> Audio paths `src/music.mp3` and `src/pop.mp3` are relative so they work under the `/hbdss/` sub-path automatically.

---

## Local Preview

```bash
# Python 3 (mic API needs localhost or https, not file://)
python3 -m http.server 8080
# open http://localhost:8080
```

For local tracking, create a `.env` file with your `MONGODB_URI` and run with:
```bash
npm install
npx vercel dev   # or: netlify dev
```

---

## Customisation Quick Reference

| What | Where |
|---|---|
| Names / messages | `index.html` — `#intro`, `#transition-screen`, `#final` |
| Blow threshold | `index.html` → `calibrate()` → `MARGIN`, `holdNeeded` |
| Music volume | `index.html` → `startMusicFadeIn()` → `TARGET_VOL` |
| Pop sound volume | `index.html` → `playPop()` → `gain.gain.value` |
| Confetti colours | `index.html` → `fireConfetti()` → `colors` array |
| Floating emojis | `index.html` → `floatyList` |
| Dashboard password | `api/events.js` + `netlify/functions/events.js` |
| MongoDB database/collection | `api/track.js` + `netlify/functions/track.js` → `.db('hbdss').collection('events')` |


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