/* ============================================================
   GAMEFORGE — FINANCES MODULE
   ============================================================ */
'use strict';

GF.finances = {

  /* ── Monthly tick ─────────────────────────────────────── */
  monthlyTick() {
    const s = GF.state.get();
    let expenses = 0;

    // Staff salaries
    const salaries = s.staff.reduce((a, b) => a + b.salary, 0);
    expenses += salaries;

    // Office rent
    expenses += s.company.officeRent;

    // Engine license fee
    const engine = GF.ENGINES[s.company.engineType];
    if (engine && engine.monthlyCost > 0) expenses += engine.monthlyCost;

    // Research costs
    if (s.research.currentNodeId) {
      const node = GF.research.getNode(s.research.currentNodeId);
      if (node) expenses += Math.floor(node.cost / node.weeks);
    }

    // Deduct expenses
    GF.state.add('finances.cash', -expenses);
    GF.state.add('finances.totalExpenses', expenses);
    s.finances.monthlyExpenses = expenses;

    // Morale bonus if cash healthy
    if (s.finances.cash > expenses * 6) {
      s.staff.forEach(st => st.morale = Math.min(100, st.morale + 1));
    }

    if (salaries > 0) {
      GF.notifications.push('warning', 'Monthly Payroll',
        `$${GF.ui.formatNum(salaries)} in salaries + $${GF.ui.formatNum(s.company.officeRent)} rent`, false);
    }
  },

  /** Collect ongoing revenue from released games */
  collectSalesRevenue() {
    const s = GF.state.get();
    let total = 0;

    for (const game of s.releasedGames) {
      if (game.currentMonthlySales <= 50) continue;

      const price  = this._getGamePrice(game);
      let grossRev = game.currentMonthlySales * price;

      // Platform cuts
      let netRev = grossRev;
      for (const p of game.platforms) {
        const cut = GF.PLATFORMS[p]?.cut || 0.30;
        netRev -= (grossRev / game.platforms.length) * cut;
      }

      netRev = Math.round(netRev);
      total  += netRev;

      game.totalRevenue += netRev;

      // Decay sales (games sell less each month)
      game.currentMonthlySales = Math.floor(game.currentMonthlySales * game.monthlyDecay);
    }

    if (total > 0) {
      GF.state.add('finances.cash', total);
      GF.state.add('finances.totalRevenue', total);
      s.finances.monthlyRevenue = total;
    }
  },

  _getGamePrice(game) {
    if (game.platforms.includes('mobile') && game.platforms.length === 1) return 2.99;
    if (game.budget > 10000000) return 69.99;
    if (game.budget > 2000000)  return 59.99;
    if (game.budget > 500000)   return 39.99;
    if (game.budget > 100000)   return 24.99;
    return 14.99;
  },

  /** Save monthly history snapshot */
  saveHistory() {
    const s = GF.state.get();
    s.finances.history.push({
      year:     s.time.year,
      month:    s.time.month,
      revenue:  s.finances.monthlyRevenue,
      expenses: s.finances.monthlyExpenses,
      cash:     s.finances.cash,
      net:      s.finances.monthlyRevenue - s.finances.monthlyExpenses
    });
    // Keep last 24 months
    if (s.finances.history.length > 24) s.finances.history.shift();

    // Reset monthly accumulators
    s.finances.monthlyRevenue  = 0;
    s.finances.monthlyExpenses = 0;
  },

  /* ── Loans ────────────────────────────────────────────── */
  takeLoan(amount, interestRate, termMonths) {
    const s = GF.state.get();
    const maxLoan = this._maxLoanAmount();

    if (amount > maxLoan) {
      GF.notifications.push('danger', 'Loan Denied',
        `Max available loan: $${GF.ui.formatNum(maxLoan)} based on your reputation.`);
      return false;
    }

    const loan = {
      id:          GF.state.uuid(),
      amount,
      remaining:   amount,
      interestRate,  // annual %
      termMonths,
      monthlyPayment: Math.round(amount * (1 + interestRate / 100) / termMonths),
      takenAt:     { year: s.time.year, month: s.time.month }
    };

    s.finances.loans.push(loan);
    GF.state.add('finances.cash', amount);
    s.statistics.totalLoans += amount;

    GF.notifications.push('success', 'Loan Approved!',
      `$${GF.ui.formatNum(amount)} at ${interestRate}% — $${GF.ui.formatNum(loan.monthlyPayment)}/mo`);
    return loan;
  },

  processLoans() {
    const s = GF.state.get();
    for (let i = s.finances.loans.length - 1; i >= 0; i--) {
      const loan = s.finances.loans[i];
      const payment = Math.min(loan.remaining + Math.round(loan.remaining * (loan.interestRate / 100 / 12)),
                               loan.monthlyPayment);
      GF.state.add('finances.cash', -payment);
      loan.remaining = Math.max(0, loan.remaining - loan.monthlyPayment);

      if (loan.remaining <= 0) {
        s.finances.loans.splice(i, 1);
        GF.notifications.push('success', 'Loan Repaid!', 'You have fully repaid a business loan.');
      }
    }
  },

  _maxLoanAmount() {
    const s = GF.state.get();
    const rep = s.company.reputation;
    const revenue = s.finances.totalRevenue;
    return Math.max(50000, Math.floor(rep * 10000 + revenue * 0.1));
  },

  /* ── Investments / Venture Capital ───────────────────── */
  acceptInvestment(investorName, amount, equityPct) {
    const s = GF.state.get();
    GF.state.add('finances.cash', amount);
    s.finances.investments.push({
      id:       GF.state.uuid(),
      investor: investorName,
      amount,
      equityPct,
      date:     { year: s.time.year, month: s.time.month }
    });
    GF.notifications.push('gold', 'Investment Secured!',
      `${investorName} invested $${GF.ui.formatNum(amount)} for ${equityPct}% equity`);
  },

  /** Check for available VC offers based on reputation */
  checkVCOffers() {
    const s = GF.state.get();
    const rep = s.company.reputation;
    const offers = [];

    if (rep > 100 && s.finances.investments.length === 0) {
      offers.push({ investor: 'Angel Investor', amount: 250000,    equityPct: 5, minRep: 100 });
    }
    if (rep > 300 && s.finances.investments.length < 2) {
      offers.push({ investor: 'Venture Capital A', amount: 2000000,  equityPct: 12, minRep: 300 });
    }
    if (rep > 600 && !s.finances.isPublic) {
      offers.push({ investor: 'Private Equity',  amount: 20000000,  equityPct: 20, minRep: 600 });
    }

    return offers;
  },

  /* ── IPO ──────────────────────────────────────────────── */
  goPublic() {
    const s = GF.state.get();
    if (s.company.reputation < 500) {
      GF.notifications.push('danger', 'IPO Failed', 'You need 500+ reputation to go public.');
      return false;
    }

    const valuation = this._estimateValuation();
    const ipoAmount = Math.floor(valuation * 0.15); // sell 15% in IPO
    const shares    = 100000000;

    s.finances.isPublic    = true;
    s.finances.shares      = shares;
    s.finances.stockPrice  = valuation / shares;
    s.finances.marketCap   = valuation;

    GF.state.add('finances.cash', ipoAmount);

    GF.notifications.push('gold', '🎉 IPO Successful!',
      `Valuation: $${GF.ui.formatNum(valuation)} | Stock Price: $${s.finances.stockPrice.toFixed(2)}`);
    return true;
  },

  updateStockPrice() {
    const s = GF.state.get();
    if (!s.finances.isPublic) return;

    const val = this._estimateValuation();
    s.finances.marketCap   = val;
    s.finances.stockPrice  = val / s.finances.shares;
  },

  _estimateValuation() {
    const s = GF.state.get();
    const annualRevenue = s.finances.totalRevenue;
    const rep = s.company.reputation;
    const games = s.releasedGames.length;

    // P/E-like multiple based on reputation + growth
    const multiple = 5 + (rep / 100) * 3;
    return Math.round(annualRevenue * multiple + games * 500000 + rep * 50000);
  },

  /* ── Upgrade office ───────────────────────────────────── */
  upgradeOffice() {
    const s = GF.state.get();
    const costs   = [0, 100000, 500000, 2000000, 8000000];
    const rents   = [0, 1500,   4000,   12000,   35000,   80000];
    const level   = s.company.officeLevel;

    if (level >= 5) {
      GF.notifications.push('info', 'Max Office Level', 'Your HQ is already the biggest it can be!');
      return false;
    }

    const cost = costs[level];
    if (s.finances.cash < cost) {
      GF.notifications.push('danger', 'Not Enough Funds', `Office upgrade costs $${GF.ui.formatNum(cost)}`);
      return false;
    }

    GF.state.add('finances.cash', -cost);
    s.company.officeLevel++;
    s.company.officeRent = rents[s.company.officeLevel];

    GF.notifications.push('success', 'Office Upgraded!',
      `Now Level ${s.company.officeLevel} — Max ${GF.development._maxConcurrent()} concurrent projects`);
    return true;
  }
};

console.log('[Finances] Module ready');
