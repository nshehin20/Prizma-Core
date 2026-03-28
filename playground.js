// ============================================
//  PRIZMA PLAYGROUND — Token Editor
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

  // Reset color pickers
  document.getElementById('brand-500').value = '#006aff';
  document.getElementById('brand-500-hex').value = '#006aff';
  document.getElementById('brand-400').value = '#3388ff';
  document.getElementById('brand-400-hex').value = '#3388ff';
  document.getElementById('brand-600').value = '#0055cc';
  document.getElementById('brand-600-hex').value = '#0055cc';
  document.getElementById('text-primary').value = '#262831';
  document.getElementById('text-primary-hex').value = '#262831';
  document.getElementById('text-secondary').value = '#60667c';
  document.getElementById('text-secondary-hex').value = '#60667c';
  document.getElementById('surface-bg').value = '#ffffff';
  document.getElementById('surface-bg-hex').value = '#ffffff';

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
    '--surface-bg':    '#ffffff',
    '--text-primary':  '#262831',
    '--text-secondary':'#60667c',
    '--logo-color':    null,
  },
  dark: {
    '--surface-bg':    '#14151a',
    '--text-primary':  '#fcfcfd',
    '--text-secondary':'#a3a8b8',
    '--logo-color':    '#ffffff',
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

const _NAV_BTN_STYLE = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--text-primary);flex-shrink:0;transform:scale(0.75);transform-origin:center';

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
    <div class="type-h2" style="color:var(--text-primary)">${d.h}</div>
    <div class="type-body-m-regular" style="color:var(--text-secondary)">${d.sub}</div>
  </div>`;
}

function renderTitlePreview(id) {
  const d = titleData[id]; if (!d) return '';
  return `<div style="padding:8px 12px;text-align:center;transform:scale(0.5);transform-origin:top center;white-space:nowrap;overflow:hidden">
    <div class="type-h2" style="color:var(--text-primary)">${d.h}</div>
    <div class="type-body-m-regular" style="color:var(--text-secondary);margin-top:6px">${d.sub}</div>
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

// DS: .tag-verified component — matches component tab exactly
const _TAG_LOGO_SVG = `<svg class="tag-verified__logo" width="44" height="12" viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M79.4916 22.4404C78.0238 22.4404 76.7418 22.1468 75.6458 21.5597C74.5498 20.953 73.6985 20.0722 73.0918 18.9175C72.4851 17.7628 72.1817 16.3732 72.1817 14.7488C72.1817 12.1654 72.7982 10.1984 74.0312 8.84801C75.2838 7.47801 77.0354 6.79301 79.2861 6.79301C80.9106 6.79301 82.2121 7.14529 83.1906 7.84987C84.1888 8.55444 84.9129 9.56237 85.3631 10.8737C85.8328 12.1654 86.0578 13.7115 86.0383 15.5121H74.589L74.2954 12.9874H83.0732L82.3686 14.0442C82.3295 12.4981 82.0555 11.3923 81.5466 10.7269C81.0573 10.0419 80.2647 9.69937 79.1687 9.69937C78.5033 9.69937 77.9161 9.85594 77.4073 10.1691C76.918 10.4627 76.5363 10.9617 76.2623 11.6663C76.0079 12.3709 75.8807 13.3397 75.8807 14.5727C75.8807 16.0992 76.2428 17.2735 76.9669 18.0955C77.6911 18.8979 78.7968 19.2992 80.2843 19.2992C80.891 19.2992 81.4683 19.2404 82.0163 19.123C82.5839 18.986 83.1026 18.8294 83.5723 18.6533C84.0616 18.4772 84.4726 18.3108 84.8053 18.1542V21.4422C84.1203 21.7358 83.3374 21.9707 82.4567 22.1468C81.5956 22.3425 80.6072 22.4404 79.4916 22.4404Z" fill="var(--logo-color)"/><path d="M62.8555 22.4404C61.8378 22.4404 60.869 22.323 59.9492 22.0881C59.0293 21.8532 58.2171 21.4422 57.5125 20.8551C56.8079 20.268 56.2501 19.4557 55.8391 18.4184C55.4477 17.3812 55.252 16.0601 55.252 14.4552C55.252 12.0871 55.8294 10.218 56.9841 8.84801C58.1388 7.47801 59.8904 6.79301 62.239 6.79301C62.5717 6.79301 63.0023 6.83215 63.5307 6.91044C64.0592 6.98872 64.5974 7.12572 65.1454 7.32144C65.7129 7.49758 66.2022 7.78137 66.6132 8.1728L65.7912 9.34708V1.06836H69.4609V18.5359C69.4609 19.2013 69.2652 19.7787 68.8737 20.268C68.5019 20.7572 67.993 21.1682 67.3472 21.501C66.7013 21.8141 65.9869 22.049 65.2041 22.2055C64.4212 22.3621 63.6384 22.4404 62.8555 22.4404ZM62.9729 19.2698C63.7754 19.2698 64.4408 19.1719 64.9692 18.9762C65.5172 18.7805 65.7912 18.4967 65.7912 18.1249V10.6094C65.3607 10.355 64.9007 10.1691 64.4114 10.0517C63.9222 9.93423 63.4524 9.87551 63.0023 9.87551C62.102 9.87551 61.3583 10.0419 60.7712 10.3746C60.184 10.6877 59.7437 11.1966 59.4501 11.9012C59.1565 12.5862 59.0097 13.4669 59.0097 14.5433C59.0097 15.4827 59.1272 16.3047 59.362 17.0093C59.5969 17.7139 59.9981 18.2717 60.5657 18.6827C61.1528 19.0741 61.9552 19.2698 62.9729 19.2698Z" fill="var(--logo-color)"/><path d="M45.9756 22.4404C43.5487 22.4404 41.7286 21.7652 40.5152 20.4147C39.3017 19.0643 38.695 17.1169 38.695 14.5727C38.695 11.8522 39.3115 9.87551 40.5445 8.64251C41.7971 7.40951 43.5977 6.79301 45.9462 6.79301C47.5902 6.79301 48.9602 7.08658 50.0562 7.67372C51.1522 8.2413 51.9645 9.10244 52.4929 10.2572C53.0409 11.4119 53.3149 12.8504 53.3149 14.5727C53.3149 17.1169 52.6788 19.0643 51.4067 20.4147C50.1541 21.7652 48.3437 22.4404 45.9756 22.4404ZM45.9756 19.3872C46.8367 19.3872 47.5315 19.1915 48.06 18.8001C48.608 18.4087 49.0092 17.8607 49.2636 17.1561C49.518 16.4319 49.6452 15.5708 49.6452 14.5727C49.6452 13.4571 49.5082 12.547 49.2342 11.8424C48.9798 11.1379 48.5786 10.6192 48.0306 10.2865C47.5022 9.9538 46.8172 9.78744 45.9756 9.78744C45.1145 9.78744 44.4197 9.96358 43.8912 10.3159C43.3628 10.6682 42.9714 11.1966 42.717 11.9012C42.4821 12.6057 42.3647 13.4962 42.3647 14.5727C42.3647 16.1384 42.6485 17.3322 43.216 18.1542C43.7836 18.9762 44.7035 19.3872 45.9756 19.3872Z" fill="var(--logo-color)"/><path d="M32.1477 22.323C31.1691 22.323 30.2297 22.186 29.3294 21.912C28.4291 21.638 27.6267 21.1976 26.9221 20.5909C26.2175 19.9842 25.6597 19.2013 25.2487 18.2423C24.8377 17.2833 24.6322 16.1188 24.6322 14.7488C24.6322 13.3201 24.828 12.1067 25.2194 11.1085C25.6108 10.1104 26.149 9.29815 26.834 8.67187C27.519 8.02601 28.3117 7.56608 29.212 7.29208C30.1318 6.99851 31.1006 6.85172 32.1183 6.85172C32.9012 6.85172 33.7036 6.93001 34.5256 7.08658C35.3476 7.24315 36.0815 7.46822 36.7274 7.7618V10.9911C36.062 10.6975 35.3965 10.4627 34.7311 10.2865C34.0657 10.0908 33.3807 9.99294 32.6761 9.99294C31.3061 9.99294 30.2395 10.3354 29.4762 11.0204C28.7129 11.7054 28.3313 12.8308 28.3313 14.3965C28.3313 16.0014 28.6738 17.1952 29.3588 17.9781C30.0633 18.7609 31.218 19.1524 32.8229 19.1524C33.547 19.1524 34.2516 19.0447 34.9366 18.8294C35.6216 18.5946 36.2283 18.3402 36.7568 18.0662V21.3248C36.0718 21.6575 35.3574 21.9022 34.6137 22.0587C33.87 22.2349 33.048 22.323 32.1477 22.323Z" fill="var(--logo-color)"/><path d="M8.49521 8.43701C8.90621 8.2413 9.3955 8.04558 9.96307 7.84987C10.5306 7.65415 11.1471 7.4878 11.8126 7.3508C12.478 7.19422 13.1434 7.07679 13.8089 6.99851C14.4939 6.90065 15.1397 6.85172 15.7464 6.85172C17.1164 6.85172 18.2516 7.03765 19.1519 7.40951C20.0717 7.76179 20.7567 8.32937 21.2069 9.11222C21.6766 9.87551 21.9114 10.8834 21.9114 12.136V22H18.2124V12.7819C18.2124 12.41 18.1635 12.0577 18.0656 11.725C17.9678 11.3727 17.8014 11.0694 17.5666 10.8149C17.3317 10.5409 17.0088 10.3354 16.5978 10.1984C16.1868 10.0419 15.6584 9.96358 15.0125 9.96358C14.5232 9.96358 14.0241 10.0125 13.5153 10.1104C13.0064 10.2082 12.5759 10.3354 12.2236 10.492V22H8.49521V8.43701Z" fill="var(--logo-color)"/><path d="M1.14307 22V7.3508H4.87143L4.90079 22H1.14307ZM1.055 5.00222V1.94908H4.9595V5.00222H1.055Z" fill="var(--logo-color)"/></svg>`;

function _verifiedTag() {
  return `<div class="tag-verified" style="justify-content:center">
    ${_VERIFIED_SVG}
    <span class="tag-verified__text">verified by</span>${_TAG_LOGO_SVG}
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

// ---- Face Capture screens ----

function fcTutorial() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px;gap:16px;min-height:0">
    <div style="display:flex;flex-direction:column;gap:24px">
      ${_navBar('logo-only')}
      <div style="display:flex;flex-direction:column;gap:12px;text-align:center;padding:16px 0">
        <div class="type-h2" style="color:var(--text-primary)">Take a selfie</div>
        <div class="type-body-m-regular" style="color:var(--text-secondary)">Keep a neutral expression, find balanced light and remove any glasses and hats</div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center">
      <img src="assets/illustrations/selfie/selfie-animated.svg" style="width:296px;height:296px;object-fit:contain" alt="Selfie illustration" />
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="type-body-m-regular" style="padding:12px 0;text-align:center;color:var(--text-secondary)">The photo will be taken automatically</div>
      <button class="btn btn-primary btn-full">Take photo</button>
      <div style="display:flex;justify-content:center;height:34px;align-items:center">
        ${_verifiedTag()}
      </div>
    </div>
  </div>`;
}

/// selfie ring frame + empty camera inside (searching state)
function fcCamSearching() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px;background:var(--surface-bg)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        <img src="assets/illustrations/selfie-ring.svg" style="position:absolute;inset:0;width:342px;height:342px" alt="" />
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Align your face within the silhouette and look at the camera</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// selfie ring frame + DS selfie filled photo (face detected)
function fcCamDetected() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px;background:var(--surface-bg)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        <img src="assets/illustrations/selfie-ring.svg" style="position:absolute;inset:0;width:342px;height:342px" alt="" />
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Align your face within the silhouette and look at the camera</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// selfie ring spinning (DS ring SVG itself rotates) + DS selfie filled photo stationary
function fcCamCapturing() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px;background:var(--surface-bg)">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 0">
      <div style="position:relative;width:342px;height:342px;flex-shrink:0">
        <img src="assets/illustrations/selfie-ring.svg" style="position:absolute;inset:0;width:342px;height:342px;animation:prizma-spin 2s linear infinite;transform-origin:171px 171px;will-change:transform;transform:translateZ(0)" alt="" />
        <div style="position:absolute;top:22px;left:22px;width:298px;height:298px;border-radius:50%;overflow:hidden">
          <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
        </div>
      </div>
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center;width:100%;height:80px;display:flex;align-items:center;justify-content:center">Get ready...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// DS: .loading-spinner (64px, defined in components.css)
function fcProcessing() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div class="loading-spinner"></div>
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center">Processing...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

function fcUploading() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div class="loading-spinner"></div>
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center">Uploading...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

function fcSuccess() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
      <img src="assets/icons/status/Status-42.svg" width="56" height="56" alt="Positive" />
      <div class="type-feedback-l" style="color:var(--text-primary);text-align:center">Success!</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// ---- Selfie Capture screens (Auto-Capture Version) ----

// Current selfie capture version
let _scVersion = 'v1';

function setScVersion(version) {
  _scVersion = version;
  // Re-render the current module if it's selfie-capture
  const activeTab = document.querySelector('.module-tab.active');
  if (activeTab && activeTab.textContent.includes('Selfie')) {
    renderModuleCanvas('selfie-capture');
  }
  // Update lab view if active
  if (_labActiveModule === 'selfie-capture') {
    labRenderScreens();
  }
}

// ---- ORIGINAL VERSION (Oval-based) ----

function _ovalFrame(state = 'searching') {
  const colors = {
    searching: { stroke: 'var(--color-gray-300)', dash: '8 4' },
    detected: { stroke: 'var(--color-brand-500)', dash: 'none' },
    capturing: { stroke: 'var(--color-brand-400)', dash: 'none' },
    verifying: { stroke: 'var(--color-brand-400)', dash: '12 6' },
    success: { stroke: 'var(--color-positive-500)', dash: 'none' },
    error: { stroke: 'var(--color-negative-500)', dash: 'none' }
  };
  const c = colors[state] || colors.searching;
  const pulseClass = state === 'capturing' ? 'sc-oval-pulse' : '';
  const rotateClass = state === 'verifying' ? 'sc-oval-rotate' : '';
  
  return `<div class="sc-oval-overlay">
    <svg viewBox="0 0 342 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="ovalMask-${state}">
          <rect width="342" height="420" fill="white"/>
          <ellipse cx="171" cy="210" rx="130" ry="170" fill="black"/>
        </mask>
      </defs>
      <rect width="342" height="420" fill="rgba(0,0,0,0.5)" mask="url(#ovalMask-${state})"/>
      <ellipse cx="171" cy="210" rx="130" ry="170" stroke="${c.stroke}" stroke-width="${state === 'capturing' ? 5 : 3}" fill="none" 
        ${c.dash !== 'none' ? `stroke-dasharray="${c.dash}"` : ''} 
        class="${pulseClass} ${rotateClass}"/>
    </svg>
  </div>`;
}

// Original screens (oval-based)
function scOrigSearching() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.9)" alt="" />
    </div>
    ${_ovalFrame('searching')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-dot sc-status-dot--searching"></div>
        <span class="type-feedback-s" style="color:var(--color-gray-0)">Looking for face...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Position your face within the oval</div>
    </div>
  </div>`;
}

function scOrigDetected() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_ovalFrame('detected')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-dot sc-status-dot--detected"></div>
        <span class="type-feedback-s" style="color:var(--color-brand-400)">Face detected</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Hold steady, capturing automatically...</div>
      <div class="sc-auto-progress">
        <div class="sc-auto-progress-bar"></div>
      </div>
    </div>
  </div>`;
}

function scOrigCapturing() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_ovalFrame('capturing')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-spinner"></div>
        <span class="type-feedback-s" style="color:var(--color-brand-300)">Capturing...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Please don't move</div>
    </div>
  </div>`;
}

function scOrigVerifying() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_ovalFrame('verifying')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-spinner"></div>
        <span class="type-feedback-s" style="color:var(--color-gray-0)">Verifying...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Checking image quality</div>
    </div>
  </div>`;
}

function scOrigSuccess() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_ovalFrame('success')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-check">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="var(--color-positive-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="type-feedback-s" style="color:var(--color-positive-500)">Capture complete</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Your selfie has been captured successfully</div>
    </div>
  </div>`;
}

function scOrigError() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7)" alt="" />
    </div>
    ${_ovalFrame('error')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9" stroke="var(--color-negative-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="type-feedback-s" style="color:var(--color-negative-500)">Face not detected</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Make sure your face is clearly visible</div>
      <div class="sc-retry-hint type-body-xs-regular" style="color:var(--color-gray-400);margin-top:8px">Retrying automatically...</div>
    </div>
  </div>`;
}

// ---- V1 VERSION (Corner brackets with scan line) ----

// Reusable face frame SVG with corner brackets and scan effect
function _faceFrame(state = 'searching') {
  const colors = {
    searching: { stroke: 'rgba(255,255,255,0.5)', glow: 'transparent' },
    detected: { stroke: 'var(--color-brand-500)', glow: 'var(--color-brand-500)' },
    capturing: { stroke: 'var(--color-brand-400)', glow: 'var(--color-brand-400)' },
    verifying: { stroke: 'var(--color-brand-400)', glow: 'var(--color-brand-400)' },
    success: { stroke: 'var(--color-positive-500)', glow: 'var(--color-positive-500)' },
    error: { stroke: 'var(--color-negative-500)', glow: 'var(--color-negative-500)' }
  };
  const c = colors[state] || colors.searching;
  const scanClass = state === 'searching' ? 'sc-scan-line sc-scan-line--searching' : 
                    state === 'detected' ? 'sc-scan-line sc-scan-line--detected' :
                    state === 'capturing' ? 'sc-scan-line sc-scan-line--capturing' : '';
  const cornerClass = state === 'detected' || state === 'capturing' ? 'sc-corner--active' : 
                      state === 'success' ? 'sc-corner--success' : 
                      state === 'error' ? 'sc-corner--error' : '';
  
  return `<div class="sc-frame-container">
    <div class="sc-vignette"></div>
    <div class="sc-frame ${state === 'capturing' ? 'sc-frame--pulse' : ''}" style="--frame-color: ${c.stroke}; --frame-glow: ${c.glow}">
      <!-- Corner brackets -->
      <div class="sc-corner sc-corner--tl ${cornerClass}"></div>
      <div class="sc-corner sc-corner--tr ${cornerClass}"></div>
      <div class="sc-corner sc-corner--bl ${cornerClass}"></div>
      <div class="sc-corner sc-corner--br ${cornerClass}"></div>
      <!-- Center reticle -->
      <div class="sc-reticle ${state !== 'searching' ? 'sc-reticle--hidden' : ''}">
        <div class="sc-reticle-h"></div>
        <div class="sc-reticle-v"></div>
      </div>
      <!-- Scan line -->
      ${scanClass ? `<div class="${scanClass}"></div>` : ''}
      <!-- Face detection points -->
      ${state === 'detected' || state === 'capturing' || state === 'verifying' ? `
      <div class="sc-detection-points">
        <div class="sc-point sc-point--1"></div>
        <div class="sc-point sc-point--2"></div>
        <div class="sc-point sc-point--3"></div>
        <div class="sc-point sc-point--4"></div>
        <div class="sc-point sc-point--5"></div>
      </div>` : ''}
    </div>
  </div>`;
}

// Fullscreen camera view - searching for face (no face detected yet)
function scCamSearching() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_faceFrame('searching')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-dot sc-status-dot--searching"></div>
        <span class="type-feedback-s" style="color:var(--color-gray-0)">Looking for face...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Position your face in the frame</div>
    </div>
  </div>`;
}

// Fullscreen camera view - face detected, aligning
function scCamDetected() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_faceFrame('detected')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-dot sc-status-dot--detected"></div>
        <span class="type-feedback-s" style="color:var(--color-brand-400)">Face detected</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Hold steady, capturing automatically...</div>
      <div class="sc-auto-progress">
        <div class="sc-auto-progress-bar"></div>
      </div>
    </div>
  </div>`;
}

// Fullscreen camera view - auto capturing in progress
function scCamCapturing() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_faceFrame('capturing')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-spinner"></div>
        <span class="type-feedback-s" style="color:var(--color-brand-300)">Capturing...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Please don't move</div>
    </div>
  </div>`;
}

// Verifying/processing the captured selfie
function scVerifying() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_faceFrame('verifying')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-spinner"></div>
        <span class="type-feedback-s" style="color:var(--color-gray-0)">Verifying...</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Checking image quality</div>
    </div>
  </div>`;
}

// Success state - face verified
function scSuccess() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-filled-ds.png" style="width:100%;height:100%;object-fit:cover" alt="" />
    </div>
    ${_faceFrame('success')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-check">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="var(--color-positive-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="type-feedback-s" style="color:var(--color-positive-500)">Capture complete</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Your selfie has been captured successfully</div>
    </div>
  </div>`;
}

// Error state - face not detected or quality issue
function scError() {
  return `<div class="sc-fullscreen-cam">
    <div class="sc-cam-bg">
      <img src="assets/images/selfie-empty.png" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.8)" alt="" />
    </div>
    ${_faceFrame('error')}
    <div class="sc-top-bar">
      <button class="sc-close-btn">${_CLOSE_SVG2}</button>
    </div>
    <div class="sc-bottom-panel sc-bottom-panel--auto">
      <div class="sc-status-indicator">
        <div class="sc-status-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9" stroke="var(--color-negative-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="type-feedback-s" style="color:var(--color-negative-500)">Face not detected</span>
      </div>
      <div class="sc-instruction type-body-s-regular" style="color:var(--color-gray-300)">Make sure your face is clearly visible</div>
      <div class="sc-retry-hint type-body-xs-regular" style="color:var(--color-gray-400);margin-top:8px">Retrying automatically...</div>
    </div>
  </div>`;
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
  'selfie-capture': {
    label: 'Selfie Capture',
    hasVersions: true,
    versions: ['Original', 'v1'],
    get screens() {
      return _scVersion === 'Original' ? [
        { id: 'sc-searching',  label: 'Searching',  render: scOrigSearching },
        { id: 'sc-detected',   label: 'Detected',   render: scOrigDetected },
        { id: 'sc-capturing',  label: 'Capturing',  render: scOrigCapturing },
        { id: 'sc-verifying',  label: 'Verifying',  render: scOrigVerifying },
        { id: 'sc-success',    label: 'Success',    render: scOrigSuccess },
        { id: 'sc-error',      label: 'Error',      render: scOrigError },
      ] : [
        { id: 'sc-searching',  label: 'Searching',  render: scCamSearching },
        { id: 'sc-detected',   label: 'Detected',   render: scCamDetected },
        { id: 'sc-capturing',  label: 'Capturing',  render: scCamCapturing },
        { id: 'sc-verifying',  label: 'Verifying',  render: scVerifying },
        { id: 'sc-success',    label: 'Success',    render: scSuccess },
        { id: 'sc-error',      label: 'Error',      render: scError },
      ];
    }
  },
  'id-capture':       { label: 'ID Capture',      screens: [] },
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
  const versionBar = document.getElementById('module-version-bar');
  
  // Handle version dropdown
  if (versionBar) {
    if (mod && mod.hasVersions) {
      const currentVersion = moduleId === 'selfie-capture' ? _scVersion : 'v1';
      versionBar.innerHTML = `
        <div class="version-selector">
          <label class="type-body-xs-medium" style="color:var(--color-gray-500)">Version</label>
          <select class="version-dropdown" onchange="setScVersion(this.value)">
            ${mod.versions.map(v => `<option value="${v}" ${v === currentVersion ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      `;
      versionBar.style.display = 'flex';
    } else {
      versionBar.innerHTML = '';
      versionBar.style.display = 'none';
    }
  }
  
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
let _labActiveModule = 'face-capture';

const _LAB_PHONE_W = 273;  // 390 × 0.70
const _LAB_PHONE_H = 591;  // 844 × 0.70
const _LAB_CELL_GAP = 36;

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
  'selfie-capture': {
    label: 'Selfie Capture',
    hasVersions: true,
    versions: ['Original', 'v1'],
    get screens() {
      return _scVersion === 'Original' ? [
        { label: 'Searching',  render: scOrigSearching },
        { label: 'Detected',   render: scOrigDetected },
        { label: 'Capturing',  render: scOrigCapturing },
        { label: 'Verifying',  render: scOrigVerifying },
        { label: 'Success',    render: scOrigSuccess },
        { label: 'Error',      render: scOrigError },
      ] : [
        { label: 'Searching',  render: scCamSearching },
        { label: 'Detected',   render: scCamDetected },
        { label: 'Capturing',  render: scCamCapturing },
        { label: 'Verifying',  render: scVerifying },
        { label: 'Success',    render: scSuccess },
        { label: 'Error',      render: scError },
      ];
    }
  },
  'id-capture':  { label: 'ID Capture',       screens: [] },
  'nfc':         { label: 'NFC',               screens: [] },
  'doc-capture': { label: 'Document Capture',  screens: [] },
};

// ---- init ----

function initLab() {
  if (_labInit) return;
  _labInit = true;

  _labSetupInteraction();

  document.addEventListener('keydown', e => {
    if (!document.getElementById('view-lab')?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  { if (!_labExpanded) labNav(-1); }
    if (e.key === 'ArrowRight') { if (!_labExpanded) labNav(1); }
    if (e.key === 'Escape')     labCollapse();
  });

  _labBuildStage();
  _labUpdateMeta();
  _labCenterReset(false);
}

// ---- module selection ----

function labSelectModule(btn) {
  const id  = btn.dataset.module;
  const mod = _labModuleData[id];
  if (!mod || !mod.screens.length) return;

  document.querySelectorAll('.lab-sidebar-item').forEach(b => b.classList.remove('lab-sidebar-item--active'));
  btn.classList.add('lab-sidebar-item--active');

  _labActiveModule = id;
  _labCurrent = 0;
  _labExpanded = false;

  const vp = document.getElementById('lab-canvas-vp');
  if (vp) vp.classList.remove('lab-expanded');

  const btn2 = document.getElementById('lab-expand-btn');
  const lbl  = document.getElementById('lab-expand-label');
  if (btn2) btn2.classList.remove('lab-expand-btn--active');
  if (lbl)  lbl.textContent = 'EXPAND';

  document.getElementById('lab-bar-module').textContent = mod.label.toUpperCase();

  _labBuildStage();
  _labUpdateMeta();
  _labCenterReset(false);
}

// ---- build stage ----

function _labBuildStage() {
  const stage = document.getElementById('lab-stage');
  if (!stage) return;
  const mod = _labModuleData[_labActiveModule];
  const src = _labStatusSrc();

  stage.innerHTML = mod.screens.map((s, i) => `
    <div class="lab-phone-cell" data-idx="${i}" onclick="_labCellClick(${i})">
      <div class="lab-phone-index-lbl">${String(i+1).padStart(2,'0')}</div>
      <div class="lab-phone-frame">
        <div class="lab-phone-notch">
          <img class="lab-status-img" src="${src}" width="390" height="54" style="display:block;width:100%" alt=""/>
        </div>
        <div class="lab-phone-screen">${s.render()}</div>
        <div class="lab-phone-home"></div>
      </div>
      <div class="lab-phone-name-lbl">${s.label.toUpperCase()}</div>
    </div>`).join('');

  _labApplyCellPositions(false);
}

function _labCellClick(i) {
  if (!_labExpanded) return;
  _labCurrent = i;
  labCollapse();
}

// ---- cell positions ----

function _labApplyCellPositions(animated) {
  const stage = document.getElementById('lab-stage');
  if (!stage) return;
  const cells = [...stage.querySelectorAll('.lab-phone-cell')];
  const step  = _LAB_PHONE_W + _LAB_CELL_GAP;

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

    cell.classList.toggle('lab-phone-cell--current', i === _labCurrent && _labExpanded);
    cell.classList.toggle('lab-phone-cell--clickable', _labExpanded);

    if (_labExpanded) {
      const dx = (i - _labCurrent) * step;
      cell.style.transform  = `translateX(${dx}px)`;
      cell.style.opacity    = '1';
      cell.style.zIndex     = i === _labCurrent ? '2' : '1';
      cell.style.pointerEvents = 'auto';
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
  const screens = _labModuleData[_labActiveModule].screens;
  const next = _labCurrent + dir;
  if (next < 0 || next >= screens.length) return;
  _labCurrent = next;
  _labApplyCellPositions(true);
  _labUpdateMeta();
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
  if (lbl) lbl.textContent = 'COLLAPSE';

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
  if (lbl) lbl.textContent = 'EXPAND';

  _labApplyCellPositions(true);
  _labCenterReset(true);
  _labUpdateMeta();
}

// ---- meta / UI ----

function _labUpdateMeta() {
  const mod     = _labModuleData[_labActiveModule];
  const screens = mod.screens;
  if (!screens.length) return;

  const screen = screens[_labCurrent];
  const idx    = String(_labCurrent + 1).padStart(2, '0');
  const tot    = String(screens.length).padStart(2, '0');

  const metaEl = document.getElementById('lab-bar-meta');
  if (metaEl) metaEl.textContent = `${idx} / ${tot} · ${screen.label.toUpperCase()}`;

  const siEl = document.getElementById('lab-screen-index');
  const slEl = document.getElementById('lab-screen-label');
  if (siEl) siEl.textContent = `${idx} / ${tot}`;
  if (slEl) slEl.textContent = screen.label.toUpperCase();

  const prev = document.getElementById('lab-arrow-prev');
  const next = document.getElementById('lab-arrow-next');
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

  if (_labExpanded) {
    const screens = _labModuleData[_labActiveModule].screens;
    const totalW  = screens.length * (_LAB_PHONE_W + _LAB_CELL_GAP) - _LAB_CELL_GAP;
    // fit all phones with padding; zoom so they fill ~85% of width
    const targetZoom = Math.min(1.5, (W * 1.2) / totalW);
    _labZoom = Math.max(0.28, targetZoom);
  } else {
    _labZoom = 1.0;
  }

  // center the stage (273×591 in content coords) in the viewport
  // with transform-origin 0 0: content at (cx, cy) maps to (cx*z + panX, cy*z + panY)
  // stage natural center in content space ≈ (W/2, H/2) (because of flex centering)
  // we need it to stay at (W/2, H/2) in screen space → panX = W/2*(1-z), panY = H/2*(1-z)
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

function _labSetupInteraction() {
  const vp = document.getElementById('lab-canvas-vp');
  if (!vp) return;

  vp.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (!_labExpanded) return;
    if (e.target.closest('.lab-arrow, .lab-zoom-bar, .lab-expand-btn, .lab-sidebar-item')) return;
    _labDragging = true;
    _labDragOrigin = { x: e.clientX - _labPan.x, y: e.clientY - _labPan.y };
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!_labDragging) return;
    _labPan.x = e.clientX - _labDragOrigin.x;
    _labPan.y = e.clientY - _labDragOrigin.y;
    _labApplyTransform();
  });

  document.addEventListener('mouseup', () => { _labDragging = false; });

  vp.addEventListener('wheel', e => {
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

// Lab is the default view — init after all lab code is defined
initLab();
