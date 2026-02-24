/* ============================================================
   GAMEFORGE — PUBLISHING & PLATFORM DEALS MODULE
   ============================================================ */
'use strict';

GF.PLATFORM_DEALS = {
  ps5: {
    platform: 'ps5', name: 'PlayStation 5', company: 'Sony',
    fee: 50000, cut: 0.30,
    exclusivePayout: 500000, exclusiveMonths: 12,
    minReputation: 50, icon: '🎮'
  },
  xbox: {
    platform: 'xbox', name: 'Xbox Series X', company: 'Microsoft',
    fee: 50000, cut: 0.30,
    exclusivePayout: 600000, exclusiveMonths: 12,
    minReputation: 50, icon: '🟩'
  },
  switch: {
    platform: 'switch', name: 'Nintendo Switch', company: 'Nintendo',
    fee: 25000, cut: 0.30,
    exclusivePayout: 300000, exclusiveMonths: 6,
    minReputation: 30, icon: '🔴'
  },
  pc: {
    platform: 'pc', name: 'Steam / PC', company: 'Valve',
    fee: 0, cut: 0.30,
    exclusivePayout: 0, exclusiveMonths: 0,
    minReputation: 0, icon: '💻'
  }
};

GF.PUBLISHER_OFFERS = [
  { id: 'ea_deal',       company: 'EA',         minRep: 150, funding: 3000000,  revShare: 0.50, label: 'EA Partners' },
  { id: 'ubisoft_deal',  company: 'Ubisoft',    minRep: 200, funding: 5000000,  revShare: 0.55, label: 'Ubisoft Publishing' },
  { id: 'take2_deal',    company: 'Take-Two',   minRep: 300, funding: 10000000, revShare: 0.60, label: 'Private Division' },
  { id: 'microsoft_deal',company: 'Microsoft',  minRep: 400, funding: 25000000, revShare: 0.65, label: 'Xbox Game Pass' },
  { id: 'sony_deal',     company: 'Sony',       minRep: 450, funding: 30000000, revShare: 0.65, label: 'PlayStation First-Party' },
  { id: 'nintendo_deal', company: 'Nintendo',   minRep: 500, funding: 20000000, revShare: 0.60, label: 'Nintendo Second-Party' },
];

GF.publishing = {

  /* ── Platform licensing ────────────────────────────────── */
  getLicense(platformId) {
    const s = GF.state.get();
    const deal = GF.PLATFORM_DEALS[platformId];
    if (!deal) return false;

    if (s.company.reputation < deal.minReputation) {
      GF.notifications.push('danger', 'License Denied',
        `You need ${deal.minReputation}+ reputation to publish on ${deal.name}.`);
      return false;
    }

    if (s.finances.cash < deal.fee) {
      GF.notifications.push('danger', 'Not Enough Funds',
        `Platform license fee: $${GF.ui.formatNum(deal.fee)}`);
      return false;
    }

    // Check if already licensed
    if (s.publishing.platformDeals.find(d => d.platformId === platformId)) {
      GF.notifications.push('info', 'Already Licensed', `You already have a deal with ${deal.name}.`);
      return false;
    }

    GF.state.add('finances.cash', -deal.fee);
    s.publishing.platformDeals.push({
      platformId,
      platformName: deal.name,
      obtained: { year: s.time.year, week: s.time.week },
      active: true,
      exclusive: false,
      exclusiveEnds: null
    });

    GF.notifications.push('success', `Platform License: ${deal.name}`,
      `You can now release games on ${deal.name}. Fee: $${GF.ui.formatNum(deal.fee)}`);
    return true;
  },

  signExclusive(platformId) {
    const s = GF.state.get();
    const deal = GF.PLATFORM_DEALS[platformId];
    if (!deal || !deal.exclusivePayout) return false;

    const existing = s.publishing.platformDeals.find(d => d.platformId === platformId);
    if (!existing) {
      GF.notifications.push('warning', 'License Required', 'Get the platform license first.');
      return false;
    }

    // Pay the studio the exclusivity bonus
    GF.state.add('finances.cash', deal.exclusivePayout);

    existing.exclusive   = true;
    existing.exclusiveEnds = { year: s.time.year + Math.floor(deal.exclusiveMonths / 12),
                               month: ((s.time.month + deal.exclusiveMonths - 1) % 12) + 1 };

    GF.notifications.push('gold', `Exclusive Deal: ${deal.name}!`,
      `Received $${GF.ui.formatNum(deal.exclusivePayout)} for ${deal.exclusiveMonths}-month exclusivity.`);
    return true;
  },

  hasLicense(platformId) {
    if (!GF.state.isLoaded()) return platformId === 'pc';
    const s = GF.state.get();
    return !!s.publishing.platformDeals.find(d => d.platformId === platformId && d.active);
  },

  getLicensedPlatforms() {
    if (!GF.state.isLoaded()) return ['pc'];
    const s = GF.state.get();
    const licensed = s.publishing.platformDeals.filter(d => d.active).map(d => d.platformId);
    if (!licensed.includes('pc')) licensed.push('pc'); // PC always available
    return licensed;
  },

  /* ── Publisher deals ────────────────────────────────────── */
  getAvailablePublisherOffers() {
    const s = GF.state.get();
    const rep = s.company.reputation;
    const signed = s.publishing.publisherDeals.map(d => d.id);
    return GF.PUBLISHER_OFFERS.filter(o => o.minRep <= rep && !signed.includes(o.id));
  },

  signPublisherDeal(offerId) {
    const s = GF.state.get();
    const offer = GF.PUBLISHER_OFFERS.find(o => o.id === offerId);
    if (!offer) return false;

    // Receive advance funding
    GF.state.add('finances.cash', offer.funding);
    s.publishing.publisherDeals.push({
      id:        offer.id,
      company:   offer.company,
      label:     offer.label,
      funding:   offer.funding,
      revShare:  offer.revShare,
      signedAt:  { year: s.time.year, month: s.time.month }
    });

    GF.notifications.push('gold', `Publisher Deal: ${offer.label}`,
      `Received $${GF.ui.formatNum(offer.funding)} advance. ${Math.round(offer.revShare * 100)}% revenue share.`);
    return true;
  },

  /* ── Monthly royalties ──────────────────────────────────── */
  monthlyTick() {
    const s = GF.state.get();
    // Check exclusive deal expirations
    for (const deal of s.publishing.platformDeals) {
      if (deal.exclusive && deal.exclusiveEnds) {
        const y = s.time.year, m = s.time.month;
        if (y > deal.exclusiveEnds.year ||
           (y === deal.exclusiveEnds.year && m >= deal.exclusiveEnds.month)) {
          deal.exclusive = false;
          GF.notifications.push('info', 'Exclusivity Expired',
            `Your exclusive deal with ${deal.platformName} has ended.`);
        }
      }
    }
  },

  /** Get available distribution store deals */
  getDistributionOptions() {
    return [
      { id: 'steam',  name: 'Steam',          cut: 0.30, minRep: 0,   bonus: 'Largest PC audience' },
      { id: 'epic',   name: 'Epic Games Store', cut: 0.12, minRep: 50, bonus: 'Low cut + exclusivity payouts' },
      { id: 'gog',    name: 'GOG.com',         cut: 0.30, minRep: 30,  bonus: 'DRM-free audience' }
    ];
  }
};

console.log('[Publishing] Module ready');
