// ============================================================
//  FICHIER DE CLASSE — à dupliquer pour chaque personnage
//  Remplacez uniquement le contenu de cet objet CLASS_DATA
// ============================================================

const CLASS_DATA = {

  // Nom affiché dans le titre (avec article si souhaité)
  nom: "Guerrier",
  article: "Le",

  // Texte d'ambiance affiché sous le titre
  ambiance: "Rompu au combat avec toutes sortes d'armes comme à mains nues, au commandement et à la stratégie militaire.",

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
      nom: "Commandement",
      competences: [
        {
          nom: "Commandement 1",
          desc: "Les troupes sous les ordres du guerrier ont +1 au combat."
        },
        {
          nom: "Commandement 2",
          desc: "Le guerrier élabore un plan, ce qui baisse le seuil de CRIT au combat de 1 pour toutes les troupes qui suivent le plan."
        },
        {
          nom: "Commandement 3",
          desc: "Le guerrier donne un ordre d'attaque à un allié, ce qui lui permet de réasier une action de combat gratuite, même s'il est hors-combat."
        }
      ]
    },
    {
      nom: "Maître d’armes",
      competences: [
        {
          nom: "Maître d’armes 1",
          desc: "DEG+1 avec toutes les armes et à mains nues."
        },
        {
          nom: "Maître d’armes 2",
          desc: "En cas d’échec à un jet de combat, le jet suivant est forcément un 6."
        },
        {
          nom: "Maître d’armes 3",
          desc: "En cas de réussite d'une action de combat, une fois par tour, le guerrier peut effectuer un enchaînement en effectuant une action de cmobat différente supplémentaire."
        }
      ]
    },
    {
      nom: "Duelliste",
      competences: [
        {
          nom: "Duelliste 1",
          desc: "+1 à tous les jets de combat contre des humanoïdes."
        },
        {
          nom: "Duelliste 2",
          desc: "Ne peut pas être surpris au combat par un humanoïde."
        },
        {
          nom: "Duelliste 3",
          desc: "+1 attaque par tour de combat"
        }
      ]
    }
  ]

};
