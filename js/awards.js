/* ============================================================
   GAMEFORGE — AWARDS MODULE
   ============================================================ */
'use strict';

GF.AWARD_CATEGORIES = [
  { id: 'goty',       label: 'Game of the Year',       icon: '🏆', minScore: 85, repBonus: 80,  salesBoost: 0.40 },
  { id: 'best_action',label: 'Best Action Game',        icon: '⚔️', minScore: 78, repBonus: 30,  salesBoost: 0.15, genres: ['action','fps','fighting'] },
  { id: 'best_rpg',   label: 'Best RPG',                icon: '🗡️', minScore: 78, repBonus: 30,  salesBoost: 0.15, genres: ['rpg'] },
  { id: 'best_indie', label: 'Best Indie Game',         icon: '🎮', minScore: 75, repBonus: 40,  salesBoost: 0.20, types: ['indie'] },
  { id: 'best_sport', label: 'Best Sports Game',        icon: '⚽', minScore: 75, repBonus: 25,  salesBoost: 0.12, genres: ['sports','racing'] },
  { id: 'best_story', label: 'Best Narrative',          icon: '📖', minScore: 80, repBonus: 35,  salesBoost: 0.18 },
  { id: 'best_audio', label: 'Best Audio',              icon: '🎵', minScore: 80, repBonus: 20,  salesBoost: 0.08 },
  { id: 'best_visuals',label: 'Best Visual Art',        icon: '🎨', minScore: 82, repBonus: 25,  salesBoost: 0.10 },
  { id: 'innovation', label: 'Most Innovative',         icon: '💡', minScore: 80, repBonus: 40,  salesBoost: 0.15 },
  { id: 'studio_year',label: 'Studio of the Year',      icon: '🏢', minScore: 0,  repBonus: 100, salesBoost: 0.30 }
];

GF.awards = {

  /** Check if a newly released game qualifies for award nominations */
  checkNomination(game) {
    const s = GF.state.get();
    if (game.reviewScore < 75) return; // below nomination threshold

    for (const cat of GF.AWARD_CATEGORIES) {
      if (cat.id === 'studio_year') continue;

      // Genre filter
      if (cat.genres && !cat.genres.includes(game.genre)) continue;

      // Studio type filter (e.g. best indie only for indie studios)
      if (cat.types && !cat.types.includes(s.company.type)) continue;

      if (game.reviewScore >= cat.minScore) {
        const nom = {
          gameId:     game.id,
          gameTitle:  game.title,
          categoryId: cat.id,
          categoryLabel: cat.label,
          year:       s.time.year,
          score:      game.reviewScore
        };

        // Check not already nominated
        const exists = s.awards.nominations.find(n => n.gameId === game.id && n.categoryId === cat.id);
        if (!exists) {
          s.awards.nominations.push(nom);
          GF.notifications.push('gold', `Award Nomination!`,
            `"${game.title}" nominated for ${cat.label} ${cat.icon}`);
        }
      }
    }
  },

  /** Annual ceremony — called at year end */
  annualCeremony() {
    const s = GF.state.get();
    const ceremonyYear = s.time.year - 1; // awards for previous year's games

    // Collect all nominations for last year
    const nominations = s.awards.nominations.filter(n => n.year === ceremonyYear);
    if (nominations.length === 0) return;

    GF.notifications.push('gold', `🏆 The ${ceremonyYear} GameForge Awards!`,
      `The annual ceremony is here. ${nominations.length} nominations from your studio.`);

    const winners = [];
    const processed = new Set();

    for (const cat of GF.AWARD_CATEGORIES) {
      if (cat.id === 'studio_year') {
        this._judgeStudioOfYear(s, ceremonyYear, winners);
        continue;
      }

      const catNoms = nominations.filter(n => n.categoryId === cat.id);
      if (catNoms.length === 0) continue;

      // Your best game for this category
      const best = catNoms.sort((a, b) => b.score - a.score)[0];
      if (!best || processed.has(best.categoryId + best.gameId)) continue;

      // Win probability: score-based + some randomness (competing with AI)
      const winChance = Math.min(0.85, (best.score - cat.minScore) / 20 * 0.7 + 0.1);
      const won = Math.random() < winChance;

      if (won) {
        winners.push({ ...best, categoryLabel: cat.label, icon: cat.icon });
        processed.add(cat.id + best.gameId);

        // Apply reputation bonus
        s.company.reputation = Math.min(1000, s.company.reputation + cat.repBonus);

        // Apply sales boost to the game
        const game = s.releasedGames.find(g => g.id === best.gameId);
        if (game) {
          const boost = Math.floor(game.totalSales * cat.salesBoost);
          game.totalSales   += boost;
          game.totalRevenue += boost * (game.totalRevenue / Math.max(1, game.totalSales));
          game.awards.push(cat.id);
          game.currentMonthlySales = Math.floor(game.currentMonthlySales * (1 + cat.salesBoost));
        }

        GF.notifications.push('gold', `🏆 WON: ${cat.label}!`,
          `"${best.gameTitle}" wins ${cat.icon}! Reputation +${cat.repBonus}`);
      } else {
        GF.notifications.push('info', `Nomination: ${cat.label}`,
          `"${best.gameTitle}" was nominated but didn't win.`);
      }
    }

    // Record ceremony
    s.awards.history.push({
      year:        ceremonyYear,
      nominations: nominations.length,
      wins:        winners.length,
      winners
    });

    s.statistics.totalAwardsWon += winners.length;

    // Clear past nominations
    s.awards.nominations = s.awards.nominations.filter(n => n.year !== ceremonyYear);

    // Move winners to won list
    s.awards.won.push(...winners);
  },

  _judgeStudioOfYear(s, year, winners) {
    const cat = GF.AWARD_CATEGORIES.find(c => c.id === 'studio_year');
    const gamesThisYear = s.releasedGames.filter(g => g.releaseDate.year === year);
    if (gamesThisYear.length === 0) return;

    const avgScore = gamesThisYear.reduce((a, b) => a + b.reviewScore, 0) / gamesThisYear.length;
    const winChance = Math.min(0.75, (avgScore - 75) / 30 * 0.6 + (s.company.reputation / 1000) * 0.3);

    if (Math.random() < winChance) {
      s.company.reputation = Math.min(1000, s.company.reputation + cat.repBonus);
      winners.push({
        categoryId:    'studio_year',
        categoryLabel: cat.label,
        icon:          cat.icon,
        gameTitle:     'Overall Studio Excellence',
        year,
        score:         Math.round(avgScore)
      });
      s.awards.won.push(winners[winners.length - 1]);
      GF.notifications.push('gold', `🏆 STUDIO OF THE YEAR!`,
        `Your studio wins the most prestigious award! Reputation +${cat.repBonus}`);
    }
  },

  /** Get upcoming ceremony info */
  getNextCeremony() {
    const s = GF.state.get();
    const weeksUntilYear = 52 - s.time.week;
    return {
      year: s.time.year,
      weeksLeft: weeksUntilYear,
      nominations: s.awards.nominations.filter(n => n.year === s.time.year).length
    };
  }
};

console.log('[Awards] Module ready');
