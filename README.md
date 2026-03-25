# hbdss — Happy Birthday Sheikh Sanzida 🎂

A cinematic, single-page birthday surprise website with microphone-based candle-blow detection, confetti, background music, and **persistent MongoDB Atlas event tracking** deployed on Vercel.

---

## Features

| Feature | Details |
|---|---|
| **4-screen flow** | Intro → Cake → Transition message → Final message |
| **Cinematic intro** | Three lines fade in sequentially; Start button unlocks only after audio is ready |
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
├── index.html          # Entire birthday website (inline CSS + JS)
├── package.json        # Node 20, mongodb dependency
├── .env.example        # Template — copy to .env and fill in MONGODB_URI
├── .gitignore
├── src/
│   ├── music.mp3       # Background music (looping)
│   └── pop.mp3         # Short celebratory pop sound
└── api/                # Vercel serverless functions
    ├── track.js        # Records events to MongoDB Atlas
    └── events.js       # Password-protected event dashboard
```

---

## MongoDB Atlas Setup

Events are saved to the `portfolio-data` cluster at:
- **Database:** `logs_of_hbd`
- **Collection:** `logs`

The collection is created automatically on first write — you don't need to create it manually.

**Steps:**
1. Go to your cluster on [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Network Access**, ensure `0.0.0.0/0` is allowed (required for Vercel serverless).
3. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@portfolio-data.okmkas1.mongodb.net/?appName=portfolio-data
```

4. Add `MONGODB_URI` as an environment variable in Vercel (see Deploy section). **Never commit `.env`** — it's in `.gitignore`.

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
| `page-opened` | On page load (bots filtered by User-Agent) |
| `started` | Start button clicked |
| `candle-blown` | Candles successfully blown |
| `final-seen` | Final message screen shown |

### Viewing the dashboard

```
https://YOUR-DOMAIN.vercel.app/api/events?key=hbdss2026
```

Shows: per-event counts (Started / Candles blown / Final seen), full event table newest-first.

To change the dashboard password, edit `api/events.js`:
```js
if (url.searchParams.get('key') !== 'hbdss2026')  // ← change this value
```

---

## Deploying to Vercel

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy from the project root:
   ```bash
   cd hbdss
   vercel
   ```
   - Framework preset: **Other**
   - Root directory: `/`
   - Output directory: leave blank

3. Add the environment variable in the Vercel dashboard:
   - Project → **Settings** → **Environment Variables**
   - Name: `MONGODB_URI`
   - Value: your Atlas connection string
   - Apply to: **Production**, **Preview**, **Development**

4. Promote to production:
   ```bash
   vercel --prod
   ```

5. Your site is live at `https://YOUR-PROJECT.vercel.app`  
   Event dashboard: `https://YOUR-PROJECT.vercel.app/api/events?key=hbdss2026`

> Vercel auto-detects the `api/` folder and deploys each `.js` file as a serverless function.

---

## Local Preview

```bash
# Python 3 — mic API requires localhost or https, not file://
python3 -m http.server 8080
# open http://localhost:8080
```

To also test tracking locally with the real MongoDB:
```bash
npm install
npx vercel dev
```
Make sure your `.env` file has `MONGODB_URI` filled in.

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
| Dashboard password | `api/events.js` → `key !== 'hbdss2026'` |
| MongoDB DB / collection | `api/track.js` + `api/events.js` → `.db('logs_of_hbd').collection('logs')` |
