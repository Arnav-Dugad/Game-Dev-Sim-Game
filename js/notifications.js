/* ============================================================
   GAMEFORGE — NOTIFICATIONS & TOAST SYSTEM
   ============================================================ */
'use strict';

GF.notifications = {
  _queue: [],
  _container: null,
  _maxToasts: 4,

  init() {
    this._container = document.getElementById('toast-container');
    // Load persisted notifications from state
    if (GF.state.isLoaded()) {
      this._queue = GF.state.get().notifications || [];
    }
  },

  /**
   * Push a notification
   * @param {string} type - success | warning | danger | info | gold
   * @param {string} title
   * @param {string} message
   * @param {boolean} persist - save to game state notification log
   */
  push(type, title, message = '', persist = true) {
    const n = {
      id:      GF.state.uuid ? GF.state.uuid() : Math.random().toString(36).slice(2),
      type,
      title,
      message,
      time:    Date.now(),
      read:    false
    };

    // Save to state
    if (persist && GF.state.isLoaded()) {
      const notifs = GF.state.get().notifications;
      notifs.unshift(n);
      if (notifs.length > 100) notifs.pop();
    }

    // Show toast
    this._showToast(n);
  },

  _showToast(n) {
    if (!this._container) {
      // Retry after DOM loads
      setTimeout(() => this._showToast(n), 200);
      return;
    }

    // Remove oldest if too many
    const existing = this._container.querySelectorAll('.toast');
    if (existing.length >= this._maxToasts) {
      this._removeToast(existing[existing.length - 1]);
    }

    const icons = {
      success: '✅',
      warning: '⚠️',
      danger:  '❌',
      info:    '💡',
      gold:    '🏆'
    };

    const el = document.createElement('div');
    el.className = `toast ${n.type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[n.type] || '📢'}</span>
      <div class="toast-body">
        <div class="toast-title">${this._esc(n.title)}</div>
        ${n.message ? `<div class="toast-message">${this._esc(n.message)}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close" onclick="GF.notifications._removeToast(this.closest('.toast'))">✕</button>
    `;

    this._container.prepend(el);

    // Auto-remove after delay
    const delay = n.type === 'gold' ? 6000 : 4000;
    setTimeout(() => this._removeToast(el), delay);
  },

  _removeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 350);
  },

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  /** Get unread count */
  unreadCount() {
    if (!GF.state.isLoaded()) return 0;
    return GF.state.get().notifications.filter(n => !n.read).length;
  },

  /** Mark all as read */
  markAllRead() {
    if (!GF.state.isLoaded()) return;
    GF.state.get().notifications.forEach(n => n.read = true);
  },

  /** Get recent notifications for the notification panel */
  getRecent(limit = 30) {
    if (!GF.state.isLoaded()) return [];
    return GF.state.get().notifications.slice(0, limit);
  },

  /** Clear all notifications */
  clearAll() {
    if (GF.state.isLoaded()) GF.state.get().notifications = [];
    if (this._container) this._container.innerHTML = '';
  }
};

console.log('[Notifications] Module ready');
