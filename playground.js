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
  document.getElementById('font-btn').value = 18;
  document.getElementById('font-btn-val').textContent = '18px';
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
    'title-back':      `<div style="height:44px;display:flex;align-items:center;justify-content:space-between"><button class="phone-nav-btn">${_BACK_SVG}</button><div style="flex:1;display:flex;justify-content:center"><span style="font-family:var(--font-button);font-size:17px;font-weight:600;color:var(--text-primary)">Take a selfie</span></div><div style="width:28px"></div></div>`,
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
    'title-back':      `<div style="height:36px;display:flex;align-items:center;padding:0 4px">${iconBtn(_BACK_SVG)}<div style="flex:1;display:flex;justify-content:center"><span style="font-family:var(--font-button);font-size:14px;font-weight:600;color:var(--text-primary)">Take a selfie</span></div>${spacer}</div>`,
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
    <div style="font-family:var(--font-button);font-size:24px;font-weight:700;line-height:27.6px;letter-spacing:-1px;color:var(--text-primary)">${d.h}</div>
    <div style="font-family:var(--font-button);font-size:16px;font-weight:500;line-height:18.4px;letter-spacing:-0.5px;color:var(--text-secondary)">${d.sub}</div>
  </div>`;
}

function renderTitlePreview(id) {
  const d = titleData[id]; if (!d) return '';
  return `<div style="padding:8px 12px;text-align:center">
    <div style="font-family:var(--font-family-dm);font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:3px">${d.h}</div>
    <div style="font-family:var(--font-family-dm);font-size:10px;font-weight:500;color:var(--text-secondary);line-height:1.4">${d.sub}</div>
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
  'ready':     `<span style="color:#fff;font-family:var(--font-button);font-size:var(--font-size-button-m);font-weight:500">Take photo</span>`,
  'retry':     `<span style="color:#fff;font-family:var(--font-button);font-size:var(--font-size-button-m);font-weight:500">Try again</span>`,
};

function renderCtaVariant(id) {
  const inner = ctaData[id]; if (!inner) return '';
  return `<button class="btn btn-primary" style="width:100%;height:56px;border-radius:var(--radius-button);display:flex;align-items:center;justify-content:center;gap:8px">${inner}</button>`;
}

function renderCtaPreview(id) {
  const inner = ctaData[id]; if (!inner) return '';
  return `<div style="padding:8px 12px">
    <div style="height:36px;border-radius:var(--radius-button);background:var(--color-brand-500);display:flex;align-items:center;justify-content:center;gap:8px">${inner}</div>
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
