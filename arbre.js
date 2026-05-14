// ============================================================
//  MOTEUR DE RENDU — arbre.js
// ============================================================

// ---- État ----
let playerLevel = 1;
const unlocked   = {};   // compétences débloquées
const openCards  = {};   // encarts ouverts
const progChoices = {};  // choix de progression : { 2: {key:'stat_PU'}, 4: {key:'crit_FI'}, ... }

const params = new URLSearchParams(window.location.search);
const CLASS_ID = params.get('classe');
const STORAGE_KEY = () => `arbre_${CLASS_ID}`;

// ---- Définition des niveaux de progression (commun à toutes les classes) ----
// type 'stat_pv'  : +1 stat choisie OU +1 PV
// type 'crit_act' : -1 CRIT sur stat choisie OU +1 action/tour sur stat choisie
const PROG_LEVELS = {
  1:  { type: 'base' },
  2:  { type: 'stat_pv' },
  3:  { type: 'stat_pv' },
  4:  { type: 'crit_act' },
  5:  { type: 'stat_pv' },
  6:  { type: 'stat_pv' },
  7:  { type: 'crit_act' },
  8:  { type: 'stat_pv' },
  9:  { type: 'stat_pv' },
  10: { type: 'crit_act' },
};

const STATS = ['Puissance', 'Finesse', 'Esprit'];

// ---- Helpers ----
const $ = id => document.getElementById(id);
const canUnlockBranch = (bi, si) => si === 0 || !!unlocked[`${bi}-${si - 1}`];
const countUnlocked   = () => Object.values(unlocked).filter(Boolean).length;
const canUnlockMore   = () => countUnlocked() < playerLevel;

// ---- Persistance localStorage ----
function saveToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify({ playerLevel, unlocked, progChoices }));
    showStatus('Progression sauvegardée automatiquement', 'ok', 2000);
  } catch {
    showStatus("Impossible d'écrire dans le localStorage", 'warn', 3000);
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY());
    if (!raw) return false;
    const data = JSON.parse(raw);
    playerLevel = data.playerLevel ?? 1;
    Object.assign(unlocked, data.unlocked ?? {});
    Object.assign(progChoices, data.progChoices ?? {});
    return true;
  } catch { return false; }
}

// ---- Export JSON ----
function exportSave() {
  const payload = JSON.stringify({ classe: CLASS_DATA.nom, playerLevel, unlocked, progChoices }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `${CLASS_DATA.nom.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showStatus('Fichier exporté', 'ok', 2500);
}

// ---- Import JSON ----
function importSave(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data.playerLevel !== 'number') throw new Error();
      for (const k of Object.keys(unlocked))    delete unlocked[k];
      for (const k of Object.keys(progChoices)) delete progChoices[k];
      playerLevel = data.playerLevel;
      Object.assign(unlocked, data.unlocked ?? {});
      Object.assign(progChoices, data.progChoices ?? {});
      saveToLocal();
      renderAll();
      showStatus(`Sauvegarde chargée (niv. ${playerLevel})`, 'ok', 3000);
    } catch { showStatus('Fichier non reconnu', 'warn', 3000); }
    input.value = '';
  };
  reader.readAsText(file);
}

// ---- Statut ----
let _statusTimer = null;
function showStatus(msg, type = '', duration = 2000) {
  const el = $('save-status');
  el.textContent = msg;
  el.className = `save-status${type ? ' ' + type : ''}`;
  clearTimeout(_statusTimer);
  _statusTimer = setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, duration);
}

// ---- Init page ----
function initPage() {
  document.title = `${CLASS_DATA.nom} — Arbre de compétences`;
  $('class-article').textContent  = CLASS_DATA.article;
  $('class-name').textContent     = CLASS_DATA.nom;
  $('class-subtitle').textContent = CLASS_DATA.ambiance;
  $('ultimate-title').textContent = CLASS_DATA.ultime.nom;
  $('ultimate-desc').innerHTML    = CLASS_DATA.ultime.desc;
}

// ---- Barre de niveau ----
function renderLevelBar() {
  const used = countUnlocked();
  const s = playerLevel > 1 ? 's' : '';
  $('level-bar').innerHTML =
  '<span class="level-label">Niveau</span>' +
  Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const earned = level <= playerLevel;
    const current = level === playerLevel;

    const cls = [
      'level-pip',
      earned ? 'earned' : '',
      current ? 'current' : ''
    ].join(' ');

    return `
      <div
        class="${cls}"
        onclick="setLevel(${level})"
        title="Niveau ${level}">
        ${level}
      </div>
    `;
  }).join('') +
  `<span class="level-count">(<strong>${used}</strong>&thinsp;/&thinsp;${playerLevel} compétence${s})</span>`;
}

// ---- Arbre de compétences ----
function renderTree() {
  const tree = $('tree');
  tree.innerHTML = '';
  const canMore = canUnlockMore();

  CLASS_DATA.branches.forEach((branch, bi) => {
    const col = document.createElement('div');
    col.className = 'branch-col';
    col.innerHTML = `
      <div class="branch-header">
        <div class="branch-icon-wrap">
          <img src="${CLASS_ID}/branche${bi + 1}.webp" alt="${branch.nom}" onerror="this.style.display='none'">
        </div>
        <div class="branch-name">${branch.nom}</div>
      </div>`;

    branch.competences.forEach((comp, si) => {
      const key        = `${bi}-${si}`;
      const isUnlocked = !!unlocked[key];
      const isLocked   = !canUnlockBranch(bi, si);
      const isOpen     = !!openCards[key];
      const classes = ['skill-card', isUnlocked && 'unlocked', isLocked && 'locked-card', isOpen && 'open active-card']
        .filter(Boolean).join(' ');
      const actionBtn = isUnlocked
        ? `<button class="btn revoke" onclick="event.stopPropagation();revokeSkill(${bi},${si})">Révoquer</button>`
        : `<button class="btn primary" onclick="event.stopPropagation();unlockSkill(${bi},${si})" ${isLocked || !canMore ? 'disabled' : ''}>Débloquer</button>`;

      col.insertAdjacentHTML('beforeend', `
        <div class="connector${isLocked ? ' locked' : ''}">
          <svg width="2" height="14"><line x1="1" y1="0" x2="1" y2="14" stroke-width="1.5"/></svg>
        </div>
        <div class="${classes}" id="card-${key}" onclick="toggleCard('${key}')">
          <div class="skill-header">
            <div class="skill-rank">Rang ${si + 1}</div>
            <div class="skill-name">${comp.nom}${isLocked ? ' <span class="lock-icon">&#128274;</span>' : ''}</div>
            <div class="skill-toggle">&#9662;</div>
          </div>
          <div class="skill-detail${isOpen ? ' open' : ''}">
            <p class="skill-desc">${comp.desc}</p>
            <div class="skill-actions">${actionBtn}</div>
          </div>
        </div>`);
    });
    tree.appendChild(col);
  });
}

// ---- Compétence ultime ----
function renderUltimate() {
  const prereqOk   = playerLevel >= 6;
  const isUnlocked = !!unlocked['ultimate'];
  const isOpen     = !!openCards['ultimate'];
  const canMore    = canUnlockMore();

  $('ultimate-card').className =
    `ultimate-card${!prereqOk ? ' locked-card' : ''}${isUnlocked ? ' unlocked' : ''}${isOpen ? ' open' : ''}`;
  $('ultimate-sub').textContent = !prereqOk
    ? `Lisible — déblocable au niveau\u00a06 (niveau actuel\u00a0: ${playerLevel})`
    : isUnlocked ? 'Débloquée' : 'Disponible — à définir avec le MJ';
  $('ultimate-detail').className = `ultimate-detail${isOpen ? ' open' : ''}`;
  $('ultimate-actions').innerHTML = isUnlocked
    ? `<button class="btn revoke" onclick="event.stopPropagation();revokeUltimate()">Révoquer</button>`
    : `<button class="btn primary" onclick="event.stopPropagation();unlockUltimate()" ${!prereqOk || !canMore ? 'disabled' : ''}>Débloquer</button>`;
}

// ---- Arbre de progression ----
function renderProgression() {
  const timeline = $('prog-timeline');
  timeline.innerHTML = '';

  for (let lvl = 1; lvl <= 10; lvl++) {
    const def      = PROG_LEVELS[lvl];
    const reached  = lvl <= playerLevel;
    const choice   = progChoices[lvl];
    const chosen   = !!choice;

    let levelClass = '';
    if (lvl === 1)    levelClass = 'is-one';
    else if (chosen)  levelClass = 'chosen';
    else if (reached) levelClass = 'reached';

    const row = document.createElement('div');
    row.className = `prog-level${levelClass ? ' ' + levelClass : ''}`;

    row.innerHTML = `
      <div class="prog-num">
        <div class="prog-circle">${lvl}</div>
      </div>
      <div class="prog-line-col"><div class="prog-line"></div></div>
      <div class="prog-content" id="prog-content-${lvl}"></div>`;

    timeline.appendChild(row);

    const content = row.querySelector(`#prog-content-${lvl}`);

    if (def.type === 'base') {
      content.innerHTML = `
        <div class="prog-lvl-label">Création du personnage</div>
        <div class="prog-base">
          6 points à répartir entre Puissance, Finesse et Esprit · 6 ♥<br>
          Seuil de critique (CRIT) à 6 pour Puissance, Finesse et Esprit<br>
          1 action par tour pour Puissance, Finesse et Esprit
        </div>`;
    } else if (def.type === 'stat_pv') {
      content.innerHTML = `<div class="prog-lvl-label">Niveau ${lvl} — Amélioration</div>`;
      content.appendChild(buildStatPvOptions(lvl, reached, choice));
    } else if (def.type === 'crit_act') {
      content.innerHTML = `<div class="prog-lvl-label">Niveau ${lvl} — Maîtrise</div>`;
      content.appendChild(buildCritActOptions(lvl, reached, choice));
    }
  }
}

function buildChoiceButton(label, onClick, options = {}) {
  const btn = document.createElement('div');
  btn.className = ['prog-option', options.className || ''].filter(Boolean).join(' ');
  btn.innerHTML = `<span class="prog-option-title">${label}</span>`;
  if (onClick) btn.onclick = onClick;
  return btn;
}

function appendCancelButton(btn, lvl) {
  const rev = document.createElement('button');
  rev.className = 'prog-revoke';
  rev.textContent = '↩ annuler';
  rev.onclick = e => { e.stopPropagation(); revokeProgChoice(lvl); };
  btn.appendChild(rev);
}

function buildStatSelector(lvl, prefix, labelForStat) {
  const wrap = document.createElement('div');
  wrap.className = 'prog-stat-select';

  STATS.forEach(stat => {
    wrap.appendChild(buildChoiceButton(
      stat,
      () => makeProgChoice(lvl, { key: `${prefix}_${stat}` }),
      { className: 'compact' }
    ));
  });

  const hint = document.createElement('span');
  hint.className = 'prog-select-hint';
  hint.textContent = labelForStat;
  wrap.appendChild(hint);

  return wrap;
}

function buildChosenOption(label, lvl, reached) {
  const btn = buildChoiceButton(label, null, { className: 'chosen' });
  if (reached) appendCancelButton(btn, lvl);
  return btn;
}

function buildStatPvOptions(lvl, reached, choice) {
  const wrap = document.createElement('div');
  wrap.className = 'prog-options';

  if (choice) {
    if (choice.key === 'PV') return buildChosenOption('+1 ♥', lvl, reached);
    if (choice.key?.startsWith('stat_')) return buildChosenOption(`+1 ${choice.key.split('_')[1]}`, lvl, reached);
  }

  if (!reached) {
    wrap.appendChild(buildChoiceButton('+1 carac', null));
    const orEl = document.createElement('span');
    orEl.className = 'prog-or';
    orEl.textContent = 'ou';
    wrap.appendChild(orEl);
    wrap.appendChild(buildChoiceButton('+1 ♥', null));
    return wrap;
  }

  wrap.appendChild(buildChoiceButton('+1 carac', () => {
    wrap.innerHTML = '';
    wrap.appendChild(buildStatSelector(lvl, 'stat', 'Choisir la caractéristique'));
  }));

  const orEl = document.createElement('span');
  orEl.className = 'prog-or';
  orEl.textContent = 'ou';
  wrap.appendChild(orEl);

  wrap.appendChild(buildChoiceButton('+1 ♥', () => makeProgChoice(lvl, { key: 'PV' })));

  return wrap;
}

function buildCritActOptions(lvl, reached, choice) {
  const wrap = document.createElement('div');
  wrap.className = 'prog-options';

  if (choice) {
    if (choice.key?.startsWith('crit_')) return buildChosenOption(`CRIT ${choice.key.split('_')[1]} − 1`, lvl, reached);
    if (choice.key?.startsWith('act_')) return buildChosenOption(`Action ${choice.key.split('_')[1]} + 1`, lvl, reached);
  }

  if (!reached) {
    wrap.appendChild(buildChoiceButton('CRIT − 1', null));
    const or = document.createElement('span');
    or.className = 'prog-or';
    or.textContent = 'ou';
    wrap.appendChild(or);
    wrap.appendChild(buildChoiceButton('+1 action', null));
    return wrap;
  }

  wrap.appendChild(buildChoiceButton('CRIT − 1', () => {
    wrap.innerHTML = '';
    wrap.appendChild(buildStatSelector(lvl, 'crit', 'Choisir le seuil critique'));
  }));

  const or = document.createElement('span');
  or.className = 'prog-or';
  or.textContent = 'ou';
  wrap.appendChild(or);

  wrap.appendChild(buildChoiceButton('+1 action', () => {
    wrap.innerHTML = '';
    wrap.appendChild(buildStatSelector(lvl, 'act', 'Choisir la caractéristique'));
  }));

  return wrap;
}

function makeProgChoice(lvl, choice) {
  progChoices[lvl] = choice;
  saveToLocal();
  renderProgression();
}

function revokeProgChoice(lvl) {
  delete progChoices[lvl];
  saveToLocal();
  renderProgression();
}

// ---- Actions compétences ----
function toggleCard(key) { openCards[key] = !openCards[key]; renderTree(); }
function toggleUltimate() { openCards['ultimate'] = !openCards['ultimate']; renderUltimate(); }

function unlockSkill(bi, si) {
  if (!canUnlockMore()) return;
  const key = `${bi}-${si}`;
  unlocked[key] = true; openCards[key] = true;
  saveToLocal(); renderAll();
  setTimeout(() => {
    const c = $(`card-${key}`);
    if (c) { c.classList.add('just-unlocked'); setTimeout(() => c.classList.remove('just-unlocked'), 800); }
  }, 50);
}

function revokeSkill(bi, si) {
  [si, si + 1, si + 2].forEach(i => { if (i < 3) delete unlocked[`${bi}-${i}`]; });
  saveToLocal(); renderAll();
}

function unlockUltimate() {
  if (playerLevel < 6 || !canUnlockMore()) return;
  unlocked['ultimate'] = true;
  saveToLocal(); renderAll();
}

function revokeUltimate() {
  delete unlocked['ultimate'];
  saveToLocal(); renderAll();
}

function setLevel(n) {
  playerLevel = n;
  if (n < 6) delete unlocked['ultimate'];
  const keys = Object.keys(unlocked).filter(k => unlocked[k]);
  while (countUnlocked() > playerLevel) delete unlocked[keys.pop()];
  saveToLocal(); renderAll();
}

// ---- Rendu global ----
function renderAll() {
  renderLevelBar();
  renderTree();
  renderUltimate();
  renderProgression();
}

// ---- Point d'entrée ----
initPage();
const restored = loadFromLocal();
renderAll();
if (restored) showStatus('Progression restaurée', 'ok', 2500);
