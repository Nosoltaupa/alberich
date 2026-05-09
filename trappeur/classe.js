// ============================================================
//  FICHIER DE CLASSE — à dupliquer pour chaque personnage
//  Remplacez uniquement le contenu de cet objet CLASS_DATA
// ============================================================

const CLASS_DATA = {

  // Nom affiché dans le titre (avec article si souhaité)
  nom: "Trappeur",
  article: "Le",

  // Texte d'ambiance affiché sous le titre
  ambiance: "Maître de la survie dans les montagnes et de la chasse au moyen de pièges ingénieux.",

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
      nom: "Archer",
      competences: [
        {
          nom: "Archer 1",
          desc: "+1 aux jets avec un arc."
        },
        {
          nom: "Archer 2",
          desc: "Sur un jet de FI, le trappeur se camoufle. Toute attaque réalisée depuis le camouflage a un seuil de CRIT baissé de 1. Tant qu'il n'est pas repéré par un jet d'ES de difficulté le jet de FI du trappeur, celui-ci reste camouflé."
        },
        {
          nom: "Archer 3",
          desc: "Pour un coût de 2 actions de FI et sur le meilleur des deux jets de FI, le trappeur tire une flèche qui tue instantanément une cible. Sur les boss, DEGx3."
        }
      ]
    },
    {
      nom: "Pièges",
      competences: [
        {
          nom: "Pièges 1",
          desc: "Sur un jet de FI, le trappeur pose un piège qui immobilise la cible (contre un jet de PU de difficulté le jet de FI du trappeur) et inflige des DEG lors de la capture en fonction des matériaux utilisés."
        },
        {
          nom: "Pièges 2",
          desc: "Le trappeur réagit à une action adverse et lance des bolas pour l'interrompre."
        },
        {
          nom: "Pièges 3",
          desc: "Le trappeur décide d'un effet (dégâts, renversement, saignement, brise-armure, désarmement, faiblesse) et prépare une zone avec des pièges. Toute créature qui rentre dans la zone est affectée par cet effet."
        }
      ]
    },
    {
      nom: "Chasseur",
      competences: [
        {
          nom: "Chasseur 1",
          desc: "+1 aux jets contre les bêtes."
        },
        {
          nom: "Chasseur 2",
          desc: "Sur un jet d’ES, le trappeur dompte une bête qui l'accompagne"
        },
        {
          nom: "Chasseur 3",
          desc: "+1 attaque par tour de combat."
        }
      ]
    }
  ]

};
