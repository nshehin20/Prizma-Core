// ============================================
//  PRIZMA DESIGN SYSTEM — Lab Playground
//  Vercel / v0 experimentation-ready
//
//  FILE STRUCTURE:
//  1. Token editor (updateToken, resetTokens, themeTokens)
//  2. Shared UI helpers (_navBar, _verifiedTag, SVG constants)
//  3. Face Capture screen functions (fcTutorial, fcCamSearching…)
//     ← ADD NEW SCREENS HERE
//  4. Module registry (_labModuleData)
//     ← REGISTER NEW SCREENS / MODULES HERE
//  5. Lab view engine (initLab, labNav, labExpand…)
//     ← DO NOT MODIFY unless changing lab behavior
//
//  TO EXPERIMENT WITH A MODULE:
//  · Edit or duplicate any fc* function in section 3
//  · Register it in _labModuleData in section 4
//  · The Lab view will pick it up automatically
// ============================================

const root = document.documentElement;

// Defaults for reset
const defaults = {
  '--color-brand-500': '#006aff',
  '--color-brand-400': '#3388ff',
  '--color-brand-600': '#0055cc',
  '--text-primary': '#262831',
  '--text-secondary': '#60667c',
  '--surface-bg': '#ffffff',
  '--radius-button': '16px',
  '--radius-card': '16px',
  '--font-button': "'DM Sans', sans-serif",
  '--font-size-button-m': '18px',
};

function updateToken(property, value) {
  root.style.setProperty(property, value);
}

function syncHex(inputId, value) {
  const el = document.getElementById(inputId);
  if (el) el.value = value;
}

function syncColor(inputId, value) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    const el = document.getElementById(inputId);
    if (el) el.value = value;
  }
}

function resetTokens() {
  // Reset theme to light first
  document.documentElement.setAttribute('data-theme', 'light');
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.toggle('theme-opt--active', o.dataset.val === 'light'));
  const statusBar = document.getElementById('phone-status-bar');
  if (statusBar) statusBar.src = 'assets/illustrations/status-bar-light.svg';

  Object.entries(defaults).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });

  // Reset color pickers (value + hex input + visible dot background)
  const resetPicker = (id, hex) => {
    const input = document.getElementById(id);
    if (input) { input.value = hex; input.closest('.token-pill-dot').style.background = hex; }
    const hexEl = document.getElementById(id + '-hex');
    if (hexEl) hexEl.value = hex;
  };
  resetPicker('brand-500',    '#006aff');
  resetPicker('brand-400',    '#3388ff');
  resetPicker('brand-600',    '#0055cc');
  resetPicker('text-primary',   '#262831');
  resetPicker('text-secondary', '#60667c');
  resetPicker('surface-bg',     '#ffffff');

  // Reset font family select
  document.getElementById('font-family-select').value = "'DM Sans', sans-serif";

  // Reset sliders
  document.getElementById('radius-btn').value = 16;
  document.getElementById('radius-btn-val').textContent = '16px';
  document.getElementById('radius-card').value = 16;
  document.getElementById('radius-card-val').textContent = '16px';
  // Also reset topbar theme to light
  document.querySelectorAll('.topbar-theme-opt').forEach(o => {
    o.classList.toggle('topbar-theme-opt--active', o.dataset.val === 'light');
  });
}

function showView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  btn.classList.add('active');
}

function showDsSection(name, btn) {
  document.querySelectorAll('.ds-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.ds-nav-tab').forEach(t => t.classList.remove('ds-nav-active'));
  document.getElementById('ds-' + name).style.display = 'block';
  btn.classList.add('ds-nav-active');
  populateTokenValues();
}

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb.trim().toUpperCase();
  return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function populateTokenValues() {
  const cs = getComputedStyle(document.documentElement);
  document.querySelectorAll('[data-token]').forEach(el => {
    const token = el.dataset.token;
    const raw = cs.getPropertyValue(token).trim();
    if (!raw) return;
    if (raw.startsWith('#')) {
      el.textContent = raw.toUpperCase();
    } else if (raw.startsWith('rgb')) {
      el.textContent = rgbToHex(raw);
    } else {
      el.textContent = raw;
    }
  });
}

const themeTokens = {
  light: {
    '--surface-bg':             '#ffffff',
    '--surface-card':           '#fcfcfd',
    '--border-card':            '#ebecef',
    '--shadow-card':            '0 2px 7px rgba(0,0,0,0.05),0 2px 35px rgba(33,39,59,0.05)',
    '--text-primary':           '#262831',
    '--text-secondary':         '#60667c',
    '--icon-filter-primary':    'brightness(0) saturate(100%) invert(15%) sepia(10%) saturate(300%) hue-rotate(190deg)',
    '--logo-color':             null,
  },
  dark: {
    '--surface-bg':             '#0a0a0f',
    '--surface-card':           '#1c1d26',
    '--border-card':            'rgba(255,255,255,0.16)',
    '--shadow-card':            'none',
    '--text-primary':           '#fcfcfd',
    '--text-secondary':         '#a3a8b8',
    '--icon-filter-primary':    'brightness(0) invert(1)',
    '--logo-color':             '#ffffff',
  },
};

function toggleTokenPanel() {
  const panel    = document.getElementById('token-panel');
  const backdrop = document.getElementById('token-panel-backdrop');
  const btn      = document.getElementById('topbar-token-btn');
  const isOpen   = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  backdrop.classList.toggle('open', !isOpen);
  btn.classList.toggle('active', !isOpen);
}

function setTopbarTheme(val) {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  if (current === val) return;
  document.documentElement.setAttribute('data-theme', val);
  document.querySelectorAll('.topbar-theme-opt').forEach(o => {
    o.classList.toggle('topbar-theme-opt--active', o.dataset.val === val);
  });
  Object.entries(themeTokens[val]).forEach(([prop, v]) => {
    if (v === null) root.style.removeProperty(prop);
    else root.style.setProperty(prop, v);
  });
  const syncMap = {
    '--surface-bg':    ['surface-bg', 'surface-bg-hex'],
    '--text-primary':  ['text-primary', 'text-primary-hex'],
    '--text-secondary':['text-secondary', 'text-secondary-hex'],
  };
  Object.entries(themeTokens[val]).forEach(([prop, v]) => {
    if (v === null) return;
    const ids = syncMap[prop];
    if (ids) ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = v; });
  });
  const statusBar = document.getElementById('phone-status-bar');
  if (statusBar) statusBar.src = val === 'dark' ? 'assets/illustrations/status-bar-dark.svg' : 'assets/illustrations/status-bar-light.svg';
  document.querySelectorAll('img[src*="assets/icons/status/"]').forEach(img => {
    if (val === 'dark') {
      img.src = img.src.replace('/assets/icons/status/', '/assets/icons/status/dark/').replace('/status/dark/dark/', '/status/dark/');
    } else {
      img.src = img.src.replace('/assets/icons/status/dark/', '/assets/icons/status/');
    }
  });
  if (typeof labRefreshStatusBars === 'function') labRefreshStatusBars();
  populateTokenValues();
}

function toggleTheme(el) {
  const opts = el.querySelectorAll('.theme-opt');
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  opts.forEach(o => o.classList.toggle('theme-opt--active', o.dataset.val === next));

  // Drive surface + text tokens explicitly so inline styles don't block the switch
  Object.entries(themeTokens[next]).forEach(([prop, val]) => {
    if (val === null) root.style.removeProperty(prop);
    else root.style.setProperty(prop, val);
  });

  // Sync sidebar color pickers that relate to these tokens
  const syncMap = {
    '--surface-bg':    ['surface-bg', 'surface-bg-hex'],
    '--text-primary':  ['text-primary', 'text-primary-hex'],
    '--text-secondary':['text-secondary', 'text-secondary-hex'],
  };
  Object.entries(themeTokens[next]).forEach(([prop, val]) => {
    if (val === null) return;
    const ids = syncMap[prop];
    if (ids) ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = val; });
  });

  // Swap status bar image
  const statusBar = document.getElementById('phone-status-bar');
  if (statusBar) {
    statusBar.src = next === 'dark'
      ? 'assets/illustrations/status-bar-dark.svg'
      : 'assets/illustrations/status-bar-light.svg';
  }

  // Swap status SVG icons
  document.querySelectorAll('img[src*="assets/icons/status/"]').forEach(img => {
    if (next === 'dark') {
      img.src = img.src.replace('/assets/icons/status/', '/assets/icons/status/dark/').replace('/status/dark/dark/', '/status/dark/');
    } else {
      img.src = img.src.replace('/assets/icons/status/dark/', '/assets/icons/status/');
    }
  });

  if (typeof labRefreshStatusBars === 'function') labRefreshStatusBars();
  populateTokenValues();
}

function setPreviewMode(id, mode, btn) {
  const section = document.getElementById('preview-' + id);
  if (!section) return;
  section.setAttribute('data-theme', mode === 'dark' ? 'dark' : '');
  section.querySelectorAll('.preview-mode-btn').forEach(b => b.classList.remove('preview-mode-btn--active'));
  btn.classList.add('preview-mode-btn--active');
}

function openDetail(name) {
  document.getElementById('ds-grid-page').style.display = 'none';
  document.getElementById('ds-detail-page').style.display = 'block';
  document.querySelectorAll('.detail-content').forEach(d => d.style.display = 'none');
  document.getElementById('detail-' + name).style.display = 'block';
  document.getElementById('view-components').scrollTop = 0;
}

function closeDetail() {
  document.getElementById('ds-detail-page').style.display = 'none';
  document.getElementById('ds-grid-page').style.display = 'block';
  document.getElementById('view-components').scrollTop = 0;
}

function toggleDropdown(fieldEl) {
  const wrap = fieldEl.closest('.dropdown-wrap');
  if (!wrap || wrap.classList.contains('dropdown-wrap--disabled')) return;
  document.querySelectorAll('.dropdown-wrap.is-open').forEach(d => {
    if (d !== wrap) d.classList.remove('is-open');
  });
  wrap.classList.toggle('is-open');
}

function selectDropdownOption(itemEl, text) {
  const wrap = itemEl.closest('.dropdown-wrap');
  if (!wrap) return;
  const textEl = wrap.querySelector('.dropdown-field__text');
  if (textEl) {
    textEl.textContent = text;
    textEl.classList.remove('dropdown-field__text--placeholder');
  }
  wrap.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('dropdown-item--selected'));
  itemEl.classList.add('dropdown-item--selected');
  wrap.classList.remove('is-open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown-wrap')) {
    document.querySelectorAll('.dropdown-wrap.is-open').forEach(d => d.classList.remove('is-open'));
  }
  if (!e.target.closest('.phone-slot__swap') && !e.target.closest('.phone-swap-panel')) {
    closeSwapPanel();
  }
});

function copyIconName(el, name) {
  navigator.clipboard.writeText(name).catch(() => {});
  el.classList.add('icon-copied');
  setTimeout(() => el.classList.remove('icon-copied'), 1000);
}

// ============================================
//  PHONE SLOT — Component Swap
// ============================================

const _BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _CLOSE_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let _navLogoHtml = null;
function getNavLogo() {
  if (!_navLogoHtml) {
    // Target the logo specifically — it has viewBox "0 0 88 24", not the 24×24 nav icons
    const el = document.querySelector('#slot-nav svg[viewBox="0 0 88 24"]');
    if (el) _navLogoHtml = el.outerHTML;
  }
  return _navLogoHtml || '';
}

const phoneSlots = {
  nav: {
    active: 'back-logo-close',
    label: 'Navigation',
    variants: [
      { id: 'back-logo-close', label: 'Back · Logo · Close' },
      { id: 'logo-only',       label: 'Logo only' },
      { id: 'back-logo',       label: 'Back · Logo' },
      { id: 'logo-close',      label: 'Logo · Close' },
      { id: 'title-back',      label: 'Back · Title' },
    ]
  },
  title: {
    active: 'selfie',
    label: 'Title',
    variants: [
      { id: 'selfie',   label: 'Selfie' },
      { id: 'front-id', label: 'ID Front' },
      { id: 'back-id',  label: 'ID Back' },
      { id: 'passport', label: 'Passport' },
    ]
  },
  illustration: {
    active: 'selfie',
    label: 'Illustration',
    variants: [
      { id: 'selfie',   label: 'Selfie' },
      { id: 'front-id', label: 'ID Front' },
      { id: 'back-id',  label: 'ID Back' },
      { id: 'passport', label: 'Passport' },
    ]
  },
  cta: {
    active: 'ready',
    label: 'Button state',
    variants: [
      { id: 'capturing', label: 'Capturing' },
      { id: 'ready',     label: 'Take photo' },
      { id: 'retry',     label: 'Try again' },
    ]
  },
};

const _NAV_BTN_STYLE = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--text-primary,#262831);flex-shrink:0;transform:scale(0.75);transform-origin:center';

function renderNavVariant(id) {
  const logo = getNavLogo();
  const center = `<div style="flex:1;display:flex;justify-content:center;align-items:center">${logo}</div>`;
  const map = {
    'back-logo-close': `<div style="height:44px;display:flex;align-items:center;justify-content:space-between"><button class="phone-nav-btn">${_BACK_SVG}</button>${center}<button class="phone-nav-btn">${_CLOSE_SVG}</button></div>`,
    'logo-only':       `<div style="height:44px;display:flex;align-items:center;justify-content:center">${logo}</div>`,
    'back-logo':       `<div style="height:44px;display:flex;align-items:center;justify-content:space-between"><button class="phone-nav-btn">${_BACK_SVG}</button>${center}<div style="width:28px"></div></div>`,
    'logo-close':      `<div style="height:44px;display:flex;align-items:center;justify-content:space-between"><div style="width:28px"></div>${center}<button class="phone-nav-btn">${_CLOSE_SVG}</button></div>`,
    'title-back':      `<div style="height:44px;display:flex;align-items:center;justify-content:space-between"><button class="phone-nav-btn">${_BACK_SVG}</button><div style="flex:1;display:flex;justify-content:center"><span class="nav-bar__center--title">Take a selfie</span></div><div style="width:28px"></div></div>`,
  };
  return map[id] || '';
}

// Preview version uses divs (not buttons) to avoid invalid nested-button HTML in the panel
function renderNavPreview(id) {
  const logoRaw = getNavLogo();
  // Scale logo down for the compact preview
  const logo = logoRaw.replace(/width="[\d.]+"/, 'width="58"').replace(/height="[\d.]+"/, 'height="16"');
  const center = `<div style="flex:1;display:flex;justify-content:center;align-items:center">${logo}</div>`;
  const iconBtn = (svg) => `<div style="${_NAV_BTN_STYLE}">${svg}</div>`;
  const spacer = `<div style="width:40px;flex-shrink:0"></div>`;
  const map = {
    'back-logo-close': `<div style="height:36px;display:flex;align-items:center;padding:0 4px">${iconBtn(_BACK_SVG)}${center}${iconBtn(_CLOSE_SVG)}</div>`,
    'logo-only':       `<div style="height:36px;display:flex;align-items:center;justify-content:center">${logo}</div>`,
    'back-logo':       `<div style="height:36px;display:flex;align-items:center;padding:0 4px">${iconBtn(_BACK_SVG)}${center}${spacer}</div>`,
    'logo-close':      `<div style="height:36px;display:flex;align-items:center;padding:0 4px">${spacer}${center}${iconBtn(_CLOSE_SVG)}</div>`,
    'title-back':      `<div style="height:36px;display:flex;align-items:center;padding:0 4px">${iconBtn(_BACK_SVG)}<div style="flex:1;display:flex;justify-content:center"><span class="nav-bar__back-label">Take a selfie</span></div>${spacer}</div>`,
  };
  return map[id] || '';
}

// ============================================
//  SLOT RENDER FUNCTIONS
// ============================================

const titleData = {
  'selfie':   { h: 'Take a selfie',     sub: 'Keep a neutral expression, find balanced light and remove any glasses and hats' },
  'front-id': { h: 'Show your ID front', sub: 'Hold your ID card flat and steady in good lighting' },
  'back-id':  { h: 'Show your ID back',  sub: 'Flip your card and hold it steady in good lighting' },
  'passport': { h: 'Show your passport', sub: 'Open your passport to the photo page and hold it flat' },
};

function renderTitleVariant(id) {
  const d = titleData[id]; if (!d) return '';
  return `<div style="display:flex;flex-direction:column;gap:12px;text-align:center;padding:16px 0">
    <div class="type-h2" style="color:var(--text-primary,#262831)">${d.h}</div>
    <div class="type-body-m-regular" style="color:var(--text-secondary,#60667c)">${d.sub}</div>
  </div>`;
}

function renderTitlePreview(id) {
  const d = titleData[id]; if (!d) return '';
  return `<div style="padding:8px 12px;text-align:center;transform:scale(0.5);transform-origin:top center;white-space:nowrap;overflow:hidden">
    <div class="type-h2" style="color:var(--text-primary,#262831)">${d.h}</div>
    <div class="type-body-m-regular" style="color:var(--text-secondary,#60667c);margin-top:6px">${d.sub}</div>
  </div>`;
}

const illustrationData = {
  'selfie':   { src: 'assets/illustrations/selfie/selfie-animated.svg',  alt: 'Selfie' },
  'front-id': { src: 'assets/illustrations/id-tutorial/step-1.svg',      alt: 'ID Front' },
  'back-id':  { src: 'assets/illustrations/id-tutorial/step-2.svg',      alt: 'ID Back' },
  'passport': { src: 'assets/illustrations/passport.svg',                alt: 'Passport' },
};

function renderIllustrationVariant(id) {
  const d = illustrationData[id]; if (!d) return '';
  return `<img src="${d.src}" style="width:296px;height:296px;object-fit:contain" alt="${d.alt}" />`;
}

function renderIllustrationPreview(id) {
  const d = illustrationData[id]; if (!d) return '';
  return `<div style="display:flex;justify-content:center;align-items:center;padding:8px">
    <img src="${d.src}" style="width:72px;height:72px;object-fit:contain" alt="" />
  </div>`;
}

const ctaData = {
  'capturing': `<div class="spinner" style="width:24px;height:24px;border-width:3px;border-color:rgba(255,255,255,0.3);border-top-color:#fff"></div>`,
  'ready':     `Take photo`,
  'retry':     `Try again`,
};

function renderCtaVariant(id) {
  const inner = ctaData[id]; if (!inner) return '';
  return `<button class="btn btn-primary btn-full">${inner}</button>`;
}

function renderCtaPreview(id) {
  const inner = ctaData[id]; if (!inner) return '';
  return `<div style="padding:8px 12px;height:52px;display:flex;align-items:center;overflow:hidden">
    <button class="btn btn-primary btn-full" style="transform:scale(0.65);transform-origin:center;pointer-events:none;flex-shrink:0">${inner}</button>
  </div>`;
}

function renderSlotPreview(slotName, variantId) {
  switch (slotName) {
    case 'nav':          return renderNavPreview(variantId);
    case 'title':        return renderTitlePreview(variantId);
    case 'illustration': return renderIllustrationPreview(variantId);
    case 'cta':          return renderCtaPreview(variantId);
    default:             return '';
  }
}

let _activeSwapSlot = null;

function openSwapPanel(slotName, btn) {
  const panel = document.getElementById('phone-swap-panel');
  const slot = phoneSlots[slotName];
  if (!slot) return;

  if (_activeSwapSlot === slotName && panel.classList.contains('is-open')) {
    closeSwapPanel();
    return;
  }

  _activeSwapSlot = slotName;
  if (slotName === 'nav') getNavLogo();
  panel.innerHTML =
    `<div class="phone-swap-panel__header">${slot.label}</div>` +
    slot.variants.map(v =>
      `<div class="phone-swap-panel__option${v.id === slot.active ? ' is-active' : ''}" role="button" tabindex="0" onclick="swapSlot('${slotName}','${v.id}')">
        <div class="phone-swap-panel__preview">${renderSlotPreview(slotName, v.id)}</div>
      </div>`
    ).join('');

  const rect = btn.getBoundingClientRect();
  const panelW = 280;
  const panelH = panel.scrollHeight || 300; // estimate before paint
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: align right edge of panel to right edge of button, clamp to viewport
  let left = Math.min(rect.right - panelW, vw - panelW - margin);
  left = Math.max(margin, left);

  // Vertical: prefer below, flip above if not enough room
  let top;
  const spaceBelow = vh - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
    top = rect.bottom + 6;
  } else {
    top = Math.max(margin, rect.top - panelH - 6);
  }

  panel.style.top  = top + 'px';
  panel.style.left = left + 'px';
  panel.classList.add('is-open');
  btn.closest('.phone-slot').classList.add('swap-open');

  // Re-clamp vertically after actual render (panel height now known)
  requestAnimationFrame(() => {
    const actualH = panel.offsetHeight;
    if (spaceBelow < actualH + margin && spaceAbove >= actualH + margin) {
      panel.style.top = Math.max(margin, rect.top - actualH - 6) + 'px';
    } else {
      // clamp bottom edge
      const maxTop = vh - actualH - margin;
      if (parseFloat(panel.style.top) > maxTop) panel.style.top = Math.max(margin, maxTop) + 'px';
    }
  });
}

function closeSwapPanel() {
  const panel = document.getElementById('phone-swap-panel');
  if (!panel) return;
  panel.classList.remove('is-open');
  document.querySelectorAll('.phone-slot.swap-open').forEach(s => s.classList.remove('swap-open'));
  _activeSwapSlot = null;
}

function swapSlot(slotName, variantId) {
  const slot = phoneSlots[slotName];
  if (!slot) return;
  const target = document.getElementById('slot-' + slotName);
  if (!target) return;
  switch (slotName) {
    case 'nav':
      getNavLogo();
      target.innerHTML = renderNavVariant(variantId);
      break;
    case 'title':
      target.innerHTML = renderTitleVariant(variantId);
      break;
    case 'illustration':
      target.innerHTML = renderIllustrationVariant(variantId);
      break;
    case 'cta':
      target.innerHTML = renderCtaVariant(variantId);
      break;
  }
  slot.active = variantId;
  closeSwapPanel();
}

// ============================================
//  MODULES — Design System module explorer
// ============================================

// ---- Shared SVG constants (DS assets) ----

const _LOGO_SVG = `<svg width="77" height="21" viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M79.4916 22.4404C78.0238 22.4404 76.7418 22.1468 75.6458 21.5597C74.5498 20.953 73.6985 20.0722 73.0918 18.9175C72.4851 17.7628 72.1817 16.3732 72.1817 14.7488C72.1817 12.1654 72.7982 10.1984 74.0312 8.84801C75.2838 7.47801 77.0354 6.79301 79.2861 6.79301C80.9106 6.79301 82.2121 7.14529 83.1906 7.84987C84.1888 8.55444 84.9129 9.56237 85.3631 10.8737C85.8328 12.1654 86.0578 13.7115 86.0383 15.5121H74.589L74.2954 12.9874H83.0732L82.3686 14.0442C82.3295 12.4981 82.0555 11.3923 81.5466 10.7269C81.0573 10.0419 80.2647 9.69937 79.1687 9.69937C78.5033 9.69937 77.9161 9.85594 77.4073 10.1691C76.918 10.4627 76.5363 10.9617 76.2623 11.6663C76.0079 12.3709 75.8807 13.3397 75.8807 14.5727C75.8807 16.0992 76.2428 17.2735 76.9669 18.0955C77.6911 18.8979 78.7968 19.2992 80.2843 19.2992C80.891 19.2992 81.4683 19.2404 82.0163 19.123C82.5839 18.986 83.1026 18.8294 83.5723 18.6533C84.0616 18.4772 84.4726 18.3108 84.8053 18.1542V21.4422C84.1203 21.7358 83.3374 21.9707 82.4567 22.1468C81.5956 22.3425 80.6072 22.4404 79.4916 22.4404Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M62.8555 22.4404C61.8378 22.4404 60.869 22.323 59.9492 22.0881C59.0293 21.8532 58.2171 21.4422 57.5125 20.8551C56.8079 20.268 56.2501 19.4557 55.8391 18.4184C55.4477 17.3812 55.252 16.0601 55.252 14.4552C55.252 12.0871 55.8294 10.218 56.9841 8.84801C58.1388 7.47801 59.8904 6.79301 62.239 6.79301C62.5717 6.79301 63.0023 6.83215 63.5307 6.91044C64.0592 6.98872 64.5974 7.12572 65.1454 7.32144C65.7129 7.49758 66.2022 7.78137 66.6132 8.1728L65.7912 9.34708V1.06836H69.4609V18.5359C69.4609 19.2013 69.2652 19.7787 68.8737 20.268C68.5019 20.7572 67.993 21.1682 67.3472 21.501C66.7013 21.8141 65.9869 22.049 65.2041 22.2055C64.4212 22.3621 63.6384 22.4404 62.8555 22.4404ZM62.9729 19.2698C63.7754 19.2698 64.4408 19.1719 64.9692 18.9762C65.5172 18.7805 65.7912 18.4967 65.7912 18.1249V10.6094C65.3607 10.355 64.9007 10.1691 64.4114 10.0517C63.9222 9.93423 63.4524 9.87551 63.0023 9.87551C62.102 9.87551 61.3583 10.0419 60.7712 10.3746C60.184 10.6877 59.7437 11.1966 59.4501 11.9012C59.1565 12.5862 59.0097 13.4669 59.0097 14.5433C59.0097 15.4827 59.1272 16.3047 59.362 17.0093C59.5969 17.7139 59.9981 18.2717 60.5657 18.6827C61.1528 19.0741 61.9552 19.2698 62.9729 19.2698Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M45.9756 22.4404C43.5487 22.4404 41.7286 21.7652 40.5152 20.4147C39.3017 19.0643 38.695 17.1169 38.695 14.5727C38.695 11.8522 39.3115 9.87551 40.5445 8.64251C41.7971 7.40951 43.5977 6.79301 45.9462 6.79301C47.5902 6.79301 48.9602 7.08658 50.0562 7.67372C51.1522 8.2413 51.9645 9.10244 52.4929 10.2572C53.0409 11.4119 53.3149 12.8504 53.3149 14.5727C53.3149 17.1169 52.6788 19.0643 51.4067 20.4147C50.1541 21.7652 48.3437 22.4404 45.9756 22.4404ZM45.9756 19.3872C46.8367 19.3872 47.5315 19.1915 48.06 18.8001C48.608 18.4087 49.0092 17.8607 49.2636 17.1561C49.518 16.4319 49.6452 15.5708 49.6452 14.5727C49.6452 13.4571 49.5082 12.547 49.2342 11.8424C48.9798 11.1379 48.5786 10.6192 48.0306 10.2865C47.5022 9.9538 46.8172 9.78744 45.9756 9.78744C45.1145 9.78744 44.4197 9.96358 43.8912 10.3159C43.3628 10.6682 42.9714 11.1966 42.717 11.9012C42.4821 12.6057 42.3647 13.4962 42.3647 14.5727C42.3647 16.1384 42.6485 17.3322 43.216 18.1542C43.7836 18.9762 44.7035 19.3872 45.9756 19.3872Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M32.1477 22.323C31.1691 22.323 30.2297 22.186 29.3294 21.912C28.4291 21.638 27.6267 21.1976 26.9221 20.5909C26.2175 19.9842 25.6597 19.2013 25.2487 18.2423C24.8377 17.2833 24.6322 16.1188 24.6322 14.7488C24.6322 13.3201 24.828 12.1067 25.2194 11.1085C25.6108 10.1104 26.149 9.29815 26.834 8.67187C27.519 8.02601 28.3117 7.56608 29.212 7.29208C30.1318 6.99851 31.1006 6.85172 32.1183 6.85172C32.9012 6.85172 33.7036 6.93001 34.5256 7.08658C35.3476 7.24315 36.0815 7.46822 36.7274 7.7618V10.9911C36.062 10.6975 35.3965 10.4627 34.7311 10.2865C34.0657 10.0908 33.3807 9.99294 32.6761 9.99294C31.3061 9.99294 30.2395 10.3354 29.4762 11.0204C28.7129 11.7054 28.3313 12.8308 28.3313 14.3965C28.3313 16.0014 28.6738 17.1952 29.3588 17.9781C30.0633 18.7609 31.218 19.1524 32.8229 19.1524C33.547 19.1524 34.2516 19.0447 34.9366 18.8294C35.6216 18.5946 36.2283 18.3402 36.7568 18.0662V21.3248C36.0718 21.6575 35.3574 21.9022 34.6137 22.0587C33.87 22.2349 33.048 22.323 32.1477 22.323Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M8.49521 8.43701C8.90621 8.2413 9.3955 8.04558 9.96307 7.84987C10.5306 7.65415 11.1471 7.4878 11.8126 7.3508C12.478 7.19422 13.1434 7.07679 13.8089 6.99851C14.4939 6.90065 15.1397 6.85172 15.7464 6.85172C17.1164 6.85172 18.2516 7.03765 19.1519 7.40951C20.0717 7.76179 20.7567 8.32937 21.2069 9.11222C21.6766 9.87551 21.9114 10.8834 21.9114 12.136V22H18.2124V12.7819C18.2124 12.41 18.1635 12.0577 18.0656 11.725C17.9678 11.3727 17.8014 11.0694 17.5666 10.8149C17.3317 10.5409 17.0088 10.3354 16.5978 10.1984C16.1868 10.0419 15.6584 9.96358 15.0125 9.96358C14.5232 9.96358 14.0241 10.0125 13.5153 10.1104C13.0064 10.2082 12.5759 10.3354 12.2236 10.492V22H8.49521V8.43701Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M1.14307 22V7.3508H4.87143L4.90079 22H1.14307ZM1.055 5.00222V1.94908H4.9595V5.00222H1.055Z" fill="var(--logo-color, var(--color-brand-500))"/></svg>`;

const _VERIFIED_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.8025 6.7238L13.3365 6.25778C13.1238 6.04445 13.0071 5.76045 13.0071 5.45978V4.79311C13.0071 3.80045 12.1991 2.99311 11.2071 2.99311H10.5391C10.2371 2.99311 9.9538 2.87645 9.7418 2.66445L9.2678 2.19111C8.56313 1.49245 7.4218 1.49578 6.72247 2.19845L6.25783 2.66445C6.04383 2.87711 5.7605 2.99378 5.45917 2.99378H4.79183C3.81117 2.99445 3.01117 3.78378 2.99317 4.76111L2.99183 4.79378V5.45845C2.99183 5.75978 2.87517 6.04311 2.6625 6.25578L2.1905 6.72847C1.48983 7.4378 1.49583 8.57913 2.19783 9.27447L2.66383 9.7418C2.87583 9.95447 2.99317 10.2371 2.99317 10.5385V11.2085C2.99317 12.2005 3.79983 13.0078 4.79183 13.0078H5.45783C5.75983 13.0085 6.04317 13.1251 6.25517 13.3365L6.73047 13.8105C7.06913 14.1471 7.51847 14.3325 7.99647 14.3325H8.00447C8.48513 14.3305 8.9358 14.1411 9.27313 13.8018L9.74047 13.3351C9.95047 13.1258 10.2411 13.0058 10.5378 13.0058H11.2085C12.1985 13.0058 13.0058 12.1998 13.0078 11.2085V10.5398C13.0078 10.2391 13.1245 9.9558 13.3358 9.74313L13.8098 9.26913C14.5098 8.56513 14.5058 7.42313 13.8025 6.7238Z" fill="var(--color-brand-500)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3891 7.03847L7.6738 9.75513C7.5798 9.84913 7.45246 9.9018 7.3198 9.9018C7.18713 9.9018 7.0598 9.84913 6.96646 9.75513L5.64849 8.43513C5.45383 8.23913 5.45383 7.92247 5.64916 7.72713C5.84516 7.53247 6.16116 7.53313 6.3565 7.7278L7.32046 8.6938L9.6818 6.33111C9.87713 6.13578 10.1938 6.13578 10.3891 6.33111C10.5845 6.52645 10.5845 6.84313 10.3891 7.03847Z" fill="white"/></svg>`;

const _BACK_SVG2 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _CLOSE_SVG2 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Selfie illustration — inlined so fill="var(--color-brand-500)" reacts to token changes
// Shirt (opacity 0.1 rect + solid shirt path) and halo gradient stop use the brand color.
const _SELFIE_SVG = `<svg width="296" height="296" viewBox="0 0 296 296" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_8839_45592)">
<circle cx="148" cy="148" r="143.5" stroke="url(#paint0_linear_8839_45592)" stroke-width="9"/>
<mask id="mask0_8839_45592" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="24" y="24" width="248" height="248">
<circle cx="148" cy="148" r="124" fill="#E9E9EB"/>
</mask>
<g mask="url(#mask0_8839_45592)">
<g clip-path="url(#clip1_8839_45592)">
<path opacity="0.1" d="M7.99951 0H288V305H7.99951V0Z" fill="var(--color-brand-500)"/>
<path d="M277.705 260.808C289.41 281.752 296.148 330.054 296.148 330.054H1.06812C1.06812 330.054 7.80823 281.746 19.5106 260.808C31.213 239.87 102.532 220.45 102.532 220.45C108.849 231.862 127.391 242.272 146.372 242.737C166.969 243.242 188.082 232.83 194.649 220.442C194.649 220.442 266.001 239.865 277.705 260.808Z" fill="white"/>
<path d="M113.924 203.799V204.266C113.796 214.137 105.486 221.56 88.9956 226.534C108.866 240.968 128.737 252.516 148.608 252.516C168.478 252.516 188.35 240.968 208.22 226.534C191.841 221.554 183.532 214.12 183.291 204.232C183.291 200.479 183.304 163.92 183.322 160.167C184.506 160.334 184.405 160.228 183.322 159.927C183.354 147.565 183.407 163.748 183.481 146.854C183.555 129.959 112.777 114.845 113.816 161.234C113.83 165.964 113.858 198.442 113.924 203.799Z" fill="url(#paint1_linear_8839_45592)"/>
<path d="M112.989 181.133C142.081 178.111 169.471 190.707 169.471 190.707C169.471 190.707 164.041 219.229 112.989 210.94V181.133Z" fill="#CDCDCD"/>
<path d="M277.705 260.808C289.41 281.752 296.148 330.054 296.148 330.054H1.06812C1.06812 330.054 7.80823 281.746 19.5106 260.808C31.213 239.87 102.532 220.45 102.532 220.45C102.532 233.142 127.133 251.445 146.372 251.771C173.198 251.771 194.649 233.142 194.649 220.442C194.649 220.442 266.001 239.865 277.705 260.808Z" fill="var(--color-brand-500)"/>
<path d="M89.139 121.453C93.0178 114.983 97.8562 119.432 99.7906 122.466L102.493 151.234C102.398 153.738 100.898 155.328 96.9857 155.823C92.0955 156.442 88.8651 143.124 87.7384 138.152C86.6116 133.181 84.2904 129.541 89.139 121.453Z" fill="url(#paint2_linear_8839_45592)"/>
<path d="M206.239 123.102C202.422 116.595 197.542 120.999 195.579 124.014L192.605 152.756C192.676 155.26 194.16 156.864 198.068 157.396C202.952 158.061 206.308 144.774 207.482 139.814C208.656 134.853 211.011 131.235 206.239 123.102Z" fill="url(#paint3_linear_8839_45592)"/>
<path d="M202.386 128.153C202.386 169.759 172.266 203.486 148.758 203.486C123.046 203.486 95.1296 169.759 95.1296 128.153C95.1296 91.0844 98.0877 51.4751 148.758 51.4751C199.428 51.4751 202.386 90.2273 202.386 128.153Z" fill="url(#paint4_linear_8839_45592)"/>
</g>
</g>
</g>
<defs>
<linearGradient id="paint0_linear_8839_45592" x1="24.5181" y1="30.759" x2="217.542" y2="256.771" gradientUnits="userSpaceOnUse">
<animateTransform attributeName="gradientTransform" type="rotate" from="0 148 148" to="360 148 148" dur="6s" repeatCount="indefinite"/>
<stop stop-color="var(--color-brand-500)"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint1_linear_8839_45592" x1="143.321" y1="164.054" x2="143.321" y2="221.466" gradientUnits="userSpaceOnUse">
<stop stop-color="#B1B1B1"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint2_linear_8839_45592" x1="99.6002" y1="135.999" x2="90.2678" y2="137.725" gradientUnits="userSpaceOnUse">
<stop offset="0.171875" stop-color="#BDBDBD"/>
<stop offset="0.640625" stop-color="#E1E1E1"/>
<stop offset="1" stop-color="#DDDDDD"/>
</linearGradient>
<linearGradient id="paint3_linear_8839_45592" x1="195.641" y1="137.548" x2="204.957" y2="139.362" gradientUnits="userSpaceOnUse">
<stop offset="0.0416667" stop-color="#B5B5B5"/>
<stop offset="0.362488" stop-color="#E2E2E2"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint4_linear_8839_45592" x1="101.722" y1="126.77" x2="177.474" y2="127.057" gradientUnits="userSpaceOnUse">
<stop stop-color="#E0E0E0"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<clipPath id="clip0_8839_45592"><rect width="296" height="296" fill="white"/></clipPath>
<clipPath id="clip1_8839_45592"><rect width="324.588" height="324.588" fill="white" transform="translate(-13.686 -0.686035)"/></clipPath>
</defs>
</svg>`;

// Inlined ring SVG — reacts to --color-brand-500 token changes.
// Gradient stop uses var(--color-brand-500) so token control updates it live.
// animate=true adds animateTransform to spin the gradient (capturing state).
function _selfieRing(animate) {
  const anim = animate
    ? `<animateTransform attributeName="gradientTransform" type="rotate" from="0 167.829 167.829" to="360 167.829 167.829" dur="2s" repeatCount="indefinite"/>`
    : '';
  return `<svg style="position:absolute;inset:0;width:342px;height:342px" viewBox="0 0 337 337" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#rc)"><circle cx="167.829" cy="167.829" r="163.114" stroke="url(#rg)" stroke-width="10.2302"/></g>
<defs>
<linearGradient id="rg" x1="27.469" y1="34.563" x2="246.876" y2="291.467" gradientUnits="userSpaceOnUse">
${anim}<stop stop-color="var(--color-brand-500)"/><stop offset="1" stop-color="white"/>
</linearGradient>
<clipPath id="rc"><rect width="336.459" height="336.459" fill="white"/></clipPath>
</defs>
</svg>`;
}

// ID tutorial front illustration — inlined so brand color tokens apply to circle + shirt.
// --surface-brand-50 = light blue circle (adapts to dark mode automatically).
// --color-brand-500  = shirt color (same as face capture / selfie SVG pattern).
const _ID_FRONT_TUTORIAL_SVG = `<svg width="342" height="382" viewBox="0 0 342 382" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_30441_21295)">
<g clip-path="url(#clip1_30441_21295)">
<ellipse cx="169.544" cy="191.438" rx="130.223" ry="130.223" fill="var(--surface-brand-50,#E5F0FF)"/>
<g filter="url(#filter0_d_30441_21295)">
<path d="M172.018 111.752C172.185 106.439 157.745 106.953 152.035 106.459C130.676 104.609 129.506 103.592 117.372 101.742C35.988 103.534 73.1728 114.062 1.39831 139.858C-6.58591 142.73 -13.2662 148.376 -17.4863 155.73C-33.0951 182.959 -49.6545 209.526 -71.9114 233.26C-100.772 259.679 -93.0634 305.362 -88.8883 319.738C-77.0051 348.643 -22.4019 305.731 -8.01356 304.646C0.13767 304.35 14.19 304.866 21.7888 301.956C57.8109 283.136 64.0544 287.523 95.0663 287.523C101.021 287.523 122.687 281.099 122.687 281.099C136.921 281.112 151.637 279.68 151.637 275.537C151.637 247.499 88.5081 259.613 70.8889 257.738C51.6574 257.892 45.4304 237.114 37.9472 219.585C31.6137 204.76 33.2453 187.744 42.071 174.255C49.4578 162.97 57.0052 151.716 67.3468 138.882C92.263 115.681 170.611 156.876 172.018 111.739V111.752Z" fill="white" fill-opacity="0.5"/>
<path d="M117.308 102.744C129.298 104.576 130.599 105.606 151.949 107.455C153.402 107.581 155.419 107.643 157.542 107.746C159.69 107.85 161.988 107.997 164.093 108.289C166.217 108.584 168.053 109.016 169.323 109.648C170.586 110.277 171.037 110.958 171.019 111.708C170.847 117.202 169.509 121.289 167.326 124.329C165.144 127.367 162.057 129.446 158.235 130.818C150.531 133.584 140.031 133.419 128.575 132.539C117.213 131.667 104.934 130.094 94.0059 130.2C83.0914 130.307 73.1858 132.079 66.665 138.15L66.6133 138.199L66.5684 138.255C57.4919 149.519 50.5619 159.568 44.0195 169.47L41.2344 173.708C32.2292 187.471 30.5602 204.839 37.0273 219.978C40.7313 228.654 44.2163 238.379 49.1797 245.847C54.1753 253.363 60.7979 258.796 70.8369 258.737C75.3465 259.208 82.6754 258.796 90.9902 258.366C99.391 257.932 108.89 257.472 117.83 257.825C126.792 258.179 135.072 259.349 141.081 262.101C144.074 263.471 146.456 265.213 148.089 267.397C149.712 269.569 150.637 272.234 150.637 275.537C150.637 275.727 150.561 275.964 150.265 276.264C149.955 276.577 149.448 276.911 148.707 277.243C147.225 277.906 145.042 278.457 142.342 278.89C136.96 279.752 129.783 280.106 122.688 280.1H122.542L122.402 280.141H122.401C122.401 280.141 122.4 280.141 122.398 280.142C122.396 280.142 122.392 280.144 122.388 280.146C122.377 280.149 122.361 280.153 122.341 280.159C122.3 280.171 122.239 280.189 122.16 280.212C122.001 280.259 121.766 280.327 121.465 280.415C120.863 280.59 119.995 280.84 118.936 281.141C116.816 281.742 113.929 282.543 110.857 283.344C107.784 284.145 104.535 284.943 101.688 285.54C98.8129 286.144 96.4376 286.522 95.0664 286.522C87.3263 286.522 81.1573 286.25 75.6201 286.132C70.0973 286.014 65.2249 286.052 60.1807 286.689C50.0795 287.966 39.402 291.629 21.3818 301.04C17.7467 302.419 12.4988 303.012 7.04492 303.282C1.5268 303.556 -3.86348 303.495 -8.0498 303.646L-8.08887 303.648C-10.0621 303.797 -12.6186 304.645 -15.5215 305.87C-18.4499 307.106 -21.8366 308.772 -25.502 310.635C-32.8559 314.372 -41.3564 318.91 -49.7842 322.519C-58.2297 326.134 -66.4594 328.751 -73.2578 328.727C-76.6401 328.715 -79.6147 328.048 -82.0781 326.574C-84.5183 325.114 -86.5309 322.817 -87.9434 319.406C-90.0056 312.282 -92.9357 297.421 -91.79 281.085C-90.6415 264.71 -85.4085 246.972 -71.2363 233.998L-71.208 233.972L-71.1816 233.944C-48.8423 210.122 -32.2375 183.471 -16.6201 156.228L-16.6191 156.229C-12.5157 149.077 -6.02151 143.59 1.73633 140.8C19.7279 134.334 30.9204 128.814 38.8623 124.134C42.8318 121.795 45.9799 119.671 48.7451 117.757C51.5198 115.836 53.8737 114.152 56.3066 112.649C65.8949 106.73 76.6849 103.643 117.308 102.744Z" stroke="white" stroke-opacity="0.5" stroke-width="2"/>
</g>
<g filter="url(#filter1_d_30441_21295)">
<path d="M55.2461 127.351C55.2461 124.969 57.1768 123.038 59.5585 123.038L282.441 123.038C284.823 123.038 286.754 124.969 286.754 127.351V252.018C286.754 254.4 284.823 256.331 282.441 256.331H59.5585C57.1768 256.331 55.2461 254.4 55.2461 252.018L55.2461 127.351Z" fill="white"/>
<path d="M55.2461 127.351C55.2461 124.969 57.1768 123.038 59.5585 123.038L282.441 123.038C284.823 123.038 286.754 124.969 286.754 127.351V252.018C286.754 254.4 284.823 256.331 282.441 256.331H59.5585C57.1768 256.331 55.2461 254.4 55.2461 252.018L55.2461 127.351Z" fill="black" fill-opacity="0.01"/>
</g>
<path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M68.2121 152.131C68.2125 151.579 68.6601 151.132 69.2121 151.132H273.19C273.743 151.132 274.19 151.579 274.19 152.132V154.491C274.19 155.043 273.743 155.491 273.19 155.491H69.2106C68.6581 155.491 68.2102 155.043 68.2106 154.49L68.2121 152.131Z" fill="#C9C9C9"/>
<rect opacity="0.5" x="138.363" y="173.932" width="53.4923" height="8.76923" rx="1" fill="#C9C9C9"/>
<rect opacity="0.5" x="138.363" y="190.593" width="53.4923" height="8.76923" rx="1" fill="#C9C9C9"/>
<rect opacity="0.5" x="138.363" y="207.255" width="74.5385" height="8.76923" rx="1" fill="#C9C9C9"/>
<rect opacity="0.5" x="138.363" y="223.916" width="23.6769" height="7.89231" rx="1" fill="#C9C9C9"/>
<rect opacity="0.5" x="68.21" y="131.808" width="98.2154" height="9.64615" rx="1" fill="#C9C9C9"/>
<rect opacity="0.5" x="254.118" y="131.808" width="20.1692" height="9.64615" rx="1" fill="#C9C9C9"/>
<g opacity="0.5">
<path d="M258.636 229.775V229.82C258.624 230.78 257.816 231.502 256.212 231.986C258.144 233.39 260.077 234.513 262.01 234.513C263.942 234.513 265.875 233.39 267.808 231.986C266.215 231.502 265.406 230.779 265.383 229.817C265.383 229.452 265.384 225.896 265.386 225.531C265.501 225.547 265.491 225.537 265.386 225.508C265.389 224.305 265.394 225.879 265.401 224.236C265.409 222.593 258.525 221.123 258.626 225.635C258.627 226.095 258.63 229.254 258.636 229.775Z" fill="url(#paint0_linear_30441_21295)"/>
<path d="M258.677 228.042C261.506 227.748 264.04 228.791 264.04 228.791C264.04 228.791 263.642 231.695 258.677 230.889V228.042Z" fill="black" fill-opacity="0.1"/>
<path d="M255.778 221.935C256.131 221.301 256.61 221.713 256.806 221.999L257.156 224.756C257.155 224.997 257.016 225.154 256.641 225.214C256.173 225.289 255.82 224.019 255.696 223.545C255.573 223.07 255.338 222.728 255.778 221.935Z" fill="url(#paint1_linear_30441_21295)"/>
<path d="M267.823 222.139C267.525 221.477 267.013 221.848 266.794 222.116L266.212 224.833C266.193 225.073 266.318 225.242 266.686 225.333C267.146 225.447 267.605 224.212 267.768 223.75C267.932 223.288 268.195 222.966 267.823 222.139Z" fill="url(#paint2_linear_30441_21295)"/>
<path d="M274.567 235.317C275.705 237.354 276.36 242.052 276.36 242.052H247.661C247.661 242.052 248.317 237.354 249.455 235.317C250.593 233.281 257.529 231.392 257.529 231.392C258.144 232.502 259.947 233.514 261.793 233.56C263.797 233.609 265.85 232.596 266.489 231.391C266.489 231.391 273.428 233.28 274.567 235.317Z" fill="white"/>
<path d="M274.567 235.317C275.705 237.354 276.36 242.052 276.36 242.052H247.661C247.661 242.052 248.317 237.354 249.455 235.317C250.593 233.281 257.529 231.392 257.529 231.392C257.529 232.627 259.922 234.407 261.793 234.438C264.402 234.438 266.489 232.627 266.489 231.391C266.489 231.391 273.428 233.28 274.567 235.317Z" fill="#C6C6C6"/>
<path d="M266.992 222.337C266.992 226.535 264.055 229.937 261.763 229.937C259.255 229.937 256.533 226.535 256.533 222.337C256.533 218.597 256.617 214.544 261.763 214.601C267.264 214.601 266.992 218.511 266.992 222.337Z" fill="url(#paint3_linear_30441_21295)"/>
</g>
<rect x="68.4004" y="164.254" width="60.5077" height="73.6615" rx="5" fill="#F2F2F2"/>
<path d="M90.3219 213.419V213.531C90.291 215.905 88.293 217.689 84.3281 218.885C89.1057 222.356 93.8835 225.132 98.6611 225.132C103.439 225.132 108.216 222.356 112.994 218.885C109.056 217.688 107.058 215.901 107 213.523C107 212.621 107.003 203.831 107.008 202.928C107.292 202.969 107.268 202.943 107.008 202.871C107.015 199.898 107.028 203.789 107.046 199.727C107.064 195.665 90.046 192.031 90.2958 203.185C90.2992 204.322 90.306 212.131 90.3219 213.419Z" fill="url(#paint4_linear_30441_21295)"/>
<path d="M128.908 226.953C128.908 228.889 128.908 231.038 128.908 232.915C128.908 235.677 126.669 237.915 123.908 237.915H73.4004C70.639 237.915 68.4004 235.677 68.4004 232.916C68.4004 231.135 68.4004 229.085 68.4004 227.125C71.2141 222.091 87.5837 217.421 87.5837 217.421C89.1025 220.165 93.5609 222.668 98.1246 222.78C103.077 222.901 108.153 220.398 109.732 217.42C109.732 217.42 126.093 221.918 128.908 226.953Z" fill="var(--color-brand-500,#006AFF)"/>
<path d="M90.0986 207.969C97.0933 207.243 103.679 210.271 103.679 210.271C103.679 210.271 102.373 217.129 90.0986 215.136V207.969Z" fill="#CDCDCD"/>
<path d="M84.3625 193.62C85.2951 192.064 86.4585 193.134 86.9236 193.863L87.5732 200.78C87.5505 201.382 87.1898 201.765 86.2492 201.884C85.0734 202.033 84.2967 198.83 84.0258 197.635C83.7549 196.44 83.1968 195.564 84.3625 193.62Z" fill="url(#paint5_linear_30441_21295)"/>
<path d="M112.518 194.016C111.6 192.451 110.427 193.51 109.955 194.235L109.24 201.146C109.257 201.748 109.614 202.134 110.553 202.262C111.728 202.421 112.535 199.227 112.817 198.034C113.099 196.841 113.665 195.971 112.518 194.016Z" fill="url(#paint6_linear_30441_21295)"/>
<path d="M111.592 195.231C111.592 205.235 104.35 213.344 98.6979 213.344C92.5158 213.344 85.8037 205.235 85.8037 195.231C85.8037 186.319 86.5149 176.795 98.6979 176.795C110.881 176.795 111.592 186.113 111.592 195.231Z" fill="#FAFAFA"/>
<g clip-path="url(#paint7_diamond_30441_21295_clip_path)" data-figma-skip-parse="true"><g transform="matrix(0.121857 -0.0601771 0.295483 0.589143 49.5976 249.767)"><rect x="0" y="0" width="2045.46" height="181.659" fill="url(#paint7_diamond_30441_21295)" opacity="1" shape-rendering="crispEdges"/><rect x="0" y="0" width="2045.46" height="181.659" transform="scale(1 -1)" fill="url(#paint7_diamond_30441_21295)" opacity="1" shape-rendering="crispEdges"/><rect x="0" y="0" width="2045.46" height="181.659" transform="scale(-1 1)" fill="url(#paint7_diamond_30441_21295)" opacity="1" shape-rendering="crispEdges"/><rect x="0" y="0" width="2045.46" height="181.659" transform="scale(-1)" fill="url(#paint7_diamond_30441_21295)" opacity="1" shape-rendering="crispEdges"/></g></g><path d="M288.086 126.122H290.716V253.058H288.086V126.122ZM284.031 122.067H58.879C56.6396 122.067 54.8242 123.883 54.8241 126.122L54.8241 253.058C54.8242 255.298 56.6396 257.113 58.879 257.113H284.031C286.27 257.113 288.086 255.298 288.086 253.058H290.716L290.708 253.403C290.534 256.821 287.793 259.562 284.375 259.736L284.031 259.744H58.879C55.3021 259.744 52.3811 256.935 52.2019 253.403L52.1934 253.058L52.1934 126.122L52.2019 125.778C52.3811 122.245 55.3021 119.436 58.879 119.436H284.031L284.375 119.445C287.793 119.618 290.534 122.359 290.708 125.778L290.716 126.122H288.086C288.086 123.883 286.27 122.067 284.031 122.067Z" data-figma-gradient-fill="{&#34;type&#34;:&#34;GRADIENT_DIAMOND&#34;,&#34;stops&#34;:[{&#34;color&#34;:{&#34;r&#34;:1.0,&#34;g&#34;:1.0,&#34;b&#34;:1.0,&#34;a&#34;:1.0},&#34;position&#34;:0.0},{&#34;color&#34;:{&#34;r&#34;:1.0,&#34;g&#34;:1.0,&#34;b&#34;:1.0,&#34;a&#34;:0.0},&#34;position&#34;:1.0},{&#34;color&#34;:{&#34;r&#34;:1.0,&#34;g&#34;:1.0,&#34;b&#34;:1.0,&#34;a&#34;:0.54000002145767212},&#34;position&#34;:1.0}],&#34;stopsVar&#34;:[],&#34;transform&#34;:{&#34;m00&#34;:243.71476745605469,&#34;m01&#34;:590.96636962890625,&#34;m02&#34;:-367.74304199218750,&#34;m10&#34;:-120.35410308837891,&#34;m11&#34;:1178.2864990234375,&#34;m12&#34;:-279.19915771484375},&#34;opacity&#34;:1.0,&#34;blendMode&#34;:&#34;NORMAL&#34;,&#34;visible&#34;:true}"/>
<path d="M288.086 126.122H290.716V253.058H288.086V126.122ZM284.031 122.067H58.879C56.6396 122.067 54.8242 123.883 54.8241 126.122L54.8241 253.058C54.8242 255.298 56.6396 257.113 58.879 257.113H284.031C286.27 257.113 288.086 255.298 288.086 253.058H290.716L290.708 253.403C290.534 256.821 287.793 259.562 284.375 259.736L284.031 259.744H58.879C55.3021 259.744 52.3811 256.935 52.2019 253.403L52.1934 253.058L52.1934 126.122L52.2019 125.778C52.3811 122.245 55.3021 119.436 58.879 119.436H284.031L284.375 119.445C287.793 119.618 290.534 122.359 290.708 125.778L290.716 126.122H288.086C288.086 123.883 286.27 122.067 284.031 122.067Z" fill="white" fill-opacity="0.5"/>
<path d="M-0.223732 197.966C7.02476 198.212 13.6701 194.002 19.1437 189.239C25.9794 183.289 31.8335 176.216 36.3948 168.388C39.7653 162.609 42.4308 156.426 46.1083 150.832C52.2969 141.41 56.459 131.427 61.792 121.495C72.0655 121.216 84.3091 122.489 97.0513 118.711C104.673 122.057 112.943 123.927 121.265 124.189C126.545 124.354 132.062 123.811 136.576 121.067C141.089 118.322 144.708 112.948 143.527 107.795C142.303 104.847 127.1 101.084 118.606 98.9695C111.345 93.5445 102.855 93.5057 93.7963 93.3153C84.7373 93.1248 70.5823 93.076 61.792 93.3152C53.0016 93.5543 47.631 91.0823 42.7496 94.7043C19.3635 112.073 13.7064 137.718 -11.3278 152.613C-13.6442 160.76 -15.4089 169.585 -13.5967 177.857C-11.7844 186.129 -7.03699 192.933 -0.217304 197.965L-0.223732 197.966Z" fill="url(#paint8_linear_30441_21295)" fill-opacity="0.7"/>
<path d="M43.3454 95.507C45.5139 93.898 47.7991 93.6087 50.761 93.7401C53.6549 93.8685 57.3972 94.4348 61.8188 94.3145C70.5879 94.0759 84.726 94.1252 93.775 94.3154C102.908 94.5074 111.049 94.5714 118.008 99.7706L118.169 99.8912L118.364 99.9396C122.618 100.998 128.512 102.461 133.493 104.024C135.987 104.806 138.22 105.604 139.892 106.377C140.729 106.764 141.396 107.132 141.875 107.472C142.311 107.781 142.502 108.008 142.574 108.129C143.544 112.662 140.343 117.605 136.057 120.212C131.794 122.804 126.514 123.352 121.296 123.189C113.102 122.931 104.958 121.09 97.4531 117.795L97.118 117.648L96.7671 117.752C84.1926 121.481 72.2007 120.212 61.7644 120.496L61.1855 120.511L60.9112 121.022C55.6824 130.759 51.6908 140.288 45.8446 149.402L45.2726 150.282C43.4044 153.124 41.7986 156.106 40.2493 159.078C38.8877 161.689 37.5751 164.281 36.1494 166.806L35.531 167.884C31.0249 175.618 25.2408 182.607 18.4874 188.485C13.1381 193.14 6.85579 197.073 0.124533 196.97C-6.38388 192.087 -10.887 185.552 -12.6198 177.643C-14.3485 169.752 -12.7259 161.274 -10.4707 153.261C2.03578 145.717 9.7396 135.523 17.1425 125.168C24.6326 114.691 31.8026 104.08 43.3454 95.507Z" stroke="url(#paint9_linear_30441_21295)" stroke-opacity="0.7" stroke-width="2"/>
</g>
</g>
<defs>
<filter id="filter0_d_30441_21295" x="-125.661" y="74.3474" width="330.293" height="293.21" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="5.21805"/>
<feGaussianBlur stdDeviation="16.3064"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_30441_21295"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_30441_21295" result="shape"/>
</filter>
<filter id="filter1_d_30441_21295" x="30.8501" y="101.895" width="280.3" height="182.084" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="3.2528"/>
<feGaussianBlur stdDeviation="12.198"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_30441_21295"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_30441_21295" result="shape"/>
</filter>
<clipPath id="paint7_diamond_30441_21295_clip_path"><path d="M288.086 126.122H290.716V253.058H288.086V126.122ZM284.031 122.067H58.879C56.6396 122.067 54.8242 123.883 54.8241 126.122L54.8241 253.058C54.8242 255.298 56.6396 257.113 58.879 257.113H284.031C286.27 257.113 288.086 255.298 288.086 253.058H290.716L290.708 253.403C290.534 256.821 287.793 259.562 284.375 259.736L284.031 259.744H58.879C55.3021 259.744 52.3811 256.935 52.2019 253.403L52.1934 253.058L52.1934 126.122L52.2019 125.778C52.3811 122.245 55.3021 119.436 58.879 119.436H284.031L284.375 119.445C287.793 119.618 290.534 122.359 290.708 125.778L290.716 126.122H288.086C288.086 123.883 286.27 122.067 284.031 122.067Z"/></clipPath><linearGradient id="paint0_linear_30441_21295" x1="261.496" y1="225.909" x2="261.496" y2="231.493" gradientUnits="userSpaceOnUse">
<stop stop-color="#D6D4D4"/>
<stop offset="1" stop-color="#E4E4E4"/>
</linearGradient>
<linearGradient id="paint1_linear_30441_21295" x1="256.129" y1="222.629" x2="256.399" y2="224.317" gradientUnits="userSpaceOnUse">
<stop stop-color="#D7D7D7"/>
<stop offset="1" stop-color="#CDCDCD"/>
</linearGradient>
<linearGradient id="paint2_linear_30441_21295" x1="267.415" y1="222.8" x2="267.003" y2="224.459" gradientUnits="userSpaceOnUse">
<stop stop-color="#D9D9D9"/>
<stop offset="1" stop-color="#CDCDCD"/>
</linearGradient>
<linearGradient id="paint3_linear_30441_21295" x1="256.259" y1="224.219" x2="262.35" y2="224.219" gradientUnits="userSpaceOnUse">
<stop stop-color="#CECECE"/>
<stop offset="1" stop-color="#E7E7E7"/>
</linearGradient>
<linearGradient id="paint4_linear_30441_21295" x1="97.3898" y1="203.863" x2="97.3898" y2="217.667" gradientUnits="userSpaceOnUse">
<stop stop-color="#B1B1B1"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint5_linear_30441_21295" x1="86.8778" y1="197.117" x2="84.634" y2="197.532" gradientUnits="userSpaceOnUse">
<stop offset="0.171875" stop-color="#BDBDBD"/>
<stop offset="0.640625" stop-color="#E1E1E1"/>
<stop offset="1" stop-color="#DDDDDD"/>
</linearGradient>
<linearGradient id="paint6_linear_30441_21295" x1="109.97" y1="197.489" x2="112.21" y2="197.925" gradientUnits="userSpaceOnUse">
<stop offset="0.0416667" stop-color="#B5B5B5"/>
<stop offset="0.362488" stop-color="#E2E2E2"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint7_diamond_30441_21295" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
<stop offset="1" stop-color="white" stop-opacity="0.54"/>
</linearGradient>
<linearGradient id="paint8_linear_30441_21295" x1="53.9314" y1="115.147" x2="8.76985" y2="171.708" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint9_linear_30441_21295" x1="50.5477" y1="125.458" x2="16.3148" y2="172.663" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<clipPath id="clip0_30441_21295">
<rect width="342" height="382" fill="white"/>
</clipPath>
<clipPath id="clip1_30441_21295">
<rect width="342" height="382" fill="white"/>
</clipPath>
</defs>
</svg>`;

// DS: .tag-verified component — matches component tab exactly
const _TAG_LOGO_SVG = `<svg class="tag-verified__logo" width="44" height="12" viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M79.4916 22.4404C78.0238 22.4404 76.7418 22.1468 75.6458 21.5597C74.5498 20.953 73.6985 20.0722 73.0918 18.9175C72.4851 17.7628 72.1817 16.3732 72.1817 14.7488C72.1817 12.1654 72.7982 10.1984 74.0312 8.84801C75.2838 7.47801 77.0354 6.79301 79.2861 6.79301C80.9106 6.79301 82.2121 7.14529 83.1906 7.84987C84.1888 8.55444 84.9129 9.56237 85.3631 10.8737C85.8328 12.1654 86.0578 13.7115 86.0383 15.5121H74.589L74.2954 12.9874H83.0732L82.3686 14.0442C82.3295 12.4981 82.0555 11.3923 81.5466 10.7269C81.0573 10.0419 80.2647 9.69937 79.1687 9.69937C78.5033 9.69937 77.9161 9.85594 77.4073 10.1691C76.918 10.4627 76.5363 10.9617 76.2623 11.6663C76.0079 12.3709 75.8807 13.3397 75.8807 14.5727C75.8807 16.0992 76.2428 17.2735 76.9669 18.0955C77.6911 18.8979 78.7968 19.2992 80.2843 19.2992C80.891 19.2992 81.4683 19.2404 82.0163 19.123C82.5839 18.986 83.1026 18.8294 83.5723 18.6533C84.0616 18.4772 84.4726 18.3108 84.8053 18.1542V21.4422C84.1203 21.7358 83.3374 21.9707 82.4567 22.1468C81.5956 22.3425 80.6072 22.4404 79.4916 22.4404Z" fill="var(--logo-color)"/><path d="M62.8555 22.4404C61.8378 22.4404 60.869 22.323 59.9492 22.0881C59.0293 21.8532 58.2171 21.4422 57.5125 20.8551C56.8079 20.268 56.2501 19.4557 55.8391 18.4184C55.4477 17.3812 55.252 16.0601 55.252 14.4552C55.252 12.0871 55.8294 10.218 56.9841 8.84801C58.1388 7.47801 59.8904 6.79301 62.239 6.79301C62.5717 6.79301 63.0023 6.83215 63.5307 6.91044C64.0592 6.98872 64.5974 7.12572 65.1454 7.32144C65.7129 7.49758 66.2022 7.78137 66.6132 8.1728L65.7912 9.34708V1.06836H69.4609V18.5359C69.4609 19.2013 69.2652 19.7787 68.8737 20.268C68.5019 20.7572 67.993 21.1682 67.3472 21.501C66.7013 21.8141 65.9869 22.049 65.2041 22.2055C64.4212 22.3621 63.6384 22.4404 62.8555 22.4404ZM62.9729 19.2698C63.7754 19.2698 64.4408 19.1719 64.9692 18.9762C65.5172 18.7805 65.7912 18.4967 65.7912 18.1249V10.6094C65.3607 10.355 64.9007 10.1691 64.4114 10.0517C63.9222 9.93423 63.4524 9.87551 63.0023 9.87551C62.102 9.87551 61.3583 10.0419 60.7712 10.3746C60.184 10.6877 59.7437 11.1966 59.4501 11.9012C59.1565 12.5862 59.0097 13.4669 59.0097 14.5433C59.0097 15.4827 59.1272 16.3047 59.362 17.0093C59.5969 17.7139 59.9981 18.2717 60.5657 18.6827C61.1528 19.0741 61.9552 19.2698 62.9729 19.2698Z" fill="var(--logo-color)"/><path d="M45.9756 22.4404C43.5487 22.4404 41.7286 21.7652 40.5152 20.4147C39.3017 19.0643 38.695 17.1169 38.695 14.5727C38.695 11.8522 39.3115 9.87551 40.5445 8.64251C41.7971 7.40951 43.5977 6.79301 45.9462 6.79301C47.5902 6.79301 48.9602 7.08658 50.0562 7.67372C51.1522 8.2413 51.9645 9.10244 52.4929 10.2572C53.0409 11.4119 53.3149 12.8504 53.3149 14.5727C53.3149 17.1169 52.6788 19.0643 51.4067 20.4147C50.1541 21.7652 48.3437 22.4404 45.9756 22.4404ZM45.9756 19.3872C46.8367 19.3872 47.5315 19.1915 48.06 18.8001C48.608 18.4087 49.0092 17.8607 49.2636 17.1561C49.518 16.4319 49.6452 15.5708 49.6452 14.5727C49.6452 13.4571 49.5082 12.547 49.2342 11.8424C48.9798 11.1379 48.5786 10.6192 48.0306 10.2865C47.5022 9.9538 46.8172 9.78744 45.9756 9.78744C45.1145 9.78744 44.4197 9.96358 43.8912 10.3159C43.3628 10.6682 42.9714 11.1966 42.717 11.9012C42.4821 12.6057 42.3647 13.4962 42.3647 14.5727C42.3647 16.1384 42.6485 17.3322 43.216 18.1542C43.7836 18.9762 44.7035 19.3872 45.9756 19.3872Z" fill="var(--logo-color)"/><path d="M32.1477 22.323C31.1691 22.323 30.2297 22.186 29.3294 21.912C28.4291 21.638 27.6267 21.1976 26.9221 20.5909C26.2175 19.9842 25.6597 19.2013 25.2487 18.2423C24.8377 17.2833 24.6322 16.1188 24.6322 14.7488C24.6322 13.3201 24.828 12.1067 25.2194 11.1085C25.6108 10.1104 26.149 9.29815 26.834 8.67187C27.519 8.02601 28.3117 7.56608 29.212 7.29208C30.1318 6.99851 31.1006 6.85172 32.1183 6.85172C32.9012 6.85172 33.7036 6.93001 34.5256 7.08658C35.3476 7.24315 36.0815 7.46822 36.7274 7.7618V10.9911C36.062 10.6975 35.3965 10.4627 34.7311 10.2865C34.0657 10.0908 33.3807 9.99294 32.6761 9.99294C31.3061 9.99294 30.2395 10.3354 29.4762 11.0204C28.7129 11.7054 28.3313 12.8308 28.3313 14.3965C28.3313 16.0014 28.6738 17.1952 29.3588 17.9781C30.0633 18.7609 31.218 19.1524 32.8229 19.1524C33.547 19.1524 34.2516 19.0447 34.9366 18.8294C35.6216 18.5946 36.2283 18.3402 36.7568 18.0662V21.3248C36.0718 21.6575 35.3574 21.9022 34.6137 22.0587C33.87 22.2349 33.048 22.323 32.1477 22.323Z" fill="var(--logo-color)"/><path d="M8.49521 8.43701C8.90621 8.2413 9.3955 8.04558 9.96307 7.84987C10.5306 7.65415 11.1471 7.4878 11.8126 7.3508C12.478 7.19422 13.1434 7.07679 13.8089 6.99851C14.4939 6.90065 15.1397 6.85172 15.7464 6.85172C17.1164 6.85172 18.2516 7.03765 19.1519 7.40951C20.0717 7.76179 20.7567 8.32937 21.2069 9.11222C21.6766 9.87551 21.9114 10.8834 21.9114 12.136V22H18.2124V12.7819C18.2124 12.41 18.1635 12.0577 18.0656 11.725C17.9678 11.3727 17.8014 11.0694 17.5666 10.8149C17.3317 10.5409 17.0088 10.3354 16.5978 10.1984C16.1868 10.0419 15.6584 9.96358 15.0125 9.96358C14.5232 9.96358 14.0241 10.0125 13.5153 10.1104C13.0064 10.2082 12.5759 10.3354 12.2236 10.492V22H8.49521V8.43701Z" fill="var(--logo-color)"/><path d="M1.14307 22V7.3508H4.87143L4.90079 22H1.14307ZM1.055 5.00222V1.94908H4.9595V5.00222H1.055Z" fill="var(--logo-color)"/></svg>`;

function _verifiedTag() {
  return `<div style="display:flex;justify-content:center;height:34px;align-items:center;flex-shrink:0">
    <div class="tag-verified" style="justify-content:center">
      ${_VERIFIED_SVG}
      <span class="tag-verified__text">verified by</span>${_TAG_LOGO_SVG}
    </div>
  </div>`;
}

// DS: .nav-bar
function _navBar(variant) {
  const logo = `<div class="nav-bar__center">${_LOGO_SVG}</div>`;
  if (variant === 'logo-only') {
    return `<div class="nav-bar" style="border-bottom:none;padding:0 16px">${logo}</div>`;
  }
  return `<div class="nav-bar" style="border-bottom:none;padding:0 16px">
    <div class="nav-bar__left"><button class="phone-nav-btn">${_BACK_SVG2}</button></div>
    ${logo}
    <div class="nav-bar__right"><button class="phone-nav-btn">${_CLOSE_SVG2}</button></div>
  </div>`;
}

// ============================================================
//  FACE CAPTURE — SCREENS
//  Each function returns an HTML string rendered inside the
//  phone frame (390×844px, scaled to 70%).
//
//  HOW TO ADD A NEW SCREEN:
//  1. Create a new function here that returns an HTML string.
//     Use the existing screens as reference.
//  2. Register it in _labModuleData below under the right module.
//
//  SHARED HELPERS (defined above):
//  · _navBar('logo-only' | 'back-close')  — top nav bar
//  · _verifiedTag()                        — "verified by incode" footer
//
//  DESIGN TOKENS (change via the Tokens panel in the top bar):
//  · --color-brand-500  primary blue
//  · --text-primary     main text color
//  · --text-secondary   secondary text color
//  · --surface-bg       phone background color
//  · --radius-button    button border radius
// ============================================================

// Screen 1/7 — Tutorial
// Static intro screen: selfie illustration + instructions + CTA button.
// To experiment: change the illustration, title copy, or button label.
function fcTutorial() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;gap:16px;min-height:0">
    <div style="display:flex;flex-direction:column;gap:24px">
      ${_navBar('logo-only')}
      <div style="display:flex;flex-direction:column;gap:12px;text-align:center;padding:16px 0">
        <div class="type-h2" style="color:var(--text-primary,#262831)">Take a selfie</div>
        <div class="type-body-m-regular" style="color:var(--text-secondary,#60667c)">Keep a neutral expression, find balanced light and remove any glasses and hats</div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center">
      <div style="width:296px;height:296px;flex-shrink:0">${_SELFIE_SVG}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="type-body-m-regular" style="padding:12px 0;text-align:center;color:var(--text-secondary,#60667c)">The photo will be taken automatically</div>
      <button class="btn btn-primary btn-full">Take photo</button>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// Screen 2/7 — Camera: Searching
// Selfie ring (static) + empty camera placeholder inside the circle.
// To experiment: replace with a full-screen camera layout, change the
// ring color, or add animated guidance arrows around the oval.
function fcCamSearching() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;background:var(--surface-bg,#ffffff)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        ${_selfieRing(false)}
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary,#262831);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Align your face within the silhouette and look at the camera</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// Screen 3/7 — Camera: Detected
// Same layout as Searching but with a real face photo, indicating detection.
// To experiment: add a green confirmation ring, change the feedback text,
// or show a face mesh overlay.
function fcCamDetected() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;background:var(--surface-bg,#ffffff)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        ${_selfieRing(false)}
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary,#262831);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Align your face within the silhouette and look at the camera</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// Screen 4/7 — Camera: Get Ready (Capturing)
// Selfie ring spinning (CSS animation) while the photo is being captured.
// To experiment: change spin speed, swap the ring for a progress bar,
// or add a countdown timer overlay.
function fcCamCapturing() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;background:var(--surface-bg,#ffffff)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        ${_selfieRing(true)}
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary,#262831);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Get ready...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// Shared status screen layout used by Processing, Uploading, and Success.
// Both the spinner and the success icon use the exact same 64×64 container
// and the same gap so there is zero positional jump between states.
function _fcStatusScreen(iconHtml, label) {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${iconHtml}
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary,#262831);text-align:center">${label}</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// Screen 5/7 — Processing
// Spinner while the photo is being analyzed on the server.
// To experiment: swap the spinner for a lottie animation, add a
// progress percentage, or show "Analyzing..." steps.
function fcProcessing() {
  return _fcStatusScreen(`<div class="loading-spinner"></div>`, 'Processing...');
}

// Screen 6/7 — Uploading
// Spinner while the photo is being uploaded.
// To experiment: add an upload progress bar or merge with Processing.
function fcUploading() {
  return _fcStatusScreen(`<div class="loading-spinner"></div>`, 'Uploading...');
}

// Screen 7/7 — Success
// Final confirmation screen. The flow is complete.
// To experiment: add a confetti animation, show the captured photo,
// or add a "Continue" CTA that leads to the next step in the journey.
function fcSuccess() {
  return _fcStatusScreen(
    `<img src="assets/icons/status/Status-42.svg" width="64" height="64" alt="Positive" />`,
    'Success!'
  );
}


// ============================================================
// ID Capture module — 13 screens
// Assets: id.svg, passport.svg, id-front.svg, id-back.svg
//         id-tutorial/step-1.svg, step-3.svg, icons/status/Status-42.svg
// ============================================================

// Encrypted badge
// dark=true → white text (camera dark screens)
// dark=false → secondary text color (light screens)
function _idEncryptedBadge(dark) {
  const color = dark ? '#ffffff' : 'var(--text-primary,#262831)';
  const lockFilter = dark ? '' : 'filter:var(--icon-filter-primary,brightness(0) saturate(100%) invert(15%) sepia(10%) saturate(300%) hue-rotate(190deg))';
  return `<div style="display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 0;flex-shrink:0">
    <img src="assets/icons/camera/lock.svg" width="16" height="16" style="${lockFilter}" alt=""/>
    <span class="type-body-m-regular" style="color:${color}">All data is encrypted</span>
  </div>`;
}

// CaptureId frame — bordered card showing the ID card area
// borderColor: exact CSS color string for the 4px border
// imgSrc: null for empty/dark state (transparent bg), string path for filled/success
// borderColor: used for detected/success states only (blue/green solid border)
// imgSrc: null = empty dark state (uses gradient frame SVG), string = filled state
// useSvgFrame: true for camera screens (gradient frame SVG), false for light screens (solid border)
// borderColor: border color string. imgSrc: null = empty (dark bg), string = filled
function _idCapFrame(borderColor, imgSrc) {
  const border = borderColor || '#ffffff';
  return `<div style="width:100%;aspect-ratio:342/215;border-radius:16px;border:4px solid ${border};overflow:hidden;flex-shrink:0;${imgSrc ? '' : 'background:#1a1a1a'}">
    ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;display:block" alt=""/>` : ''}
  </div>`;
}

// Shared: dark camera screen (front or back, empty or detected)
// showTimer: true = show countdown timer instead of ? button
function _idCameraScreen(title, subtitle, state, side, showTimer) {
  const detected = state === 'detected' || showTimer;
  const imgSrc = detected
    ? (side === 'back' ? 'assets/illustrations/id-back.png' : 'assets/illustrations/id-front.png')
    : null;
  const borderColor = detected ? '#006AFF' : null;
  const frameHtml = showTimer
    ? `<div style="position:relative;flex-shrink:0">
        ${_idCapFrame(borderColor, imgSrc)}
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none">
          <img src="assets/icons/camera/timer.svg" width="90" height="90" alt=""/>
        </div>
      </div>`
    : `<div style="flex-shrink:0">${_idCapFrame(borderColor, imgSrc)}</div>`;
  return `<div style="flex:1;display:flex;flex-direction:column;background:#111">
    <div style="height:44px;flex-shrink:0"></div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:0 24px 24px">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:40px;text-align:center">
        <div class="type-h2" style="color:#fff">${title}</div>
        <div class="type-h5" style="color:#a3a8b8;margin-top:8px">${subtitle}</div>
      </div>
      <div style="flex-shrink:0">
        ${frameHtml}
        ${_idEncryptedBadge(true)}
      </div>
      <div style="flex:1;display:flex;align-items:flex-end;justify-content:flex-end">
        <img src="assets/icons/camera/question-mark.svg" width="32" height="32" alt="" style="cursor:pointer"/>
      </div>
    </div>
  </div>`;
}

// Shared: processing / uploading screen (white background, no navBar)
function _idProcessingScreen(label, progressPct, side) {
  const imgSrc = side === 'back' ? 'assets/illustrations/id-back.png' : 'assets/illustrations/id-front.png';
  return `<div style="flex:1;display:flex;flex-direction:column;background:var(--surface-bg,#ffffff);padding:0 24px">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:40px;gap:24px">
      <div style="width:164px;height:8px;border-radius:99px;background:var(--border-card,#ebecef);overflow:hidden;flex-shrink:0">
        <div style="height:100%;width:${progressPct}%;background:#189f60;border-radius:99px"></div>
      </div>
      <div class="type-h2" style="color:var(--text-primary,#262831);text-align:center">${label}</div>
    </div>
    ${_idCapFrame('#189f60', imgSrc)}
    ${_idEncryptedBadge(false)}
    <div style="flex:1"></div>
  </div>`;
}

// Screen 1/13 — Document Select
function idDocSelect() {
  // 44×24px blue pill arrow (per Figma: w-44 h-24 cta_arrow)
  const ctaArrow = `<div style="width:44px;height:24px;border-radius:99px;background:var(--color-brand-500);display:flex;align-items:center;justify-content:center;flex-shrink:0">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 8L6.5 5 3.5 2" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
  // Illustration: 118×86px container, image small/centered inside
  const illus = (src) => `<div style="width:118px;height:86px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden">
    <img src="${src}" style="max-width:90px;max-height:70px;object-fit:contain" alt=""/>
  </div>`;
  const card = (src, title, sub) => `
    <div style="background:var(--surface-card,#fcfcfd);border:1px solid var(--border-card,#ebecef);border-radius:24px;padding:16px 24px 16px 12px;display:flex;align-items:center;box-shadow:var(--shadow-card,0 2px 7px rgba(0,0,0,0.05),0 2px 35px rgba(33,39,59,0.05));width:100%">
      ${illus(src)}
      <div style="flex:1;display:flex;flex-direction:column;gap:8px;align-items:flex-end;min-width:0">
        <div style="width:100%;display:flex;flex-direction:column;gap:4px;text-align:right">
          <div class="type-h5" style="color:var(--text-primary,#262831)">${title}</div>
          <div class="type-body-m-regular" style="color:var(--text-secondary,#60667c)">${sub}</div>
        </div>
        ${ctaArrow}
      </div>
    </div>`;
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;min-height:0;background:var(--surface-bg,#ffffff)">
    <div style="display:flex;flex-direction:column;gap:24px;flex-shrink:0">
      ${_navBar('logo-only')}
      <div class="type-h2" style="color:var(--text-primary,#262831);text-align:center">Choose the document<br>for scanning</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:24px;justify-content:flex-end;padding-bottom:24px">
      ${card('assets/illustrations/id.svg', 'Identity Card', 'National Identity Card,<br>or Driver\'s License')}
      ${card('assets/illustrations/passport.svg', 'Passport', 'Your country Passport')}
    </div>
    ${_verifiedTag()}
  </div>`;
}

// Screen 2/13 — Front Tutorial
function idFrontTutorial() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;gap:16px;min-height:0;background:var(--surface-bg)">
    <div style="display:flex;flex-direction:column;gap:24px;flex-shrink:0">
      ${_navBar('logo-only')}
      <div style="text-align:center;padding:16px 0">
        <div class="type-h2" style="color:var(--text-primary,#262831)">Show the front of your ID</div>
        <div class="type-h5" style="color:var(--text-secondary,#60667c);margin-top:12px">Ensure your ID is readable</div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:0;overflow:hidden">
      <div style="width:100%;height:auto">${_ID_FRONT_TUTORIAL_SVG}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;flex-shrink:0">
      <div class="type-h4" style="color:var(--text-secondary,#60667c);text-align:center;padding:12px 0">The photo will be taken automatically</div>
      <button class="btn btn-primary btn-full">Let's scan</button>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// Screen 3/13 — Front Camera: Empty
function idFrontCamEmpty() {
  return _idCameraScreen('Frame the front of your ID', 'The capture will happen automatically', 'empty', 'front');
}

// Screen 4/14 — Front Camera: Detected
function idFrontCamFilled() {
  return _idCameraScreen('Frame the front of your ID', 'The capture will happen automatically', 'detected', 'front');
}

// Screen 5/14 — Front Camera: Capturing (countdown)
function idFrontCamCapturing() {
  return _idCameraScreen('Taking photo...', 'Don\'t move your ID for a few seconds', 'detected', 'front', true);
}

// Screen 6/14 — Front Processing
function idFrontProcessing() {
  return _idProcessingScreen('Processing..', 25, 'front');
}

// Screen 6/13 — Front Uploading
function idFrontUploading() {
  return _idProcessingScreen('Uploading..', 75, 'front');
}

// Screen 7/13 — Front Success
function _idSuccessScreen(subtitle, imgSrc, buttonLabel) {
  const checkmark = `<div style="width:40px;height:40px;border-radius:50%;background:#189f60;display:flex;align-items:center;justify-content:center;flex-shrink:0">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4.5 10.5L8.5 14.5L15.5 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
  return `<div style="flex:1;display:flex;flex-direction:column;background:var(--surface-bg,#ffffff);padding:0 24px">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:40px;gap:16px;text-align:center">
      ${checkmark}
      <div style="display:flex;flex-direction:column;gap:12px;width:100%">
        <div class="type-h2" style="color:var(--text-primary,#262831)">Successfully processed!</div>
        <div class="type-h5" style="color:var(--text-secondary,#60667c)">${subtitle}</div>
      </div>
    </div>
    ${_idCapFrame('#189f60', imgSrc)}
    ${_idEncryptedBadge(false)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:12px">
      <button class="btn btn-primary btn-full" style="height:56px;border-radius:15px;font-size:18px">${buttonLabel}</button>
      ${_verifiedTag()}
    </div>
  </div>`;
}

function idFrontSuccess() {
  return _idSuccessScreen("Now let's capture the back", 'assets/illustrations/id-front.png', 'Scan the back');
}

// Screen 9/14 — Flip
function idFlip() {
  return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;background:var(--surface-bg,#ffffff);padding:24px;text-align:center">
    <div class="type-h2" style="color:var(--text-primary,#262831)">Show the back of your ID</div>
    <img src="assets/illustrations/id-flip.svg" width="260" height="138" alt="Flip ID"/>
  </div>`;
}

// Screen 9/13 — Back Camera: Empty
function idBackCamEmpty() {
  return _idCameraScreen('Frame the back of your ID', 'The capture will happen automatically', 'empty', 'back');
}

// Screen 10/13 — Back Camera: Detected
function idBackCamFilled() {
  return _idCameraScreen('Frame the back of your ID', 'The capture will happen automatically', 'detected', 'back');
}

// Screen 11/13 — Back Camera: Capturing (timer overlay)
function idBackCamCapturing() {
  return _idCameraScreen('Taking photo...', "Don't move your ID for a few seconds", 'detected', 'back', true);
}

// Screen 12/13 — Back Processing
function idBackProcessing() {
  return _idProcessingScreen('Processing..', 25, 'back');
}

// Screen 12/13 — Back Uploading
function idBackUploading() {
  return _idProcessingScreen('Uploading..', 75, 'back');
}

// Screen 14/14 — Back Success / Complete
function idBackSuccess() {
  return _idSuccessScreen("Let's continue", 'assets/illustrations/id-back.png', 'Continue');
}

// ---- Module registry ----

const modules = {
  'face-capture': {
    label: 'Face Capture',
    screens: [
      { id: 'tutorial',   label: 'Tutorial',   render: fcTutorial },
      { id: 'cam-search', label: 'Searching',  render: fcCamSearching },
      { id: 'cam-detect', label: 'Detected',   render: fcCamDetected },
      { id: 'cam-ready',  label: 'Get Ready',  render: fcCamCapturing },
      { id: 'processing', label: 'Processing', render: fcProcessing },
      { id: 'uploading',  label: 'Uploading',  render: fcUploading },
      { id: 'success',    label: 'Success',    render: fcSuccess },
    ]
  },
  'id-capture': {
    label: 'ID Capture',
    screens: [
      { id: 'doc-select',        label: 'Doc Select',       render: idDocSelect },
      { id: 'front-tutorial',    label: 'Front Tutorial',   render: idFrontTutorial },
      { id: 'front-empty',       label: 'Front: Empty',      render: idFrontCamEmpty },
      { id: 'front-filled',      label: 'Front: Detected',   render: idFrontCamFilled },
      { id: 'front-capturing',   label: 'Front: Capturing',  render: idFrontCamCapturing },
      { id: 'front-processing',  label: 'Front Processing',  render: idFrontProcessing },
      { id: 'front-uploading',   label: 'Front Uploading',  render: idFrontUploading },
      { id: 'front-success',     label: 'Front Success',    render: idFrontSuccess },
      { id: 'flip',              label: 'Flip',             render: idFlip },
      { id: 'back-empty',        label: 'Back: Empty',      render: idBackCamEmpty },
      { id: 'back-filled',       label: 'Back: Detected',   render: idBackCamFilled },
      { id: 'back-capturing',    label: 'Back: Capturing',  render: idBackCamCapturing },
      { id: 'back-processing',   label: 'Back Processing',  render: idBackProcessing },
      { id: 'back-uploading',    label: 'Back Uploading',   render: idBackUploading },
      { id: 'back-success',      label: 'Back Success',     render: idBackSuccess },
    ]
  },
  'nfc':              { label: 'NFC',              screens: [] },
  'document-capture': { label: 'Document Capture', screens: [] },
};

// ---- Canvas zoom ----

let _canvasZoom = 0.6;

function setCanvasZoom(z) {
  _canvasZoom = Math.min(2, Math.max(0.2, Math.round(z * 10) / 10));
  const el = document.getElementById('module-canvas');
  if (el) el.style.zoom = _canvasZoom;
  const lbl = document.getElementById('canvas-zoom-label');
  if (lbl) lbl.textContent = Math.round(_canvasZoom * 100) + '%';
}

function canvasZoomIn()  { setCanvasZoom(_canvasZoom + 0.1); }
function canvasZoomOut() { setCanvasZoom(_canvasZoom - 0.1); }
function canvasZoomFit() { setCanvasZoom(0.6); }

// Cmd/Ctrl + scroll to zoom; click+drag to pan
function _setupCanvasInteraction() {
  const vp = document.getElementById('canvas-viewport');
  if (!vp) return;

  // Zoom
  vp.addEventListener('wheel', function(e) {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setCanvasZoom(_canvasZoom + delta);
    }
  }, { passive: false });

  // Pan (click+drag)
  let _panning = false, _panStartX = 0, _panStartY = 0, _scrollStartX = 0, _scrollStartY = 0;

  vp.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    _panning = true;
    _panStartX = e.clientX; _panStartY = e.clientY;
    _scrollStartX = vp.scrollLeft; _scrollStartY = vp.scrollTop;
    vp.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!_panning) return;
    vp.scrollLeft = _scrollStartX - (e.clientX - _panStartX);
    vp.scrollTop  = _scrollStartY - (e.clientY - _panStartY);
  });
  window.addEventListener('mouseup', function() {
    if (!_panning) return;
    _panning = false;
    vp.style.cursor = 'grab';
  });

  vp.style.cursor = 'grab';
}

// ---- Init ----

let _modulesInit = false;

function initModules() {
  if (_modulesInit) return;
  _modulesInit = true;
  renderModuleCanvas('face-capture');
  setCanvasZoom(0.6);
  _setupCanvasInteraction();
}

function selectModule(id, btn) {
  document.querySelectorAll('.module-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderModuleCanvas(id);
}

function renderModuleCanvas(moduleId) {
  const mod = modules[moduleId];
  const canvas = document.getElementById('module-canvas');
  if (!mod || !mod.screens.length) {
    canvas.innerHTML = `<div class="module-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--color-gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>Coming soon</span>
    </div>`;
    return;
  }
  canvas.innerHTML = mod.screens.map((screen, i) =>
    `<div class="module-step">
      <div class="module-step-num">${i + 1} / ${mod.screens.length}</div>
      <div class="mf-outer">
        <div class="mf-frame">
          <div class="mf-notch">
            <img src="assets/illustrations/status-bar-light.svg" width="390" height="54" style="display:block;width:100%" alt=""/>
          </div>
          <div class="mf-screen">${screen.render()}</div>
          <div class="mf-home"></div>
        </div>
      </div>
      <div class="module-step-label">${screen.label}</div>
    </div>
    ${i < mod.screens.length - 1 ? '<div class="module-arrow">›</div>' : ''}`
  ).join('');
}

// Populate live token hex values on first load
populateTokenValues();


// ============================================

// ============================================
//  LAB VIEW
// ============================================

let _labInit      = false;
let _labExpanded  = false;
let _labCurrent   = 0;
let _labZoom      = 1.0;
let _labPan       = { x: 0, y: 0 };
let _labDragging  = false;
let _labDragOrigin = { x: 0, y: 0 };
let _labDragMoved  = false;   // true once pointer moves > threshold during drag
let _labActiveModule = null;
let _labHomeActive   = true;
let _labStreamingActive = false; // true while blank-canvas streaming is in progress
const _moduleLastExp  = {}; // moduleId → expId or null ('original')
const _newFlowModules = []; // [{ id: 'blank-1', label: 'Flow 1' }, ...]
let   _newFlowCounter = 0;

const _LAB_PHONE_W = 273;  // 390 × 0.70
const _LAB_PHONE_H = 591;  // 844 × 0.70
const _LAB_CELL_GAP = 20;

// ============================================================
//  LAB MODULE REGISTRY
//  This is where you wire screen functions to modules.
//
//  HOW TO ADD A NEW SCREEN to an existing module:
//  1. Write a new function above (e.g. fcCamFullScreen)
//  2. Add { label: 'My Screen', render: fcCamFullScreen }
//     to the screens array below.
//
//  HOW TO ADD A NEW MODULE:
//  1. Add a new entry to this object with a unique key.
//  2. Add a matching button in the sidebar in index.html.
//  3. Write screen functions for it above.
//
//  HOW TO EXPERIMENT WITH A VARIANT (e.g. full-screen camera):
//  1. Duplicate the screens array with your modified functions.
//  2. Add it as a second entry in the registry, e.g.:
//     'face-capture-fs': { label: 'Face Capture — Full Screen', screens: [...] }
//  3. Add a sidebar button for it in index.html.
// ============================================================
const _labModuleData = {
  'face-capture': {
    label: 'Face Capture',
    screens: [
      { label: 'Tutorial',   render: fcTutorial },
      { label: 'Searching',  render: fcCamSearching },
      { label: 'Detected',   render: fcCamDetected },
      { label: 'Get Ready',  render: fcCamCapturing },
      { label: 'Processing', render: fcProcessing },
      { label: 'Uploading',  render: fcUploading },
      { label: 'Success',    render: fcSuccess },
    ]
  },
  // Add new modules here — copy the face-capture pattern above
  'id-capture': {
    label: 'ID Capture',
    screens: [
      { label: 'Doc Select',       render: idDocSelect },
      { label: 'Front Tutorial',   render: idFrontTutorial },
      { label: 'Front: Empty',     render: idFrontCamEmpty },
      { label: 'Front: Detected',  render: idFrontCamFilled },
      { label: 'Front: Capturing', render: idFrontCamCapturing },
      { label: 'Front Processing', render: idFrontProcessing },
      { label: 'Front Uploading',  render: idFrontUploading },
      { label: 'Front Success',    render: idFrontSuccess },
      { label: 'Flip',             render: idFlip },
      { label: 'Back: Empty',      render: idBackCamEmpty },
      { label: 'Back: Detected',   render: idBackCamFilled },
      { label: 'Back: Capturing',  render: idBackCamCapturing },
      { label: 'Back Processing',  render: idBackProcessing },
      { label: 'Back Uploading',   render: idBackUploading },
      { label: 'Back Success',     render: idBackSuccess },
    ]
  },
  'nfc':         { label: 'NFC',               screens: [] },
  'doc-capture': { label: 'Document Capture',  screens: [] },
  'blank':       { label: 'New Flow',          screens: [] },
};

// ---- init ----

function initLab() {
  if (_labInit) return;
  _labInit = true;

  document.body.classList.add('lab-home-mode');
  _labSetupInteraction();

  document.addEventListener('keydown', e => {
    if (!document.getElementById('view-lab')?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  { if (!_labExpanded) labNav(-1); }
    if (e.key === 'ArrowRight') { if (!_labExpanded) labNav(1); }
    if (e.key === 'Escape')     labCollapse();
    if (e.ctrlKey && e.key === 'e') { e.preventDefault(); labExpand(); }
    if (e.ctrlKey && e.key === 'c' && _labExpanded) { e.preventDefault(); labCollapse(); }
  });

  // Hide sidebar when overlay input is focused
  document.addEventListener('focusin', e => {
    if (e.target?.id === 'lab-exp-overlay-input') {
      document.getElementById('lab-canvas-vp')?.classList.add('lab-input-focused');
    }
  });
  document.addEventListener('focusout', e => {
    if (e.target?.id === 'lab-exp-overlay-input') {
      document.getElementById('lab-canvas-vp')?.classList.remove('lab-input-focused');
    }
  });

  if (!_labHomeActive && _labActiveModule) {
    const initMod = _labModuleData[_labActiveModule];
    _labSetExpHeading(initMod);
    _labBuildStage();
    _labUpdateMeta();
    _labCenterReset(false);
  }
}

// ---- home screen ----

function labHideHome() {
  if (!_labHomeActive) return;
  _labHomeActive = false;
  document.getElementById('lab-home')?.classList.add('lab-home--hidden');
  document.body.classList.remove('lab-home-mode');
}

function labHomeSelectModule(id) {
  labHideHome();
  const btn = document.querySelector(`.lab-sidebar-item[data-module="${id}"]`);
  if (btn) labSelectModule(btn);
}

function labHomeNewFlow() {
  labHideHome();
  labCreateBlankExperiment();
}

// ---- experiment overlay heading ----

const _LAB_TAGLINES = [
  'No bad ideas in here 👀',
  'Break things safely ✦',
  'Your design, but make it weird',
  'Science, but make it pretty',
  'The original will survive. Probably.',
  'Undo exists. Go wild.',
  'This is a safe space for bad ideas',
  'Pixels don\'t feel pain',
  'Push it. See what happens.',
  'Good judgment comes from experience. Experience comes from bad judgment.',
];

function _labSetExpHeading(mod) {
  const heading = document.getElementById('lab-exp-heading');
  const tagline = document.getElementById('lab-exp-tagline');
  if (heading && mod) heading.innerHTML = `What do you want to experiment in ${mod.label}?`;
  if (tagline) tagline.textContent = _LAB_TAGLINES[Math.floor(Math.random() * _LAB_TAGLINES.length)];
}

// ---- module selection ----

function labSelectModule(btn) {
  labHideHome();
  const id  = btn.dataset.module;
  const mod = _labModuleData[id];
  if (!mod || !mod.screens.length) return;

  document.querySelectorAll('.lab-sidebar-item').forEach(b => b.classList.remove('lab-sidebar-item--active'));
  btn.classList.add('lab-sidebar-item--active');

  _labActiveModule = id;
  _labCurrent = 0;
  _labExpanded = false;

  // Restore last active exp for this module (null = Original)
  const lastExpId = _moduleLastExp[id] ?? null;
  _activeExpId = lastExpId;
  if (lastExpId) {
    const exp = _experiments.find(e => e.id === lastExpId);
    if (exp) { _restoreExpCSS(exp); _restoreExpTokens(exp); }
  } else {
    _applyExpCSS('', false);
  }

  const vp = document.getElementById('lab-canvas-vp');
  if (vp) vp.classList.remove('lab-expanded');

  const btn2 = document.getElementById('lab-expand-btn');
  const lbl  = document.getElementById('lab-expand-label');
  if (btn2) btn2.classList.remove('lab-expand-btn--active');
  if (lbl)  lbl.textContent = 'Expand';

  document.getElementById('lab-bar-module').textContent = mod.label;
  _labSetExpHeading(mod);

  labExpRenderSidebarItems();
  _labBuildStage();
  _labUpdateMeta();
  _labCenterReset(false);

  // Sync the experiment panel to the restored experiment (or clear it for Original)
  const overlay = document.getElementById('lab-experiment-overlay');
  const panel   = document.getElementById('lab-exp-panel');
  const restoredExp = lastExpId ? _experiments.find(e => e.id === lastExpId) : null;

  if (!restoredExp) {
    // Original view — close panel
    vp.classList.remove('lab-exp-active', 'lab-panel-open', 'lab-exp-phase2');
    if (overlay) overlay.classList.remove('active');
    if (panel)   panel.classList.remove('active');
  } else if (restoredExp.messages.length === 0) {
    // Experiment with no messages yet — show phase-1 overlay
    vp.classList.add('lab-exp-active');
    vp.classList.remove('lab-panel-open', 'lab-exp-phase2');
    if (overlay) overlay.classList.add('active');
    if (panel)   panel.classList.remove('active');
  } else {
    // Experiment with messages — show chat panel with correct history
    vp.classList.remove('lab-exp-active');
    vp.classList.add('lab-panel-open', 'lab-exp-phase2');
    if (overlay) overlay.classList.remove('active');
    if (panel) {
      panel.classList.add('active');
      const titleEl = document.getElementById('lab-exp-panel-title');
      if (titleEl) titleEl.textContent = restoredExp.label;
      labExpRenderMessages(restoredExp);
    }
  }
}

// ---- build stage ----

// Returns the active screen list — experiment's customScreens, or module screens + overrides
function _labActiveScreens() {
  const mod      = _labModuleData[_labActiveModule];
  const activeExp = _experiments.find(e => e.id === _activeExpId);
  if (activeExp?.customScreens) return activeExp.customScreens;
  // Blank module or module with no screens — return empty (blank canvas)
  if (!mod || !mod.screens.length) return [];
  const overrides = activeExp?.screenOverrides || {};
  return mod.screens.map((s, i) => ({
    label: s.label,
    html:  overrides[i] !== undefined ? overrides[i] : s.render(),
  }));
}

// Materialise customScreens from the current state (called before add/remove/setScreen)
function _labEnsureCustomScreens(exp) {
  if (exp.customScreens) return;
  // Blank canvas starts with an empty array — nothing to copy from module
  if (exp.moduleId?.startsWith('blank-')) {
    exp.customScreens = [];
    exp.screenOverrides = {};
    return;
  }
  exp.customScreens = _labActiveScreens().map(s => ({ label: s.label, html: s.html }));
  exp.screenOverrides = {};
}

function _labBuildStage() {
  const stage = document.getElementById('lab-stage');
  if (!stage) return;
  const src     = _labStatusSrc();
  const screens = _labActiveScreens();

  const activeExp  = _experiments.find(e => e.id === _activeExpId);
  const injections = activeExp?.screenInjections || {};

  // Ghost cell — one glowing white phone shown while streaming
  const ghostCell = `
    <div class="lab-phone-cell lab-phone-cell--ghost">
      <div class="lab-phone-index-lbl" style="opacity:0">--</div>
      <div class="lab-phone-frame lab-phone-frame--glow">
        <div class="lab-phone-notch">
          <img class="lab-status-img" src="${src}" width="390" height="54" style="display:block;width:100%" alt=""/>
        </div>
        <div class="lab-phone-screen lab-phone-screen--generating">
          <div class="lab-gen-inner">
            <svg class="lab-gen-star" width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L18.8 11.2L26 16L18.8 20.8L16 28L13.2 20.8L6 16L13.2 11.2L16 4Z" fill="#006AFF" opacity="0.18"/>
              <path d="M16 8L18 13.2L23 16L18 18.8L16 24L14 18.8L9 16L14 13.2L16 8Z" fill="#006AFF"/>
            </svg>
          </div>
        </div>
        <div class="lab-phone-home"></div>
      </div>
      <div class="lab-phone-name-lbl" style="opacity:0">--</div>
    </div>`;

  // Empty canvas — no real screens yet
  if (screens.length === 0) {
    if (_labStreamingActive) {
      // Single ghost centered — _labCurrent = 0 so it renders as "current"
      _labCurrent = 0;
      stage.innerHTML = ghostCell;
      _labApplyCellPositions(false);
    } else {
      stage.innerHTML = `<div class="lab-blank-hint">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4L18.8 11.2L26 16L18.8 20.8L16 28L13.2 20.8L6 16L13.2 11.2L16 4Z" fill="#006AFF" opacity="0.15"/><path d="M16 8L18 13.2L23 16L18 18.8L16 24L14 18.8L9 16L14 13.2L16 8Z" fill="#006AFF"/></svg>
        <p class="lab-blank-hint__text">Describe your flow in the chat<br>and screens will appear here</p>
      </div>`;
    }
    return;
  }

  // A screen is "generated" (full-bleed, 844px, notch overlaid) only when its HTML
  // was explicitly written by AI via setScreen/addScreen — NOT when it was only injected into.
  const isGenerated = (i) => !!(activeExp?.customScreens?.[i]?.aiWritten || activeExp?.screenOverrides?.[i]);

  const realCells = screens.map((s, i) => {
    // Prepend any injected elements as absolute overlays inside the screen div.
    const injHtml = injections[i] || '';
    const screenHtml = injHtml
      ? s.html.replace(/^(\s*<div[^>]*>)/, `$1${injHtml}`)
      : s.html;
    return `
    <div class="lab-phone-cell" data-idx="${i}" onclick="_labCellClick(${i})">
      <div class="lab-phone-index-lbl">${String(i+1).padStart(2,'0')}</div>
      <div class="lab-phone-frame${isGenerated(i) ? ' lab-phone-frame--generated' : ''}">
        <div class="lab-phone-notch">
          <img class="lab-status-img" src="${src}" width="390" height="54" style="display:block;width:100%" alt=""/>
        </div>
        <div class="lab-phone-screen">${screenHtml}</div>
        <div class="lab-phone-home"></div>
      </div>
      <div class="lab-phone-name-lbl">${s.label.toUpperCase()}</div>
    </div>`;
  }).join('');

  if (_labStreamingActive) {
    // During streaming: show only the ghost phone centered.
    // Screens accumulate in data silently and all reveal at once when done.
    _labCurrent = 0;
    stage.innerHTML = ghostCell;
    _labApplyCellPositions(false);
    return;
  }

  // Normal / post-generation build
  stage.innerHTML = realCells;
  _labApplyCellPositions(false);
}

function _labCellClick(i) {
  if (!_labExpanded) return;
  if (_labDragMoved) return;   // was a drag, not a tap
  _labCurrent = i;
  labCollapse();
}

// ---- cell positions ----

function _labApplyCellPositions(animated) {
  const stage = document.getElementById('lab-stage');
  if (!stage) return;
  const cells = [...stage.querySelectorAll('.lab-phone-cell')];
  const step  = _LAB_PHONE_W + _LAB_CELL_GAP;

  // During streaming we force the spread-out layout so every screen + the ghost is visible
  const spread = _labExpanded || _labStreamingActive;

  cells.forEach((cell, i) => {
    const dist = Math.abs(i - _labCurrent);

    if (!animated) {
      cell.style.transition = 'none';
    } else {
      const delay = dist * 45;
      cell.style.transition =
        `transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,` +
        `opacity 0.3s ease ${Math.max(0, delay - 30)}ms`;
    }

    // Only mark cells as "current" / "clickable" in the real expanded mode (not during streaming)
    cell.classList.toggle('lab-phone-cell--current', i === _labCurrent && _labExpanded && !_labStreamingActive);
    cell.classList.toggle('lab-phone-cell--clickable', _labExpanded && !_labStreamingActive);

    if (spread) {
      const dx = (i - _labCurrent) * step;
      cell.style.transform  = `translateX(${dx}px)`;
      cell.style.opacity    = '1';
      cell.style.zIndex     = i === _labCurrent ? '2' : '1';
      // Ghost cells are never interactive; real cells only interactive when truly expanded
      const isGhost = cell.classList.contains('lab-phone-cell--ghost');
      cell.style.pointerEvents = (!isGhost && _labExpanded && !_labStreamingActive) ? 'auto' : 'none';
    } else {
      cell.style.transform  = 'translateX(0)';
      cell.style.opacity    = i === _labCurrent ? '1' : '0';
      cell.style.zIndex     = i === _labCurrent ? '2' : '1';
      cell.style.pointerEvents = 'none';
    }

    // restore default transition after initial build
    if (!animated) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cell.style.transition = '';
      }));
    }
  });
}

// ---- navigation ----

function labNav(dir) {
  const screens = _labActiveScreens();
  const next = _labCurrent + dir;
  if (next < 0 || next >= screens.length) return;
  _labCurrent = next;
  _labApplyCellPositions(true);
  _labUpdateMeta();
}

// ---- sidebar collapse ----

function labToggleSidebar() {
  const vp = document.getElementById('lab-canvas-vp');
  if (vp) vp.classList.toggle('lab-sidebar--collapsed');
}

// ---- expand / collapse ----

function labToggleExpand() {
  _labExpanded ? labCollapse() : labExpand();
}

function labExpand() {
  if (_labExpanded) return;
  _labExpanded = true;

  const vp  = document.getElementById('lab-canvas-vp');
  const btn = document.getElementById('lab-expand-btn');
  const lbl = document.getElementById('lab-expand-label');
  if (vp)  vp.classList.add('lab-expanded');
  if (btn) btn.classList.add('lab-expand-btn--active');
  if (lbl) lbl.textContent = 'Collapse';

  _labApplyCellPositions(true);
  _labCenterReset(true);
}

function labCollapse() {
  if (!_labExpanded) return;
  _labExpanded = false;

  const vp  = document.getElementById('lab-canvas-vp');
  const btn = document.getElementById('lab-expand-btn');
  const lbl = document.getElementById('lab-expand-label');
  if (vp)  vp.classList.remove('lab-expanded');
  if (btn) btn.classList.remove('lab-expand-btn--active');
  if (lbl) lbl.textContent = 'Expand';

  _labApplyCellPositions(true);
  _labCenterReset(true);
  _labUpdateMeta();
}

// ---- meta / UI ----

function _labUpdateMeta() {
  const screens = _labActiveScreens();

  const metaEl = document.getElementById('lab-bar-meta');
  const siEl   = document.getElementById('lab-screen-index');
  const slEl   = document.getElementById('lab-screen-label');
  const prev   = document.getElementById('lab-arrow-prev');
  const next   = document.getElementById('lab-arrow-next');
  const expBtn = document.getElementById('lab-expand-btn');

  if (!screens.length) {
    // No screens — clear meta so stale module info doesn't show
    if (metaEl) metaEl.textContent = '';
    if (siEl)   siEl.textContent = '';
    if (slEl)   slEl.textContent = '';
    if (prev)   prev.classList.add('lab-arrow--disabled');
    if (next)   next.classList.add('lab-arrow--disabled');
    if (expBtn) expBtn.style.visibility = 'hidden';
    return;
  }

  // While streaming: hide arrows and expand button — user isn't navigating yet
  if (_labStreamingActive) {
    if (prev)   prev.style.visibility = 'hidden';
    if (next)   next.style.visibility = 'hidden';
    if (expBtn) expBtn.style.visibility = 'hidden';
    if (metaEl) metaEl.textContent = '';
    if (siEl)   siEl.textContent = '';
    if (slEl)   slEl.textContent = '';
    return;
  }

  if (prev)   prev.style.visibility = '';
  if (next)   next.style.visibility = '';
  if (expBtn) expBtn.style.visibility = '';

  const screen = screens[_labCurrent] || screens[0];
  const idx    = String(_labCurrent + 1).padStart(2, '0');
  const tot    = String(screens.length).padStart(2, '0');

  if (metaEl) metaEl.textContent = `${idx} / ${tot} · ${screen.label.toUpperCase()}`;
  if (siEl) siEl.textContent = `${idx} / ${tot}`;
  if (slEl) slEl.textContent = screen.label.toUpperCase();

  if (prev) prev.classList.toggle('lab-arrow--disabled', _labCurrent === 0);
  if (next) next.classList.toggle('lab-arrow--disabled', _labCurrent === screens.length - 1);
}

// ---- pan / zoom ----

function _labStatusSrc() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return theme === 'dark'
    ? 'assets/illustrations/status-bar-dark.svg'
    : 'assets/illustrations/status-bar-light.svg';
}

function labRefreshStatusBars() {
  const src = _labStatusSrc();
  document.querySelectorAll('#lab-stage .lab-status-img').forEach(img => { img.src = src; });
}

function _labApplyTransform() {
  const inner = document.getElementById('lab-canvas-inner');
  if (!inner) return;
  inner.style.transform = `translate(${_labPan.x}px, ${_labPan.y}px) scale(${_labZoom})`;

  const val = document.getElementById('lab-zoom-val');
  if (val) val.textContent = Math.round(_labZoom * 100) + '%';
}

function _labCenterReset(animated) {
  const vp = document.getElementById('lab-canvas-vp');
  if (!vp) return;
  const W = vp.offsetWidth;
  const H = vp.offsetHeight;

  if (_labStreamingActive) {
    // Single ghost phone — natural size, centered
    _labZoom = 1.0;
  } else if (_labExpanded) {
    const screens = _labActiveScreens();
    const count   = Math.max(1, screens.length);
    // Cap visible count at 7 so modules with many screens (e.g. ID Capture) don't shrink phones
    const visibleCount = Math.min(count, 7);
    const totalW  = visibleCount * (_LAB_PHONE_W + _LAB_CELL_GAP) - _LAB_CELL_GAP;
    // Fit visible phones into viewport with padding; cap at 1.0 so we never zoom IN
    const fitZoom    = (W * 0.75) / totalW;
    _labZoom = Math.max(0.28, Math.min(1.0, fitZoom));
  } else {
    _labZoom = 1.0;
  }

  // Center the stage at (W/2, H/2) — same as original formula
  _labPan.x = (W / 2) * (1 - _labZoom);
  _labPan.y = (H / 2) * (1 - _labZoom);

  const inner = document.getElementById('lab-canvas-inner');
  if (inner) {
    inner.style.transition = animated ? 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    _labApplyTransform();
    if (animated) setTimeout(() => { if (inner) inner.style.transition = ''; }, 420);
  } else {
    _labApplyTransform();
  }
}

function labZoom(delta) {
  _labZoom = Math.min(2.5, Math.max(0.25, _labZoom + delta));
  _labApplyTransform();
}

function labFitCenter() {
  _labCenterReset(true);
}

function labToggleControls() {
  const vp  = document.getElementById('lab-canvas-vp');
  const btn = document.getElementById('lab-ctrl-toggle');
  if (!vp) return;
  const isOpen = vp.classList.toggle('lab-ctrl-open');
  if (btn) btn.classList.toggle('active', isOpen);
}

function _labSetupInteraction() {
  const vp = document.getElementById('lab-canvas-vp');
  if (!vp) return;

  vp.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (!_labExpanded) return;
    if (e.target.closest('.lab-arrow, .lab-zoom-bar, .lab-expand-btn, .lab-sidebar-item, .lab-sidebar-toggle, .lab-sidebar, .lab-theme-toggle, .lab-exp-panel, .lab-exp-messages, .lab-experiment-overlay')) return;
    _labDragging = true;
    _labDragMoved = false;
    _labDragOrigin = { x: e.clientX - _labPan.x, y: e.clientY - _labPan.y };
    _labDragOrigin._startX = e.clientX;
    _labDragOrigin._startY = e.clientY;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!_labDragging) return;
    const dx = e.clientX - _labDragOrigin._startX;
    const dy = e.clientY - _labDragOrigin._startY;
    if (!_labDragMoved && Math.sqrt(dx*dx + dy*dy) > 5) _labDragMoved = true;
    _labPan.x = e.clientX - _labDragOrigin.x;
    // Horizontal-only pan — vertical is locked
    // _labPan.y stays at its initial value
    _labApplyTransform();
  });

  document.addEventListener('mouseup', () => { _labDragging = false; });

  vp.addEventListener('wheel', e => {
    if (e.target.closest('.lab-exp-panel, .lab-exp-messages, .lab-sidebar')) return;
    e.preventDefault();
    if (!_labExpanded) return;
    const rect = vp.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const contentX = (mx - _labPan.x) / _labZoom;
    const contentY = (my - _labPan.y) / _labZoom;
    const delta = e.deltaY > 0 ? -0.07 : 0.07;
    _labZoom = Math.min(2.5, Math.max(0.25, _labZoom + delta));
    _labPan.x = mx - contentX * _labZoom;
    _labPan.y = my - contentY * _labZoom;
    _labApplyTransform();
  }, { passive: false });
}

// ─── Multi-experiment state — declared BEFORE initLab() so _labBuildStage can read them ───
let _experiments   = [];
let _activeExpId   = null;
let _expCounter    = 0;

// ── Image upload + diff state ─────────────────────────────────────────────────
let _pendingImage = null; // { data, type, previewUrl }
const _diffStore  = {};   // diffId → { oldHtml, newHtml, label }
let   _diffIdCtr  = 0;

// Lab is the default view — init after all lab code is defined
initLab();


// ============================================
//  EXPERIMENT — Claude integration
// ============================================

const _PROMPT_SYSTEM = `You are an AI assistant embedded in Incode Core Lab — a design system playground for identity verification (IDV) mobile flows. Users are product managers and designers (non-technical) who want to explore and modify UI components via natural language.

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

// ── Image upload ──────────────────────────────────────────────────────────────
function labExpHandleImage(input, ctx) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl   = e.target.result;
    const data      = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const type      = file.type || 'image/jpeg';
    const previewUrl = URL.createObjectURL(file);
    _pendingImage = { data, type, previewUrl };
    const pillId  = ctx === 'overlay' ? 'lab-overlay-img-pill' : 'lab-panel-img-pill';
    const thumbId = ctx === 'overlay' ? 'lab-overlay-img-pill-thumb' : 'lab-panel-img-pill-thumb';
    const thumbEl = document.getElementById(thumbId);
    const pillEl  = document.getElementById(pillId);
    if (thumbEl) thumbEl.src = previewUrl;
    if (pillEl)  pillEl.classList.add('visible');
    input.value = '';
  };
  reader.readAsDataURL(file);
}

function labExpRemoveImage(ctx) {
  if (_pendingImage?.previewUrl) URL.revokeObjectURL(_pendingImage.previewUrl);
  _pendingImage = null;
  const pillId  = ctx === 'overlay' ? 'lab-overlay-img-pill' : 'lab-panel-img-pill';
  const thumbId = ctx === 'overlay' ? 'lab-overlay-img-pill-thumb' : 'lab-panel-img-pill-thumb';
  const pillEl  = document.getElementById(pillId);
  const thumbEl = document.getElementById(thumbId);
  if (pillEl)  pillEl.classList.remove('visible');
  if (thumbEl) thumbEl.src = '';
}

// ── Diff thumbnail ─────────────────────────────────────────────────────────────
function _renderDiffFrame(container, html) {
  const W = 390, H = 760, S = 44 / W;  // scale to 44px wide, crop to 68px tall
  container.style.cssText = `width:44px;height:68px;overflow:hidden;border-radius:6px;background:#000;flex-shrink:0`;
  const iframe = document.createElement('iframe');
  iframe.scrolling = 'no';
  iframe.style.cssText = `border:none;width:${W}px;height:${H}px;transform:scale(${S});transform-origin:top left;pointer-events:none`;
  iframe.srcdoc = `<!DOCTYPE html><html><head><style>*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden}</style></head><body>${html}</body></html>`;
  container.innerHTML = '';
  container.appendChild(iframe);
}

function labExpAiSuggest(btn) {
  const text  = btn.textContent.trim();
  const input = document.getElementById('lab-exp-panel-input');
  if (!input) return;
  input.value = text;
  input.focus();
  labExpPanelSubmit();
}

// ── Figma Export ───────────────────────────────────────────────────────────────

let _currentExportId  = null;
let _currentManifest  = null;

function _collectTokens() {
  const names = [
    '--color-brand-500', '--color-brand-400', '--color-brand-600',
    '--text-primary', '--text-secondary', '--surface-bg',
    '--radius-button', '--radius-card',
  ];
  const style = getComputedStyle(document.documentElement);
  const tokens = {};
  names.forEach(n => { const v = style.getPropertyValue(n).trim(); if (v) tokens[n] = v; });
  return tokens;
}

function _exportSetState(state) {
  ['loading', 'error', 'ready', 'success'].forEach(s => {
    const el = document.getElementById('lab-export-' + s);
    if (el) el.style.display = s === state ? (s === 'loading' ? 'flex' : 'flex') : 'none';
  });
}

async function labExportToPDF() {
  const backdrop = document.getElementById('lab-export-backdrop');
  const modal    = document.getElementById('lab-export-modal');
  backdrop.classList.add('open');
  modal.classList.add('open');
  _exportSetState('loading');
  _currentExportId = null;
  _currentManifest = null;

  try {
    const exp = _experiments.find(e => e.id === _activeExpId);
    const injections = exp?.screenInjections || {};
    const screens = _labActiveScreens().map((s, i) => {
      const injHtml = injections[i] || '';
      const html = injHtml ? s.html.replace(/^(\s*<div[^>]*>)/, `$1${injHtml}`) : s.html;
      return { index: i, label: s.label, html };
    });
    _currentExportId = 'export_' + Date.now();

    document.getElementById('lab-export-loading-label').textContent =
      `Generating ${screens.length} screenshots…`;

    const resp = await fetch('/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exportId:    _currentExportId,
        screens,
        tokens:      _collectTokens(),
        injectedCSS: exp?.injectedCSS || '',
      }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);

    _currentManifest = data;

    // Render thumbnails
    const thumbsEl = document.getElementById('lab-export-screens');
    thumbsEl.innerHTML = data.screens.map(s =>
      `<div class="lab-export-screen-thumb">
        <img src="${s.url}" alt="${s.label}" loading="lazy"/>
        <span class="lab-export-screen-label">${s.label}</span>
      </div>`
    ).join('');

    _exportSetState('ready');
  } catch (err) {
    document.getElementById('lab-export-error-msg').textContent =
      err.message.includes('puppeteer')
        ? 'puppeteer not installed. Run: npm install puppeteer  — then restart the server.'
        : err.message;
    _exportSetState('error');
  }
}

function labExportDownloadPDF() {
  if (!_currentManifest) return;
  const btn = document.getElementById('lab-export-push-btn');
  btn.disabled = true;
  btn.textContent = 'Generating PDF…';

  const pdfUrl = `/api/export/${_currentManifest.exportId}/export.pdf`;

  // Trigger download — browser waits for server to generate the PDF
  const a = document.createElement('a');
  a.href = pdfUrl;
  a.download = 'lab-export.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  const count = _currentManifest.count;
  document.getElementById('lab-export-success-title').textContent = 'PDF Downloaded';
  document.getElementById('lab-export-success-sub').textContent =
    `${count} screen${count !== 1 ? 's' : ''} exported successfully.`;
  document.getElementById('lab-export-success-link').href = pdfUrl;

  // Small delay so the download starts before we switch state
  setTimeout(() => _exportSetState('success'), 400);
}

function labExportClose() {
  document.getElementById('lab-export-backdrop').classList.remove('open');
  document.getElementById('lab-export-modal').classList.remove('open');
}

// ── Stream buffer parser — extracts complete delimiter blocks ─────────────────
// Returns { events: [...], pos: number } where pos = bytes consumed from start of buffer.
// IMPORTANT: when a start marker is found but its end hasn't arrived yet, pos stays AT the
// start marker (not past it) so the next call can re-try once more data has arrived.
function _parseStreamBuffer(buffer) {
  const events = [];
  let pos = 0;

  while (pos < buffer.length) {
    const from = buffer.indexOf('<<<', pos);
    if (from === -1) break;

    // <<<DONE>>>
    if (buffer.startsWith('<<<DONE>>>', from)) {
      events.push({ type: 'done' });
      pos = from + 10;
      break;
    }

    // <<<SCREEN:Label>>>..<<<SCREEN_END>>>
    const screenMatch = /^<<<SCREEN:([^>]+)>>>/.exec(buffer.slice(from));
    if (screenMatch) {
      const endMarker = '<<<SCREEN_END>>>';
      const endIdx = buffer.indexOf(endMarker, from + screenMatch[0].length);
      if (endIdx === -1) return { events, pos: from }; // wait — stay AT start marker
      const html = buffer.slice(from + screenMatch[0].length, endIdx).trim();
      events.push({ type: 'screen', label: screenMatch[1].trim(), html });
      pos = endIdx + endMarker.length;
      continue;
    }

    // Other fixed-delimiter blocks
    const blockDefs = [
      { open: '<<<MSG>>>',         close: '<<<MSG_END>>>',         type: 'msg' },
      { open: '<<<SUGGESTIONS>>>', close: '<<<SUGGESTIONS_END>>>', type: 'suggestions' },
      { open: '<<<ACTION>>>',      close: '<<<ACTION_END>>>',      type: 'action' },
    ];

    let advanced = false;
    for (const bd of blockDefs) {
      if (buffer.startsWith(bd.open, from)) {
        const endIdx = buffer.indexOf(bd.close, from + bd.open.length);
        if (endIdx === -1) return { events, pos: from }; // wait — stay AT start marker
        events.push({ type: bd.type, content: buffer.slice(from + bd.open.length, endIdx).trim() });
        pos = endIdx + bd.close.length;
        advanced = true;
        break;
      }
    }

    if (!advanced) pos = from + 1; // unrecognized '<<<' — skip past it
  }

  return { events, pos };
}

// ── Stream Claude call — reads SSE from /api/stream-prompt ────────────────────
async function _callClaudeStream(history, currentScreens, onChunk) {
  // Send raw exp.messages format — server handles Anthropic mapping (same as _callClaude)
  const res = await fetch('/api/stream-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history, moduleId: _labActiveModule, screenCount: currentScreens.length }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    sseBuffer += decoder.decode(value, { stream: true });

    const lines = sseBuffer.split('\n');
    sseBuffer = lines.pop(); // keep last incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.error) throw new Error(event.error);
        if (event.done) return;
        if (event.t !== undefined) onChunk(event.t);
      } catch (e) {
        // Re-throw API errors; swallow JSON parse errors from partial lines
        if (e.message && !e.message.includes('JSON') && !e.message.includes('token')) throw e;
      }
    }
  }
}

async function _callClaude(history, currentScreens) {
  const screenSnapshot = '';

  const messages = history.map((m, idx) => {
    const isLast = idx === history.length - 1;
    if (m.role === 'ai') return { role: 'assistant', content: m.text };
    if (m.image) return {
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: m.image.type, data: m.image.data } },
        { type: 'text', text: (m.text || '') + (isLast ? screenSnapshot : '') },
      ],
    };
    return { role: 'user', content: (m.text || '') + (isLast ? screenSnapshot : '') };
  });

  const res = await fetch('/api/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, moduleId: _labActiveModule, screenCount: currentScreens.length }),
  });
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Server returned non-JSON (HTTP ${res.status}): ${raw.slice(0, 120)}`);
  }
  return data;
}

function labCreateExperiment(moduleId, moduleLabel) {
  _labActiveModule = moduleId;
  _expCounter++;
  const id    = 'exp-' + _expCounter;
  const label = 'Experiment ' + _expCounter;
  _experiments.push({ id, label, moduleId, messages: [], injectedCSS: '', screenOverrides: {}, tokenOverrides: {}, customScreens: null });

  // Sync sidebar active state
  document.querySelectorAll('.lab-sidebar-item[data-module]').forEach(b => {
    b.classList.toggle('lab-sidebar-item--active', b.dataset.module === moduleId);
  });
  labExpRenderSidebarItems();
  labExpTabSwitch(id);
}

function labCreateBlankExperiment() {
  labHideHome();
  _newFlowCounter++;
  const flowId = 'blank-' + _newFlowCounter;
  const label  = 'Flow ' + _newFlowCounter;
  _newFlowModules.push({ id: flowId, label });
  _labRenderFlowSidebar();
  labCreateExperiment(flowId, label);
}

// Switch to an existing blank flow page
function labSelectFlow(btn) {
  labHideHome();
  const flowId = btn.dataset.flow;

  document.querySelectorAll('.lab-sidebar-item').forEach(b => b.classList.remove('lab-sidebar-item--active'));
  btn.classList.add('lab-sidebar-item--active');

  _labActiveModule = flowId;
  _labCurrent = 0;

  // Restore last active exp for this flow, or fall back to the first one
  const lastExpId  = _moduleLastExp[flowId];
  const firstExp   = _experiments.find(e => e.moduleId === flowId);
  const restoreId  = lastExpId || firstExp?.id || null;
  _activeExpId = restoreId;

  if (restoreId) {
    const exp = _experiments.find(e => e.id === restoreId);
    if (exp) { _restoreExpCSS(exp); _restoreExpTokens(exp); }
  }

  labExpRenderSidebarItems();
  _labBuildStage();
  _labUpdateMeta();
  _labCenterReset(false);

  // Sync the experiment panel to the restored experiment (or clear it)
  const vpF      = document.getElementById('lab-canvas-vp');
  const overlayF = document.getElementById('lab-experiment-overlay');
  const panelF   = document.getElementById('lab-exp-panel');
  const restoredExpF = restoreId ? _experiments.find(e => e.id === restoreId) : null;

  if (!restoredExpF) {
    vpF.classList.remove('lab-exp-active', 'lab-panel-open', 'lab-exp-phase2');
    if (overlayF) overlayF.classList.remove('active');
    if (panelF)   panelF.classList.remove('active');
  } else if (restoredExpF.messages.length === 0) {
    vpF.classList.add('lab-exp-active');
    vpF.classList.remove('lab-panel-open', 'lab-exp-phase2');
    if (overlayF) overlayF.classList.add('active');
    if (panelF)   panelF.classList.remove('active');
  } else {
    vpF.classList.remove('lab-exp-active');
    vpF.classList.add('lab-panel-open', 'lab-exp-phase2');
    if (overlayF) overlayF.classList.remove('active');
    if (panelF) {
      panelF.classList.add('active');
      const titleEl = document.getElementById('lab-exp-panel-title');
      if (titleEl) titleEl.textContent = restoredExpF.label;
      labExpRenderMessages(restoredExpF);
    }
  }
}

// Create a new experiment inside the currently active module/flow
function labCreateExpInCurrentModule() {
  const flowMod = _newFlowModules.find(f => f.id === _labActiveModule);
  const label   = flowMod ? flowMod.label : (_labModuleData[_labActiveModule]?.label || 'Module');
  labCreateExperiment(_labActiveModule, label);
}

// Re-render the "My Flows" section in the sidebar
function _labRenderFlowSidebar() {
  const nav = document.getElementById('lab-sidebar-flows-nav');
  if (!nav) return;

  const dots = `<svg class="lab-drag-handle" width="10" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="2.5" r="1.1" fill="currentColor"/><circle cx="7" cy="2.5" r="1.1" fill="currentColor"/><circle cx="3" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="3" cy="11.5" r="1.1" fill="currentColor"/><circle cx="7" cy="11.5" r="1.1" fill="currentColor"/></svg>`;
  const plus = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1V9M1 5H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

  if (!_newFlowModules.length) {
    nav.innerHTML = '';
    return;
  }

  nav.innerHTML = _newFlowModules.map(f => `
    <div class="lab-sidebar-item-group">
      <button class="lab-sidebar-item${_labActiveModule === f.id ? ' lab-sidebar-item--active' : ''}"
              data-flow="${f.id}" onclick="labSelectFlow(this)">
        ${dots}
        <span>${f.label}</span>
        <span class="lab-sidebar-item-add" onclick="event.stopPropagation(); _labActiveModule='${f.id}'; labCreateExpInCurrentModule()" title="New experiment">${plus}</span>
      </button>
    </div>
  `).join('');
}

function labExpRenderSidebarItems() {
  const bar = document.getElementById('lab-exp-tab-bar');
  if (!bar) return;

  // Only show experiments belonging to the current module/page
  const moduleExps = _experiments.filter(e => e.moduleId === _labActiveModule);
  const isBlank    = _labActiveModule.startsWith('blank-');

  if (!moduleExps.length && isBlank) {
    bar.classList.remove('visible');
    bar.innerHTML = '';
    return;
  }

  // "Original" tab only for module-based pages (not blank flows)
  const originalTab = isBlank ? '' : `
    <button class="lab-exp-tab${_activeExpId === null ? ' lab-exp-tab--active' : ''}"
            onclick="labExpTabSwitch('original')">
      Original
    </button>`;

  const dupIcon  = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="3.5" y="0.5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 3.5H1a.5.5 0 00-.5.5v5A.5.5 0 001 9.5h5a.5.5 0 00.5-.5V9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  const closeIcon = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  const expTabs = moduleExps.map(exp => `
    <button class="lab-exp-tab lab-exp-tab--closeable${_activeExpId === exp.id ? ' lab-exp-tab--active' : ''}"
            onclick="labExpTabSwitch('${exp.id}')">
      ${exp.label}
      <span class="lab-exp-tab-dup"   onclick="event.stopPropagation();labExpDuplicate('${exp.id}')" title="Duplicate">${dupIcon}</span>
      <span class="lab-exp-tab-close" onclick="event.stopPropagation();labExpClose('${exp.id}')"      title="Delete">${closeIcon}</span>
    </button>
  `).join('');

  // "+" tab to create a new experiment in the current module/flow
  const addTab = `
    <button class="lab-exp-tab lab-exp-tab--add" onclick="labCreateExpInCurrentModule()" title="New experiment">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1V9M1 5H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>`;

  if (!originalTab && !expTabs) {
    bar.classList.remove('visible');
    bar.innerHTML = '';
    return;
  }

  bar.innerHTML = originalTab + expTabs + addTab;
  bar.classList.add('visible');
}

function labExpRenameFromPanel(el) {
  if (!_activeExpId) return;
  const exp = _experiments.find(e => e.id === _activeExpId);
  if (!exp) return;
  const newLabel = el.textContent.trim();
  if (newLabel) {
    exp.label = newLabel;
    labExpRenderSidebarItems(); // sync sidebar
  } else {
    el.textContent = exp.label; // revert if blank
  }
}

function labExpRenameFromSidebar(el, id) {
  const exp = _experiments.find(e => e.id === id);
  if (!exp) return;
  const newLabel = el.textContent.trim();
  if (newLabel) {
    exp.label = newLabel;
    // Sync panel title if this experiment is active
    if (_activeExpId === id) {
      const titleEl = document.getElementById('lab-exp-panel-title');
      if (titleEl) titleEl.textContent = newLabel;
    }
  } else {
    el.textContent = exp.label; // revert if blank
  }
}

function labExpTabSwitch(idOrOriginal) {
  _activeExpId = (idOrOriginal === 'original') ? null : idOrOriginal;

  // Track last active exp per module so switching pages restores the right tab
  _moduleLastExp[_labActiveModule] = _activeExpId;

  labExpRenderSidebarItems();

  const vp      = document.querySelector('.lab-canvas-vp');
  const overlay = document.getElementById('lab-experiment-overlay');
  const panel   = document.getElementById('lab-exp-panel');

  if (_activeExpId === null) {
    // Back to original — restore everything
    vp.classList.remove('lab-exp-active', 'lab-panel-open', 'lab-exp-phase2');
    overlay.classList.remove('active');
    panel.classList.remove('active');
    _restoreExpCSS(null);
    _restoreExpTokens(null);  // clear any experiment token overrides
    _labBuildStage();
    _labUpdateMeta();
    return;
  }

  const exp = _experiments.find(e => e.id === _activeExpId);
  if (!exp) return;

  // Restore the module this experiment belongs to + sync sidebar active state
  if (exp.moduleId) {
    _labActiveModule = exp.moduleId;
    document.querySelectorAll('.lab-sidebar-item[data-module]').forEach(b => {
      b.classList.toggle('lab-sidebar-item--active', b.dataset.module === exp.moduleId);
    });
    // Sync flows sidebar active state
    _labRenderFlowSidebar();
  }

  _restoreExpCSS(exp);
  _restoreExpTokens(exp);  // apply this experiment's token overrides
  _labBuildStage();
  _labUpdateMeta();

  if (exp.messages.length === 0) {
    // Phase 1: no messages yet — hide phones, show centered chat card
    vp.classList.add('lab-exp-active');
    vp.classList.remove('lab-panel-open', 'lab-exp-phase2');
    overlay.classList.add('active');
    panel.classList.remove('active');
    const _tl = document.getElementById('lab-exp-tagline');
    if (_tl) _tl.textContent = _LAB_TAGLINES[Math.floor(Math.random() * _LAB_TAGLINES.length)];
    // Blank canvas gets a different prompt heading and placeholder
    const _hd = document.getElementById('lab-exp-heading');
    const _inp = document.getElementById('lab-exp-overlay-input');
    if (exp.moduleId?.startsWith('blank-')) {
      const flowMod = _newFlowModules.find(f => f.id === exp.moduleId);
      if (_hd) _hd.textContent = flowMod ? `What do you want to build in ${flowMod.label}?` : 'What do you want to build?';
      if (_inp) _inp.placeholder = 'e.g. "Build an onboarding flow with consent screen and selfie"…';
    } else {
      const modLabel = _labModuleData[exp.moduleId]?.label || exp.moduleId;
      if (_hd) _hd.innerHTML = `What do you want to experiment in <strong>${modLabel}</strong>?`;
      if (_inp) _inp.placeholder = 'Describe what you want to explore…';
    }
    setTimeout(() => document.getElementById('lab-exp-overlay-input')?.focus(), 80);
  } else {
    // Phase 2: has messages — phones back, right panel visible
    vp.classList.remove('lab-exp-active');
    vp.classList.add('lab-panel-open', 'lab-exp-phase2');
    overlay.classList.remove('active');
    panel.classList.add('active');
    document.getElementById('lab-exp-panel-title').textContent = exp.label;
    labExpRenderMessages(exp);
    setTimeout(() => document.getElementById('lab-exp-panel-input')?.focus(), 80);
  }
}

function labExpClose(id) {
  const exp = _experiments.find(e => e.id === id);
  const backdrop = document.getElementById('lab-delete-backdrop');
  const body = document.getElementById('lab-delete-body');
  const btn = document.getElementById('lab-delete-btn-confirm');
  body.textContent = `"${exp?.label || 'This experiment'}" and all its screens will be permanently removed.`;
  btn.onclick = () => { labExpDeleteCancel(); _labExpDoDelete(id); };
  backdrop.classList.add('active');
}

function labExpDuplicate(id) {
  const src = _experiments.find(e => e.id === id);
  if (!src) return;

  // Materialize the exact screens the user is looking at right now.
  // Temporarily point _activeExpId at the source so _labActiveScreens()
  // returns the correct merged result (module screens + overrides, or customScreens).
  const prevId = _activeExpId;
  _activeExpId = id;
  const snapshot = _labActiveScreens().map((s, i) => ({
    label:     s.label,
    html:      s.html,
    aiWritten: !!(src.customScreens?.[i]?.aiWritten || src.screenOverrides?.[i]),
  }));
  _activeExpId = prevId;

  _expCounter++;
  const newId  = 'exp-' + _expCounter;
  const newExp = {
    id:               newId,
    label:            src.label + ' copy',
    moduleId:         src.moduleId,
    messages:         JSON.parse(JSON.stringify(src.messages.filter(m => !m.thinking))),
    injectedCSS:      src.injectedCSS,
    screenOverrides:  {},          // baked into customScreens below
    tokenOverrides:   JSON.parse(JSON.stringify(src.tokenOverrides   || {})),
    customScreens:    snapshot.length ? snapshot : null,
    screenInjections: JSON.parse(JSON.stringify(src.screenInjections || {})),
  };
  _experiments.push(newExp);
  labExpTabSwitch(newId);
}

function labExpDeleteCancel() {
  document.getElementById('lab-delete-backdrop').classList.remove('active');
}

function _labExpDoDelete(id) {
  const deleted = _experiments.find(e => e.id === id);
  _experiments = _experiments.filter(e => e.id !== id);
  if (_activeExpId === id) {
    // Fall back to another exp in the same module, or Original (if module-based)
    const moduleExps = _experiments.filter(e => e.moduleId === _labActiveModule);
    const last = moduleExps[moduleExps.length - 1];
    const fallback = last ? last.id : (_labActiveModule.startsWith('blank-') ? null : 'original');
    if (fallback !== null) labExpTabSwitch(fallback);
    else labExpTabSwitch('original');
  } else {
    labExpRenderSidebarItems();
  }
  if (_experiments.filter(e => e.moduleId === _labActiveModule).length === 0 && _labActiveModule.startsWith('blank-')) {
    labCloseExperiment();
  }
}

function labCloseExperiment() {
  _experiments = [];
  _activeExpId = null;
  _expCounter  = 0;
  document.getElementById('lab-experiment-overlay').classList.remove('active');
  document.getElementById('lab-exp-panel').classList.remove('active');
  document.querySelector('.lab-canvas-vp').classList.remove('lab-exp-active', 'lab-panel-open', 'lab-exp-phase2');
  const tabBar = document.getElementById('lab-exp-tab-bar');
  if (tabBar) { tabBar.classList.remove('visible'); tabBar.innerHTML = ''; }
}

// Toggle panel — mirrors labToggleSidebar exactly
function labToggleExpPanel() {
  const vp = document.querySelector('.lab-canvas-vp');
  const panel = document.getElementById('lab-exp-panel');
  const isOpen = panel.classList.contains('active');
  if (isOpen) {
    panel.classList.remove('active');
    vp.classList.remove('lab-panel-open');
  } else {
    panel.classList.add('active');
    vp.classList.add('lab-panel-open');
  }
}

// Suggestion chip → fill overlay input and submit
function labExpSuggest(btn) {
  const input = document.getElementById('lab-exp-overlay-input');
  if (input) { input.value = btn.textContent.trim(); input.focus(); }
  labExpSubmit();
}

function labExpRenderMessages(exp) {
  const container = document.getElementById('lab-exp-messages');
  if (!container) return;
  container.innerHTML = exp.messages.map(m => {
    if (m.thinking) {
      return `<div class="lab-exp-msg lab-exp-msg--ai lab-exp-msg--thinking">
        <div class="lab-exp-msg-generating">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L9.6 5.8L14 8L9.6 10.2L8 15L6.4 10.2L2 8L6.4 5.8L8 1Z" fill="#006AFF"/></svg>
          <span class="lab-exp-generating-label">Generating</span>
          <span class="lab-exp-generating-dots"><span></span><span></span><span></span></span>
        </div>
      </div>`;
    }
    if (m.clarify) {
      return `<div class="lab-exp-msg lab-exp-msg--ai">
        <div class="lab-exp-msg-bubble">
          <span style="display:block;margin-bottom:10px">${m.clarify.originalText}</span>
          <div class="lab-exp-clarify-btns">
            <button class="lab-exp-clarify-btn" onclick="labExpClarifyChoice(false)">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              ${m.clarify.applyLabel}
            </button>
            <button class="lab-exp-clarify-btn lab-exp-clarify-btn--explore" onclick="labExpClarifyChoice(true)">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.2 4.3L11 6L7.2 7.7L6 11L4.8 7.7L1 6L4.8 4.3L6 1Z" fill="currentColor"/></svg>
              ${m.clarify.exploreLabel}
            </button>
          </div>
        </div>
      </div>`;
    }
    if (m.role === 'user') {
      const imgHtml = m.imagePreviewUrl
        ? `<img src="${m.imagePreviewUrl}" class="lab-exp-msg-img-thumb" alt=""/>`
        : '';
      const textHtml = (m.text && m.text !== '(see attached image)') ? m.text : '';
      return `<div class="lab-exp-msg lab-exp-msg--user">
        <div class="lab-exp-msg-bubble">${imgHtml}${textHtml}</div>
      </div>`;
    }
    // AI message
    const diffHtml = (m.diffs?.length ? m.diffs : []).map(diffId => {
      const diff = _diffStore[diffId];
      if (!diff) return '';
      return `<div class="lab-exp-diff-card">
        <div class="lab-exp-diff-thumb" id="diff-${diffId}"></div>
        <div class="lab-exp-diff-info">
          <span class="lab-exp-diff-name">${diff.label}</span>
          <span class="lab-exp-diff-tag">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="#22a861" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Updated
          </span>
        </div>
      </div>`;
    }).join('');
    const suggestHtml = m.suggestions?.length
      ? `<div class="lab-exp-ai-suggestions">${m.suggestions.map(s =>
          `<button class="lab-exp-ai-chip" onclick="labExpAiSuggest(this)">${s}</button>`).join('')}</div>`
      : '';
    return `<div class="lab-exp-msg lab-exp-msg--ai">
      <div class="lab-exp-msg-ai-body">
        <div class="lab-exp-msg-bubble">${m.text}</div>
        ${diffHtml}${suggestHtml}
      </div>
    </div>`;
  }).join('');

  // Populate diff "after" previews
  exp.messages.forEach(m => {
    (m.diffs || []).forEach(diffId => {
      const el   = document.getElementById('diff-' + diffId);
      const diff = _diffStore[diffId];
      if (el && diff && !el.hasChildNodes()) _renderDiffFrame(el, diff.newHtml);
    });
  });

  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

// ── Token-request detection ──────────────────────────────────────────────────
// These prompts are about theming/tokens — always ask apply-vs-experiment first.
const _TOKEN_KEYWORDS = [
  'dark mode', 'light mode', 'dark theme', 'light theme', 'dark color', 'dark colour',
  'dark background', 'night mode', 'brand color', 'brand colour', 'brand palette',
  'change color', 'change colour', 'color scheme', 'colour scheme',
  'purple', 'green brand', 'red brand', 'orange brand',
  'font ', 'typography', 'typeface', 'font family',
  'feel premium', 'feel minimal', 'feel clean', 'feel modern', 'feel professional',
  'premium feel', 'minimal feel', 'softer radius', 'rounder', 'less rounded',
  'lighter background', 'darker background', 'background color', 'text color',
  'remove friction', 'reduce friction',
];

function _isTokenRequest(text) {
  const lower = text.toLowerCase();
  return _TOKEN_KEYWORDS.some(kw => lower.includes(kw));
}

// Show the clarify card client-side (no API call) when intent is token-related
function _showClarifyCard(exp, userText) {
  const currentLabel = exp.label;
  exp.messages.push({
    role: 'ai',
    text: `Got it — apply this to the original design, or explore it as a brand new design?`,
    clarify: {
      applyLabel:   'Apply to Original design',
      exploreLabel: 'New design',
      originalText: `Got it — apply this to the original design, or explore it as a brand new design?`,
    },
  });
  labExpRenderMessages(exp);
}

// Submit from the centered overlay card (Phase 1 → Phase 2 transition)
async function labExpSubmit() {
  const input = document.getElementById('lab-exp-overlay-input');
  const btn   = document.getElementById('lab-exp-submit-btn');
  const msg   = input?.value.trim();
  if ((!msg && !_pendingImage) || btn?.disabled || !_activeExpId) return;

  const exp = _experiments.find(e => e.id === _activeExpId);
  if (!exp) return;

  const userMsg = { role: 'user', text: msg || '(see attached image)' };
  if (_pendingImage) {
    userMsg.image = { data: _pendingImage.data, type: _pendingImage.type };
    userMsg.imagePreviewUrl = _pendingImage.previewUrl;
    labExpRemoveImage('overlay');
  }
  exp.messages.push(userMsg);
  input.value = '';

  // Transition: hide overlay, show phones + right panel (phase-2)
  const vp = document.querySelector('.lab-canvas-vp');
  vp.classList.remove('lab-exp-active');
  vp.classList.add('lab-panel-open', 'lab-exp-phase2');
  document.getElementById('lab-experiment-overlay').classList.remove('active');
  const panel = document.getElementById('lab-exp-panel');
  panel.classList.add('active');
  document.getElementById('lab-exp-panel-title').textContent = exp.label;

  // Blank canvas flows have no "original" — skip clarify, go straight to generation
  if (_isTokenRequest(msg) && !exp.moduleId?.startsWith('blank-')) {
    _showClarifyCard(exp, msg);
  } else {
    labExpRenderMessages(exp);
    await _runExpResponse(exp);
  }
}

// Submit from the right panel (Phase 2 follow-up messages)
async function labExpPanelSubmit() {
  const input = document.getElementById('lab-exp-panel-input');
  const btn   = document.getElementById('lab-exp-panel-send');
  const msg   = input?.value.trim();
  if ((!msg && !_pendingImage) || btn?.disabled || !_activeExpId) return;

  const exp = _experiments.find(e => e.id === _activeExpId);
  if (!exp) return;

  const userMsg = { role: 'user', text: msg || '(see attached image)' };
  if (_pendingImage) {
    userMsg.image = { data: _pendingImage.data, type: _pendingImage.type };
    userMsg.imagePreviewUrl = _pendingImage.previewUrl;
    labExpRemoveImage('panel');
  }
  exp.messages.push(userMsg);
  input.value = '';

  // Blank canvas flows have no "original" — skip clarify, go straight to generation
  if (_isTokenRequest(msg) && !exp.moduleId?.startsWith('blank-')) {
    labExpRenderMessages(exp);
    _showClarifyCard(exp, msg);
  } else {
    labExpRenderMessages(exp);
    await _runExpResponse(exp);
  }
}

async function _runExpResponse(exp) {
  const overlayBtn  = document.getElementById('lab-exp-submit-btn');
  const panelInput  = document.getElementById('lab-exp-panel-input');
  const panelBtn    = document.getElementById('lab-exp-panel-send');
  const starBtnHTML = '<svg class="lab-send-star" width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1L9.6 5.8L14 8L9.6 10.2L8 15L6.4 10.2L2 8L6.4 5.8L8 1Z" fill="white"/></svg><span class="lab-send-label">Build</span>';

  // Disable inputs + pulse phones
  if (overlayBtn) overlayBtn.disabled = true;
  if (panelInput) panelInput.disabled = true;
  if (panelBtn)   panelBtn.disabled = true;
  document.querySelectorAll('.lab-phone-cell').forEach(c => c.classList.add('lab-phone-cell--generating'));

  const restore = () => {
    document.querySelectorAll('.lab-phone-cell').forEach(c => c.classList.remove('lab-phone-cell--generating'));
    if (overlayBtn) { overlayBtn.disabled = false; overlayBtn.innerHTML = starBtnHTML; }
    if (panelInput) panelInput.disabled = false;
    if (panelBtn)   { panelBtn.disabled = false; panelBtn.innerHTML = starBtnHTML; }
    document.getElementById('lab-exp-panel-input')?.focus();
  };

  // ── STREAMING PATH — blank canvas experiments ─────────────────────────────
  if (exp.moduleId?.startsWith('blank-')) {
    // Follow-up on an existing flow — clear screens so Claude rebuilds with the change applied
    // (avoids appending new screens on top of existing ones)
    if (exp.customScreens && exp.customScreens.length > 0) {
      exp.customScreens = [];
      exp.screenOverrides = {};
    }
    _labExpanded = false;     // lock canvas — no pan/zoom/interaction during generation
    _labStreamingActive = true;
    _labBuildStage();        // show only ghost phone centered
    _labUpdateMeta();        // hide arrows + meta bar during generation
    _labCenterReset(true);   // animate to natural size, centered in visible area
    exp.messages.push({ role: 'ai', text: '__thinking__', thinking: true });
    labExpRenderMessages(exp);

    let textBuffer   = '';
    let parsedUpTo   = 0;
    let aiMsg        = null; // the chat message we'll update
    let msgSet       = false;

    const processBuffer = () => {
      const slice = textBuffer.slice(parsedUpTo);
      const { events, pos } = _parseStreamBuffer(slice);
      if (pos > 0) console.log('[stream] parsed', events.length, 'events, pos', pos, '| events:', events.map(e => e.type));
      parsedUpTo += pos;

      for (const event of events) {
        if (event.type === 'msg' && !msgSet) {
          // Replace thinking bubble with real message
          exp.messages = exp.messages.filter(m => !m.thinking);
          aiMsg = { role: 'ai', text: event.content };
          exp.messages.push(aiMsg);
          msgSet = true;
          labExpRenderMessages(exp);
        }

        if (event.type === 'screen') {
          // Screens appear one by one as they stream in
          executeLabAction({ type: 'addScreen', label: event.label, html: event.html }, exp.id);
        }

        if (event.type === 'suggestions') {
          if (!aiMsg) {
            exp.messages = exp.messages.filter(m => !m.thinking);
            aiMsg = { role: 'ai', text: 'Here\'s your flow.' };
            exp.messages.push(aiMsg);
          }
          aiMsg.suggestions = event.content.split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
          labExpRenderMessages(exp);
        }

        if (event.type === 'action') {
          try { executeLabAction(JSON.parse(event.content), exp.id); } catch {}
        }
      }
    };

    try {
      await _callClaudeStream(
        exp.messages.filter(m => !m.thinking),
        _labActiveScreens(),
        (chunk) => {
          textBuffer += chunk;
          processBuffer();
        }
      );
      // Final parse pass — catch any trailing complete blocks
      processBuffer();

      console.log('[stream] done. total buffer length:', textBuffer.length, '| first 200 chars:', JSON.stringify(textBuffer.slice(0, 200)));

      // If MSG never arrived (malformed output), show a fallback
      if (!msgSet) {
        exp.messages = exp.messages.filter(m => !m.thinking);
        exp.messages.push({ role: 'ai', text: 'Flow generated.' });
        labExpRenderMessages(exp);
      }
    } catch (err) {
      exp.messages = exp.messages.filter(m => !m.thinking);
      exp.messages.push({ role: 'ai', text: `Error: ${err.message || 'Something went wrong — please try again.'}` });
      labExpRenderMessages(exp);
    } finally {
      _labStreamingActive = false;
      _labCurrent = 0;
      _labExpanded = true; // stay in expanded mode — user collapses when ready
      document.getElementById('lab-canvas-vp')?.classList.add('lab-expanded');
      _labBuildStage();    // rebuild without ghost, stays spread out
      _labCenterReset(true); // animate zoom to fit all finished screens
      _labUpdateMeta();

      // Show COLLAPSE button state
      const expBtn = document.getElementById('lab-expand-btn');
      const expLbl = document.getElementById('lab-expand-label');
      if (expBtn) expBtn.classList.add('lab-expand-btn--active');
      if (expLbl) expLbl.textContent = 'COLLAPSE';

      restore();
    }
    return;
  }

  // ── JSON PATH — module-based experiments (face capture, ID capture, etc.) ──
  exp.messages.push({ role: 'ai', text: '__thinking__', thinking: true });
  labExpRenderMessages(exp);

  try {
    const data = await _callClaude(exp.messages.filter(m => !m.thinking), _labActiveScreens());
    exp.messages = exp.messages.filter(m => !m.thinking);
    const aiMsg = { role: 'ai', text: data.message || 'Done.' };
    if (Array.isArray(data.suggestions) && data.suggestions.length) {
      aiMsg.suggestions = data.suggestions.slice(0, 3);
    }
    exp.messages.push(aiMsg);
    labExpRenderMessages(exp);
    if (Array.isArray(data.actions)) data.actions.forEach(a => executeLabAction(a, exp.id));
    labExpRenderMessages(exp);
  } catch (err) {
    exp.messages = exp.messages.filter(m => !m.thinking);
    exp.messages.push({ role: 'ai', text: `Error: ${err?.message || err || 'unknown'}` });
    labExpRenderMessages(exp);
  } finally {
    restore();
  }
}

async function _fakeExpResponse(message) {
  await new Promise(r => setTimeout(r, 1300));
  const m = message.toLowerCase();

  if (m.includes('dark') || m.includes('night') || m.includes('oscuro')) {
    return { message: 'Switched to dark theme so you can see how it looks at night.', actions: [{ type: 'setTheme', theme: 'dark' }] };
  }
  if (m.includes('light') || m.includes('claro') || m.includes('blanco')) {
    return { message: 'Back to the light theme.', actions: [{ type: 'setTheme', theme: 'light' }] };
  }
  if (m.includes('purple') || m.includes('morado') || m.includes('violeta')) {
    return { message: 'Applied a purple brand color to the design.', actions: [{ type: 'setToken', token: '--color-brand-500', value: '#7C3AED' }, { type: 'setToken', token: '--color-brand-400', value: '#8B5CF6' }, { type: 'setToken', token: '--color-brand-600', value: '#6D28D9' }] };
  }
  if (m.includes('green') || m.includes('verde')) {
    return { message: 'Applied a green brand color.', actions: [{ type: 'setToken', token: '--color-brand-500', value: '#059669' }, { type: 'setToken', token: '--color-brand-400', value: '#10B981' }, { type: 'setToken', token: '--color-brand-600', value: '#047857' }] };
  }
  if (m.includes('red') || m.includes('rojo')) {
    return { message: 'Applied a red brand color.', actions: [{ type: 'setToken', token: '--color-brand-500', value: '#DC2626' }, { type: 'setToken', token: '--color-brand-400', value: '#EF4444' }, { type: 'setToken', token: '--color-brand-600', value: '#B91C1C' }] };
  }
  if (m.includes('reset') || m.includes('default') || m.includes('original')) {
    return { message: 'Reset everything back to default tokens.', actions: [{ type: 'resetTokens' }] };
  }
  if (m.includes('expand') || m.includes('full') || m.includes('grande')) {
    return { message: 'Expanded the module to full screen view.', actions: [{ type: 'expandModule' }] };
  }
  if (m.includes('screen') || m.includes('step') || m.includes('pantalla')) {
    const num = parseInt(m.match(/\d+/)?.[0]) || 1;
    return { message: `Navigated to screen ${num}.`, actions: [{ type: 'goToScreen', index: num - 1 }] };
  }
  if (m.includes('token') || m.includes('color') || m.includes('panel')) {
    return { message: 'Opened the token panel so you can tweak colors directly.', actions: [{ type: 'openTokenPanel' }] };
  }

  const replies = [
    'Interesting idea. In a real integration I\'d generate mock screens here — for now this is a concept preview.',
    'Got it. This experiment canvas is where your generated screens would appear.',
    'I can see what you\'re going for. Once wired to the real API, I\'d render that variation here.',
    'Nice direction. This would generate a new screen variant matching your description.',
  ];
  return { message: replies[Math.floor(Math.random() * replies.length)], actions: [] };
}

function _applyExpCSS(css, append) {
  let tag = document.getElementById('lab-exp-injected-css');
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'lab-exp-injected-css';
    document.head.appendChild(tag);
  }
  if (append) {
    tag.textContent += '\n' + css;
  } else {
    tag.textContent = css || '';
  }
}

function _restoreExpCSS(exp) {
  _applyExpCSS(exp?.injectedCSS || '', false);
}

function _restoreExpTokens(exp) {
  // Always reset to design-system defaults first
  Object.entries(defaults).forEach(([prop, val]) => root.style.setProperty(prop, val));
  // Then apply this experiment's overrides (if any)
  if (exp?.tokenOverrides) {
    Object.entries(exp.tokenOverrides).forEach(([prop, val]) => root.style.setProperty(prop, val));
  }
}

function executeLabAction(action, targetExpId) {
  // targetExpId lets callers pin actions to a specific experiment even if _activeExpId
  // changes mid-flight (e.g. user switches tabs while an API call is in progress).
  // Falls back to _activeExpId when not provided (interactive / real-time calls).
  const resolvedExpId = targetExpId !== undefined ? targetExpId : _activeExpId;
  switch (action.type) {

    case 'selectModule': {
      const btn = document.querySelector(`[data-module="${action.moduleId}"]`);
      if (btn) {
        // Make sure we're on the Lab view
        if (!document.getElementById('view-lab').classList.contains('active')) {
          const labTab = document.querySelector('.tab');
          if (labTab) showView('lab', labTab);
        }
        labSelectModule(btn);
      }
      break;
    }

    case 'expandModule': {
      if (!_labExpanded) labExpand();
      break;
    }

    case 'collapseModule': {
      if (_labExpanded) labCollapse();
      break;
    }

    case 'goToScreen': {
      const mod = _labModuleData[_labActiveModule];
      if (!mod || !mod.screens.length) break;
      const idx = Math.max(0, Math.min(action.index, mod.screens.length - 1));
      if (_labExpanded) labCollapse();
      _labCurrent = idx;
      _labBuildStage();
      _labUpdateMeta();
      break;
    }

    case 'setTheme': {
      if (action.theme === 'light' || action.theme === 'dark') {
        // Only apply to DOM if this experiment is currently being viewed
        if (resolvedExpId === _activeExpId) setTopbarTheme(action.theme);
      }
      break;
    }

    case 'setToken': {
      if (action.token && action.value) {
        // If inside an experiment, store per-experiment so original is unaffected
        if (resolvedExpId) {
          const activeExp = _experiments.find(e => e.id === resolvedExpId);
          if (activeExp) {
            if (!activeExp.tokenOverrides) activeExp.tokenOverrides = {};
            activeExp.tokenOverrides[action.token] = action.value;
          }
        }
        // Only apply to DOM if this experiment is currently being viewed
        if (resolvedExpId === _activeExpId) updateToken(action.token, action.value);
        // Sync hex input if one exists for this token
        const tokenHexMap = {
          '--color-brand-500': 'brand-500-hex',
          '--color-brand-400': 'brand-400-hex',
          '--color-brand-600': 'brand-600-hex',
          '--text-primary':    'text-primary-hex',
          '--text-secondary':  'text-secondary-hex',
          '--surface-bg':      'surface-bg-hex',
        };
        const hexId = tokenHexMap[action.token];
        if (hexId) {
          const hexEl = document.getElementById(hexId);
          if (hexEl) hexEl.value = action.value;
          // Also sync the color dot
          const dotId = hexId.replace('-hex', '');
          const colorEl = document.getElementById(dotId);
          if (colorEl) {
            colorEl.value = action.value;
            const dot = colorEl.closest('.token-pill-dot');
            if (dot) dot.style.background = action.value;
          }
        }
      }
      break;
    }

    case 'openTokenPanel': {
      const panel = document.getElementById('token-panel');
      if (!panel.classList.contains('open')) toggleTokenPanel();
      break;
    }

    case 'resetTokens': {
      resetTokens();
      break;
    }

    case 'injectCSS': {
      if (action.css) {
        // Scope all injected CSS inside .lab-stage so it only affects the screens
        const scoped = action.css
          .replace(/\/\*[\s\S]*?\*\//g, '')  // strip comments
          .split('}')
          .filter(r => r.trim())
          .map(rule => {
            // Handle @keyframes — don't scope them
            if (rule.trim().startsWith('@keyframes')) return rule + '}';
            const [sel, ...rest] = rule.split('{');
            if (!sel || !rest.length) return '';
            const selectors = sel.trim().split(',').map(s => {
              const t = s.trim();
              if (/^(:root|html|body|@)/.test(t)) return t;
              return `.lab-stage ${t}`;
            }).join(', ');
            return `${selectors} { ${rest.join('{')} }`;
          })
          .filter(Boolean)
          .join('\n');
        // Save to active experiment
        const activeExp = _experiments.find(e => e.id === resolvedExpId);
        if (activeExp) activeExp.injectedCSS = (activeExp.injectedCSS || '') + '\n' + scoped;
        // Only apply to DOM if this experiment is currently being viewed
        if (resolvedExpId === _activeExpId) {
          _applyExpCSS(scoped, true);
          // Glow all visible cells since CSS affects all screens
          requestAnimationFrame(() => {
            document.querySelectorAll('.lab-phone-cell').forEach(cell => {
              cell.classList.add('lab-phone-cell--modified');
              setTimeout(() => cell.classList.remove('lab-phone-cell--modified'), 2000);
            });
          });
        }
      }
      break;
    }

    case 'resetCSS': {
      const activeExp = _experiments.find(e => e.id === resolvedExpId);
      if (activeExp) activeExp.injectedCSS = '';
      _applyExpCSS('', false);
      break;
    }

    case 'addScreen': {
      if (action.html !== undefined) {
        const activeExp = _experiments.find(e => e.id === resolvedExpId);
        if (activeExp) {
          _labEnsureCustomScreens(activeExp);
          const screens = activeExp.customScreens;
          const idx = (action.index !== undefined)
            ? Math.max(0, Math.min(action.index, screens.length))
            : screens.length;
          screens.splice(idx, 0, { label: action.label || 'New Screen', html: action.html, aiWritten: true });
          _labCurrent = idx;
          // During streaming, screens accumulate silently — the ghost phone stays centered.
          // All screens are revealed at once when generation finishes.
          if (!_labStreamingActive) {
            _labBuildStage();
            _labUpdateMeta();
            requestAnimationFrame(() => {
              const cell = document.querySelector(`.lab-phone-cell[data-idx="${idx}"]`);
              if (cell) {
                cell.classList.add('lab-phone-cell--modified');
                setTimeout(() => cell.classList.remove('lab-phone-cell--modified'), 2000);
              }
            });
          }
        }
      }
      break;
    }

    case 'removeScreen': {
      if (action.index !== undefined) {
        const activeExp = _experiments.find(e => e.id === resolvedExpId);
        if (activeExp) {
          _labEnsureCustomScreens(activeExp);
          const screens = activeExp.customScreens;
          if (screens.length > 1) {
            screens.splice(action.index, 1);
            _labCurrent = Math.min(_labCurrent, screens.length - 1);
            _labBuildStage();
            _labUpdateMeta();
          }
        }
      }
      break;
    }

    case 'injectHTML': {
      // AI provides only the new element HTML; client stores it in screenInjections
      // (NOT customScreens) so screens stay in normal flow — notch stays above, home below.
      // Injected elements use position:absolute relative to .lab-phone-screen (below notch).
      if (action.html) {
        const exp = _experiments.find(e => e.id === resolvedExpId);
        if (exp) {
          if (!exp.screenInjections) exp.screenInjections = {};
          const screenCount = _labActiveScreens().length;
          const targets = Array.isArray(action.screens)
            ? action.screens
            : Array.from({ length: screenCount }, (_, i) => i);

          targets.forEach(idx => {
            // Accumulate injections per screen (append each new injection)
            exp.screenInjections[idx] = (exp.screenInjections[idx] || '') + action.html;
          });

          _labBuildStage();
          _labUpdateMeta();
        }
      }
      break;
    }

    case 'patchScreen': {
      // Surgical find-and-replace inside a single screen's HTML — no full rewrite needed.
      // Operates on the base screen HTML (customScreens or rendered), not on injections.
      if (action.index !== undefined && action.find !== undefined && action.replace !== undefined) {
        const activeExp = _experiments.find(e => e.id === resolvedExpId);
        if (activeExp) {
          // Get the base HTML for this screen (without injections)
          const baseScreens = activeExp.customScreens || _labActiveScreens();
          const screen = baseScreens[action.index];
          if (screen) {
            const newHtml = screen.html.split(action.find).join(action.replace);
            if (newHtml !== screen.html) {
              if (!activeExp.customScreens) _labEnsureCustomScreens(activeExp);
              activeExp.customScreens[action.index].html = newHtml;
              _labCurrent = action.index;
              if (_labExpanded) labCollapse();
              _labBuildStage();
              _labUpdateMeta();
            }
          }
        }
      }
      break;
    }

    case 'setScreen': {
      if (action.html !== undefined && action.index !== undefined) {
        const activeExp = _experiments.find(e => e.id === resolvedExpId);
        if (activeExp) {
          if (activeExp.customScreens) {
            // Update in-place on customScreens, mark as AI-written (full-bleed layout)
            if (activeExp.customScreens[action.index]) {
              activeExp.customScreens[action.index].html = action.html;
              activeExp.customScreens[action.index].aiWritten = true;
            }
          } else {
            if (!activeExp.screenOverrides) activeExp.screenOverrides = {};
            activeExp.screenOverrides[action.index] = action.html;
          }
          // Clear any prior injections for this screen (AI rewrote it from scratch)
          if (activeExp.screenInjections) delete activeExp.screenInjections[action.index];
          _labCurrent = Math.max(0, action.index);
          if (_labExpanded) labCollapse();

          // Animated screen reveal transition
          const existingCell = document.querySelector(`.lab-phone-cell[data-idx="${action.index}"]`);
          const existingScreen = existingCell?.querySelector('.lab-phone-screen');

          // Mark frame as generated so it gets full-bleed layout
          existingCell?.querySelector('.lab-phone-frame')?.classList.add('lab-phone-frame--generated');

          if (existingScreen) {
            // Capture old HTML for diff view
            const oldHtml = existingScreen.innerHTML;
            const activeExpForDiff = _experiments.find(e => e.id === resolvedExpId);
            if (activeExpForDiff) {
              const aiMsgs = activeExpForDiff.messages.filter(m => m.role === 'ai' && !m.thinking && !m.clarify);
              const lastAi = aiMsgs[aiMsgs.length - 1];
              if (lastAi) {
                if (!lastAi.diffs) lastAi.diffs = [];
                const diffId = 'diff_' + (++_diffIdCtr);
                const screens = _labActiveScreens();
                _diffStore[diffId] = { oldHtml, newHtml: action.html, label: screens[action.index]?.label || `Screen ${action.index + 1}` };
                lastAi.diffs.push(diffId);
              }
            }

            // Old layer sits underneath, dims as new reveals
            const oldLayer = document.createElement('div');
            oldLayer.className = 'lab-screen-layer lab-screen-layer--old';
            oldLayer.innerHTML = oldHtml;
            existingScreen.innerHTML = '';
            existingScreen.appendChild(oldLayer);

            // New layer clips from top — will be revealed by scan line
            const newLayer = document.createElement('div');
            newLayer.className = 'lab-screen-layer lab-screen-layer--new';
            newLayer.innerHTML = action.html;
            existingScreen.appendChild(newLayer);

            // White flash overlay
            const flash = document.createElement('div');
            flash.className = 'lab-flash';
            existingScreen.appendChild(flash);

            // Trigger reflow then start animations
            existingScreen.offsetHeight;
            oldLayer.classList.add('lab-screen-layer--old-exit');
            flash.classList.add('lab-flash--active');

            // New screen appears just after the flash peak
            setTimeout(() => newLayer.classList.add('lab-screen-layer--new-active'), 400);

            // Cleanup after longest animation finishes (flash 1200ms vs delay+appear 400+1000ms)
            setTimeout(() => {
              existingScreen.innerHTML = action.html;
              existingCell.classList.add('lab-phone-cell--modified');
              setTimeout(() => existingCell.classList.remove('lab-phone-cell--modified'), 2000);
            }, 1450);

            _labUpdateMeta();
          } else {
            _labBuildStage();
            _labUpdateMeta();
            requestAnimationFrame(() => {
              const cell = document.querySelector(`.lab-phone-cell[data-idx="${action.index}"]`);
              if (cell) {
                cell.classList.add('lab-phone-cell--modified');
                setTimeout(() => cell.classList.remove('lab-phone-cell--modified'), 2000);
              }
            });
          }
        }
      }
      break;
    }

    case 'resetScreens': {
      const activeExp = _experiments.find(e => e.id === resolvedExpId);
      if (activeExp) {
        activeExp.screenOverrides = {};
        activeExp.customScreens = null;
        activeExp.screenInjections = {};
      }
      _labBuildStage();
      _labUpdateMeta();
      break;
    }

    case 'clarify': {
      // Replace the last AI message with a clarification card
      const exp = _experiments.find(e => e.id === resolvedExpId);
      if (!exp) break;
      const lastMsg = exp.messages[exp.messages.length - 1];
      if (lastMsg?.role === 'ai') {
        lastMsg.clarify = {
          applyLabel:   action.applyLabel   || 'Apply to Original design',
          exploreLabel: action.exploreLabel || 'New design',
          originalText: lastMsg.text,
        };
      }
      labExpRenderMessages(exp);
      break;
    }

  }
}

// Called when user picks a clarification option
function labExpClarifyChoice(isExplore) {
  const exp = _experiments.find(e => e.id === _activeExpId);
  if (!exp) return;

  // Collapse the clarify card to plain text
  const clarifyMsg = exp.messages.find(m => m.clarify);
  if (clarifyMsg) { clarifyMsg.text = clarifyMsg.clarify.originalText; delete clarifyMsg.clarify; }

  // Find the original user request (the one before the clarify AI message)
  const userMessages = exp.messages.filter(m => m.role === 'user');
  const originalRequest = userMessages[userMessages.length - 1]?.text || '';

  if (isExplore) {
    // New experiment path — rebuild screens with full redesign
    exp.messages.push({ role: 'user', text: `Explore this as a new version: redesign all relevant screens to reflect "${originalRequest}". Use setScreen with complete new HTML for every screen.` });
  } else {
    // Apply to current version — tokens + CSS only, no setScreen
    exp.messages.push({ role: 'user', text: `Apply "${originalRequest}" to the current version using only setToken and injectCSS. Do NOT use setScreen. Keep all screen structures exactly as they are.` });
  }

  labExpRenderMessages(exp);
  _runExpResponse(exp);
}
