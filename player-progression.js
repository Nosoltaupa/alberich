// ============================================================
//  MOTEUR DE PROGRESSION — player-progression.js
// ============================================================

const PROGRESSION_LIMITS = {
  minLevel: 1,
  maxLevel: 10,
  minStat: 1,
  maxStat: 5,
  minActions: 1,
  maxActions: 3,
  minCrit: 4,
  maxCrit: 6,
  basePV: 6,
};

const LEVEL_TYPES = {
  CREATION: 'creation',
  AMELIORATION: 'amelioration',
  MAITRISE: 'maitrise',
};

const PROGRESSION_LEVELS = [
  { level: 1, type: LEVEL_TYPES.CREATION, label: 'Création' },
  { level: 2, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 3, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 4, type: LEVEL_TYPES.MAITRISE, label: 'Maîtrise' },
  { level: 5, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 6, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 7, type: LEVEL_TYPES.MAITRISE, label: 'Maîtrise' },
  { level: 8, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 9, type: LEVEL_TYPES.AMELIORATION, label: 'Amélioration' },
  { level: 10, type: LEVEL_TYPES.MAITRISE, label: 'Maîtrise' },
];

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || min));
}

function getProgressionLevel(level) {
  return PROGRESSION_LEVELS.find(entry => entry.level === level) ?? PROGRESSION_LEVELS[0];
}

function getAvailableProgressionLevels(currentLevel) {
  const cappedLevel = clampNumber(currentLevel, PROGRESSION_LIMITS.minLevel, PROGRESSION_LIMITS.maxLevel);
  return PROGRESSION_LEVELS.filter(entry => entry.level <= cappedLevel);
}

function defaultProgressionChoice(level) {
  const entry = getProgressionLevel(level);

  if (entry.type === LEVEL_TYPES.CREATION) {
    return {
      level,
      type: entry.type,
      choice: null,
      stat: null,
    };
  }

  return {
    level,
    type: entry.type,
    choice: null,
    stat: null,
  };
}

function defaultProgressionState() {
  return {
    choices: Object.fromEntries(PROGRESSION_LEVELS.map(entry => [entry.level, defaultProgressionChoice(entry.level)])),
  };
}

function normalizeProgressionState(progression) {
  const fallback = defaultProgressionState();
  const sourceChoices = progression?.choices ?? {};

  return {
    choices: Object.fromEntries(PROGRESSION_LEVELS.map(entry => {
      const raw = sourceChoices[entry.level] ?? {};
      return [entry.level, {
        level: entry.level,
        type: entry.type,
        choice: raw.choice ?? null,
        stat: raw.stat ?? null,
      }];
    })),
  };
}

function buildBaseComputedSheet(stats) {
  return {
    carac: Object.fromEntries(stats.map(({ key }) => [key, {
      val: PROGRESSION_LIMITS.minStat,
      act: PROGRESSION_LIMITS.minActions,
      critValue: PROGRESSION_LIMITS.maxCrit,
      crit: [true, false, false],
    }])),
    maxPV: PROGRESSION_LIMITS.basePV,
  };
}

function applyCritValueToFlags(critValue) {
  return [
    true,
    critValue <= 5,
    critValue <= 4,
  ];
}

function computeSheetFromProgression({ stats, level, progression }) {
  const computed = buildBaseComputedSheet(stats);
  const normalizedProgression = normalizeProgressionState(progression);
  const availableLevels = getAvailableProgressionLevels(level);

  availableLevels.forEach(entry => {
    const choice = normalizedProgression.choices[entry.level];
    if (!choice) return;

    if (entry.type === LEVEL_TYPES.CREATION) {
      applyCreationChoice(computed, choice);
      return;
    }

    if (entry.type === LEVEL_TYPES.AMELIORATION) {
      applyAmeliorationChoice(computed, choice);
      return;
    }

    if (entry.type === LEVEL_TYPES.MAITRISE) {
      applyMaitriseChoice(computed, choice);
    }
  });

  stats.forEach(({ key }) => {
    const carac = computed.carac[key];
    carac.val = clampNumber(carac.val, PROGRESSION_LIMITS.minStat, PROGRESSION_LIMITS.maxStat);
    carac.act = clampNumber(carac.act, PROGRESSION_LIMITS.minActions, PROGRESSION_LIMITS.maxActions);
    carac.critValue = clampNumber(carac.critValue, PROGRESSION_LIMITS.minCrit, PROGRESSION_LIMITS.maxCrit);
    carac.crit = applyCritValueToFlags(carac.critValue);
  });

  computed.maxPV = Math.max(PROGRESSION_LIMITS.basePV, computed.maxPV);
  return computed;
}

function applyCreationChoice(computed, choice) {
  if (!choice?.choice) return;

  if (choice.choice === 'pv') {
    computed.maxPV += 1;
    return;
  }

  if (choice.choice === 'stat' && choice.stat && computed.carac[choice.stat]) {
    computed.carac[choice.stat].val += 1;
  }
}

function applyAmeliorationChoice(computed, choice) {
  if (!choice?.choice) return;

  if (choice.choice === 'pv') {
    computed.maxPV += 1;
    return;
  }

  if (choice.choice === 'stat' && choice.stat && computed.carac[choice.stat]) {
    computed.carac[choice.stat].val += 1;
  }
}

function applyMaitriseChoice(computed, choice) {
  if (!choice?.choice || !choice.stat || !computed.carac[choice.stat]) return;

  if (choice.choice === 'crit') {
    computed.carac[choice.stat].critValue -= 1;
    return;
  }

  if (choice.choice === 'action') {
    computed.carac[choice.stat].act += 1;
  }
}

function isProgressionChoiceAllowed({ stats, level, progression, targetLevel, choice, stat }) {
  const entry = getProgressionLevel(targetLevel);
  if (targetLevel > level) return false;

  const hypothetical = normalizeProgressionState(progression);
  hypothetical.choices[targetLevel] = {
    level: targetLevel,
    type: entry.type,
    choice,
    stat: stat ?? null,
  };

  const computed = computeSheetFromProgression({ stats, level, progression: hypothetical });

  if (choice === 'pv') return true;

  if (!stat || !computed.carac[stat]) return false;

  if ((entry.type === LEVEL_TYPES.CREATION || entry.type === LEVEL_TYPES.AMELIORATION) && choice === 'stat') {
    return computed.carac[stat].val <= PROGRESSION_LIMITS.maxStat;
  }

  if (entry.type === LEVEL_TYPES.MAITRISE && choice === 'crit') {
    return computed.carac[stat].critValue >= PROGRESSION_LIMITS.minCrit;
  }

  if (entry.type === LEVEL_TYPES.MAITRISE && choice === 'action') {
    return computed.carac[stat].act <= PROGRESSION_LIMITS.maxActions;
  }

  return false;
}
