/* ============================================================
   GAMEFORGE — REAL COMPANIES DATA & AI
   ============================================================ */
'use strict';

GF.COMPANIES_DATA = [
  {
    id: 'microsoft',
    name: 'Xbox Game Studios',
    short: 'Microsoft',
    logoColor: '#107c10',
    logoChar: 'X',
    type: 'aaa',
    reputation: 820,
    marketCap: 2800000000000,
    specialties: ['fps', 'rpg', 'strategy'],
    platforms: ['xbox', 'pc'],
    releaseFrequency: 4,  // games per year
    budgetRange: [80000000, 300000000],
    franchises: ['Halo', 'Forza', 'Gears of War', 'Age of Empires', 'Fable'],
    founded: 2000,
    description: 'Microsoft\'s gaming division, home to iconic franchises.'
  },
  {
    id: 'sony',
    name: 'PlayStation Studios',
    short: 'Sony',
    logoColor: '#003087',
    logoChar: 'P',
    type: 'aaa',
    reputation: 950,
    marketCap: 120000000000,
    specialties: ['action', 'adventure', 'rpg'],
    platforms: ['ps5', 'ps4'],
    releaseFrequency: 6,
    budgetRange: [100000000, 400000000],
    franchises: ['God of War', 'Spider-Man', 'Horizon', 'The Last of Us', 'Gran Turismo'],
    founded: 1993,
    description: 'Sony\'s first-party studios creating PlayStation exclusives.'
  },
  {
    id: 'nintendo',
    name: 'Nintendo',
    short: 'Nintendo',
    logoColor: '#e60012',
    logoChar: 'N',
    type: 'aaa',
    reputation: 980,
    marketCap: 75000000000,
    specialties: ['platformer', 'adventure', 'puzzle'],
    platforms: ['switch'],
    releaseFrequency: 5,
    budgetRange: [50000000, 200000000],
    franchises: ['Mario', 'Zelda', 'Pokémon', 'Metroid', 'Animal Crossing', 'Splatoon'],
    founded: 1889,
    description: 'The iconic Japanese company behind beloved family franchises.'
  },
  {
    id: 'ea',
    name: 'Electronic Arts',
    short: 'EA',
    logoColor: '#ff4500',
    logoChar: 'E',
    type: 'aaa',
    reputation: 520,
    marketCap: 36000000000,
    specialties: ['sports', 'fps', 'strategy'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 10,
    budgetRange: [50000000, 200000000],
    franchises: ['FIFA', 'Battlefield', 'The Sims', 'Apex Legends', 'Mass Effect'],
    founded: 1982,
    description: 'Publishers of sports games and major multiplayer titles.'
  },
  {
    id: 'ubisoft',
    name: 'Ubisoft',
    short: 'Ubisoft',
    logoColor: '#1273c4',
    logoChar: 'U',
    type: 'aaa',
    reputation: 600,
    marketCap: 5000000000,
    specialties: ['openworld', 'action', 'adventure'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 8,
    budgetRange: [50000000, 200000000],
    franchises: ['Assassin\'s Creed', 'Far Cry', 'Watch Dogs', 'Rainbow Six', 'The Division'],
    founded: 1986,
    description: 'French publisher known for open-world action adventures.'
  },
  {
    id: 'activision',
    name: 'Activision Blizzard',
    short: 'Activision',
    logoColor: '#1a1a2e',
    logoChar: 'A',
    type: 'aaa',
    reputation: 580,
    marketCap: 75000000000,
    specialties: ['fps', 'mmo', 'strategy'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 6,
    budgetRange: [100000000, 400000000],
    franchises: ['Call of Duty', 'World of Warcraft', 'Overwatch', 'Diablo', 'Starcraft'],
    founded: 1979,
    description: 'Home to Call of Duty, WoW, and Blizzard Entertainment.'
  },
  {
    id: 'taketwo',
    name: 'Take-Two Interactive',
    short: 'Take-Two',
    logoColor: '#e4002b',
    logoChar: 'T',
    type: 'aaa',
    reputation: 780,
    marketCap: 28000000000,
    specialties: ['openworld', 'action', 'sports'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 4,
    budgetRange: [80000000, 500000000],
    franchises: ['GTA', 'Red Dead Redemption', 'NBA 2K', 'Bioshock', 'Borderlands'],
    founded: 1993,
    description: 'Parent company of Rockstar Games and 2K.'
  },
  {
    id: 'epic',
    name: 'Epic Games',
    short: 'Epic',
    logoColor: '#2d2d2d',
    logoChar: 'E',
    type: 'aa',
    reputation: 750,
    marketCap: 32000000000,
    specialties: ['fps', 'action'],
    platforms: ['pc', 'ps5', 'xbox', 'mobile'],
    releaseFrequency: 2,
    budgetRange: [50000000, 200000000],
    franchises: ['Fortnite', 'Unreal Tournament', 'Gears of War'],
    founded: 1991,
    description: 'Creators of Fortnite and the Unreal Engine.'
  },
  {
    id: 'valve',
    name: 'Valve Corporation',
    short: 'Valve',
    logoColor: '#1b2838',
    logoChar: 'V',
    type: 'aa',
    reputation: 880,
    marketCap: 10000000000,
    specialties: ['fps', 'strategy', 'adventure'],
    platforms: ['pc'],
    releaseFrequency: 1,
    budgetRange: [20000000, 100000000],
    franchises: ['Half-Life', 'Portal', 'Dota 2', 'Counter-Strike', 'Team Fortress'],
    founded: 1996,
    description: 'Legendary developer and Steam platform owners.'
  },
  {
    id: 'bethesda',
    name: 'Bethesda Softworks',
    short: 'Bethesda',
    logoColor: '#c41230',
    logoChar: 'B',
    type: 'aaa',
    reputation: 760,
    marketCap: 8000000000,
    specialties: ['rpg', 'openworld', 'fps'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 2,
    budgetRange: [60000000, 250000000],
    franchises: ['The Elder Scrolls', 'Fallout', 'Doom', 'Starfield', 'Dishonored'],
    founded: 1986,
    description: 'Creators of massive open-world RPGs like Skyrim and Fallout.'
  },
  {
    id: 'cdprojekt',
    name: 'CD Projekt Red',
    short: 'CDPR',
    logoColor: '#cd0d0d',
    logoChar: 'C',
    type: 'aa',
    reputation: 850,
    marketCap: 7000000000,
    specialties: ['rpg', 'openworld', 'action'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 1,
    budgetRange: [80000000, 300000000],
    franchises: ['The Witcher', 'Cyberpunk 2077'],
    founded: 1994,
    description: 'Polish studio behind The Witcher series and Cyberpunk 2077.'
  },
  {
    id: 'capcom',
    name: 'Capcom',
    short: 'Capcom',
    logoColor: '#0073af',
    logoChar: 'C',
    type: 'aaa',
    reputation: 840,
    marketCap: 14000000000,
    specialties: ['action', 'horror', 'fighting'],
    platforms: ['pc', 'ps5', 'xbox', 'switch'],
    releaseFrequency: 5,
    budgetRange: [30000000, 120000000],
    franchises: ['Resident Evil', 'Devil May Cry', 'Street Fighter', 'Monster Hunter', 'Mega Man'],
    founded: 1979,
    description: 'Japanese developer known for survival horror and fighting games.'
  },
  {
    id: 'squareenix',
    name: 'Square Enix',
    short: 'Square Enix',
    logoColor: '#e7e7d0',
    logoChar: 'S',
    type: 'aaa',
    reputation: 740,
    marketCap: 5000000000,
    specialties: ['rpg', 'action', 'strategy'],
    platforms: ['pc', 'ps5', 'xbox', 'switch', 'mobile'],
    releaseFrequency: 7,
    budgetRange: [30000000, 200000000],
    franchises: ['Final Fantasy', 'Dragon Quest', 'Kingdom Hearts', 'Tomb Raider', 'Deus Ex'],
    founded: 1986,
    description: 'Creator of Final Fantasy and Dragon Quest series.'
  },
  {
    id: 'bandainamco',
    name: 'Bandai Namco',
    short: 'Namco',
    logoColor: '#e31e2f',
    logoChar: 'B',
    type: 'aaa',
    reputation: 690,
    marketCap: 15000000000,
    specialties: ['fighting', 'action', 'rpg'],
    platforms: ['pc', 'ps5', 'xbox', 'switch'],
    releaseFrequency: 8,
    budgetRange: [20000000, 100000000],
    franchises: ['Tekken', 'Dark Souls', 'Pac-Man', 'Tales', 'Naruto'],
    founded: 2005,
    description: 'Japanese entertainment giant behind Tekken and Dark Souls.'
  },
  {
    id: 'sega',
    name: 'Sega',
    short: 'Sega',
    logoColor: '#1b52ae',
    logoChar: 'S',
    type: 'aaa',
    reputation: 650,
    marketCap: 4000000000,
    specialties: ['action', 'rpg', 'sports'],
    platforms: ['pc', 'ps5', 'xbox', 'switch', 'mobile'],
    releaseFrequency: 8,
    budgetRange: [15000000, 80000000],
    franchises: ['Sonic', 'Yakuza', 'Persona', 'Total War', 'Football Manager'],
    founded: 1960,
    description: 'Iconic Japanese developer behind Sonic and Yakuza series.'
  },
  {
    id: 'fromsoft',
    name: 'FromSoftware',
    short: 'FromSoft',
    logoColor: '#1a1a1a',
    logoChar: 'F',
    type: 'aa',
    reputation: 920,
    marketCap: 1500000000,
    specialties: ['action', 'rpg', 'horror'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 1,
    budgetRange: [20000000, 80000000],
    franchises: ['Elden Ring', 'Dark Souls', 'Bloodborne', 'Sekiro', "Demon's Souls"],
    founded: 1986,
    description: 'Creators of legendary challenging action-RPG experiences.'
  },
  {
    id: 'insomniac',
    name: 'Insomniac Games',
    short: 'Insomniac',
    logoColor: '#e63946',
    logoChar: 'I',
    type: 'aaa',
    reputation: 860,
    marketCap: 229000000,
    specialties: ['action', 'adventure'],
    platforms: ['ps5'],
    releaseFrequency: 2,
    budgetRange: [80000000, 300000000],
    franchises: ['Spider-Man', 'Ratchet & Clank', 'Sunset Overdrive'],
    founded: 1994,
    description: 'PlayStation studio behind Spider-Man and Ratchet & Clank.'
  },
  {
    id: 'naughtydog',
    name: 'Naughty Dog',
    short: 'Naughty Dog',
    logoColor: '#d4af37',
    logoChar: 'N',
    type: 'aaa',
    reputation: 940,
    marketCap: 500000000,
    specialties: ['adventure', 'action'],
    platforms: ['ps5'],
    releaseFrequency: 1,
    budgetRange: [100000000, 400000000],
    franchises: ['The Last of Us', 'Uncharted'],
    founded: 1984,
    description: 'Masters of narrative-driven cinematic experiences.'
  },
  {
    id: 'remedy',
    name: 'Remedy Entertainment',
    short: 'Remedy',
    logoColor: '#e8751a',
    logoChar: 'R',
    type: 'aa',
    reputation: 780,
    marketCap: 600000000,
    specialties: ['action', 'horror', 'adventure'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 1,
    budgetRange: [20000000, 80000000],
    franchises: ['Control', 'Alan Wake', 'Max Payne'],
    founded: 1995,
    description: 'Finnish studio known for cinematic and atmospheric games.'
  },
  {
    id: 'io',
    name: 'IO Interactive',
    short: 'IO Interactive',
    logoColor: '#c8102e',
    logoChar: 'I',
    type: 'aa',
    reputation: 730,
    marketCap: 400000000,
    specialties: ['action', 'adventure'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 1,
    budgetRange: [25000000, 80000000],
    franchises: ['Hitman', '007 Project'],
    founded: 1998,
    description: 'Danish studio behind the acclaimed Hitman trilogy.'
  },
  {
    id: '2k',
    name: '2K Games',
    short: '2K',
    logoColor: '#006bb6',
    logoChar: '2',
    type: 'aaa',
    reputation: 720,
    marketCap: 6000000000,
    specialties: ['sports', 'action', 'strategy'],
    platforms: ['pc', 'ps5', 'xbox', 'switch', 'mobile'],
    releaseFrequency: 6,
    budgetRange: [30000000, 150000000],
    franchises: ['NBA 2K', 'Civilization', 'BioShock', 'XCOM', 'Borderlands'],
    founded: 2005,
    description: 'Publisher of sports sims and acclaimed franchises.'
  },
  {
    id: 'rockstar',
    name: 'Rockstar Games',
    short: 'Rockstar',
    logoColor: '#fcbf04',
    logoChar: 'R',
    type: 'aaa',
    reputation: 990,
    marketCap: 20000000000,
    specialties: ['openworld', 'action'],
    platforms: ['pc', 'ps5', 'xbox'],
    releaseFrequency: 0.5,
    budgetRange: [200000000, 600000000],
    franchises: ['Grand Theft Auto', 'Red Dead Redemption', 'Max Payne'],
    founded: 1998,
    description: 'Creators of GTA — arguably the most impactful games ever made.'
  }
];

/* ── Companies Module (runtime state) ──────────────────────── */
GF.companies = {
  _state: null,   // { companyId: { releases: [], nextReleaseWeek } }

  init() {
    this._state = {};
    for (const c of GF.COMPANIES_DATA) {
      const weeksPerRelease = Math.round(52 / Math.max(0.5, c.releaseFrequency));
      this._state[c.id] = {
        nextReleaseWeek: weeksPerRelease + Math.floor(Math.random() * 8),
        weeksPerRelease,
        releases: []
      };
    }
  },

  /** Called every game week — check if any company should release */
  weeklyTick() {
    const s = GF.state.get();
    const totalWeeks = (s.time.year - 2005) * 52 + s.time.week;

    for (const c of GF.COMPANIES_DATA) {
      const cs = this._state[c.id];
      if (!cs) continue;

      if (totalWeeks >= cs.nextReleaseWeek) {
        this._releaseGame(c, s.time.year, s.time.week);
        cs.nextReleaseWeek = totalWeeks + cs.weeksPerRelease + Math.floor(Math.random() * 6 - 3);
      }
    }
  },

  _releaseGame(company, year, week) {
    const genre = company.specialties[Math.floor(Math.random() * company.specialties.length)];
    const platform = company.platforms[Math.floor(Math.random() * company.platforms.length)];
    const budget = company.budgetRange[0] + Math.random() * (company.budgetRange[1] - company.budgetRange[0]);

    // Quality score influenced by company reputation + random variance
    const baseQuality = 50 + (company.reputation / 1000) * 35;
    const quality = Math.min(100, Math.max(20, baseQuality + (Math.random() * 24 - 12)));

    // Franchise or original
    let title;
    if (company.franchises.length > 0 && Math.random() < 0.65) {
      const f = company.franchises[Math.floor(Math.random() * company.franchises.length)];
      const suffixes = ['', ' 2', ' 3', ' Remastered', ' Origins', ' Legacy', ' Rising', ' Returns', ' Reborn'];
      title = f + suffixes[Math.floor(Math.random() * suffixes.length)];
    } else {
      title = this._generateTitle(genre);
    }

    const release = {
      companyId:   company.id,
      companyName: company.short,
      title,
      genre,
      platform,
      quality:     Math.round(quality),
      budget:      Math.round(budget),
      year,
      week
    };

    this._state[company.id].releases.unshift(release);
    // Keep only last 10
    if (this._state[company.id].releases.length > 10) {
      this._state[company.id].releases.pop();
    }

    // Affect market trends
    GF.market && GF.market.onCompetitorRelease(genre, quality);

    // Push notification for high-quality releases
    if (quality >= 88) {
      GF.notifications.push('info', `${company.short} Released "${title}"`,
        `Score: ${Math.round(quality)}/100 — ${GF.GENRES[genre]?.label || genre} on ${GF.PLATFORMS[platform]?.label || platform}`);
    }
  },

  _generateTitle(genre) {
    const words = {
      action:     ['Shadow Strike', 'Iron Fist', 'Final Assault', 'Dark Strike', 'Crimson Edge'],
      rpg:        ['Chronicles of Ash', 'Dragon\'s Fate', 'Realm of Shadows', 'Ancient Blood'],
      fps:        ['Urban Warfare', 'Ballistic Zone', 'Conflict Protocol', 'Ghost Unit'],
      strategy:   ['Empire Rising', 'Command & Conquer 2', 'Tactical Command', 'War Council'],
      sports:     ['Pro Football 25', 'Ultimate Sports', 'Championship Edition', 'World League'],
      simulation: ['Life Builder', 'City Constructor', 'Business Empire', 'Planet Manager'],
      horror:     ['Dark Descent', 'Fear Protocol', 'The Hollow', 'Void Walker', 'Nightmare'],
      puzzle:     ['Mind Bender', 'Logic Gate', 'Puzzle Kingdom', 'Brain Matrix'],
      racing:     ['Speed Rush', 'Grand Circuit', 'Turbo Championship', 'Road Rivals'],
      fighting:   ['Combat Zone', 'Street Warriors', 'Iron Knuckle', 'Battle Arena'],
      adventure:  ['Lost Horizon', 'Mystic Journey', 'The Wanderer', 'Ancient Path'],
      openworld:  ['Open Earth', 'Frontier', 'Boundless World', 'The Vast'],
      mmo:        ['World Online', 'Realm Online', 'Chronicles Online', 'Saga Online'],
      platformer: ['Super Jump', 'Platform Rush', 'Sky Runner', 'Bounce Bros']
    };
    const list = words[genre] || words.action;
    return list[Math.floor(Math.random() * list.length)];
  },

  /** Get recent releases (all companies, sorted by recency) */
  getRecentReleases(limit = 20) {
    const all = [];
    for (const [id, cs] of Object.entries(this._state || {})) {
      all.push(...cs.releases);
    }
    return all
      .sort((a,b) => (b.year * 52 + b.week) - (a.year * 52 + a.week))
      .slice(0, limit);
  },

  /** Get a specific company's data */
  getCompany(id) {
    return GF.COMPANIES_DATA.find(c => c.id === id);
  }
};

console.log('[Companies] Module ready —', GF.COMPANIES_DATA.length, 'companies');
