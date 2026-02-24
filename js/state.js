/* ============================================================
   GAMEFORGE — CENTRAL GAME STATE
   ============================================================ */
'use strict';

window.GF = window.GF || {};

/* ── Default / Initial State Template ──────────────────────── */
GF.DEFAULT_STATE = {
  version: '1.0.0',

  /* ── Company ──────────────────────────────────────────── */
  company: {
    name:           'Unnamed Studio',
    slogan:         '',
    logoColor:      '#6c63ff',
    logoChar:       'G',
    type:           'indie',        // indie | aa | aaa | mobile | vr
    specialtyGenre: 'action',
    focusPlatform:  'pc',
    founderName:    '',
    reputation:     10,             // 0–1000
    fans:           0,
    officeLevel:    1,              // 1–5
    officeRent:     2000,
    engineType:     'unity',        // unity | unreal | godot | custom
    engineLevel:    1,              // 1–5 per engine
    acquisitions:   [],
    founded:        { year: 2005, week: 1 }
  },

  /* ── Time ─────────────────────────────────────────────── */
  time: {
    year:       2005,
    month:      1,                  // 1–12
    week:       1,                  // 1–52
    day:        1,                  // day within week 1–7
    totalDays:  0,
    speed:      1,                  // 0=paused 1=normal 2=fast 4=ultra
    tickMs:     1000                // ms per in-game day
  },

  /* ── Finances ─────────────────────────────────────────── */
  finances: {
    cash:           500000,
    totalRevenue:   0,
    totalExpenses:  0,
    monthlyRevenue: 0,
    monthlyExpenses:0,
    loans:          [],
    investments:    [],
    isPublic:       false,
    stockPrice:     0,
    shares:         0,
    marketCap:      0,
    history:        []              // { year, month, revenue, expenses, cash }
  },

  /* ── Staff ────────────────────────────────────────────── */
  staff: [],

  /* ── Active Projects ──────────────────────────────────── */
  projects: [],

  /* ── Released Games ───────────────────────────────────── */
  releasedGames: [],

  /* ── Research ─────────────────────────────────────────── */
  research: {
    currentNodeId:  null,
    progress:       0,             // 0–100
    completedIds:   [],
    researchPoints: 0
  },

  /* ── Publishing / Platform Deals ─────────────────────── */
  publishing: {
    platformDeals:    [],
    publisherDeals:   [],
    distributionDeals:[]
  },

  /* ── Awards ───────────────────────────────────────────── */
  awards: {
    nominations: [],
    won:         [],
    history:     []
  },

  /* ── Market Snapshot ──────────────────────────────────── */
  market: {
    trends:           {},           // genre → 0–100 popularity
    platformShares:   {},           // platform → 0–100 %
    consumerSentiment:50
  },

  /* ── In-game Notifications ────────────────────────────── */
  notifications: [],

  /* ── Lifetime Statistics ──────────────────────────────── */
  statistics: {
    gamesReleased:       0,
    totalSales:          0,
    totalStaffHired:     0,
    totalStaffFired:     0,
    totalAwardsWon:      0,
    highestReviewScore:  0,
    peakCash:            0,
    totalLoans:          0,
    totalMarketingSpent: 0
  }
};

/* ── State Module ───────────────────────────────────────────── */
GF.state = {
  _data: null,

  /** Deep-clone default state and optionally merge company setup */
  init(companySetup = {}) {
    this._data = JSON.parse(JSON.stringify(GF.DEFAULT_STATE));

    if (companySetup.company) {
      Object.assign(this._data.company, companySetup.company);
    }

    // Set starting cash based on company type
    const startingCash = {
      indie:  250000,
      aa:     750000,
      aaa:    2500000,
      mobile: 150000,
      vr:     500000
    };
    this._data.finances.cash = startingCash[this._data.company.type] || 500000;

    // Starting office rent based on type
    const startRent = { indie: 1500, aa: 4000, aaa: 12000, mobile: 1000, vr: 3000 };
    this._data.company.officeRent = startRent[this._data.company.type] || 2000;

    // Initial market trends
    this._data.market.trends    = GF.MARKET.genreSeeds();
    this._data.market.platformShares = GF.MARKET.platformSeeds();

    // Starting reputation
    const startRep = { indie: 5, aa: 25, aaa: 80, mobile: 5, vr: 15 };
    this._data.company.reputation = startRep[this._data.company.type] || 10;

    console.log('[State] Initialized:', this._data.company.name);
    return this._data;
  },

  /** Load raw state from Firestore/JSON */
  load(rawState) {
    // Merge incoming state over default to handle version gaps
    this._data = this._deepMerge(JSON.parse(JSON.stringify(GF.DEFAULT_STATE)), rawState);
    console.log('[State] Loaded save — Year', this._data.time.year);
    return this._data;
  },

  /** Return full state */
  get() {
    return this._data;
  },

  /** Set a nested property by dot-path: 'finances.cash' */
  set(path, value) {
    const parts = path.split('.');
    let obj = this._data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] === undefined) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  },

  /** Get a nested property by dot-path */
  getPath(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this._data);
  },

  /** Add to a numeric property */
  add(path, amount) {
    const cur = this.getPath(path) || 0;
    this.set(path, cur + amount);
  },

  /** Clamp a numeric property between min and max */
  clamp(path, min, max) {
    const cur = this.getPath(path);
    this.set(path, Math.min(max, Math.max(min, cur)));
  },

  /** Generate a UUID v4 */
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  /** Deep merge b into a (a is mutated) */
  _deepMerge(a, b) {
    for (const key of Object.keys(b || {})) {
      if (b[key] && typeof b[key] === 'object' && !Array.isArray(b[key]) &&
          a[key] && typeof a[key] === 'object' && !Array.isArray(a[key])) {
        this._deepMerge(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
    return a;
  },

  /** Return a serializable snapshot (for Firebase / export) */
  snapshot() {
    return JSON.parse(JSON.stringify(this._data));
  },

  /** Check if a game is loaded */
  isLoaded() {
    return this._data !== null;
  }
};

/* ── Shared Enums / Constants ───────────────────────────────── */
GF.GENRES = {
  action:      { label: 'Action',      icon: '⚔️',  color: '#ff4757' },
  rpg:         { label: 'RPG',         icon: '🗡️',  color: '#a855f7' },
  fps:         { label: 'FPS',         icon: '🔫',  color: '#ff6b35' },
  strategy:    { label: 'Strategy',    icon: '♟️',  color: '#00d4ff' },
  sports:      { label: 'Sports',      icon: '⚽',  color: '#00e676' },
  simulation:  { label: 'Simulation',  icon: '🏗️',  color: '#ffb300' },
  horror:      { label: 'Horror',      icon: '👻',  color: '#8b0000' },
  puzzle:      { label: 'Puzzle',      icon: '🧩',  color: '#6c63ff' },
  racing:      { label: 'Racing',      icon: '🏎️',  color: '#ffd700' },
  fighting:    { label: 'Fighting',    icon: '🥊',  color: '#ff4757' },
  adventure:   { label: 'Adventure',   icon: '🗺️',  color: '#00b894' },
  openworld:   { label: 'Open World',  icon: '🌍',  color: '#74b9ff' },
  mmo:         { label: 'MMO',         icon: '🌐',  color: '#0984e3' },
  platformer:  { label: 'Platformer',  icon: '🏃',  color: '#fdcb6e' }
};

GF.PLATFORMS = {
  pc:       { label: 'PC (Steam)',       icon: '💻', cut: 0.30, fee: 0,       audience: 0.40 },
  ps5:      { label: 'PlayStation 5',   icon: '🎮', cut: 0.30, fee: 50000,   audience: 0.30 },
  xbox:     { label: 'Xbox Series X',   icon: '🟩', cut: 0.30, fee: 50000,   audience: 0.20 },
  switch:   { label: 'Nintendo Switch', icon: '🔴', cut: 0.30, fee: 25000,   audience: 0.15 },
  mobile:   { label: 'Mobile',          icon: '📱', cut: 0.15, fee: 0,       audience: 0.35 },
  ps4:      { label: 'PlayStation 4',   icon: '🎮', cut: 0.30, fee: 30000,   audience: 0.20 },
  xbone:    { label: 'Xbox One',        icon: '🟩', cut: 0.30, fee: 30000,   audience: 0.12 }
};

GF.STUDIO_TYPES = {
  indie:  { label: 'Indie Studio',      icon: '🎮', description: 'Small, creative, passionate' },
  aa:     { label: 'AA Studio',         icon: '🏢', description: 'Mid-size, balanced resources' },
  aaa:    { label: 'AAA Publisher',     icon: '🏛️', description: 'Large budget, massive teams' },
  mobile: { label: 'Mobile-First',      icon: '📱', description: 'Fast releases, mass market' },
  vr:     { label: 'VR Specialist',     icon: '🥽', description: 'Cutting-edge immersive tech' }
};

GF.STAFF_ROLES = {
  director:    { label: 'Game Director',      icon: '👑', baseSalary: 12000, maxSkillBonus: 3000 },
  lead_prog:   { label: 'Lead Programmer',    icon: '💻', baseSalary: 9000,  maxSkillBonus: 2500 },
  programmer:  { label: 'Programmer',         icon: '⌨️', baseSalary: 6500,  maxSkillBonus: 1800 },
  artist:      { label: 'Artist',             icon: '🎨', baseSalary: 5500,  maxSkillBonus: 1500 },
  animator:    { label: 'Animator',           icon: '🎬', baseSalary: 6000,  maxSkillBonus: 1600 },
  sound:       { label: 'Sound Engineer',     icon: '🎵', baseSalary: 5000,  maxSkillBonus: 1400 },
  qa:          { label: 'QA Tester',          icon: '🔍', baseSalary: 4000,  maxSkillBonus: 1000 },
  marketing:   { label: 'Marketing Mgr',      icon: '📣', baseSalary: 7000,  maxSkillBonus: 2000 },
  bizdev:      { label: 'Business Dev',       icon: '🤝', baseSalary: 8000,  maxSkillBonus: 2200 },
  community:   { label: 'Community Mgr',      icon: '💬', baseSalary: 4500,  maxSkillBonus: 1200 }
};

GF.ENGINES = {
  unity:   { label: 'Unity',      icon: '⚙️',  monthlyCost: 500,   qualityMult: 1.0, speedMult: 1.1 },
  unreal:  { label: 'Unreal',     icon: '🔷',  monthlyCost: 0,     qualityMult: 1.25, speedMult: 0.9 },
  godot:   { label: 'Godot',      icon: '🤖',  monthlyCost: 0,     qualityMult: 0.85, speedMult: 1.2 },
  custom:  { label: 'Custom',     icon: '🛠️',  monthlyCost: 2000,  qualityMult: 1.4,  speedMult: 0.8 }
};

GF.PHASES = ['preproduction', 'production', 'qa', 'marketing'];
GF.PHASE_LABELS = {
  preproduction: 'Pre-Production',
  production:    'Production',
  qa:            'QA & Testing',
  marketing:     'Marketing'
};
GF.PHASE_DURATIONS = {  // base weeks per phase (before modifiers)
  preproduction: 4,
  production:    16,
  qa:            4,
  marketing:     2
};

/* ── Market helpers (needed before market.js loads) ─────────── */
GF.MARKET = GF.MARKET || {
  genreSeeds() {
    const seed = {};
    for (const g of Object.keys(GF.GENRES)) {
      seed[g] = 40 + Math.floor(Math.random() * 40);
    }
    return seed;
  },
  platformSeeds() {
    return { pc: 40, ps5: 28, xbox: 18, switch: 14 };
  }
};

console.log('[State] Module ready');
