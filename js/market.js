/* ============================================================
   GAMEFORGE — MARKET MODULE
   ============================================================ */
'use strict';

GF.MARKET = GF.MARKET || {};

Object.assign(GF.MARKET, {
  genreSeeds() {
    const seed = {};
    for (const g of Object.keys(GF.GENRES)) {
      seed[g] = 35 + Math.floor(Math.random() * 40);
    }
    return seed;
  },
  platformSeeds() {
    return { pc: 40, ps5: 28, xbox: 18, switch: 14 };
  }
});

GF.market = {
  /* ── Trend calculations ───────────────────────────────── */

  weeklyTick() {
    const s = GF.state.get();
    const trends = s.market.trends;

    // Tiny random drift each week
    for (const g of Object.keys(trends)) {
      const drift = (Math.random() - 0.5) * 2;
      trends[g] = Math.min(95, Math.max(5, trends[g] + drift));
    }

    // Platform share slight drift
    const shares = s.market.platformShares;
    if (shares.pc !== undefined) {
      // PC grows slowly over time (digital distribution)
      const year = s.time.year;
      if (year > 2010 && Math.random() < 0.3) {
        shares.pc   = Math.min(70, shares.pc + 0.1);
        shares.xbox = Math.max(5, shares.xbox - 0.05);
        shares.ps5  = Math.max(5, (shares.ps5 || 28) - 0.05);
      }
    }
  },

  monthlyTick() {
    const s = GF.state.get();
    const trends = s.market.trends;
    const year   = s.time.year;

    // Seasonal modifiers (Q4 = holiday boom)
    const month = s.time.month;
    if (month === 11 || month === 12) {
      s.market.consumerSentiment = Math.min(100, s.market.consumerSentiment + 2);
    } else if (month === 1 || month === 2) {
      s.market.consumerSentiment = Math.max(0, s.market.consumerSentiment - 1);
    }

    // Clamp sentiment
    s.market.consumerSentiment = Math.min(100, Math.max(10, s.market.consumerSentiment));

    // Major trend shifts (rare, big swing events)
    if (Math.random() < 0.03) {
      const g = this._randomGenre();
      const swing = Math.random() < 0.5 ? 15 : -15;
      trends[g] = Math.min(95, Math.max(5, trends[g] + swing));
      const dir = swing > 0 ? 'surging' : 'declining';
      GF.notifications.push('info', `Market Trend: ${GF.GENRES[g]?.label} is ${dir}!`,
        `Demand for ${GF.GENRES[g]?.label} games has shifted.`);
    }

    // Era-based genre boosts
    this._eraModifiers(year, trends);
  },

  _eraModifiers(year, trends) {
    // Historical genre trends
    if (year >= 2005 && year <= 2010) {
      trends.fps    = Math.min(90, trends.fps    + 0.5);
      trends.sports = Math.min(85, trends.sports + 0.3);
    }
    if (year >= 2010 && year <= 2015) {
      trends.mobile = Math.min(90, (trends.mobile || 40) + 0.8);
      trends.fps    = Math.min(90, trends.fps    + 0.3);
    }
    if (year >= 2015 && year <= 2020) {
      trends.openworld = Math.min(90, (trends.openworld || 50) + 0.6);
      trends.rpg       = Math.min(85, trends.rpg + 0.4);
    }
    if (year >= 2020) {
      trends.rpg       = Math.min(92, trends.rpg + 0.3);
      trends.horror    = Math.min(80, trends.horror + 0.2);
      trends.strategy  = Math.min(82, trends.strategy + 0.2);
    }
  },

  onCompetitorRelease(genre, quality) {
    const s = GF.state.get();
    if (!s.market.trends[genre]) return;
    // High-quality release in a genre boosts its trend
    if (quality > 80) {
      s.market.trends[genre] = Math.min(95, s.market.trends[genre] + 3);
      s.market.consumerSentiment = Math.min(100, s.market.consumerSentiment + 1);
    }
  },

  _randomGenre() {
    const genres = Object.keys(GF.GENRES);
    return genres[Math.floor(Math.random() * genres.length)];
  },

  /** Get trend score for a genre (0–100) */
  getTrend(genre) {
    const s = GF.state.get();
    return s.market.trends[genre] || 50;
  },

  /** Get sales multiplier for genre (1.0 = average) */
  getSalesMultiplier(genre) {
    const trend = this.getTrend(genre);
    return 0.5 + (trend / 100) * 1.5;  // 0.5x to 2.0x
  },

  /** Estimate potential audience size for a game */
  estimateAudience(genre, platforms, quality) {
    const s = GF.state.get();
    const trendScore = this.getTrend(genre);
    const sentiment  = s.market.consumerSentiment;

    let audienceBase = 50000; // base units

    // Genre popularity
    audienceBase *= (trendScore / 50);

    // Quality multiplier
    if (quality >= 90) audienceBase *= 5;
    else if (quality >= 80) audienceBase *= 3;
    else if (quality >= 70) audienceBase *= 1.8;
    else if (quality >= 60) audienceBase *= 1.2;
    else if (quality >= 50) audienceBase *= 0.8;
    else audienceBase *= 0.4;

    // Platform reach
    let platformMult = 0;
    for (const p of platforms) {
      platformMult += (GF.PLATFORMS[p]?.audience || 0.1);
    }
    audienceBase *= Math.min(2, platformMult);

    // Consumer sentiment
    audienceBase *= (0.7 + (sentiment / 100) * 0.6);

    // Company reputation (your studio)
    const rep = s.company.reputation;
    audienceBase *= (0.5 + (rep / 1000) * 1.5);

    return Math.round(audienceBase);
  },

  /** Get top trending genres */
  getTopTrends(limit = 5) {
    const s = GF.state.get();
    return Object.entries(s.market.trends)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre, score]) => ({ genre, score: Math.round(score), ...GF.GENRES[genre] }));
  }
};

console.log('[Market] Module ready');
