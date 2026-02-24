/* ============================================================
   GAMEFORGE — EXPORT & IMPORT MODULE
   ============================================================ */
'use strict';

GF.saveIO = {
  CURRENT_FORMAT: '1.0.0',

  /* ── Export ───────────────────────────────────────────── */
  exportToFile() {
    if (!GF.state.isLoaded()) {
      GF.notifications.push('danger', 'No Game Loaded', 'Load a game first before exporting.');
      return;
    }

    const snapshot = GF.state.snapshot();
    const payload  = {
      _gameforge:  true,
      _version:    this.CURRENT_FORMAT,
      _exportedAt: new Date().toISOString(),
      _company:    snapshot.company.name,
      _year:       snapshot.time.year,
      state:       snapshot
    };

    const json     = JSON.stringify(payload, null, 2);
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    const filename = `${snapshot.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_Y${snapshot.time.year}_W${snapshot.time.week}.gameforge`;

    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    GF.notifications.push('success', 'Save Exported!', `File: ${filename}`);
  },

  /* ── Import ───────────────────────────────────────────── */
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file provided.'));

      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'gameforge' && ext !== 'json') {
        GF.notifications.push('danger', 'Invalid File', 'Please use a .gameforge file.');
        return reject(new Error('Invalid file type'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const payload = JSON.parse(e.target.result);
          const result  = this._validate(payload);

          if (!result.valid) {
            GF.notifications.push('danger', 'Import Failed', result.error);
            return reject(new Error(result.error));
          }

          // Stop engine before loading
          if (GF.engine) GF.engine.pause();

          // Load state
          GF.state.load(result.state);

          // Reinitialize modules with loaded data
          GF.companies.init();
          GF.team.refreshApplicants();
          GF.notifications.init();
          GF.db.startAutoSave();
          GF.engine.start();

          GF.notifications.push('success', 'Game Imported!',
            `Welcome back, ${result.state.company.name}! Year ${result.state.time.year}`);
          resolve(result.state);
        } catch (err) {
          GF.notifications.push('danger', 'Import Error', 'The save file appears to be corrupted.');
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  },

  _validate(payload) {
    if (!payload._gameforge) {
      return { valid: false, error: 'Not a valid GameForge save file.' };
    }

    const state = payload.state;
    if (!state || typeof state !== 'object') {
      return { valid: false, error: 'Save file has no valid game state.' };
    }

    // Check required fields
    const required = ['company', 'time', 'finances', 'staff', 'projects'];
    for (const field of required) {
      if (!state[field]) {
        return { valid: false, error: `Save file is missing required field: ${field}` };
      }
    }

    // Version migration (for future compatibility)
    const version = payload._version || '1.0.0';
    const migrated = this._migrate(state, version);

    return { valid: true, state: migrated };
  },

  _migrate(state, fromVersion) {
    // Future: apply migrations when save format changes
    // e.g., if (fromVersion === '1.0.0') { ...add new fields... }
    return state;
  },

  /* ── Quick JSON copy ──────────────────────────────────── */
  copyToClipboard() {
    if (!GF.state.isLoaded()) return;
    const json = JSON.stringify(GF.state.snapshot());
    navigator.clipboard.writeText(json).then(() => {
      GF.notifications.push('success', 'Copied!', 'Game state copied to clipboard.');
    }).catch(() => {
      GF.notifications.push('danger', 'Copy Failed', 'Could not access clipboard.');
    });
  },

  /** Format file size for display */
  getExportSize() {
    if (!GF.state.isLoaded()) return '—';
    const size = JSON.stringify(GF.state.snapshot()).length;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

console.log('[Export/Import] Module ready');
