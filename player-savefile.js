function exportSaveFile() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (state.nom || state.joueur || PLAYER_ID)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, '-');

  a.href = url;
  a.download = `sauvegarde-${safeName}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showStatus('Sauvegarde exportée');
}

function importSaveFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);

      state = { ...defaultPlayerState(), ...imported };
      state.id = PLAYER_ID;
      state.sheet = normalizeSheet(state.sheet);
      state.styles = normalizeStyles(state.styles);
      state.tree = normalizeTreeState(state.tree, state.classeId);
      state.progression = normalizeProgressionState(state.progression);

      save();
      renderAll();
      loadAndRenderTree();
      showStatus('Sauvegarde importée');
    } catch {
      alert('Fichier de sauvegarde invalide.');
    }

    event.target.value = '';
  };

  reader.readAsText(file);
}

function resetSheet() {
  if (!confirm('Réinitialiser entièrement cette feuille ? Cette action effacera les données locales de ce personnage.')) return;

  localStorage.removeItem(STORAGE_KEY);
  state = defaultPlayerState();

  save();
  renderAll();
  loadAndRenderTree();
  showStatus('Feuille réinitialisée');
}
