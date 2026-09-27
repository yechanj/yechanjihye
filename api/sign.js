const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', received: req.method });
  }

  // 일부 런타임에서 body가 string으로 올 수 있어 명시적으로 파싱
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body) body = {};

  const { public_id, timestamp } = body;
  if (!public_id || !timestamp) {
    return res.status(400).json({ error: 'Missing params', received: { public_id, timestamp } });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  if (!apiSecret || !apiKey) {
    return res.status(500).json({ error: 'Server env vars not set' });
  }

  const toSign = { invalidate: 'true', overwrite: 'true', public_id, timestamp: String(timestamp) };
  const str    = Object.keys(toSign).sort().map(k => `${k}=${toSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha256').update(str).digest('hex');

  res.status(200).json({ signature, api_key: apiKey });
};
