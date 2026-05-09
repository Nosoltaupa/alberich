// ============================================================
//  FICHIER DE CLASSE — à dupliquer pour chaque personnage
//  Remplacez uniquement le contenu de cet objet CLASS_DATA
// ============================================================

const CLASS_DATA = {

  // Nom affiché dans le titre (avec article si souhaité)
  nom: "Mineur",
  article: "Le",

  // Texte d'ambiance affiché sous le titre
  ambiance: "Puissant ouvrier habitué des galeries souterraines et des gobelins qui les infestent.",

  // Compétence ultime (se débloque au niveau 6)
  ultime: {
    nom: "Ulti",
    desc: "???"
  },

  // Les 3 branches avec leurs 3 compétences chacune
  // Les icônes sont des fichiers image placés dans le même dossier :
  //   branche1.jpg  →  branche 0 (index 0)
  //   branche2.jpg  →  branche 1 (index 1)
  //   branche3.jpg  →  branche 2 (index 2)
  branches: [
    {
      nom: "Peau de pierre",
      competences: [
        {
          nom: "Peau de pierre 1",
          desc: "+1 ARM de manière permanente."
        },
        {
          nom: "Peau de pierre 2",
          desc: "Sur un jet de PU, le mineur échappe à un échec critique."
        },
        {
          nom: "Peau de pierre 3",
          desc: "Le mineur est insensible aux effets de saignement, ne peut pas être renversé et son armure ne peut pas être brisée."
        }
      ]
    },
    {
      nom: "Excavateur",
      competences: [
        {
          nom: "Par ici la sortie !",
          desc: "Dans un dédale, le mineur trouve toujours la sortie."
        },
        {
          nom: "Nyctalope",
          desc: "Le mineur voit dans la pénombre comme en plein jour."
        },
        {
          nom: "Sens de la roche",
          desc: "Au prix d'une action d'ES (réussite automatique), le mineur ressent la vibration dans la roche et détecte tout mouvement dans un rayon de 50m autour de lui, y compris à travers la matière."
        }
      ]
    },
    {
      nom: "Tueur de gobelins",
      competences: [
        {
          nom: "Tueur de gobelins 1",
          desc: "Le mineur a +1 au combat contre les adversaires plus nombreux (gobelins et autres hordes)."
        },
        {
          nom: "Tueur de gobelins 2",
          desc: "Lorsqu'un allié proche est attaqué, le mineur peut intercepter cette attaque sur un jet de PU réussi."
        },
        {
          nom: "Tueur de gobelins 3",
          desc: "Si un adversaire du mineur attaque une autre cible, le mineur obtient une attaque gratuite contre lui."
        }
      ]
    }
  ]

};
