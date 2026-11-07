// Configure GEMINI_API_KEY in Vercel: Project Settings > Environment Variables.
// GEMINI_MODEL is optional and defaults to gemini-3.5-flash.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server is missing GEMINI_API_KEY. Add it in Vercel project settings.' } });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(body);
  } catch (error) {
    console.error('Gemini request failed:', error);
    return res.status(502).json({ error: { message: 'Could not reach Gemini. Please try again.' } });
  }
};
