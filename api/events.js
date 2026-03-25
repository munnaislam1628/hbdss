const { MongoClient } = require('mongodb');

const ICONS = {
  'page-opened':  '👀',
  'started':      '▶️',
  'candle-blown': '🎂',
  'final-seen':   '💖',
};

let cachedClient = null;

async function getCollection() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI env var is not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db('logs_of_hbd').collection('logs');
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.searchParams.get('key') !== 'hbdss2026') {
    return res.status(401).send('Unauthorized');
  }

  let docs  = [];
  let dbErr = null;

  try {
    const col = await getCollection();
    docs = await col.find({}).sort({ createdAt: -1 }).limit(300).toArray();
  } catch (err) {
    dbErr = err.message;
  }

  const count     = function (name) { return docs.filter(function (d) { return d.event === name; }).length; };
  const started   = count('started');
  const blown     = count('candle-blown');
  const finalSeen = count('final-seen');

  const tableRows = docs.map(function (d) {
    const icon = ICONS[d.event] || '📌';
    const time = d.time ? d.time.replace('T', ' ').replace('Z', ' UTC') : '?';
    const ua   = (d.ua || '').substring(0, 90);
    return `<tr>
      <td>${icon}</td>
      <td><b>${d.event || '?'}</b></td>
      <td>${time}</td>
      <td>${d.ip || '?'}</td>
      <td style="font-size:0.75rem;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ua}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Birthday Tracker 🎂</title>
<style>
  body  { font-family:'Segoe UI',sans-serif; background:#1a0a0f; color:#f8e9ec; padding:24px; }
  h1    { color:#e07095; margin-bottom:6px; }
  p.sub { color:#a07080; font-size:0.85rem; margin-bottom:20px; }
  .badges { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
  .badge  { background:#2b0a12; border:1px solid #9b1a3a; padding:12px 20px; border-radius:12px; text-align:center; min-width:110px; }
  .badge .num { font-size:2rem; font-weight:bold; color:#e07095; display:block; }
  .badge .lbl { font-size:0.75rem; color:#a07080; }
  table { border-collapse:collapse; width:100%; max-width:900px; }
  th    { text-align:left; color:#a07080; font-size:0.8rem; padding:6px 10px; border-bottom:1px solid #3a1020; }
  td    { padding:8px 10px; border-bottom:1px solid #2a0f18; font-size:0.85rem; vertical-align:top; }
  tr:hover td { background:#2a0f18; }
  .empty { color:#604050; text-align:center; padding:30px; }
  .err { background:#3a0f0f; border:1px solid #9b1a3a; padding:12px 16px; border-radius:8px; color:#ff8899; margin-bottom:16px; }
</style>
</head>
<body>
<h1>🎂 Birthday Event Tracker</h1>
<p class="sub">Powered by MongoDB Atlas · ${docs.length} event${docs.length !== 1 ? 's' : ''} total · newest first</p>
${dbErr ? `<div class="err">⚠️ DB error: ${dbErr}</div>` : ''}
<div class="badges">
  <div class="badge"><span class="num">${started}</span><span class="lbl">▶️ Started</span></div>
  <div class="badge"><span class="num">${blown}</span><span class="lbl">🎂 Candles blown</span></div>
  <div class="badge"><span class="num">${finalSeen}</span><span class="lbl">💖 Final screen seen</span></div>
</div>
<table>
  <thead><tr><th></th><th>Event</th><th>Time (UTC)</th><th>IP</th><th>User Agent</th></tr></thead>
  <tbody>${tableRows || '<tr><td colspan="5" class="empty">No events yet.</td></tr>'}</tbody>
</table>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
