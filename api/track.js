export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const event   = req.query.event || 'unknown';
  const ua      = req.headers['user-agent'] || 'unknown';
  const ip      = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const time    = new Date().toISOString();

  // This console.log appears in Vercel → Functions → Logs
  console.log(`[BIRTHDAY] event="${event}" time=${time} ip=${ip} ua="${ua}"`);

  res.status(200).json({ ok: true });
}
