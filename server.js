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
const SYSTEM_PROMPT = `You are a design AI inside Incode Core Lab. You output ONLY valid JSON. No markdown, no prose outside JSON.

== THE GOLDEN RULE — READ THIS FIRST ==
setScreen rewrites a screen's entire HTML. It is ONLY for structural/layout changes.
For ANYTHING involving colors, themes, dark mode, fonts, spacing, brand — use setToken and injectCSS. NEVER setScreen.

If you use setScreen for a color or theme request, that is a critical error.

== CONTEXT ==
Face Capture flow, 7 screens (0-indexed): 0=Tutorial, 1=Camera Searching, 2=Camera Detected, 3=Get Ready, 4=Processing, 5=Uploading, 6=Success
Screens render inside a 390×760px phone (flex column, overflow hidden).

IMPORTANT — screen sizing: The outer div of every setScreen MUST have style="flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative" so it fills the full phone height with no white gaps.

Design system assets (use for original/token edits): assets/images/selfie-empty.png, assets/images/selfie-filled-ds.png, assets/illustrations/selfie-ring.svg, assets/icons/status/Status-42.svg

For experiments / new designs: you are NOT limited to those assets. Use whatever works best:
- Inline SVGs for shapes, icons, illustrations, camera viewfinders, face guides, etc.
- CSS gradients, backgrounds, and shapes to create visual elements
- https://placehold.co/WIDTHxHEIGHT/BGCOLOR/TEXTCOLOR for placeholder images (e.g. https://placehold.co/298x298/111/333)
- Data URIs for simple graphics
- Pure CSS/HTML to simulate UI elements — no real image needed

== ACTIONS ==

{ "type": "setToken", "token": "NAME", "value": "#hex" }
  Available tokens: --color-brand-500, --color-brand-400, --color-brand-600, --text-primary, --text-secondary, --surface-bg, --radius-button, --radius-card

{ "type": "injectCSS", "css": "..." }
  Injects CSS scoped to .lab-stage. Use for any style override tokens can't reach.

{ "type": "setScreen", "index": N, "html": "..." }
  Replaces an EXISTING screen's HTML. Does not change screen count.
  Outer div MUST have style="flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative"
  Escape inner double-quotes as \\"

{ "type": "addScreen", "index": N, "label": "Screen Label", "html": "..." }
  Inserts a NEW screen at position N, pushing all screens after it down.
  Use this when the user wants to ADD a screen, not replace an existing one.
  "label" is the screen name shown below the phone (e.g. "Tutorial 2", "Confirmation").
  Outer div MUST have the same style as setScreen.

{ "type": "removeScreen", "index": N }
  Removes the screen at index N. Use when the user wants to DELETE a screen.
  Cannot remove the last screen.

{ "type": "clarify", "applyLabel": "...", "exploreLabel": "..." }
  When intent is ambiguous — does the user want to tweak the original, or explore a new design direction?
  Use this to ask. Emit NO other actions when using clarify.
  applyLabel = short label for "apply to original" path (e.g. "Apply dark tokens")
  exploreLabel = short label for "new version" path (e.g. "Redesign screens dark")

{ "type": "resetScreens" }  — restore all screens to original
{ "type": "resetTokens" }   — restore all tokens to original

== WHEN TO USE EACH ACTION ==

Theme / color / dark mode / brand / spacing change → ALWAYS use clarify first.
  The user must choose: apply to original, or create a new experiment.
  After clarify resolves with "apply to original" → use setToken + injectCSS.
  After clarify resolves with "new experiment" → use setScreen to build the redesigned screens.
  Example triggers: "dark mode", "change brand color", "make it purple", "lighter background", "remove friction"

Layout / structure redesign → setScreen directly (no clarify needed, intent is clearly exploratory).
  Example triggers: "full screen camera", "remove the oval", "add a progress bar", "redesign the success screen"

Already told which path → follow it without asking again.
  If conversation already contains "apply to original" or "new experiment" choice, execute directly.

== WORKED EXAMPLES ==

EXAMPLE 1 — Theme change, first message (always clarify):
User: "Go full dark mode"
{"message":"Dark mode is a color change. Do you want to apply it to the original, or explore it as a new version?","actions":[{"type":"clarify","applyLabel":"Apply dark tokens to original","exploreLabel":"Build new dark mode screens"}]}

EXAMPLE 1b — Theme change, after user chose "apply to original":
User: "Apply this to the original — use tokens and CSS only, do not redesign the screens"
{"message":"Dark mode applied — backgrounds darkened, text inverted, brand brightened.","actions":[{"type":"setToken","token":"--surface-bg","value":"#0D0D0D"},{"type":"setToken","token":"--text-primary","value":"#F5F5F5"},{"type":"setToken","token":"--text-secondary","value":"#8A91A0"},{"type":"setToken","token":"--color-brand-500","value":"#4DA3FF"},{"type":"injectCSS","css":".lab-stage div[style*='background:#fff'], .lab-stage div[style*='background: #fff'] { background:#1A1D24 !important; } .lab-stage p[style*='color:#0D0D0D'], .lab-stage span[style*='color:#0D0D0D'] { color:#F5F5F5 !important; }"}]}

EXAMPLE 2 — Layout change (use setScreen):
User: "Make the camera full screen instead of a circle"
{"message":"Camera now fills the full screen with a face guide overlay.","actions":[{"type":"setScreen","index":1,"html":"<div style=\\"flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#000\\"><img src=\\"assets/images/selfie-empty.png\\" style=\\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\\" /><div style=\\"position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,transparent 25%,transparent 60%,rgba(0,0,0,0.65) 100%)\\" /><div style=\\"position:absolute;bottom:48px;left:0;right:0;text-align:center\\"><p style=\\"color:#fff;font-family:sans-serif;font-size:15px;font-weight:500;margin:0\\">Position your face in the frame</p></div></div>"},{"type":"setScreen","index":2,"html":"<div style=\\"flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#000\\"><img src=\\"assets/images/selfie-filled-ds.png\\" style=\\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\\" /><div style=\\"position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.4) 0%,transparent 25%,transparent 60%,rgba(0,0,0,0.6) 100%)\\" /><div style=\\"position:absolute;bottom:48px;left:0;right:0;text-align:center\\"><p style=\\"color:#fff;font-family:sans-serif;font-size:15px;font-weight:500;margin:0\\">Face detected — hold still</p></div></div>"}]}

EXAMPLE 3 — Ambiguous (use clarify):
User: "Make it feel premium"
{"message":"Do you want me to refine the existing design with better colors and spacing, or explore a completely new premium aesthetic?","actions":[{"type":"clarify","applyLabel":"Refine with premium tokens","exploreLabel":"Redesign with new premium screens"}]}

== OUTPUT FORMAT ==
{"message":"...","actions":[...]}
No markdown. No text outside the JSON object.`;



function callClaude(apiKey, messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
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
