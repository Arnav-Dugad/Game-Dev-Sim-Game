/* ============================================================
   GAMEFORGE — FIREBASE DATABASE MODULE
   ============================================================ */
'use strict';

GF.db = {
  _autoSaveTimer: null,
  _lastSaved: null,
  _saving: false,

  /* ── Save Management ──────────────────────────────────── */

  /** Check if user has any save */
  async hasSave(uid) {
    const snap = await db.collection('users').doc(uid)
                         .collection('saves').limit(1).get();
    return !snap.empty;
  },

  /** List all save slots */
  async listSaves(uid) {
    const snap = await db.collection('users').doc(uid)
                         .collection('saves')
                         .orderBy('savedAt', 'desc')
                         .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /** Save game to a specific slot (default: 'autosave') */
  async save(slot = 'autosave') {
    if (this._saving) return;
    const uid = GF.auth.uid();
    if (!uid || !GF.state.isLoaded()) return;

    this._saving = true;
    try {
      const gs = GF.state.snapshot();
      const s  = gs;
      const meta = {
        companyName: s.company.name,
        studioType:  s.company.type,
        year:        s.time.year,
        week:        s.time.week,
        cash:        s.finances.cash,
        reputation:  s.company.reputation,
        savedAt:     firebase.firestore.FieldValue.serverTimestamp(),
        version:     s.version
      };

      await db.collection('users').doc(uid)
              .collection('saves').doc(slot)
              .set({ ...meta, gameState: gs });

      this._lastSaved = new Date();
      GF.ui && GF.ui.updateSaveTime(this._lastSaved);
      console.log('[DB] Saved to slot:', slot);
    } catch (err) {
      console.error('[DB] Save error:', err);
      GF.notifications.push('warning', 'Auto-save failed', 'Check your internet connection.');
    } finally {
      this._saving = false;
    }
  },

  /** Load game from a specific slot */
  async load(slot = 'autosave') {
    const uid = GF.auth.uid();
    if (!uid) throw new Error('Not authenticated');

    const doc = await db.collection('users').doc(uid)
                        .collection('saves').doc(slot).get();
    if (!doc.exists) throw new Error('Save not found: ' + slot);

    const data = doc.data();
    GF.state.load(data.gameState);
    console.log('[DB] Loaded slot:', slot);
    return data.gameState;
  },

  /** Delete a save slot */
  async deleteSave(slot) {
    const uid = GF.auth.uid();
    await db.collection('users').doc(uid)
            .collection('saves').doc(slot).delete();
    console.log('[DB] Deleted slot:', slot);
  },

  /** Start auto-save (every 60 seconds) */
  startAutoSave(intervalMs = 60000) {
    this.stopAutoSave();
    this._autoSaveTimer = setInterval(() => this.save('autosave'), intervalMs);
    console.log('[DB] Auto-save started, interval:', intervalMs);
  },

  /** Stop auto-save */
  stopAutoSave() {
    if (this._autoSaveTimer) {
      clearInterval(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
  },

  /* ── Manual Multi-Slot ────────────────────────────────── */

  /** Save to manual slot 1, 2, or 3 */
  async saveSlot(n) {
    await this.save('slot' + n);
    GF.notifications.push('success', 'Game Saved', `Saved to Slot ${n}`);
  },

  /** Load from manual slot */
  async loadSlot(n) {
    await this.load('slot' + n);
    GF.engine.start();
  },

  /** Get metadata for all slots (for settings display) */
  async getAllSlotMeta() {
    const uid = GF.auth.uid();
    const snap = await db.collection('users').doc(uid)
                         .collection('saves').get();
    const result = { autosave: null, slot1: null, slot2: null, slot3: null };
    snap.docs.forEach(d => {
      if (result.hasOwnProperty(d.id)) {
        const data = d.data();
        result[d.id] = {
          companyName: data.companyName,
          year:        data.year,
          week:        data.week,
          cash:        data.cash,
          reputation:  data.reputation,
          savedAt:     data.savedAt?.toDate?.() || null
        };
      }
    });
    return result;
  }
};

console.log('[DB] Module ready');
