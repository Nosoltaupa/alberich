const params = new URLSearchParams(window.location.search);
const PLAYER_ID = params.get('id') || 'joueur1';
const PLAYER_META = getPlayerMeta(PLAYER_ID);
const STORAGE_KEY = `personnage_${PLAYER_ID}`;
const UI_STORAGE_KEY = `personnage_ui_${PLAYER_ID}`;
const MAX_LVL = 10, BASE_PV = 6;
const CRIT_FACES = [6, 5, 4];
const DIE_DOTS = { 4: [[.3,.3],[.7,.3],[.3,.7],[.7,.7]], 5: [[.3,.3],[.7,.3],[.5,.5],[.3,.7],[.7,.7]], 6: [[.3,.25],[.7,.25],[.3,.5],[.7,.5],[.3,.75],[.7,.75]] };
let currentClassData = null;

function dieSVG(n) { return `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">${(DIE_DOTS[n] || []).map(([cx, cy]) => `<circle class="die-dot" cx="${cx * 20}" cy="${cy * 20}" r="2.3"/>`).join('')}</svg>`; }
function escapeAttr(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function escapeText(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function defaultStyles() { return Object.fromEntries(STATS.map(s => [s.key, ''])); }
function defaultEquipmentState() { return Object.fromEntries(EQUIPMENT_SLOTS.map(({ key }) => [key, { nom: '', valeur: '', desc: '' }])); }
function defaultSheetState() { return { niveau: 1, pvLost: [], equipement: defaultEquipmentState(), inventaire: Array.from({ length: 6 }, () => '') }; }
function defaultPlayerState() { return { id: PLAYER_ID, joueur: PLAYER_META.label, nom: PLAYER_META.personnage, classeId: PLAYER_META.classeId, styles: defaultStyles(), sheet: defaultSheetState(), tree: TREE_STATE_DEFAULT(), progression: defaultProgressionState() }; }

let state = defaultPlayerState();
let statusTimer = null;

function normalizeSheet(sheet) {
  const fallback = defaultSheetState();
  const normalized = { ...fallback, ...(sheet ?? {}) };
  normalized.niveau = Number.isInteger(normalized.niveau) ? normalized.niveau : fallback.niveau;
  normalized.pvLost = Array.isArray(normalized.pvLost) ? normalized.pvLost : (Array.isArray(normalized.pv) ? normalized.pv.map(h => !!h.lost) : []);
  normalized.equipement = Object.fromEntries(EQUIPMENT_SLOTS.map(({ key }) => [key, {
    nom: normalized.equipement?.[key]?.nom ?? '',
    valeur: normalized.equipement?.[key]?.valeur ?? '',
    desc: normalized.equipement?.[key]?.desc ?? '',
  }]));
  normalized.inventaire = Array.from({ length: 6 }, (_, i) => normalized.inventaire?.[i] ?? '');
  return normalized;
}

function normalizeStyles(styles) {
  const fallback = defaultStyles();
  return Object.fromEntries(STATS.map(({ key }) => [key, styles?.[key] ?? fallback[key]]));
}

function getComputedSheet() {
  return computeSheetFromProgression({ stats: STATS, level: state.sheet.niveau, progression: state.progression });
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showStatus('Sauvegardé automatiquement');
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    state = { ...defaultPlayerState(), ...JSON.parse(raw) };
    state.sheet = normalizeSheet(state.sheet);
    state.styles = normalizeStyles(state.styles);
    state.tree = normalizeTreeState(state.tree, state.classeId);
    state.progression = normalizeProgressionState(state.progression);
  } catch {}
}

function showStatus(message) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { el.textContent = ''; }, 1800);
}

function toggleIdentityPanel() {
  const panel = document.getElementById('identity-panel');
  panel.classList.toggle('is-closed');
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ identityClosed: panel.classList.contains('is-closed') }));
}

function toggleProgressionPanel() {
  const panel = document.getElementById('progression-panel');
  panel.classList.toggle('is-closed');
  const raw = localStorage.getItem(UI_STORAGE_KEY);
  const ui = raw ? JSON.parse(raw) : {};
  ui.progressionClosed = panel.classList.contains('is-closed');
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(ui));
}

function restoreIdentityPanel() {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return;
    const ui = JSON.parse(raw);
    if (ui.identityClosed) document.getElementById('identity-panel').classList.add('is-closed');
    if (ui.progressionClosed) document.getElementById('progression-panel')?.classList.add('is-closed');
  } catch {}
}

function renderClassSelect() {
  const select = document.getElementById('class-select');
  select.innerHTML = CLASSES.map(cls => `<option value="${cls.id}"${cls.id === state.classeId ? ' selected' : ''}>${cls.nom}</option>`).join('');
  select.onchange = async () => {
    state.classeId = select.value;
    state.tree = normalizeTreeState(null, state.classeId);
    save();
    await loadAndRenderTree();
    renderAll();
  };
}

function renderIdentity() {
  document.getElementById('player-label').textContent = state.joueur || PLAYER_META.label;
  document.getElementById('player-title').textContent = state.nom || 'Nouveau personnage';
  const classMeta = getClassMeta(state.classeId);
  document.getElementById('player-subtitle').textContent = `${classMeta.article} ${classMeta.nom}`;

  const playerInput = document.getElementById('player-name');
  playerInput.value = state.joueur;
  playerInput.oninput = () => {
    state.joueur = playerInput.value;
    document.getElementById('player-label').textContent = state.joueur || PLAYER_META.label;
    save();
  };

  const characterInput = document.getElementById('character-name');
  characterInput.value = state.nom;
  characterInput.oninput = () => {
    state.nom = characterInput.value;
    document.getElementById('player-title').textContent = state.nom || 'Nouveau personnage';
    save();
  };
}

function renderStylesConfig() {
  const grid = document.getElementById('style-grid');
  grid.innerHTML = '';
  STATS.forEach(({ key, label }) => {
    const wrap = document.createElement('div');
    wrap.className = 'field-group';
    wrap.innerHTML = `<label class="field-label" for="style-${key}">Style de ${label}</label><input class="sheet-input" id="style-${key}" type="text" placeholder="Ex. brutal, précis, mystique" value="${escapeAttr(state.styles[key])}">`;
    const input = wrap.querySelector('input');
    input.oninput = () => {
      state.styles[key] = input.value;
      save();
      renderSheetCaracs();
    };
    grid.appendChild(wrap);
  });
}

function renderClassPreview() {
  const classMeta = getClassMeta(state.classeId);
  document.getElementById('class-preview').innerHTML = `<div class="class-preview-icon"><img src="${classMeta.icone}" alt="${classMeta.nom}" onerror="this.style.display='none'"></div><div><div class="class-preview-name">${classMeta.article} ${classMeta.nom}</div><div class="class-preview-desc">${classMeta.ambiance}</div></div>`;
}

function renderSheetLevel() {
  const row = document.getElementById('sheet-level-bar');
  row.innerHTML = '';
  for (let i = 0; i < MAX_LVL; i++) {
    const level = i + 1;
    const pip = document.createElement('div');
    pip.className = ['level-pip', level <= state.sheet.niveau ? 'filled' : '', level === state.sheet.niveau ? 'current' : ''].filter(Boolean).join(' ');
    pip.textContent = level;
    pip.title = `Niveau ${level}`;
    pip.onclick = () => { setLevel(level); };
    row.appendChild(pip);
  }
}

function setLevel(level) {
  state.sheet.niveau = level;
  clearInactiveProgressionChoices();
  save();
  renderSheet();
  renderTreeOnly();
}

function clearInactiveProgressionChoices() {
  state.progression = normalizeProgressionState(state.progression);
  Object.keys(state.progression.choices).forEach(levelKey => {
    const level = Number(levelKey);
    if (level > state.sheet.niveau) state.progression.choices[level] = defaultProgressionChoice(level);
  });
}

function setProgressionChoice(level, choice, stat = null) {
  const entry = getProgressionLevel(level);
  state.progression.choices[level] = { level, type: entry.type, choice, stat };
  save();
  renderSheet();
}

function clearProgressionChoice(level) {
  state.progression.choices[level] = defaultProgressionChoice(level);
  save();
  renderSheet();
}

function renderSheetCaracs() {
  const computed = getComputedSheet();
  const grid = document.getElementById('sheet-carac-grid');
  grid.innerHTML = '';

  STATS.forEach(({ key, label }) => {
    const data = computed.carac[key];
    const style = state.styles?.[key] ?? '';
    const col = document.createElement('div');
    col.className = 'carac-col';
    col.innerHTML = `<div class="carac-head"><div class="carac-name">${label}</div><div class="carac-style">${escapeText(style)}</div></div>`;

    const valRow = document.createElement('div');
    valRow.className = 'billes-row';
    for (let i = 0; i < PROGRESSION_LIMITS.maxStat; i++) {
      const value = i + 1;
      const b = document.createElement('div');
      b.className = `bille${value <= data.val ? ' filled' : ''}${value === 1 ? ' fixed' : ''}`;
      b.title = `${label} ${value}`;
      valRow.appendChild(b);
    }
    col.appendChild(valRow);

    const critBlock = document.createElement('div');
    critBlock.className = 'crit-block';
    critBlock.innerHTML = '<div class="block-label">Critique</div>';
    const diceRow = document.createElement('div');
    diceRow.className = 'crit-dice';
    CRIT_FACES.forEach((face, fi) => {
      const die = document.createElement('div');
      die.innerHTML = dieSVG(face);
      die.className = `die-face${data.crit[fi] ? ' active' : ''}${fi === 0 ? ' fixed' : ''}`;
      die.title = `CRIT ${label} : ${face}`;
      diceRow.appendChild(die);
    });
    critBlock.appendChild(diceRow);
    col.appendChild(critBlock);

    const actBlock = document.createElement('div');
    actBlock.className = 'actions-block';
    actBlock.innerHTML = '<div class="block-label">Actions / tour</div>';
    const actRow = document.createElement('div');
    actRow.className = 'billes-row';
    for (let i = 0; i < PROGRESSION_LIMITS.maxActions; i++) {
      const value = i + 1;
      const b = document.createElement('div');
      b.className = `bille${value <= data.act ? ' filled' : ''}${value === 1 ? ' fixed' : ''}`;
      b.title = `${label} : ${value} action${value > 1 ? 's' : ''}/tour`;
      actRow.appendChild(b);
    }
    actBlock.appendChild(actRow);
    col.appendChild(actBlock);
    grid.appendChild(col);
  });
}

function renderSheetPV() {
  const computed = getComputedSheet();
  state.sheet.pvLost = Array.from({ length: computed.maxPV }, (_, i) => !!state.sheet.pvLost?.[i]);
  const row = document.getElementById('sheet-hearts-row');
  row.innerHTML = '';
  state.sheet.pvLost.forEach((lost, i) => {
    const el = document.createElement('span');
    el.className = `heart ${lost ? 'lost' : 'full'}`;
    el.textContent = '♥';
    el.title = lost ? 'Blessure — cliquer pour récupérer' : 'PV — cliquer pour perdre';
    el.onclick = () => {
      state.sheet.pvLost[i] = !state.sheet.pvLost[i];
      save();
      renderSheetPV();
    };
    row.appendChild(el);
  });
}

function renderSheet() {
  renderSheetLevel();
  renderProgression();
  renderSheetCaracs();
  renderSheetPV();
  renderSheetEquipement();
  renderSheetInventaire();
}

function renderTreeOnly() {
  if (!currentClassData) return;
  ensurePlayerTreeState(state);
  renderPlayerTree({
    containerId:'player-tree-root',
    classId:state.classeId,
    classData:currentClassData,
    treeState:state.tree,
    playerLevel:state.sheet.niveau,
    onChange: treeState => {
      state.tree = treeState;
      save();
      renderTreeOnly();
    },
  });
}

async function loadAndRenderTree() {
  const root = document.getElementById('player-tree-root');
  root.innerHTML = '<div class="placeholder-panel">Chargement de l’arbre…</div>';
  try {
    ensurePlayerTreeState(state);
    currentClassData = await loadClassScript(state.classeId);
    renderTreeOnly();
  } catch (err) {
    root.innerHTML = `<div class="tree-error">${err.message}</div>`;
  }
}

function renderAll() {
  renderIdentity();
  renderClassSelect();
  renderStylesConfig();
  renderClassPreview();
  renderSheet();
  restoreIdentityPanel();
}

load();
renderAll();
loadAndRenderTree();
