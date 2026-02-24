/* ============================================================
   GAMEFORGE — UI UTILITIES MODULE
   ============================================================ */
'use strict';

GF.ui = {
  _speedBtns: null,
  _cashEl:    null,
  _timeEl:    null,
  _saveEl:    null,
  _notifBadge:null,

  /* ── Init ─────────────────────────────────────────────── */
  init() {
    this._speedBtns  = document.querySelectorAll('.speed-btn');
    this._cashEl     = document.getElementById('nav-cash');
    this._timeEl     = document.getElementById('nav-time');
    this._saveEl     = document.getElementById('nav-save-time');
    this._notifBadge = document.getElementById('notif-badge');

    // Speed button click handlers
    this._speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        GF.engine.setSpeed(speed);
      });
    });

    // Bottom nav active state
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href')?.split('/').pop();
      if (href === page) item.classList.add('active');
    });

    // Initial render
    if (GF.state.isLoaded()) {
      this.refreshTime();
      this.refreshCash();
      this.refreshNotifBadge();
    }
  },

  /* ── Time display ─────────────────────────────────────── */
  refreshTime() {
    if (!this._timeEl || !GF.state.isLoaded()) return;
    const { year, week, month } = GF.state.get().time;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this._timeEl.textContent = `${months[month - 1]} Y${year} W${week}`;
  },

  /* ── Cash display ─────────────────────────────────────── */
  refreshCash() {
    if (!this._cashEl || !GF.state.isLoaded()) return;
    const cash = GF.state.get().finances.cash;
    this._cashEl.textContent = '$' + this.formatNum(cash);
    this._cashEl.style.color = cash < 0 ? 'var(--danger)' : cash < 10000 ? 'var(--warning)' : 'var(--success)';
  },

  /* ── Speed UI ─────────────────────────────────────────── */
  setSpeedUI(speed) {
    this._speedBtns = this._speedBtns || document.querySelectorAll('.speed-btn');
    this._speedBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
    });
  },

  /* ── Save time display ────────────────────────────────── */
  updateSaveTime(date) {
    if (!this._saveEl) return;
    const m = date.getMinutes().toString().padStart(2, '0');
    this._saveEl.textContent = `Saved ${date.getHours()}:${m}`;
  },

  /* ── Notification badge ───────────────────────────────── */
  refreshNotifBadge() {
    const badge = this._notifBadge || document.getElementById('notif-badge');
    if (!badge) return;
    const count = GF.notifications.unreadCount();
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  /* ── Bankruptcy overlay ───────────────────────────────── */
  showBankruptcy() {
    this.showModal('bankruptcy-modal');
  },

  /* ── Number formatting ────────────────────────────────── */
  formatNum(n, compact = false) {
    if (n === null || n === undefined) return '0';
    n = Number(n);
    if (isNaN(n)) return '0';

    if (compact || Math.abs(n) >= 1e9) {
      if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    }

    return Math.round(n).toLocaleString();
  },

  /** Format a dollar amount with $ prefix */
  formatCash(n) {
    return (n < 0 ? '-$' : '$') + this.formatNum(Math.abs(n));
  },

  /** Format date from {year, week} */
  formatDate(dateObj) {
    if (!dateObj) return '—';
    return `Y${dateObj.year} W${dateObj.week}`;
  },

  /** Color class based on value vs range */
  getColorClass(value, low, high) {
    if (value >= high)   return 'text-success';
    if (value >= low)    return 'text-warning';
    return 'text-danger';
  },

  /** Morale color */
  moraleColor(morale) {
    if (morale >= 70) return 'var(--success)';
    if (morale >= 40) return 'var(--warning)';
    return 'var(--danger)';
  },

  /** Score color */
  scoreColor(score) {
    if (score >= 90) return 'var(--gold)';
    if (score >= 80) return 'var(--success)';
    if (score >= 70) return 'var(--cyan)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  },

  /* ── Modal helpers ────────────────────────────────────── */
  showModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  },

  /* ── Confirm dialog ───────────────────────────────────── */
  confirm(title, message, onConfirm, danger = false) {
    const overlay = document.getElementById('confirm-overlay');
    if (!overlay) {
      if (window.confirm(message)) onConfirm();
      return;
    }

    document.getElementById('confirm-title').textContent   = title;
    document.getElementById('confirm-message').textContent = message;

    const btn = document.getElementById('confirm-ok');
    btn.className = `btn btn-w-full ${danger ? 'btn-danger' : 'btn-primary'}`;
    btn.onclick = () => {
      this._closeConfirm();
      onConfirm();
    };

    document.getElementById('confirm-cancel').onclick = () => this._closeConfirm();
    overlay.classList.add('active');
  },

  _closeConfirm() {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  /* ── Animated counter ─────────────────────────────────── */
  animateCounter(el, from, to, duration = 800, prefix = '', suffix = '') {
    if (!el) return;
    const start   = performance.now();
    const diff    = to - from;

    function step(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased   = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      const current = Math.round(from + diff * eased);
      el.textContent = prefix + GF.ui.formatNum(current) + suffix;
      if (elapsed < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  },

  /* ── Ripple effect on button click ───────────────────── */
  addRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    Object.assign(ripple.style, {
      width:  size + 'px', height: size + 'px',
      left:   x + 'px',   top:    y + 'px'
    });
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  },

  /* ── Progress ring builder ────────────────────────────── */
  buildProgressRing(pct, size = 56, stroke = 5, color = 'var(--violet)') {
    const r  = (size - stroke) / 2;
    const c  = 2 * Math.PI * r;
    const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}"/>
        <circle class="progress-ring-fill"
          cx="${size/2}" cy="${size/2}" r="${r}"
          stroke-width="${stroke}"
          stroke="${color}"
          stroke-dasharray="${c}"
          stroke-dashoffset="${offset}"
          transform="rotate(-90 ${size/2} ${size/2})"
        />
      </svg>`;
  },

  /* ── Company logo avatar ──────────────────────────────── */
  buildAvatar(char, color, size = 'md') {
    const bg = color || '#6c63ff';
    const textColor = this._contrastColor(bg);
    return `<div class="avatar avatar-${size}" style="background:${bg};color:${textColor}">${char.toUpperCase()}</div>`;
  },

  _contrastColor(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (r*0.299 + g*0.587 + b*0.114) > 150 ? '#000000' : '#ffffff';
  },

  /* ── Phase label ──────────────────────────────────────── */
  phaseLabel(phase) {
    return GF.PHASE_LABELS[phase] || phase;
  },

  /* ── Genre badge ──────────────────────────────────────── */
  genreBadge(genre) {
    const g = GF.GENRES[genre];
    if (!g) return `<span class="badge badge-muted">${genre}</span>`;
    return `<span class="badge" style="background:${g.color}22;color:${g.color};border-color:${g.color}44">${g.icon} ${g.label}</span>`;
  },

  /* ── Score badge ──────────────────────────────────────── */
  scoreBadge(score) {
    const color = this.scoreColor(score);
    return `<span class="font-mono font-bold" style="color:${color}">${score}/100</span>`;
  },

  /* ── Tab switching ────────────────────────────────────── */
  initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = container.querySelector(`[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  },

  /* ── Close modals on overlay click ───────────────────── */
  initModalClose() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) this.closeModal(overlay.id);
      });
    });
  },

  /* ── Page loading overlay ─────────────────────────────── */
  showLoader() {
    const el = document.getElementById('page-loader');
    if (el) el.style.display = 'flex';
  },

  hideLoader() {
    const el = document.getElementById('page-loader');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => el.style.display = 'none', 300);
    }
  },

  /* ── Money float effect ───────────────────────────────── */
  showMoneyFloat(amount, el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const float = document.createElement('div');
    float.className = 'money-float';
    float.textContent = (amount > 0 ? '+' : '') + '$' + this.formatNum(amount);
    float.style.cssText = `left:${rect.left + rect.width/2}px;top:${rect.top}px;`;
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1300);
  }
};

console.log('[UI] Module ready');
