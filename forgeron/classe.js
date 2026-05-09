// ============================================================
//  FICHIER DE CLASSE — à dupliquer pour chaque personnage
//  Remplacez uniquement le contenu de cet objet CLASS_DATA
// ============================================================

const CLASS_DATA = {

  // Nom affiché dans le titre (avec article si souhaité)
  nom: "Forgeron",
  article: "Le",

  // Texte d'ambiance affiché sous le titre
  ambiance: "Maître artisan capable de forger et modifier des armes et des armures.",

  // Compétence ultime (se débloque au niveau 6)
  ultime: {
    // nom: "Graveur de runes",
    // desc: "Le forgeron peut graver des runes mystiques sur la Norlithe afin de leur octroyer des capacités particulières.<br>Thurisaz : rune de la sauvagerie, à graver sur une arme, qui augmente ses DEG de 1.<br>Ansuz : rune de la connaissance, à graver sur le crâne, qui augmente l'ES de 1.<br>Raido : rune du voyage, à graver sur les tibias, qui augmente l'INIT de 1.<br>Hagalaz : rune de la grêle, à graver sur un arc, qui permet de tirer sans avoir de flèches."
    nom: "Forge des Griffes et des Ecailles",
    desc: "Le forgeron considère les griffes et les écailles des créatures touchées par la norlithe comme des armes et des armures forgées et peut les façonner à sa guise, que ce soit en récupérant ces matériaux sur des créatures vaincues pour forger de l'équipement ou pour modifier les propriétés naturelles des créatures touchées par la norlithe vivantes."
  },

  // Les 3 branches avec leurs 3 compétences chacune
  // Les icônes sont des fichiers image placés dans le même dossier :
  //   branche1.jpg  →  branche 0 (index 0)
  //   branche2.jpg  →  branche 1 (index 1)
  //   branche3.jpg  →  branche 2 (index 2)
  branches: [
    {
      nom: "Brise-armure",
      competences: [
        {
          nom: "Bris d'armure",
          desc: "Lorsque le forgeron effectue un CRIT au combat, il applique l'effet bris d'armure à sa cible, ce qui réduit son ARM de 1."
        },
        {
          nom: "Faille dans l'armure",
          desc: "Le seuil de CRIT des cibles affectées par bris d'armure est abaissé de 1."
        },
        {
          nom: "Faiblesse",
          desc: "Lorsque l'armure de la cible est déjà brisée, les CRIT du forgeron infligent l'effet faiblesse. La prochaine attaque réussie contre cette cible est automatiquement un CRIT."
        }
      ]
    },
    {
      nom: "Affûter",
      competences: [
        {
          nom: "Pôlir",
          desc: "Sur un jet de FI, augmente l’ARM d’une armure forgée de 1 (2 si critique). Non cumulable."
        },
        {
          nom: "Aiguiser",
          desc: "Sur un jet de FI, augmente les DEG d’une arme forgée de 1 (2 si critique). Non cumulable."
        },
        {
          nom: "Arme acérée",
          desc: "Améliore grandement les qualités d'une arme. Celle-ci obtient la description suivante : une fois par combat, une attaque normale devient un CRIT."
        }
      ]
    },
    {
      nom: "Forgeron de guerre",
      competences: [
        {
          nom: "Expertise des armes forgées",
          desc: "Les DEG sont augmentés de 1 en maniant une arme forgée."
        },
        {
          nom: "Botte",
          desc: "Lorsque le forgeron réussit une attaque de PU, il obtient une attaque gratuite de FI ce tour."
        },
        {
          nom: "Enchaînement",
          desc: "Si la botte du forgeron est un CRIT, il obtient une attaque gratuite de PU ce tour. Cette action peut déclencher une botte."
        }
      ]
    }
  ]

};
