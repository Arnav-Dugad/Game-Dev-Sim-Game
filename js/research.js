/* ============================================================
   GAMEFORGE — RESEARCH & TECH TREE MODULE
   ============================================================ */
'use strict';

GF.RESEARCH_TREE = [
  /* ── Graphics ──────────────────────────────────────────── */
  { id: 'hd_textures',   category: 'Graphics', label: 'HD Textures',       icon: '🖼️',  cost: 50000,   weeks: 4,  requires: [],              bonus: { graphicsQuality: 0.05 },  desc: 'Enables high-resolution texture support, boosting visual quality.' },
  { id: '4k_rendering',  category: 'Graphics', label: '4K Rendering',      icon: '📺',  cost: 200000,  weeks: 8,  requires: ['hd_textures'],  bonus: { graphicsQuality: 0.10 },  desc: 'Full 4K output pipeline. Significantly improves review scores.' },
  { id: 'ray_tracing',   category: 'Graphics', label: 'Ray Tracing',       icon: '💡',  cost: 500000,  weeks: 12, requires: ['4k_rendering'], bonus: { graphicsQuality: 0.15 },  desc: 'Photorealistic lighting. Required for AAA visual parity.' },

  /* ── Gameplay ───────────────────────────────────────────── */
  { id: 'physics_v2',    category: 'Gameplay', label: 'Advanced Physics',  icon: '⚙️',  cost: 80000,   weeks: 5,  requires: [],              bonus: { gameplayQuality: 0.07 },  desc: 'Better collision, ragdolls, and environmental physics.' },
  { id: 'ai_pathfinding',category: 'Gameplay', label: 'AI Pathfinding',    icon: '🤖',  cost: 120000,  weeks: 6,  requires: ['physics_v2'],   bonus: { gameplayQuality: 0.08 },  desc: 'Smart enemy AI and NPC behavior systems.' },
  { id: 'open_world_sys',category: 'Gameplay', label: 'Open World Engine', icon: '🌍',  cost: 600000,  weeks: 16, requires: ['ai_pathfinding'],bonus: { gameplayQuality: 0.15, unlocks: 'openworld' }, desc: 'Full open-world streaming system. Unlocks Open World genre.' },

  /* ── Audio ──────────────────────────────────────────────── */
  { id: 'spatial_audio', category: 'Audio',    label: 'Spatial Audio',     icon: '🎧',  cost: 40000,   weeks: 3,  requires: [],              bonus: { soundQuality: 0.08 },     desc: '3D positional audio system.' },
  { id: 'dynamic_music', category: 'Audio',    label: 'Dynamic Music',     icon: '🎵',  cost: 100000,  weeks: 5,  requires: ['spatial_audio'],bonus: { soundQuality: 0.10 },     desc: 'Adaptive soundtrack that responds to gameplay.' },
  { id: 'dolby_atmos',   category: 'Audio',    label: 'Dolby Atmos',       icon: '🔊',  cost: 200000,  weeks: 6,  requires: ['dynamic_music'],bonus: { soundQuality: 0.12 },     desc: 'Premium immersive audio. Boosts review scores significantly.' },

  /* ── Engine ─────────────────────────────────────────────── */
  { id: 'engine_opt',    category: 'Engine',   label: 'Engine Optimization',icon: '🔧', cost: 150000,  weeks: 8,  requires: [],              bonus: { devSpeed: 0.10 },         desc: 'Faster compile times and build pipelines.' },
  { id: 'custom_tools',  category: 'Engine',   label: 'Custom Dev Tools',  icon: '🛠️',  cost: 300000,  weeks: 10, requires: ['engine_opt'],   bonus: { devSpeed: 0.15 },         desc: 'Proprietary editors and pipelines exclusive to your studio.' },
  { id: 'custom_engine', category: 'Engine',   label: 'Custom Engine',     icon: '⚡',  cost: 2000000, weeks: 26, requires: ['custom_tools'], bonus: { devSpeed: 0.20, overallQuality: 0.20 }, desc: 'Build your own engine. Massive long-term advantage.' },

  /* ── Online ─────────────────────────────────────────────── */
  { id: 'online_basic',  category: 'Online',   label: 'Online Multiplayer',icon: '🌐',  cost: 100000,  weeks: 6,  requires: [],              bonus: { unlocks: 'mmo' },         desc: 'Enables basic online features. Unlocks MMO genre.' },
  { id: 'live_service',  category: 'Online',   label: 'Live Service Tech', icon: '🔄',  cost: 400000,  weeks: 12, requires: ['online_basic'], bonus: { revenueBonus: 0.15 },     desc: 'Battle passes, seasons, and ongoing content delivery.' },
  { id: 'crossplay',     category: 'Online',   label: 'Cross-Platform',    icon: '🔗',  cost: 600000,  weeks: 10, requires: ['live_service'], bonus: { audienceBonus: 0.20 },    desc: 'Cross-platform matchmaking. Dramatically expands audience.' },

  /* ── VR/AR ──────────────────────────────────────────────── */
  { id: 'vr_basic',      category: 'VR/AR',    label: 'VR Support',        icon: '🥽',  cost: 200000,  weeks: 8,  requires: [],              bonus: { unlocks: 'vr_genre' },    desc: 'Add VR headset support to your games.' },
  { id: 'ar_tech',       category: 'VR/AR',    label: 'AR Technology',     icon: '👓',  cost: 500000,  weeks: 14, requires: ['vr_basic'],     bonus: { overallQuality: 0.08 },   desc: 'Augmented reality capabilities.' },

  /* ── Business ───────────────────────────────────────────── */
  { id: 'analytics',     category: 'Business', label: 'Analytics Platform',icon: '📊',  cost: 60000,   weeks: 4,  requires: [],              bonus: { revenueBonus: 0.05 },     desc: 'Track player behavior to improve retention.' },
  { id: 'user_research', category: 'Business', label: 'User Research Lab',  icon: '🔬', cost: 150000,  weeks: 5,  requires: ['analytics'],    bonus: { gameplayQuality: 0.05 },  desc: 'Formal playtesting lab. Reduces shipping bugs.' },
  { id: 'global_reach',  category: 'Business', label: 'Global Localization',icon: '🌏', cost: 300000,  weeks: 8,  requires: ['analytics'],    bonus: { audienceBonus: 0.25 },    desc: 'Translate games to 20+ languages. Expands global market.' }
];

GF.research = {
  getNode(id) {
    return GF.RESEARCH_TREE.find(n => n.id === id);
  },

  getCategories() {
    return [...new Set(GF.RESEARCH_TREE.map(n => n.category))];
  },

  getByCategory(cat) {
    return GF.RESEARCH_TREE.filter(n => n.category === cat);
  },

  isCompleted(id) {
    if (!GF.state.isLoaded()) return false;
    return GF.state.get().research.completedIds.includes(id);
  },

  isAvailable(id) {
    const node = this.getNode(id);
    if (!node) return false;
    if (this.isCompleted(id)) return false;
    return node.requires.every(req => this.isCompleted(req));
  },

  startResearch(id) {
    const s = GF.state.get();
    const node = this.getNode(id);
    if (!node) return false;

    if (!this.isAvailable(id)) {
      GF.notifications.push('warning', 'Research Unavailable', 'Complete prerequisite research first.');
      return false;
    }

    if (s.research.currentNodeId) {
      GF.notifications.push('warning', 'Research In Progress', 'Wait for current research to finish first.');
      return false;
    }

    s.research.currentNodeId = id;
    s.research.progress      = 0;

    GF.notifications.push('info', `Research Started: ${node.label}`,
      `Est. ${node.weeks} weeks — $${GF.ui.formatNum(node.cost)}`);
    return true;
  },

  weeklyTick() {
    const s = GF.state.get();
    if (!s.research.currentNodeId) return;

    const node = this.getNode(s.research.currentNodeId);
    if (!node) { s.research.currentNodeId = null; return; }

    const pctPerWeek = 100 / node.weeks;
    s.research.progress = Math.min(100, s.research.progress + pctPerWeek);

    if (s.research.progress >= 100) {
      this._complete(s.research.currentNodeId, s);
    }
  },

  _complete(id, s) {
    const node = this.getNode(id);
    s.research.completedIds.push(id);
    s.research.currentNodeId = null;
    s.research.progress      = 0;

    GF.notifications.push('gold', `Research Complete: ${node.label}`,
      node.desc);
  },

  yearlyBonus() {
    const s = GF.state.get();
    s.research.researchPoints = (s.research.researchPoints || 0) + 10 + s.research.completedIds.length;
  },

  /** Get aggregated quality bonus multiplier from completed research */
  getQualityBonus() {
    if (!GF.state.isLoaded()) return 1;
    const completed = GF.state.get().research.completedIds;
    let bonus = 1.0;

    for (const id of completed) {
      const node = this.getNode(id);
      if (!node) continue;
      if (node.bonus.graphicsQuality)  bonus += node.bonus.graphicsQuality * 0.3;
      if (node.bonus.gameplayQuality)  bonus += node.bonus.gameplayQuality * 0.3;
      if (node.bonus.soundQuality)     bonus += node.bonus.soundQuality    * 0.2;
      if (node.bonus.overallQuality)   bonus += node.bonus.overallQuality;
    }

    return Math.min(2.5, bonus); // cap at 2.5x
  },

  getDevSpeedBonus() {
    if (!GF.state.isLoaded()) return 1;
    const completed = GF.state.get().research.completedIds;
    let bonus = 1.0;
    for (const id of completed) {
      const node = this.getNode(id);
      if (node?.bonus.devSpeed) bonus += node.bonus.devSpeed;
    }
    return Math.min(2.0, bonus);
  },

  getAudienceBonus() {
    if (!GF.state.isLoaded()) return 1;
    const completed = GF.state.get().research.completedIds;
    let bonus = 1.0;
    for (const id of completed) {
      const node = this.getNode(id);
      if (node?.bonus.audienceBonus) bonus += node.bonus.audienceBonus;
    }
    return Math.min(2.0, bonus);
  }
};

console.log('[Research] Module ready —', GF.RESEARCH_TREE.length, 'nodes');
