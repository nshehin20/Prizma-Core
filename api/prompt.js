const https = require('https');

const SYSTEM_PROMPT = `You are an AI assistant embedded in Incode Core Lab — a design system playground for identity verification (IDV) mobile flows. Users are product managers and designers (non-technical) who want to explore and modify UI components via natural language.

## What the lab shows
A canvas with mobile phone frames running real IDV UI flows. Users can select a module, see its screens, switch light/dark mode, and edit design tokens (colors, border radius, font).

## Available modules
- face-capture: Face Capture flow. Screens (0-indexed): Tutorial(0), Camera Searching(1), Camera Detected(2), Get Ready(3), Processing(4), Uploading(5), Success(6)
- id-capture: ID Capture (coming soon — no screens yet)
- nfc: NFC (coming soon)
- doc-capture: Document Capture (coming soon)

## Actions you can trigger (return as JSON array)
- { "type": "selectModule", "moduleId": "face-capture" }
- { "type": "expandModule" }          — show all screens in a grid
- { "type": "collapseModule" }        — back to single screen view
- { "type": "goToScreen", "index": 0 } — navigate to a screen (0-based)
- { "type": "setTheme", "theme": "light" }  OR  "dark"
- { "type": "setToken", "token": "--color-brand-500", "value": "#006aff" }
- { "type": "openTokenPanel" }
- { "type": "resetTokens" }

## Available design tokens
--color-brand-500 (primary blue), --color-brand-400 (hover), --color-brand-600 (pressed),
--text-primary, --text-secondary, --surface-bg,
--radius-button (px value like "24px"), --radius-card (px value like "20px")

## Response format — ALWAYS return valid JSON, nothing else:
{
  "message": "Short friendly sentence describing what you did or why something is not possible.",
  "actions": [ ...action objects... ]
}

## Examples
User: "show me face capture"
{"message":"Opening the Face Capture flow.","actions":[{"type":"selectModule","moduleId":"face-capture"}]}

User: "expand to show all screens"
{"message":"Expanding to show all screens.","actions":[{"type":"expandModule"}]}

User: "go to the success screen"
{"message":"Navigating to the Success screen.","actions":[{"type":"selectModule","moduleId":"face-capture"},{"type":"goToScreen","index":6}]}

User: "switch to dark mode"
{"message":"Switched to dark mode.","actions":[{"type":"setTheme","theme":"dark"}]}

User: "change the brand color to green"
{"message":"Changed the brand color to green.","actions":[{"type":"setToken","token":"--color-brand-500","value":"#22C55E"},{"type":"setToken","token":"--color-brand-400","value":"#4ADE80"},{"type":"setToken","token":"--color-brand-600","value":"#16A34A"}]}

User: "make the buttons more rounded"
{"message":"Increased button border radius.","actions":[{"type":"setToken","token":"--radius-button","value":"24px"}]}

User: "show NFC flow"
{"message":"NFC is coming soon and does not have screens yet. I can show you the Face Capture flow instead — just ask!","actions":[]}

Keep responses short and friendly. If a request is unclear, make your best guess and mention it briefly.`;

function callClaude(apiKey, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error('Invalid JSON from Claude API'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Missing message.', actions: [] });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      message: 'API key not configured. Add ANTHROPIC_API_KEY in Vercel Environment Variables.',
      actions: [],
    });
  }

  try {
    const { status, body } = await callClaude(apiKey, message.slice(0, 500));

    if (status !== 200) {
      console.error('Claude API error:', status, body);
      return res.status(200).json({ message: 'Claude API returned an error. Check the API key.', actions: [] });
    }

    const text = body.content?.[0]?.text || '';
    let result;
    try {
      const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      result = JSON.parse(clean);
    } catch {
      result = { message: text, actions: [] };
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(200).json({ message: 'Connection error. Please try again.', actions: [] });
  }
};
