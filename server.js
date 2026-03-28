// Local dev server — serves static files + proxies /api/prompt to Anthropic
// Usage: node server.js
// Reads API key from config.local.js automatically

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 3000;

// ── Extract API key from config.local.js ─────────────────────────────────────
function getApiKey() {
  try {
    const src = fs.readFileSync(path.join(__dirname, 'config.local.js'), 'utf8');
    const match = src.match(/ANTHROPIC_LOCAL_KEY\s*=\s*['"](.+?)['"]/);
    return match?.[1] || process.env.ANTHROPIC_API_KEY || null;
  } catch {
    return process.env.ANTHROPIC_API_KEY || null;
  }
}

// ── Call Anthropic API server-side (no CORS issues) ──────────────────────────
const SYSTEM_PROMPT = `You are an AI assistant embedded in Incode Core Lab — a design system playground for identity verification (IDV) mobile flows. Users are product managers and designers (non-technical) who want to explore and modify UI components via natural language.

Available modules:
- face-capture: Face Capture. Screens (0-indexed): Tutorial(0), Camera Searching(1), Camera Detected(2), Get Ready(3), Processing(4), Uploading(5), Success(6)
- id-capture: ID Capture (coming soon, no screens)
- nfc: NFC (coming soon)
- doc-capture: Document Capture (coming soon)

Actions you can trigger:
- { "type": "selectModule", "moduleId": "face-capture" }
- { "type": "expandModule" }
- { "type": "collapseModule" }
- { "type": "goToScreen", "index": 0 }
- { "type": "setTheme", "theme": "light" } or "dark"
- { "type": "setToken", "token": "--color-brand-500", "value": "#hex" }
- { "type": "openTokenPanel" }
- { "type": "resetTokens" }

Available tokens: --color-brand-500, --color-brand-400, --color-brand-600, --text-primary, --text-secondary, --surface-bg, --radius-button (e.g. "24px"), --radius-card

ALWAYS respond with valid JSON only:
{ "message": "Short friendly sentence.", "actions": [ ...action objects... ] }`;

function callClaude(apiKey, messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('Invalid JSON from Anthropic')); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // POST /api/prompt — proxy to Anthropic
  if (req.method === 'POST' && req.url === '/api/prompt') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const { messages } = JSON.parse(body);
        if (!Array.isArray(messages) || !messages.length) {
          return res.end(JSON.stringify({ message: 'Missing messages.', actions: [] }));
        }

        const apiKey = getApiKey();
        if (!apiKey) {
          return res.end(JSON.stringify({ message: 'No API key found in config.local.js.', actions: [] }));
        }

        const { status, body: claudeBody } = await callClaude(apiKey, messages);
        if (status !== 200) {
          const errMsg = claudeBody?.error?.message || `HTTP ${status}`;
          return res.end(JSON.stringify({ message: `API error: ${errMsg}`, actions: [] }));
        }

        const text = claudeBody.content?.[0]?.text || '';
        try {
          const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          res.end(clean);
        } catch {
          res.end(JSON.stringify({ message: text, actions: [] }));
        }
      } catch (err) {
        res.end(JSON.stringify({ message: `Server error: ${err.message}`, actions: [] }));
      }
    });
    return;
  }

  // GET — serve static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Incode Core Lab — local server`);
  console.log(`  http://localhost:${PORT}\n`);
  const key = getApiKey();
  if (key) {
    console.log(`  API key loaded from config.local.js ✓`);
  } else {
    console.log(`  ⚠ No API key found — add it to config.local.js`);
  }
});
