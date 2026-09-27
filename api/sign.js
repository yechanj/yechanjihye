const crypto = require('crypto');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { public_id, timestamp } = req.body;
  if (!public_id || !timestamp) return res.status(400).json({ error: 'Missing params' });

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey    = process.env.CLOUDINARY_API_KEY;

  // Cloudinary 서명: 파라미터 알파벳 순 정렬 후 API Secret 추가 → SHA-256
  const toSign = { invalidate: 'true', overwrite: 'true', public_id, timestamp: String(timestamp) };
  const str    = Object.keys(toSign).sort().map(k => `${k}=${toSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha256').update(str).digest('hex');

  res.status(200).json({ signature, api_key: apiKey });
};
