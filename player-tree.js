// ============================================================
//  MOTEUR D'ARBRE INTÉGRÉ — player-tree.js
// ============================================================

const TREE_STATE_DEFAULT = () => ({
  classId: '',
  unlocked: {},
  openCards: {},
});

function normalizeTreeState(tree, classId) {
  return {
    classId,
    unlocked: tree?.classId === classId ? (tree.unlocked ?? {}) : {},
    openCards: tree?.classId === classId ? (tree.openCards ?? {}) : {},
  };
}

function countTreeUnlocked(treeState) {
  return Object.values(treeState.unlocked ?? {}).filter(Boolean).length;
}

function canUnlockTreeBranch(treeState, branchIndex, skillIndex) {
  return skillIndex === 0 || !!treeState.unlocked[`${branchIndex}-${skillIndex - 1}`];
}

function ensurePlayerTreeState(state) {
  state.tree = normalizeTreeState(state.tree, state.classeId);
}

async function loadClassScript(classId) {
  const response = await fetch(`${classId}/classe.js?v=${Date.now()}`);
  if (!response.ok) throw new Error(`Impossible de charger ${classId}/classe.js`);

  const source = await response.text();
  const factory = new Function(`${source}\nreturn CLASS_DATA;`);
  const classData = factory();

  if (!classData?.branches || !classData?.ultime) {
    throw new Error(`Données de classe invalides pour ${classId}`);
  }

  return classData;
}

function renderPlayerTree({ containerId, classId, classData, treeState, playerLevel, onChange }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const used = countTreeUnlocked(treeState);
  const canUnlockMore = used < playerLevel;

  container.innerHTML = `
    <div class="player-tree-head">
      <div>
        <div class="player-tree-title">${classData.article} ${classData.nom}</div>
        <div class="player-tree-subtitle">${classData.ambiance}</div>
      </div>
      <div class="player-tree-count">${used}&thinsp;/&thinsp;${playerLevel} compétences</div>
    </div>
    <div class="player-tree-grid" id="player-tree-grid"></div>
    <div class="player-ultimate" id="player-ultimate"></div>
  `;

  const grid = document.getElementById('player-tree-grid');

  classData.branches.forEach((branch, branchIndex) => {
    const branchEl = document.createElement('div');
    branchEl.className = 'player-branch';
    branchEl.innerHTML = `
      <div class="player-branch-header">
        <div class="player-branch-icon">
          <img src="${classId}/branche${branchIndex + 1}.webp" alt="${branch.nom}" onerror="this.style.display='none'">
        </div>
        <div class="player-branch-name">${branch.nom}</div>
      </div>
    `;

    branch.competences.forEach((skill, skillIndex) => {
      const key = `${branchIndex}-${skillIndex}`;
      const unlocked = !!treeState.unlocked[key];
      const locked = !canUnlockTreeBranch(treeState, branchIndex, skillIndex);
      const open = !!treeState.openCards[key];

      const card = document.createElement('div');
      card.className = [
        'player-skill-card',
        unlocked ? 'unlocked' : '',
        locked ? 'locked' : '',
        open ? 'open' : '',
      ].filter(Boolean).join(' ');
      card.title = skill.desc;

      card.innerHTML = `
        <div class="player-skill-header">
          <div>
            <div class="player-skill-rank">Rang ${skillIndex + 1}</div>
            <div class="player-skill-name">${skill.nom}${locked ? ' 🔒' : ''}</div>
          </div>
          <div class="player-skill-toggle">▾</div>
        </div>
        <div class="player-skill-detail">
          <p>${skill.desc}</p>
          <div class="player-skill-actions"></div>
        </div>
      `;

      card.querySelector('.player-skill-header').onclick = () => {
        treeState.openCards[key] = !treeState.openCards[key];
        onChange(treeState);
      };

      const actions = card.querySelector('.player-skill-actions');
      const btn = document.createElement('button');
      btn.className = unlocked ? 'tree-btn revoke' : 'tree-btn primary';
      btn.textContent = unlocked ? 'Révoquer' : 'Débloquer';
      btn.disabled = !unlocked && (locked || !canUnlockMore);
      btn.onclick = event => {
        event.stopPropagation();
        if (unlocked) revokeTreeSkill(treeState, branchIndex, skillIndex);
        else {
          treeState.unlocked[key] = true;
          treeState.openCards[key] = true;
        }
        onChange(treeState);
      };
      actions.appendChild(btn);

      branchEl.appendChild(card);
    });

    grid.appendChild(branchEl);
  });

  renderPlayerUltimate({ classData, treeState, playerLevel, canUnlockMore, onChange });
}

function revokeTreeSkill(treeState, branchIndex, skillIndex) {
  for (let i = skillIndex; i < 3; i++) delete treeState.unlocked[`${branchIndex}-${i}`];
}

function renderPlayerUltimate({ classData, treeState, playerLevel, canUnlockMore, onChange }) {
  const ultimate = document.getElementById('player-ultimate');
  if (!ultimate) return;

  const unlocked = !!treeState.unlocked.ultimate;
  const open = !!treeState.openCards.ultimate;
  const available = playerLevel >= 6;

  ultimate.className = [
    'player-ultimate',
    unlocked ? 'unlocked' : '',
    !available ? 'locked' : '',
    open ? 'open' : '',
  ].filter(Boolean).join(' ');
  ultimate.title = classData.ultime.desc;

  ultimate.innerHTML = `
    <div class="player-skill-header">
      <div>
        <div class="player-skill-rank">Compétence ultime</div>
        <div class="player-skill-name">${classData.ultime.nom}${!available ? ' 🔒' : ''}</div>
      </div>
      <div class="player-skill-toggle">▾</div>
    </div>
    <div class="player-skill-detail">
      <p>${classData.ultime.desc}</p>
      <div class="player-skill-actions"></div>
    </div>
  `;

  ultimate.querySelector('.player-skill-header').onclick = () => {
    treeState.openCards.ultimate = !treeState.openCards.ultimate;
    onChange(treeState);
  };

  const btn = document.createElement('button');
  btn.className = unlocked ? 'tree-btn revoke' : 'tree-btn primary';
  btn.textContent = unlocked ? 'Révoquer' : 'Débloquer';
  btn.disabled = !unlocked && (!available || !canUnlockMore);
  btn.onclick = event => {
    event.stopPropagation();
    if (unlocked) delete treeState.unlocked.ultimate;
    else {
      treeState.unlocked.ultimate = true;
      treeState.openCards.ultimate = true;
    }
    onChange(treeState);
  };

  ultimate.querySelector('.player-skill-actions').appendChild(btn);
}
