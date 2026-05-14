// ============================================================
//  CONFIGURATION COMMUNE — player-data.js
// ============================================================

const STATS = [
  { key: 'PU', label: 'Puissance' },
  { key: 'FI', label: 'Finesse' },
  { key: 'ES', label: 'Esprit' },
];

const EQUIPMENT_SLOTS = [
  { key: 'main1', title: 'Main principale', valueLabel: 'DEG' },
  { key: 'main2', title: 'Main secondaire', valueLabel: 'DEG' },
  { key: 'armure', title: 'Armure', valueLabel: 'ARM' },
];

const CLASSES = [
  {
    id:       'forgeron',
    nom:      'Forgeron',
    article:  'Le',
    ambiance: 'Maître artisan capable de forger et modifier des armes et des armures.',
    icone:    'forgeron/branche1.webp'
  },
  {
    id:       'guerrier',
    nom:      'Guerrier',
    article:  'Le',
    ambiance: 'Rompu au combat avec toutes sortes d\'armes comme à mains nues, au commandement et à la stratégie militaire.',
    icone:    'guerrier/branche2.webp'
  },
  {
    id:       'mineur',
    nom:      'Mineur',
    article:  'Le',
    ambiance: 'Puissant ouvrier habitué des galeries souterraines et des gobelins qui les infestent.',
    icone:    'mineur/branche2.webp'
  },
  {
    id:       'trappeur',
    nom:      'Trappeur',
    article:  'Le',
    ambiance: 'Maître de la survie dans les montagnes et de la chasse au moyen de pièges ingénieux.',
    icone:    'trappeur/branche1.webp'
  },
];

const PLAYERS = [
  {
    id: 'joueur1',
    label: 'Joueur 1',
    personnage: 'Nouveau personnage',
    classeId: 'guerrier',
  },
  {
    id: 'joueur2',
    label: 'Joueur 2',
    personnage: 'Nouveau personnage',
    classeId: 'forgeron',
  },
  {
    id: 'joueur3',
    label: 'Joueur 3',
    personnage: 'Nouveau personnage',
    classeId: 'mineur',
  },
  {
    id: 'joueur4',
    label: 'Joueur 4',
    personnage: 'Nouveau personnage',
    classeId: 'trappeur',
  },
];

function getClassMeta(classId) {
  return CLASSES.find(cls => cls.id === classId) ?? CLASSES[0];
}

function getPlayerMeta(playerId) {
  return PLAYERS.find(player => player.id === playerId) ?? PLAYERS[0];
}
