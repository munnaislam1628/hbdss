const { MongoClient } = require('mongodb');

const BOTS = ['HeadlessChrome', 'Googlebot', 'AhrefsBot', 'Baiduspider', 'YandexBot', 'facebookexternalhit'];

let cachedClient = null;

async function getCollection() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI env var is not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db('hbdss').collection('events');
}

exports.handler = async function (event) {
  const headers = event.headers || {};
  const ua = headers['user-agent'] || '';

  if (BOTS.some(function (b) { return ua.includes(b); })) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, skipped: true }) };
  }

  const params    = event.queryStringParameters || {};
  const eventName = params.event || 'unknown';
  const ip        = (headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  const doc = {
    event:     eventName,
    ip,
    ua,
    time:      new Date().toISOString(),
    createdAt: new Date()
  };

  try {
    const col = await getCollection();
    await col.insertOne(doc);
    console.log(`[BIRTHDAY] event="${eventName}" time=${doc.time} ip=${ip}`);
  } catch (err) {
    console.error('[BIRTHDAY] MongoDB insert failed:', err.message);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true })
  };
};
