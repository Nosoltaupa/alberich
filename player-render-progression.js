function hasAllowedStatChoice(level, choice) {
  return STATS.some(({ key }) => isProgressionChoiceAllowed({
    stats: STATS,
    level: state.sheet.niveau,
    progression: state.progression,
    targetLevel: level,
    choice,
    stat: key,
  }));
}

function renderProgression() {
  const grid = document.getElementById('progression-grid');
  if (!grid) return;

  grid.innerHTML = '';

  getAvailableProgressionLevels(state.sheet.niveau).forEach(entry => {
    const choice = state.progression.choices[entry.level] ?? defaultProgressionChoice(entry.level);
    const complete = entry.type === LEVEL_TYPES.CREATION
      ? getCreationUsedPoints(choice) === PROGRESSION_LIMITS.creationPoints
      : !!choice.choice && (choice.choice === 'pv' || !!choice.stat);

    const card = document.createElement('div');
    card.className = `progression-card${complete ? ' complete' : ''}`;
    card.innerHTML = `
      <div class="progression-head">
        <div class="progression-level">Niveau ${entry.level}</div>
        <div class="progression-type">${entry.label}</div>
      </div>
      <div class="progression-actions"></div>
      <div class="progression-stat-row"></div>
    `;

    const actions = card.querySelector('.progression-actions');
    const statRow = card.querySelector('.progression-stat-row');

    if (entry.type === LEVEL_TYPES.CREATION) addCreationChoiceButtons(actions, statRow, choice);
    if (entry.type === LEVEL_TYPES.AMELIORATION) renderAmeliorationProgression(entry, choice, actions, statRow);
    if (entry.type === LEVEL_TYPES.MAITRISE) renderMaitriseProgression(entry, choice, actions, statRow);

    grid.appendChild(card);
  });
}

function renderAmeliorationProgression(entry, choice, actions, statRow) {
  if (choice.choice === 'pv') {
    addProgressionButton(actions, '♥', true, () => clearProgressionChoice(entry.level));
    return;
  }

  if (choice.choice === 'stat' && choice.stat) {
    addProgressionButton(actions, `${getStatLabel(choice.stat)} +1`, true, () => clearProgressionChoice(entry.level));
    return;
  }

  addProgressionButton(
    actions,
    'Caractéristique',
    false,
    () => setProgressionChoice(entry.level, 'stat', null),
    hasAllowedStatChoice(entry.level, 'stat')
  );
  addProgressionButton(actions, '♥', false, () => setProgressionChoice(entry.level, 'pv', null));

  if (choice.choice === 'stat') addStatButtons(statRow, entry.level, 'stat', choice.stat);
}

function renderMaitriseProgression(entry, choice, actions, statRow) {
  if (choice.choice === 'crit' && choice.stat) {
    addProgressionButton(actions, `${getStatLabel(choice.stat)} critique`, true, () => clearProgressionChoice(entry.level));
    return;
  }

  if (choice.choice === 'action' && choice.stat) {
    addProgressionButton(actions, `+1 action de ${getStatLabel(choice.stat)}`, true, () => clearProgressionChoice(entry.level));
    return;
  }

  addProgressionButton(
    actions,
    'Critique',
    false,
    () => setProgressionChoice(entry.level, 'crit', null),
    hasAllowedStatChoice(entry.level, 'crit')
  );
  addProgressionButton(
    actions,
    'Actions par tour',
    false,
    () => setProgressionChoice(entry.level, 'action', null),
    hasAllowedStatChoice(entry.level, 'action')
  );

  if (choice.choice === 'crit' || choice.choice === 'action') addStatButtons(statRow, entry.level, choice.choice, choice.stat);
}

function addProgressionButton(container, label, active, onClick, enabled = true) {
  const btn = document.createElement('button');
  btn.className = `progression-btn${active ? ' active' : ''}`;
  btn.type = 'button';
  btn.textContent = label;
  btn.disabled = !enabled;
  btn.onclick = enabled ? onClick : null;
  container.appendChild(btn);
}

function addCreationChoiceButtons(actions, statRow, choice) {
  for (let i = 0; i < PROGRESSION_LIMITS.creationPoints; i++) {
    const selected = choice.slots?.[i] ?? null;

    addProgressionButton(
      actions,
      selected ? `${getStatLabel(selected)} +1` : `Carac ${i + 1}`,
      !!selected,
      () => {
        choice.openSlot = choice.openSlot === i ? null : i;
        state.progression.choices[1] = {
          level: 1,
          type: LEVEL_TYPES.CREATION,
          allocation: choice.allocation ?? {},
          slots: choice.slots ?? [],
          openSlot: choice.openSlot,
        };
        save();
        renderSheet();
      }
    );
  }

  if (Number.isInteger(choice.openSlot)) addCreationSlotStatButtons(statRow, choice.openSlot, choice);
}

function addCreationSlotStatButtons(container, slotIndex, choice) {
  STATS.forEach(({ key, label }) => {
    const allowed = canSetCreationSlot(choice, slotIndex, key);
    const btn = document.createElement('button');
    btn.className = `progression-btn${choice.slots?.[slotIndex] === key ? ' active' : ''}`;
    btn.type = 'button';
    btn.textContent = label;
    btn.disabled = !allowed && choice.slots?.[slotIndex] !== key;
    btn.onclick = () => setCreationSlot(slotIndex, key);
    container.appendChild(btn);
  });
}

function canSetCreationSlot(choice, slotIndex, stat) {
  const slots = Array.from({ length: PROGRESSION_LIMITS.creationPoints }, (_, i) => choice.slots?.[i] ?? null);
  slots[slotIndex] = stat;

  const allocation = {};
  slots.forEach(key => {
    if (key) allocation[key] = (allocation[key] ?? 0) + 1;
  });

  return PROGRESSION_LIMITS.minStat + (allocation[stat] ?? 0) <= PROGRESSION_LIMITS.maxStat;
}

function getStatLabel(key) {
  return STATS.find(s => s.key === key)?.label ?? key;
}

function setCreationSlot(slotIndex, stat) {
  const choice = state.progression.choices[1] ?? defaultProgressionChoice(1);
  if (!canSetCreationSlot(choice, slotIndex, stat)) return;

  const slots = Array.from({ length: PROGRESSION_LIMITS.creationPoints }, (_, i) => choice.slots?.[i] ?? null);
  slots[slotIndex] = stat;

  const allocation = {};
  slots.forEach(key => {
    if (key) allocation[key] = (allocation[key] ?? 0) + 1;
  });

  state.progression.choices[1] = {
    level: 1,
    type: LEVEL_TYPES.CREATION,
    allocation,
    slots,
    openSlot: null,
  };

  save();
  renderSheet();
}

function addStatButtons(container, level, choice, currentStat) {
  STATS.forEach(({ key, label }) => {
    const allowed = isProgressionChoiceAllowed({
      stats: STATS,
      level: state.sheet.niveau,
      progression: state.progression,
      targetLevel: level,
      choice,
      stat: key,
    });

    const btn = document.createElement('button');
    btn.className = `progression-btn${currentStat === key ? ' active' : ''}`;
    btn.type = 'button';
    btn.textContent = label;
    btn.disabled = !allowed && currentStat !== key;
    btn.onclick = () => setProgressionChoice(level, choice, key);
    container.appendChild(btn);
  });
}
