const { MongoClient } = require('mongodb');

const BOTS = ['HeadlessChrome', 'Googlebot', 'vercel-healthcheck', 'AhrefsBot', 'Baiduspider', 'YandexBot', 'facebookexternalhit'];

let cachedClient = null;

async function getCollection() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI env var is not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db('hbdss').collection('events');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url   = new URL(req.url, 'http://localhost');
  const event = url.searchParams.get('event') || 'unknown';

  const ua = req.headers['user-agent'] || '';
  if (BOTS.some(function (b) { return ua.includes(b); })) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const ip  = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const doc = {
    event,
    ip,
    ua,
    time:      new Date().toISOString(),
    createdAt: new Date()
  };

  try {
    const col = await getCollection();
    await col.insertOne(doc);
    console.log(`[BIRTHDAY] event="${event}" time=${doc.time} ip=${ip}`);
  } catch (err) {
    // Still return 200 so the browser doesn't retry noisily
    console.error('[BIRTHDAY] MongoDB insert failed:', err.message);
  }

  res.status(200).json({ ok: true });
};

