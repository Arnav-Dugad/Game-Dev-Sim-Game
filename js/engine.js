/* ============================================================
   GAMEFORGE — GAME ENGINE / TICK SYSTEM
   ============================================================ */
'use strict';

GF.engine = {
  _timer:      null,
  _running:    false,
  _speedMap:   { 0: 0, 1: 1000, 2: 500, 4: 200 },

  /** Start the game tick */
  start() {
    if (this._running) return;
    const s = GF.state.get();
    if (!s || s.time.speed === 0) return;
    this._schedule(s.time.speed);
    this._running = true;
    GF.ui && GF.ui.setSpeedUI(s.time.speed);
    console.log('[Engine] Started at speed', s.time.speed);
  },

  /** Pause the game */
  pause() {
    clearInterval(this._timer);
    this._timer = null;
    this._running = false;
    if (GF.state.isLoaded()) GF.state.set('time.speed', 0);
    GF.ui && GF.ui.setSpeedUI(0);
  },

  /** Set speed: 0=pause, 1=normal, 2=fast, 4=ultra */
  setSpeed(speed) {
    clearInterval(this._timer);
    this._timer = null;
    this._running = false;

    if (GF.state.isLoaded()) GF.state.set('time.speed', speed);

    if (speed > 0) {
      this._schedule(speed);
      this._running = true;
    }
    GF.ui && GF.ui.setSpeedUI(speed);
  },

  _schedule(speed) {
    const ms = this._speedMap[speed] || 1000;
    this._timer = setInterval(() => this._tick(), ms);
  },

  /** Core game tick — 1 call = 1 in-game day */
  _tick() {
    if (!GF.state.isLoaded()) return;
    const s = GF.state.get();

    // Advance time
    s.time.day++;
    s.time.totalDays++;

    if (s.time.day > 7) {
      s.time.day = 1;
      s.time.week++;
      this._weeklyTick(s);
    }

    if (s.time.week > 52) {
      s.time.week = 1;
      s.time.month = 1;
      s.time.year++;
      this._yearlyTick(s);
    }

    // Derive month from week (4.33 weeks per month)
    s.time.month = Math.min(12, Math.ceil(s.time.week / 4.33));

    // Update peak cash stat
    if (s.finances.cash > s.statistics.peakCash) {
      s.statistics.peakCash = s.finances.cash;
    }

    // Refresh UI
    GF.ui && GF.ui.refreshTime();
    GF.ui && GF.ui.refreshCash();
  },

  _weeklyTick(s) {
    console.log('[Engine] Week', s.time.year, 'W' + s.time.week);

    // Advance all active projects
    GF.development.weeklyTick();

    // Staff morale + experience
    GF.team.weeklyTick();

    // Market trend drift
    GF.market.weeklyTick();

    // Competitor AI releases
    GF.companies.weeklyTick();

    // Research progress
    GF.research.weeklyTick();

    // Monthly financial tick (at end of each 4-week period)
    if (s.time.week % 4 === 0) {
      this._monthlyTick(s);
    }

    // Refresh notification badge
    GF.ui && GF.ui.refreshNotifBadge();
  },

  _monthlyTick(s) {
    console.log('[Engine] Monthly tick — Month', s.time.month, s.time.year);

    // Pay expenses (salaries, rent, engine license)
    GF.finances.monthlyTick();

    // Collect game sales revenue
    GF.finances.collectSalesRevenue();

    // Publishing royalties
    GF.publishing.monthlyTick();

    // Loan interest
    GF.finances.processLoans();

    // Market trend monthly shift
    GF.market.monthlyTick();

    // Staff applicant pool refresh
    GF.team.refreshApplicants();

    // Check bankruptcy
    if (s.finances.cash < -500000) {
      this._triggerBankruptcy();
    }

    // Save history snapshot
    GF.finances.saveHistory();
  },

  _yearlyTick(s) {
    console.log('[Engine] Year', s.time.year, 'begins');

    // Annual awards ceremony
    GF.awards.annualCeremony();

    // Stock price update (if public)
    GF.finances.updateStockPrice();

    // Research bonus points
    GF.research.yearlyBonus();

    // Fans organic growth
    const fanGrowth = Math.floor(s.company.fans * 0.05 + s.company.reputation * 10);
    GF.state.add('company.fans', fanGrowth);

    GF.notifications.push('info', `Year ${s.time.year} Has Begun`,
      `Your studio enters a new year. Fans: ${GF.ui.formatNum(s.company.fans)}`);
  },

  _triggerBankruptcy() {
    this.pause();
    GF.notifications.push('danger', 'Studio Bankrupt!',
      'You have run out of money. The studio has collapsed.', true);
    GF.ui && GF.ui.showBankruptcy();
  }
};

console.log('[Engine] Module ready');
