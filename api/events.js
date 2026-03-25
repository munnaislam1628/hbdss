const fs = require('fs');

const LOG_FILE = '/tmp/birthday_events.log';

// Simple emoji map for events
const ICONS = {
  'page-opened':  '👀',
  'started':      '▶️',
  'candle-blown': '🎂',
  'final-seen':   '💖',
};

module.exports = function handler(req, res) {
  // Very basic auth: ?key=hbdss  (keep this secret — change it to something personal)
  const base = 'http://localhost';
  const url  = new URL(req.url, base);
  if (url.searchParams.get('key') !== 'hbdss2026') {
    return res.status(401).send('Unauthorized');
  }

  let lines = [];
  try {
    const raw = fs.readFileSync(LOG_FILE, 'utf8');
    lines = raw.trim().split('\n').filter(Boolean).reverse(); // newest first
  } catch (_) {
    lines = [];
  }

  const rows = lines.map(function (line) {
    const mEvent = line.match(/event="([^"]+)"/);
    const mTime  = line.match(/time=([^\s]+)/);
    const mIp    = line.match(/ip=([^\s]+)/);
    const event  = mEvent ? mEvent[1] : '?';
    const time   = mTime  ? mTime[1].replace('T', ' ').replace('Z', ' UTC') : '?';
    const ip     = mIp    ? mIp[1]   : '?';
    const icon   = ICONS[event] || '📌';
    return `<tr><td>${icon}</td><td><b>${event}</b></td><td>${time}</td><td>${ip}</td></tr>`;
  }).join('');

  const hasFinalSeen   = lines.some(function (l) { return l.includes('final-seen'); });
  const hasCandleBlown = lines.some(function (l) { return l.includes('candle-blown'); });
  const hasStarted     = lines.some(function (l) { return l.includes('"started"'); });

  const summary = `
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
      <div class="badge ${hasStarted     ? 'yes' : 'no'}">▶️ Started: ${hasStarted ? 'YES' : 'not yet'}</div>
      <div class="badge ${hasCandleBlown ? 'yes' : 'no'}">🎂 Candles blown: ${hasCandleBlown ? 'YES' : 'not yet'}</div>
      <div class="badge ${hasFinalSeen   ? 'yes' : 'no'}">💖 Final screen seen: ${hasFinalSeen ? 'YES ✅' : 'not yet'}</div>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Birthday Tracker 🎂</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background:#1a0a0f; color:#f8e9ec; padding:24px; }
  h1   { color:#e07095; margin-bottom:6px; }
  p.sub { color:#a07080; font-size:0.85rem; margin-bottom:20px; }
  .badge { padding:8px 16px; border-radius:20px; font-size:0.9rem; font-weight:600; }
  .badge.yes { background:#3a0f1a; border:1px solid #e07095; color:#ffb3c6; }
  .badge.no  { background:#1f1010; border:1px solid #5a2030; color:#a07080; }
  table { border-collapse:collapse; width:100%; max-width:800px; }
  th    { text-align:left; color:#a07080; font-size:0.8rem; padding:6px 10px; border-bottom:1px solid #3a1020; }
  td    { padding:8px 10px; border-bottom:1px solid #2a0f18; font-size:0.85rem; }
  tr:hover td { background:#2a0f18; }
  .empty { color:#604050; text-align:center; padding:30px; }
</style>
</head>
<body>
<h1>🎂 Birthday Event Tracker</h1>
<p class="sub">Events are stored per server instance. Refresh to see latest. Total events: ${lines.length}</p>
${summary}
<table>
  <thead><tr><th></th><th>Event</th><th>Time (UTC)</th><th>IP</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="4" class="empty">No events recorded yet in this instance.<br>Check Vercel → Functions → Logs for persistent history.</td></tr>'}</tbody>
</table>
<p style="margin-top:24px;font-size:0.75rem;color:#504040">
  ⚠️ /tmp storage is per-instance. For permanent logs, check 
  <a href="https://vercel.com/dashboard" style="color:#e07095">Vercel Dashboard → Functions → Logs</a>
  and filter by <code>[BIRTHDAY]</code>.
</p>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
