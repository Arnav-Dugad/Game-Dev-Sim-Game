/* ============================================================
   GAMEFORGE — GAME DEVELOPMENT MODULE
   ============================================================ */
'use strict';

GF.development = {

  /* ── Create a new project ─────────────────────────────── */
  createProject(options) {
    const s = GF.state.get();

    if (options.budget > s.finances.cash) {
      GF.notifications.push('danger', 'Not Enough Funds', 'You cannot afford this project budget.');
      return null;
    }

    // Check concurrent project limit
    const maxProjects = this._maxConcurrent();
    if (s.projects.length >= maxProjects) {
      GF.notifications.push('warning', 'Project Limit Reached',
        `Your office supports up to ${maxProjects} concurrent projects.`);
      return null;
    }

    // Deduct initial budget (50% upfront)
    const upfront = Math.floor(options.budget * 0.5);
    GF.state.add('finances.cash', -upfront);

    const project = {
      id:            GF.state.uuid(),
      title:         options.title,
      genre:         options.genre,
      platforms:     options.platforms || ['pc'],
      engine:        s.company.engineType,
      budget:        options.budget,
      spent:         upfront,
      phase:         'preproduction',
      phaseProgress: 0,
      totalProgress: 0,
      assignedStaff: options.staffIds || [],
      focus: {
        graphics:  options.focus?.graphics  || 25,
        gameplay:  options.focus?.gameplay  || 25,
        story:     options.focus?.story     || 25,
        sound:     options.focus?.sound     || 25
      },
      crunchMode:      false,
      quality:         { graphics: 0, gameplay: 0, story: 0, sound: 0, total: 0 },
      marketingBudget: 0,
      hype:            0,
      bugs:            0,
      startDate:       { year: s.time.year, week: s.time.week },
      releaseDate:     null,
      platformDeals:   [],
      estimatedWeeks:  this._estimateWeeks(options, s)
    };

    // Assign staff to project
    for (const staffId of project.assignedStaff) {
      GF.team.assignToProject(staffId, project.id);
    }

    s.projects.push(project);

    GF.notifications.push('success', `Project Started: "${project.title}"`,
      `${GF.GENRES[project.genre]?.label} | Budget: $${GF.ui.formatNum(project.budget)}`);

    return project;
  },

  _maxConcurrent() {
    const s = GF.state.get();
    const level = s.company.officeLevel;
    return [0, 1, 2, 3, 5, 8][level] || 1;
  },

  _estimateWeeks(options, s) {
    const team = s.staff.filter(st => options.staffIds?.includes(st.id));
    const avgSkill = team.length
      ? team.reduce((a, b) => a + b.skill, 0) / team.length
      : 3;

    const baseDuration = Object.values(GF.PHASE_DURATIONS).reduce((a, b) => a + b, 0);
    const budgetFactor = Math.sqrt(options.budget / 200000);
    const skillFactor  = 10 / avgSkill;

    return Math.round(baseDuration * budgetFactor * skillFactor * 0.8);
  },

  /* ── Weekly tick ─────────────────────────────────────── */
  weeklyTick() {
    const s = GF.state.get();
    const toRelease = [];

    for (const project of s.projects) {
      this._advanceProject(project, s);
      if (project.phase === 'released') {
        toRelease.push(project);
      }
    }

    // Release ready projects
    for (const proj of toRelease) {
      this._releaseProject(proj, s);
    }
  },

  _advanceProject(project, s) {
    // Gather assigned staff
    const team = s.staff.filter(st => project.assignedStaff.includes(st.id));

    if (team.length === 0) return; // No one working on it

    // Calculate weekly progress contribution
    const avgSkill   = team.reduce((a, b) => a + b.skill, 0) / team.length;
    const avgMorale  = team.reduce((a, b) => a + b.morale, 0) / team.length;
    const engine     = GF.ENGINES[project.engine] || GF.ENGINES.unity;
    const crunchMult = project.crunchMode ? 1.5 : 1;
    const moraleMult = 0.6 + (avgMorale / 100) * 0.8;
    const teamSizeMult = Math.sqrt(team.length / 3);

    const progressPerWeek = (avgSkill / 10) * moraleMult * engine.speedMult * crunchMult * teamSizeMult * 8;

    // Phase-specific progress
    const phaseDuration = GF.PHASE_DURATIONS[project.phase] || 4;
    const phasePct = progressPerWeek / phaseDuration;

    project.phaseProgress = Math.min(100, project.phaseProgress + phasePct);

    // Bug accumulation (crunch = more bugs, QA phase = bug reduction)
    if (project.phase === 'production') {
      const bugRate = project.crunchMode ? 0.5 : 0.15;
      project.bugs += Math.floor(Math.random() * bugRate * (10 - avgSkill) + 0.1);
    }
    if (project.phase === 'qa') {
      const fixRate = avgSkill * 0.8 + 0.5;
      project.bugs = Math.max(0, project.bugs - Math.floor(fixRate));
    }

    // Hype build during marketing phase
    if (project.phase === 'marketing') {
      const marketingSkill = team.filter(st => st.role === 'marketing').reduce((a,b)=>a+b.skill,0) || 0;
      project.hype = Math.min(100, project.hype + (marketingSkill || 3) * 0.5 + project.marketingBudget / 100000);
    }

    // Build quality incrementally
    this._buildQuality(project, team, engine, s);

    // Advance weekly spending (remaining 50% of budget over production weeks)
    const weeklyBurn = (project.budget * 0.5) / (project.estimatedWeeks || 26);
    project.spent    = Math.min(project.budget, project.spent + weeklyBurn);
    GF.state.add('finances.cash', -weeklyBurn);
    GF.state.add('finances.totalExpenses', weeklyBurn);

    // Phase transition
    if (project.phaseProgress >= 100) {
      this._nextPhase(project, s);
    }

    // Total progress (weighted across 4 phases)
    const phaseWeights = { preproduction: 0.1, production: 0.65, qa: 0.15, marketing: 0.1 };
    const completedPhases = GF.PHASES.slice(0, GF.PHASES.indexOf(project.phase));
    const completedPct = completedPhases.reduce((a, p) => a + phaseWeights[p], 0);
    const currentPct   = (project.phaseProgress / 100) * phaseWeights[project.phase];
    project.totalProgress = Math.min(99, Math.round((completedPct + currentPct) * 100));
  },

  _buildQuality(project, team, engine, s) {
    const roles = {
      programmer: ['gameplay'],
      artist:     ['graphics'],
      animator:   ['graphics'],
      sound:      ['sound'],
      director:   ['gameplay', 'story', 'graphics'],
      qa:         [],
      marketing:  []
    };

    for (const staff of team) {
      const dims = roles[staff.role] || ['gameplay'];
      const contribution = (staff.skill / 10) * (staff.morale / 100) * engine.qualityMult * 0.02;

      for (const dim of dims) {
        if (project.quality[dim] !== undefined) {
          project.quality[dim] = Math.min(100, project.quality[dim] + contribution);
        }
      }

      // Story quality from director
      if (staff.role === 'director') {
        project.quality.story = Math.min(100, project.quality.story + contribution);
      }
    }

    // Focus multipliers
    project.quality.graphics = Math.min(100, project.quality.graphics * (1 + project.focus.graphics / 200));
    project.quality.gameplay = Math.min(100, project.quality.gameplay * (1 + project.focus.gameplay / 200));
    project.quality.story    = Math.min(100, project.quality.story    * (1 + project.focus.story    / 200));
    project.quality.sound    = Math.min(100, project.quality.sound    * (1 + project.focus.sound    / 200));

    // Research bonuses
    const resBonus = GF.research.getQualityBonus();
    project.quality.total = Math.round(
      (project.quality.graphics * 0.25 +
       project.quality.gameplay * 0.35 +
       project.quality.story    * 0.25 +
       project.quality.sound    * 0.15) * resBonus
    );
  },

  _nextPhase(project, s) {
    const phases = GF.PHASES;
    const idx = phases.indexOf(project.phase);
    project.phaseProgress = 0;

    if (idx < phases.length - 1) {
      project.phase = phases[idx + 1];
      GF.notifications.push('info', `"${project.title}" — ${GF.PHASE_LABELS[project.phase]}`,
        `The project has entered ${GF.PHASE_LABELS[project.phase]}.`);
    } else {
      // Done marketing — mark for release
      project.phase = 'released';
    }
  },

  /* ── Release a game ───────────────────────────────────── */
  _releaseProject(project, s) {
    // Calculate review score
    const qualityBase = project.quality.total;
    const bugPenalty  = Math.min(20, project.bugs * 0.5);
    const hypebonus   = project.hype * 0.05;
    let reviewScore   = Math.min(100, Math.max(10, qualityBase - bugPenalty + hypebonus));

    // Genre specialty bonus
    if (project.genre === s.company.specialtyGenre) {
      reviewScore = Math.min(100, reviewScore + 5);
    }

    // Engine quality bonus
    reviewScore = Math.min(100, reviewScore * (GF.ENGINES[project.engine]?.qualityMult || 1));

    reviewScore = Math.round(reviewScore);

    // Calculate sales
    const units = GF.market.estimateAudience(project.genre, project.platforms, reviewScore);
    const price = this._calcPrice(project);
    let grossRevenue = units * price;

    // Platform cuts
    let revenue = grossRevenue;
    for (const p of project.platforms) {
      const cut = GF.PLATFORMS[p]?.cut || 0.30;
      revenue -= (grossRevenue / project.platforms.length) * cut;
    }

    revenue = Math.round(revenue);

    // Update cash
    GF.state.add('finances.cash', revenue);
    GF.state.add('finances.totalRevenue', revenue);
    GF.state.add('finances.monthlyRevenue', revenue * 0.3); // first month estimate

    // Build released game object
    const released = {
      id:           project.id,
      title:        project.title,
      genre:        project.genre,
      platforms:    project.platforms,
      engine:       project.engine,
      releaseDate:  { year: s.time.year, week: s.time.week },
      reviewScore,
      totalSales:   units,
      totalRevenue: revenue,
      firstWeekSales: Math.floor(units * 0.25),
      monthlyDecay: 0.85, // sales decay each month
      currentMonthlySales: Math.floor(units * 0.25),
      budget:       project.budget,
      quality:      { ...project.quality },
      awards:       [],
      bugs:         project.bugs,
      hype:         project.hype,
      marketingBudget: project.marketingBudget
    };

    s.releasedGames.push(released);
    s.statistics.gamesReleased++;
    s.statistics.totalSales += units;

    if (reviewScore > s.statistics.highestReviewScore) {
      s.statistics.highestReviewScore = reviewScore;
    }

    // Remove from active projects
    s.projects = s.projects.filter(p => p.id !== project.id);

    // Free staff
    for (const staffId of project.assignedStaff) {
      GF.team.removeFromProject(staffId);
    }

    // Reputation impact
    const repDelta = Math.round((reviewScore - 60) * 0.5);
    s.company.reputation = Math.min(1000, Math.max(0, s.company.reputation + repDelta));

    // Fan impact
    const fanGain = Math.floor(units * (reviewScore / 100) * 0.1);
    s.company.fans += fanGain;

    // Notify
    const scoreEmoji = reviewScore >= 90 ? '🏆' : reviewScore >= 75 ? '⭐' : reviewScore >= 60 ? '👍' : '😐';
    GF.notifications.push('gold', `"${project.title}" Released! ${scoreEmoji}`,
      `Score: ${reviewScore}/100 | Sales: ${GF.ui.formatNum(units)} units | Revenue: $${GF.ui.formatNum(revenue)}`);

    // Check if eligible for awards
    GF.awards.checkNomination(released);

    return released;
  },

  _calcPrice(project) {
    const platformHasMobile = project.platforms.includes('mobile');
    if (platformHasMobile && project.platforms.length === 1) return 4.99;
    if (project.budget > 10000000) return 69.99;
    if (project.budget > 2000000)  return 59.99;
    if (project.budget > 500000)   return 39.99;
    if (project.budget > 100000)   return 24.99;
    return 14.99;
  },

  /* ── Utilities ────────────────────────────────────────── */
  getProjectById(id) {
    return GF.state.get().projects.find(p => p.id === id);
  },

  setMarketing(projectId, budget) {
    const proj = this.getProjectById(projectId);
    if (!proj) return;
    const s = GF.state.get();
    if (s.finances.cash < budget) return;
    GF.state.add('finances.cash', -budget);
    proj.marketingBudget = (proj.marketingBudget || 0) + budget;
    s.statistics.totalMarketingSpent += budget;
    GF.notifications.push('info', `Marketing Budget Updated`, `"${proj.title}" — Total: $${GF.ui.formatNum(proj.marketingBudget)}`);
  },

  toggleCrunch(projectId) {
    const proj = this.getProjectById(projectId);
    if (!proj) return;
    proj.crunchMode = !proj.crunchMode;
    GF.notifications.push(proj.crunchMode ? 'warning' : 'success',
      proj.crunchMode ? 'Crunch Mode Enabled' : 'Crunch Mode Disabled',
      `"${proj.title}" — ${proj.crunchMode ? 'Speed ↑ Morale ↓ Bugs ↑' : 'Team can rest normally.'}`);
  },

  addStaffToProject(projectId, staffId) {
    const proj = this.getProjectById(projectId);
    if (!proj || proj.assignedStaff.includes(staffId)) return false;
    proj.assignedStaff.push(staffId);
    GF.team.assignToProject(staffId, projectId);
    return true;
  },

  removeStaffFromProject(projectId, staffId) {
    const proj = this.getProjectById(projectId);
    if (!proj) return false;
    proj.assignedStaff = proj.assignedStaff.filter(id => id !== staffId);
    GF.team.removeFromProject(staffId);
    return true;
  }
};

console.log('[Development] Module ready');
