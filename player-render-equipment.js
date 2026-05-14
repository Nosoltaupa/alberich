function renderSheetEquipement() {
  const grid = document.getElementById('sheet-equipement-grid');
  grid.innerHTML = '';

  EQUIPMENT_SLOTS.forEach(item => {
    const data = state.sheet.equipement[item.key];
    const card = document.createElement('div');
    card.className = 'equipement-card';
    card.innerHTML = `
      <div class="equipement-title">${item.title}</div>
      <div class="equipement-row">
        <input class="sheet-input" type="text" placeholder="Nom de l'objet" value="${escapeAttr(data.nom)}">
        <input class="sheet-input" type="text" placeholder="${item.valueLabel}" value="${escapeAttr(data.valeur)}">
      </div>
      <textarea class="sheet-textarea" placeholder="Description">${escapeText(data.desc)}</textarea>
    `;

    const [nomInput, valeurInput] = card.querySelectorAll('input');
    const descInput = card.querySelector('textarea');

    nomInput.oninput = () => {
      state.sheet.equipement[item.key].nom = nomInput.value;
      save();
    };

    valeurInput.oninput = () => {
      state.sheet.equipement[item.key].valeur = valeurInput.value;
      save();
    };

    descInput.oninput = () => {
      state.sheet.equipement[item.key].desc = descInput.value;
      save();
    };

    grid.appendChild(card);
  });
}

function renderSheetInventaire() {
  const grid = document.getElementById('sheet-inventaire-grid');
  grid.innerHTML = '';

  state.sheet.inventaire.forEach((value, i) => {
    const input = document.createElement('textarea');
    input.className = 'sheet-textarea inventory-textarea inventaire-slot';
    input.placeholder = `Objet ${i + 1}`;
    input.rows = 2;
    input.value = value;

    input.oninput = () => {
      state.sheet.inventaire[i] = input.value;
      save();
    };

    grid.appendChild(input);
  });
}
