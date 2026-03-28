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

// ============================================
//  MODULES — Design System module explorer
// ============================================

// ---- Shared SVG constants (DS assets) ----

const _LOGO_SVG = `<svg width="77" height="21" viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M79.4916 22.4404C78.0238 22.4404 76.7418 22.1468 75.6458 21.5597C74.5498 20.953 73.6985 20.0722 73.0918 18.9175C72.4851 17.7628 72.1817 16.3732 72.1817 14.7488C72.1817 12.1654 72.7982 10.1984 74.0312 8.84801C75.2838 7.47801 77.0354 6.79301 79.2861 6.79301C80.9106 6.79301 82.2121 7.14529 83.1906 7.84987C84.1888 8.55444 84.9129 9.56237 85.3631 10.8737C85.8328 12.1654 86.0578 13.7115 86.0383 15.5121H74.589L74.2954 12.9874H83.0732L82.3686 14.0442C82.3295 12.4981 82.0555 11.3923 81.5466 10.7269C81.0573 10.0419 80.2647 9.69937 79.1687 9.69937C78.5033 9.69937 77.9161 9.85594 77.4073 10.1691C76.918 10.4627 76.5363 10.9617 76.2623 11.6663C76.0079 12.3709 75.8807 13.3397 75.8807 14.5727C75.8807 16.0992 76.2428 17.2735 76.9669 18.0955C77.6911 18.8979 78.7968 19.2992 80.2843 19.2992C80.891 19.2992 81.4683 19.2404 82.0163 19.123C82.5839 18.986 83.1026 18.8294 83.5723 18.6533C84.0616 18.4772 84.4726 18.3108 84.8053 18.1542V21.4422C84.1203 21.7358 83.3374 21.9707 82.4567 22.1468C81.5956 22.3425 80.6072 22.4404 79.4916 22.4404Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M62.8555 22.4404C61.8378 22.4404 60.869 22.323 59.9492 22.0881C59.0293 21.8532 58.2171 21.4422 57.5125 20.8551C56.8079 20.268 56.2501 19.4557 55.8391 18.4184C55.4477 17.3812 55.252 16.0601 55.252 14.4552C55.252 12.0871 55.8294 10.218 56.9841 8.84801C58.1388 7.47801 59.8904 6.79301 62.239 6.79301C62.5717 6.79301 63.0023 6.83215 63.5307 6.91044C64.0592 6.98872 64.5974 7.12572 65.1454 7.32144C65.7129 7.49758 66.2022 7.78137 66.6132 8.1728L65.7912 9.34708V1.06836H69.4609V18.5359C69.4609 19.2013 69.2652 19.7787 68.8737 20.268C68.5019 20.7572 67.993 21.1682 67.3472 21.501C66.7013 21.8141 65.9869 22.049 65.2041 22.2055C64.4212 22.3621 63.6384 22.4404 62.8555 22.4404ZM62.9729 19.2698C63.7754 19.2698 64.4408 19.1719 64.9692 18.9762C65.5172 18.7805 65.7912 18.4967 65.7912 18.1249V10.6094C65.3607 10.355 64.9007 10.1691 64.4114 10.0517C63.9222 9.93423 63.4524 9.87551 63.0023 9.87551C62.102 9.87551 61.3583 10.0419 60.7712 10.3746C60.184 10.6877 59.7437 11.1966 59.4501 11.9012C59.1565 12.5862 59.0097 13.4669 59.0097 14.5433C59.0097 15.4827 59.1272 16.3047 59.362 17.0093C59.5969 17.7139 59.9981 18.2717 60.5657 18.6827C61.1528 19.0741 61.9552 19.2698 62.9729 19.2698Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M45.9756 22.4404C43.5487 22.4404 41.7286 21.7652 40.5152 20.4147C39.3017 19.0643 38.695 17.1169 38.695 14.5727C38.695 11.8522 39.3115 9.87551 40.5445 8.64251C41.7971 7.40951 43.5977 6.79301 45.9462 6.79301C47.5902 6.79301 48.9602 7.08658 50.0562 7.67372C51.1522 8.2413 51.9645 9.10244 52.4929 10.2572C53.0409 11.4119 53.3149 12.8504 53.3149 14.5727C53.3149 17.1169 52.6788 19.0643 51.4067 20.4147C50.1541 21.7652 48.3437 22.4404 45.9756 22.4404ZM45.9756 19.3872C46.8367 19.3872 47.5315 19.1915 48.06 18.8001C48.608 18.4087 49.0092 17.8607 49.2636 17.1561C49.518 16.4319 49.6452 15.5708 49.6452 14.5727C49.6452 13.4571 49.5082 12.547 49.2342 11.8424C48.9798 11.1379 48.5786 10.6192 48.0306 10.2865C47.5022 9.9538 46.8172 9.78744 45.9756 9.78744C45.1145 9.78744 44.4197 9.96358 43.8912 10.3159C43.3628 10.6682 42.9714 11.1966 42.717 11.9012C42.4821 12.6057 42.3647 13.4962 42.3647 14.5727C42.3647 16.1384 42.6485 17.3322 43.216 18.1542C43.7836 18.9762 44.7035 19.3872 45.9756 19.3872Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M32.1477 22.323C31.1691 22.323 30.2297 22.186 29.3294 21.912C28.4291 21.638 27.6267 21.1976 26.9221 20.5909C26.2175 19.9842 25.6597 19.2013 25.2487 18.2423C24.8377 17.2833 24.6322 16.1188 24.6322 14.7488C24.6322 13.3201 24.828 12.1067 25.2194 11.1085C25.6108 10.1104 26.149 9.29815 26.834 8.67187C27.519 8.02601 28.3117 7.56608 29.212 7.29208C30.1318 6.99851 31.1006 6.85172 32.1183 6.85172C32.9012 6.85172 33.7036 6.93001 34.5256 7.08658C35.3476 7.24315 36.0815 7.46822 36.7274 7.7618V10.9911C36.062 10.6975 35.3965 10.4627 34.7311 10.2865C34.0657 10.0908 33.3807 9.99294 32.6761 9.99294C31.3061 9.99294 30.2395 10.3354 29.4762 11.0204C28.7129 11.7054 28.3313 12.8308 28.3313 14.3965C28.3313 16.0014 28.6738 17.1952 29.3588 17.9781C30.0633 18.7609 31.218 19.1524 32.8229 19.1524C33.547 19.1524 34.2516 19.0447 34.9366 18.8294C35.6216 18.5946 36.2283 18.3402 36.7568 18.0662V21.3248C36.0718 21.6575 35.3574 21.9022 34.6137 22.0587C33.87 22.2349 33.048 22.323 32.1477 22.323Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M8.49521 8.43701C8.90621 8.2413 9.3955 8.04558 9.96307 7.84987C10.5306 7.65415 11.1471 7.4878 11.8126 7.3508C12.478 7.19422 13.1434 7.07679 13.8089 6.99851C14.4939 6.90065 15.1397 6.85172 15.7464 6.85172C17.1164 6.85172 18.2516 7.03765 19.1519 7.40951C20.0717 7.76179 20.7567 8.32937 21.2069 9.11222C21.6766 9.87551 21.9114 10.8834 21.9114 12.136V22H18.2124V12.7819C18.2124 12.41 18.1635 12.0577 18.0656 11.725C17.9678 11.3727 17.8014 11.0694 17.5666 10.8149C17.3317 10.5409 17.0088 10.3354 16.5978 10.1984C16.1868 10.0419 15.6584 9.96358 15.0125 9.96358C14.5232 9.96358 14.0241 10.0125 13.5153 10.1104C13.0064 10.2082 12.5759 10.3354 12.2236 10.492V22H8.49521V8.43701Z" fill="var(--logo-color, var(--color-brand-500))"/><path d="M1.14307 22V7.3508H4.87143L4.90079 22H1.14307ZM1.055 5.00222V1.94908H4.9595V5.00222H1.055Z" fill="var(--logo-color, var(--color-brand-500))"/></svg>`;

const _VERIFIED_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.8025 6.7238L13.3365 6.25778C13.1238 6.04445 13.0071 5.76045 13.0071 5.45978V4.79311C13.0071 3.80045 12.1991 2.99311 11.2071 2.99311H10.5391C10.2371 2.99311 9.9538 2.87645 9.7418 2.66445L9.2678 2.19111C8.56313 1.49245 7.4218 1.49578 6.72247 2.19845L6.25783 2.66445C6.04383 2.87711 5.7605 2.99378 5.45917 2.99378H4.79183C3.81117 2.99445 3.01117 3.78378 2.99317 4.76111L2.99183 4.79378V5.45845C2.99183 5.75978 2.87517 6.04311 2.6625 6.25578L2.1905 6.72847C1.48983 7.4378 1.49583 8.57913 2.19783 9.27447L2.66383 9.7418C2.87583 9.95447 2.99317 10.2371 2.99317 10.5385V11.2085C2.99317 12.2005 3.79983 13.0078 4.79183 13.0078H5.45783C5.75983 13.0085 6.04317 13.1251 6.25517 13.3365L6.73047 13.8105C7.06913 14.1471 7.51847 14.3325 7.99647 14.3325H8.00447C8.48513 14.3305 8.9358 14.1411 9.27313 13.8018L9.74047 13.3351C9.95047 13.1258 10.2411 13.0058 10.5378 13.0058H11.2085C12.1985 13.0058 13.0058 12.1998 13.0078 11.2085V10.5398C13.0078 10.2391 13.1245 9.9558 13.3358 9.74313L13.8098 9.26913C14.5098 8.56513 14.5058 7.42313 13.8025 6.7238Z" fill="var(--color-brand-500)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3891 7.03847L7.6738 9.75513C7.5798 9.84913 7.45246 9.9018 7.3198 9.9018C7.18713 9.9018 7.0598 9.84913 6.96646 9.75513L5.64849 8.43513C5.45383 8.23913 5.45383 7.92247 5.64916 7.72713C5.84516 7.53247 6.16116 7.53313 6.3565 7.7278L7.32046 8.6938L9.6818 6.33111C9.87713 6.13578 10.1938 6.13578 10.3891 6.33111C10.5845 6.52645 10.5845 6.84313 10.3891 7.03847Z" fill="white"/></svg>`;

const _BACK_SVG2 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _CLOSE_SVG2 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// DS: .tag-verified component
function _verifiedTag() {
  return `<div class="tag-verified" style="justify-content:center">
    ${_VERIFIED_SVG}
    <span class="tag-verified__text">verified by </span>
    <span class="tag-verified__text" style="font-weight:700;color:var(--color-brand-500)">incode</span>
  </div>`;
}

// DS: .nav-bar with logo centered + optional back/close
function _navBar(variant) {
  const logo = `<div class="nav-bar__center">${_LOGO_SVG}</div>`;
  if (variant === 'logo-only') {
    return `<div class="nav-bar" style="border-bottom:none;padding:0 16px">${logo}</div>`;
  }
  // back + logo + close (DS: .phone-nav-btn)
  return `<div class="nav-bar" style="border-bottom:none;padding:0 16px">
    <div class="nav-bar__left"><button class="phone-nav-btn">${_BACK_SVG2}</button></div>
    ${logo}
    <div class="nav-bar__right"><button class="phone-nav-btn">${_CLOSE_SVG2}</button></div>
  </div>`;
}

// ---- Face Capture screens ----

function fcTutorial() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:8px 24px 24px;gap:0">
    ${_navBar('full')}
    <div style="text-align:center;padding:16px 0 0">
      <div style="font-family:var(--font-button);font-size:24px;font-weight:700;line-height:1.15;letter-spacing:-1px;color:var(--text-primary)">Take a selfie</div>
      <div style="font-family:var(--font-button);font-size:16px;font-weight:500;line-height:1.4;letter-spacing:-0.5px;color:var(--text-secondary);margin-top:12px">Keep a neutral expression, find balanced light and remove any glasses and hats</div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:16px 0">
      <img src="assets/images/selfie-empty.png" style="width:240px;height:240px;object-fit:contain" alt="Selfie illustration" />
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="text-align:center;font-family:var(--font-button);font-size:16px;font-weight:500;color:var(--text-secondary)">Stay still, selfie will be taken automatically</div>
      <button class="btn btn-primary btn-full">Take selfie</button>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// ⚠️ DS FLAG: cam-circle / cam-dark-area / cam-ring are NOT in DS — camera viewport component needed
function fcCamSearching() {
  return `<div class="cam-screen">
    <div style="padding:0 16px">${_navBar('logo-only')}</div>
    <div class="cam-dark-area">
      <div style="position:relative">
        <div class="cam-circle" style="border:3px solid rgba(255,255,255,0.25)"></div>
      </div>
    </div>
    <div class="cam-text-area">
      <div style="font-family:var(--font-button);font-size:18px;font-weight:600;letter-spacing:-0.3px;color:var(--text-primary);text-align:center">Align your face within the silhouette and look at the camera</div>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// ⚠️ DS FLAG: white detection ring not in DS
function fcCamDetected() {
  return `<div class="cam-screen">
    <div style="padding:0 16px">${_navBar('logo-only')}</div>
    <div class="cam-dark-area">
      <div style="position:relative">
        <div class="cam-circle">
          <img src="assets/images/selfie-filled.png" alt="" />
        </div>
        <div class="cam-ring cam-ring--detected"></div>
      </div>
    </div>
    <div class="cam-text-area">
      <div style="font-family:var(--font-button);font-size:18px;font-weight:600;letter-spacing:-0.3px;color:var(--text-primary);text-align:center">Align your face within the silhouette and look at the camera</div>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// ⚠️ DS FLAG: blue arc progress ring not in DS — uses CSS SVG animation not from DS
function fcCamCapturing() {
  // Arc math: circle r=148, circumference=2πr≈929. We want ~75% fill → dashoffset=929*0.25≈232
  return `<div class="cam-screen">
    <div style="padding:0 16px">${_navBar('logo-only')}</div>
    <div class="cam-dark-area">
      <div style="position:relative;width:280px;height:280px">
        <div class="cam-circle">
          <img src="assets/images/selfie-filled.png" alt="" />
        </div>
        <svg class="cam-arc-svg" viewBox="0 0 296 296" width="296" height="296">
          <circle class="cam-arc-track" cx="148" cy="148" r="144"/>
          <circle class="cam-arc-fill" cx="148" cy="148" r="144"/>
        </svg>
      </div>
    </div>
    <div class="cam-text-area">
      <div style="font-family:var(--font-button);font-size:18px;font-weight:600;letter-spacing:-0.3px;color:var(--text-primary);text-align:center">Get ready...</div>
      ${_verifiedTag()}
    </div>
  </div>`;
}

// DS: .spinner (loading-spinner token colors)
function fcProcessing() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:0 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
      <div class="spinner" style="width:64px;height:64px;border-width:6px"></div>
      <div style="font-family:var(--font-button);font-size:24px;font-weight:700;letter-spacing:-0.5px;color:var(--text-primary)">Processing...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

function fcUploading() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:0 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
      <div class="spinner" style="width:64px;height:64px;border-width:6px"></div>
      <div style="font-family:var(--font-button);font-size:24px;font-weight:700;letter-spacing:-0.5px;color:var(--text-primary)">Uploading...</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// ⚠️ DS FLAG: success icon (green circle + checkmark) — .states-block exists but no icon component
// Using --color-positive-500 token + inline SVG checkmark
function fcSuccess() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:0 24px 24px">
    ${_navBar('logo-only')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px">
      <div style="width:88px;height:88px;border-radius:50%;background:var(--color-positive-500);display:flex;align-items:center;justify-content:center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="font-family:var(--font-button);font-size:28px;font-weight:700;letter-spacing:-0.5px;color:var(--text-primary)">Success!</div>
    </div>
    ${_verifiedTag()}
  </div>`;
}

// ---- Module registry ----

const modules = {
  'face-capture': {
    label: 'Face Capture',
    screens: [
      { id: 'tutorial',    label: 'Tutorial',   render: fcTutorial },
      { id: 'cam-search',  label: 'Searching',  render: fcCamSearching },
      { id: 'cam-detect',  label: 'Detected',   render: fcCamDetected },
      { id: 'cam-ready',   label: 'Get Ready',  render: fcCamCapturing },
      { id: 'processing',  label: 'Processing', render: fcProcessing },
      { id: 'uploading',   label: 'Uploading',  render: fcUploading },
      { id: 'success',     label: 'Success',    render: fcSuccess },
    ]
  },
  'id-capture':       { label: 'ID Capture',       screens: [] },
  'nfc':              { label: 'NFC',               screens: [] },
  'document-capture': { label: 'Document Capture',  screens: [] },
};

let _modulesInit = false;

function initModules() {
  if (_modulesInit) return;
  _modulesInit = true;
  renderModuleCanvas('face-capture');
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
