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
    nom: "Traqueur de Norlithe",
    desc: "Au prix d'une action d'ES par tour (réussite automatique), le trappeur peut percevoir la norlithe et les créatures touchées par la norlithe dans un rayon de 50m autour de lui, y compris à travers la matière. Lorsqu'il active cette compétence en combat, cela lui permet également d'avoir une seconde chance pour les attaques contre les créatures touchées par la norlithe : tout jet raté peut être relancé. Il n'y a pas de troisième chance."
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
          nom: "Maître archer",
          desc: "+1 aux jets avec un arc."
        },
        {
          nom: "Tireur embusqué",
          desc: "Sur un jet de FI, le trappeur se camoufle. Toute attaque réalisée depuis le camouflage a un seuil de CRIT baissé de 1. Tant qu'il n'est pas repéré par un jet d'ES de difficulté le jet de FI du trappeur, celui-ci reste camouflé."
        },
        {
          nom: "Tir critique",
          desc: "A remanier... Pour un coût de 2 actions de FI et sur le meilleur des deux jets de FI, le trappeur tire une flèche qui tue instantanément une cible. Sur les boss, DEGx3."
        }
      ]
    },
    // {
    //   nom: "Pièges",
    //   competences: [
    //     {
    //       nom: "Pièges 1",
    //       desc: "Sur un jet de FI, le trappeur pose un piège qui immobilise la cible (contre un jet de PU de difficulté le jet de FI du trappeur) et inflige des DEG lors de la capture en fonction des matériaux utilisés."
    //     },
    //     {
    //       nom: "Pièges 2",
    //       desc: "Le trappeur réagit à une action adverse et lance des bolas pour l'interrompre."
    //     },
    //     {
    //       nom: "Pièges 3",
    //       desc: "Le trappeur décide d'un effet (dégâts, renversement, saignement, brise-armure, désarmement, faiblesse) et prépare une zone avec des pièges. Toute créature qui rentre dans la zone est affectée par cet effet."
    //     }
    //   ]
    // },
    {
      nom: "Saignements",
      competences: [
        {
          nom: "Saignement",
          desc: "Sur un CRIT, la cible du trappeur est affectée par l'effet saignement. Un saignement inflige à partir du tour suivant 1 dégât par tour qui ignore l'armure. Une cible atteinte de saignement peut-être suivie à la trace et aura beaucoup plus de mal à se camoufler, à moins d'activement effacer ses traces."
        },
        {
          nom: "Hémorragie",
          desc: "Un CRIT sur une cible atteinte de saignement inflige l'effet hémorragie. L'hémorragie inflige 1 dégât par tour (cumulable avec le saignement). Le nombre d'actions par tour de la cible atteinte d'hémorragie est diminué de 2. (si comme vous la cible a 3 actions par tour, une de puissance, une de finesse, une d'esprit, avec l'hémorragie la cible ne peut plus effectuer qu'une seule action, celle de son choix)"
        },
        {
          nom: "Blessures infectées",
          desc: "Le saignement et l'hémorragie infligés par le trappeur appliquent également l'effet infection. L'infection inflige 1 dégât par tour (cumulable avec le saignement et l'hémorragie) jusqu'à ce que l'infection soit guérie. Guérir la plaie ne soigne pas l'infection."
        }
      ]
    },
    {
      nom: "Chasseur",
      competences: [
        {
          nom: "Tueur de bêtes",
          desc: "+1 aux jets contre les bêtes."
        },
        {
          nom: "Familier",
          desc: "Sur un jet d’ES, le trappeur dompte une bête qui l'accompagne"
        },
        {
          nom: "Attaque coordonnée",
          desc: "Lorsque le familier réussit une attaque contre la cible du trappeur, celui-ci obtient une action de FI gratuite."
        }
      ]
    }
  ]

};
