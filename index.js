function getSavedPlayer(playerId) {
  try {
    const raw = localStorage.getItem(`personnage_${playerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildGrid() {
  const grid = document.getElementById('players-grid');
  if (!grid) return;

  grid.innerHTML = '';

  PLAYERS.forEach(player => {
    const saved = getSavedPlayer(player.id);
    const playerName = saved?.joueur || player.label;
    const characterName = saved?.nom || player.personnage;
    const classId = saved?.classeId || player.classeId;
    const classMeta = getClassMeta(classId);

    const card = document.createElement('a');
    card.className = 'class-card';
    card.href = `player.html?id=${player.id}`;

    card.innerHTML = `
      <div class="class-card-icon">
        <img src="${classMeta.icone}" alt="${classMeta.nom}"
             onerror="this.style.display='none';this.parentElement.textContent='✦'">
      </div>
      <div class="class-card-info">
        <div class="class-card-name">${playerName}</div>
        <div class="class-card-ambiance">${characterName} · ${classMeta.article} ${classMeta.nom}</div>
      </div>
    `;

    grid.appendChild(card);
  });
}

buildGrid();
