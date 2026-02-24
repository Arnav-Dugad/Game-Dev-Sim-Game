/* ============================================================
   GAMEFORGE — TEAM MANAGEMENT MODULE
   ============================================================ */
'use strict';

GF.team = {
  _applicants: [],

  /* ── Staff generation ─────────────────────────────────── */
  _firstNames: ['Alex','Jordan','Sam','Taylor','Morgan','Casey','Riley','Avery','Quinn','Drew',
                'Parker','Blake','Hayden','Reese','Rowan','Skylar','Devon','Jamie','Kendall','Logan',
                'Marcus','Priya','Kenji','Sofia','Liam','Emma','Noah','Olivia','Ethan','Ava',
                'Lucas','Isabella','Mason','Mia','James','Charlotte','Elijah','Amelia','Oliver'],
  _lastNames:  ['Chen','Rivera','Patel','Nguyen','Kim','Thompson','Garcia','Martinez','Anderson',
                'Taylor','Thomas','Jackson','White','Harris','Clark','Lewis','Robinson','Walker',
                'Hall','Allen','Wright','Scott','Green','Baker','Hill','Adams','Nelson','Carter',
                'Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans'],

  _randomName() {
    return this._firstNames[Math.floor(Math.random() * this._firstNames.length)] + ' ' +
           this._lastNames[Math.floor(Math.random() * this._lastNames.length)];
  },

  _generateStaff(role, minSkill = 2, maxSkill = 8) {
    const roleData = GF.STAFF_ROLES[role];
    const skill = minSkill + Math.floor(Math.random() * (maxSkill - minSkill + 1));
    const salary = Math.round((roleData.baseSalary + (skill / 10) * roleData.maxSkillBonus) * (0.9 + Math.random() * 0.2));

    const specialtyMap = {
      programmer: ['gameplay', 'engine', 'AI', 'graphics', 'networking', 'tools'],
      artist:     ['characters', 'environments', 'UI', 'VFX', 'concept', 'textures'],
      animator:   ['characters', 'cutscenes', 'VFX', 'rigging'],
      sound:      ['music', 'SFX', 'voice', 'mixing'],
      qa:         ['functional', 'performance', 'compliance', 'automation'],
      marketing:  ['social media', 'PR', 'advertising', 'community'],
      director:   ['creative', 'technical', 'narrative'],
      lead_prog:  ['architecture', 'gameplay', 'engine'],
      bizdev:     ['publishing', 'licensing', 'partnerships'],
      community:  ['social media', 'events', 'support']
    };
    const specs = specialtyMap[role] || ['general'];
    const specialty = specs[Math.floor(Math.random() * specs.length)];

    return {
      id:          GF.state.uuid(),
      name:        this._randomName(),
      role,
      skill,
      specialty,
      morale:      65 + Math.floor(Math.random() * 25),
      salary,
      experience:  Math.floor(Math.random() * (skill * 100)),
      level:       skill,
      isOnProject: null,
      hiredAt:     { year: GF.state.get().time.year, week: GF.state.get().time.week }
    };
  },

  /* ── Applicant Pool ───────────────────────────────────── */
  refreshApplicants() {
    const s = GF.state.get();
    const repFactor = s.company.reputation / 1000;
    const count = 6 + Math.floor(repFactor * 8);
    const roles  = Object.keys(GF.STAFF_ROLES);
    const minSkill = Math.max(1, Math.floor(repFactor * 4));
    const maxSkill = Math.min(10, minSkill + 4 + Math.floor(repFactor * 3));

    this._applicants = [];
    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      this._applicants.push(this._generateStaff(role, minSkill, maxSkill));
    }
    return this._applicants;
  },

  getApplicants() {
    if (this._applicants.length === 0) this.refreshApplicants();
    return this._applicants;
  },

  /* ── Hire / Fire ──────────────────────────────────────── */
  hire(applicantId) {
    const s = GF.state.get();
    const idx = this._applicants.findIndex(a => a.id === applicantId);
    if (idx === -1) return null;

    const staff = this._applicants.splice(idx, 1)[0];
    staff.hiredAt = { year: s.time.year, week: s.time.week };
    s.staff.push(staff);
    s.statistics.totalStaffHired++;

    GF.notifications.push('success', `${staff.name} Joined`,
      `${GF.STAFF_ROLES[staff.role].label} — Skill ${staff.skill}/10 — $${GF.ui.formatNum(staff.salary)}/mo`);

    return staff;
  },

  fire(staffId) {
    const s = GF.state.get();
    const idx = s.staff.findIndex(st => st.id === staffId);
    if (idx === -1) return false;

    const staff = s.staff[idx];
    // Severance = 2 months salary
    const severance = staff.salary * 2;
    GF.state.add('finances.cash', -severance);

    // Remove from project
    if (staff.isOnProject) {
      const proj = s.projects.find(p => p.id === staff.isOnProject);
      if (proj) proj.assignedStaff = proj.assignedStaff.filter(id => id !== staffId);
    }

    s.staff.splice(idx, 1);
    s.statistics.totalStaffFired++;

    // Morale hit for remaining staff
    s.staff.forEach(st => { st.morale = Math.max(0, st.morale - 5); });

    GF.notifications.push('warning', `${staff.name} Was Let Go`,
      `Severance paid: $${GF.ui.formatNum(severance)}`);

    return true;
  },

  train(staffId, amount) {
    const s = GF.state.get();
    const staff = s.staff.find(st => st.id === staffId);
    if (!staff) return false;
    if (s.finances.cash < amount) {
      GF.notifications.push('danger', 'Not Enough Funds', 'Cannot afford training.');
      return false;
    }

    GF.state.add('finances.cash', -amount);
    const xpGain = Math.floor(amount / 100);
    staff.experience += xpGain;

    // Level up check
    const xpNeeded = staff.level * 500;
    if (staff.experience >= xpNeeded && staff.skill < 10) {
      staff.skill = Math.min(10, staff.skill + 1);
      staff.level++;
      staff.experience = 0;
      staff.morale = Math.min(100, staff.morale + 10);
      GF.notifications.push('success', `${staff.name} Leveled Up!`,
        `Skill is now ${staff.skill}/10`);
    }

    GF.notifications.push('info', `Training: ${staff.name}`,
      `+${xpGain} XP gained from $${GF.ui.formatNum(amount)} investment`);
    return true;
  },

  giveBonus(staffId, amount) {
    const s = GF.state.get();
    const staff = s.staff.find(st => st.id === staffId);
    if (!staff) return false;
    if (s.finances.cash < amount) return false;

    GF.state.add('finances.cash', -amount);
    staff.morale = Math.min(100, staff.morale + Math.floor(amount / 500));
    GF.notifications.push('success', `Bonus Paid to ${staff.name}`, `$${GF.ui.formatNum(amount)}`);
    return true;
  },

  /* ── Weekly tick ─────────────────────────────────────── */
  weeklyTick() {
    const s = GF.state.get();

    for (const staff of s.staff) {
      // Morale drift towards 70 (natural recovery / decay)
      if (staff.morale < 70) staff.morale = Math.min(70, staff.morale + 1);
      else if (staff.morale > 85) staff.morale = Math.max(85, staff.morale - 1);

      // Experience gain while on project
      if (staff.isOnProject) {
        staff.experience += Math.floor(staff.skill * 2 + Math.random() * 5);

        // Crunch morale penalty
        const proj = s.projects.find(p => p.id === staff.isOnProject);
        if (proj && proj.crunchMode) {
          staff.morale = Math.max(5, staff.morale - 3);
        }
      }

      // Random morale events
      if (Math.random() < 0.02) {
        const events = [
          { delta: 8,  msg: `${staff.name} is feeling inspired!` },
          { delta: -6, msg: `${staff.name} is feeling burnt out.` },
          { delta: 5,  msg: `${staff.name} got great feedback on their work.` },
          { delta: -8, msg: `${staff.name} is unhappy with the direction of the project.` }
        ];
        const e = events[Math.floor(Math.random() * events.length)];
        staff.morale = Math.min(100, Math.max(0, staff.morale + e.delta));
        GF.notifications.push(e.delta > 0 ? 'info' : 'warning', 'Team Update', e.msg, false);
      }

      // Headhunting risk (low morale + high skill = higher chance)
      const headhuntRisk = (staff.skill / 10) * ((100 - staff.morale) / 100) * 0.01;
      if (Math.random() < headhuntRisk) {
        this._headhunt(staff, s);
      }
    }
  },

  _headhunt(staff, s) {
    const companies = ['EA', 'Ubisoft', 'Activision', 'Microsoft', 'Sony', 'Rockstar', '2K'];
    const recruiter = companies[Math.floor(Math.random() * companies.length)];
    GF.notifications.push('danger', `${recruiter} is Headhunting ${staff.name}!`,
      `Skill ${staff.skill}/10 | Morale ${staff.morale}% — Consider a raise or bonus.`);
  },

  /* ── Aggregate stats ─────────────────────────────────── */
  getTeamStats() {
    const s = GF.state.get();
    if (!s.staff.length) return { avgSkill: 0, avgMorale: 0, count: 0, monthlyCost: 0 };

    const avgSkill   = s.staff.reduce((a, b) => a + b.skill, 0) / s.staff.length;
    const avgMorale  = s.staff.reduce((a, b) => a + b.morale, 0) / s.staff.length;
    const monthlyCost = s.staff.reduce((a, b) => a + b.salary, 0);

    return {
      avgSkill:   Math.round(avgSkill * 10) / 10,
      avgMorale:  Math.round(avgMorale),
      count:      s.staff.length,
      monthlyCost
    };
  },

  /** Staff available for project assignment */
  getAvailableStaff() {
    const s = GF.state.get();
    return s.staff.filter(st => !st.isOnProject);
  },

  /** Assign staff to a project */
  assignToProject(staffId, projectId) {
    const s = GF.state.get();
    const staff = s.staff.find(st => st.id === staffId);
    if (!staff) return;
    staff.isOnProject = projectId;
  },

  /** Remove staff from project */
  removeFromProject(staffId) {
    const s = GF.state.get();
    const staff = s.staff.find(st => st.id === staffId);
    if (!staff) return;
    staff.isOnProject = null;
  }
};

console.log('[Team] Module ready');
