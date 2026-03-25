const fs   = require('fs');
const path = require('path');

const LOG_FILE = '/tmp/birthday_events.log';

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Use WHATWG URL API — no url.parse() deprecation warning
  const base  = 'http://localhost';
  const url   = new URL(req.url, base);
  const event = url.searchParams.get('event') || 'unknown';

  // Skip Vercel health-check bots so only real visits show up
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('HeadlessChrome') || ua.includes('Googlebot') || ua.includes('vercel-healthcheck')) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const ip   = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const time = new Date().toISOString();
  const line = `[BIRTHDAY] event="${event}" time=${time} ip=${ip} ua="${ua}"\n`;

  // Print to Vercel → Functions → Logs
  console.log(line.trim());

  // Also persist to /tmp so /api/events can serve it
  // /tmp is per-instance but gives a readable audit trail while the instance is warm
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (_) {}

  res.status(200).json({ ok: true });
};

