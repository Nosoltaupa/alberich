# Le Royaume de Givre

Interface web amateur pour gérer des personnages et des arbres de compétences dans le cadre d'un jeu de rôle en ligne.

Site GitHub Pages :  
https://nosoltaupa.github.io/alberich/index.html

## Objectif du projet

Le dépôt contient une interface permettant à chaque joueur de gérer une page de personnage intégrée comprenant :

- identité du joueur et du personnage ;
- choix de la classe ;
- niveau ;
- progression automatique ;
- caractéristiques ;
- points de vie ;
- équipement ;
- arbre de compétences ;
- inventaire ;
- export/import d'un fichier de sauvegarde local.

L'ancien fonctionnement séparait la feuille de personnage et les arbres de compétences. La branche `refactor` regroupe désormais ces éléments dans une seule page par joueur.

## Structure principale

```text
index.html
index.css
index.js

player.html
player.css
player.js
player-data.js
player-progression.js
player-render-progression.js
player-render-equipment.js
player-savefile.js
player-tree.js

theme.css
theme.js

forgeron/
mineur/
trappeur/
guerrier/
```

## Pages

### `index.html`

Page d'accueil du site.

Elle affiche les cartes des joueurs et pointe vers :

```text
player.html?id=joueur1
player.html?id=joueur2
player.html?id=joueur3
player.html?id=joueur4
```

Le contenu dynamique de cette page est généré par `index.js` à partir des données de `player-data.js` et des sauvegardes locales du navigateur.

### `player.html`

Page principale d'un personnage.

Elle contient la structure HTML des sections suivantes :

- configuration du personnage ;
- niveau ;
- progression ;
- caractéristiques ;
- points de vie ;
- équipement ;
- arbre de compétences ;
- inventaire ;
- boutons d'export, import et réinitialisation.

La page charge les scripts spécialisés dans cet ordre :

```html
<script src="player-render-equipment.js"></script>
<script src="player-render-progression.js"></script>
<script src="player.js"></script>
<script src="player-savefile.js"></script>
```

## Scripts principaux

### `player-data.js`

Contient les données communes :

- liste des caractéristiques ;
- emplacements d'équipement ;
- liste des classes ;
- liste des joueurs ;
- fonctions utilitaires pour retrouver une classe ou un joueur.

### `player.js`

Script central de la page personnage.

Il gère :

- l'état courant du personnage ;
- la sauvegarde automatique dans `localStorage` ;
- la normalisation des anciennes sauvegardes ;
- l'identité du joueur et du personnage ;
- le choix de classe ;
- le niveau ;
- le rendu des caractéristiques ;
- le rendu des points de vie ;
- le chargement de l'arbre de compétences ;
- l'orchestration générale de la page.

### `player-progression.js`

Moteur de calcul de la progression.

Il définit :

- les limites de jeu ;
- les types de niveaux ;
- les choix possibles par niveau ;
- le calcul des caractéristiques, actions, critiques et points de vie ;
- la validation des choix de progression.

Limites actuelles :

```text
Caractéristique : maximum 5
Actions par tour : maximum 3
Critique : minimum 4
Points de vie de base : 6
Création : 3 points de caractéristiques
```

### `player-render-progression.js`

Gère uniquement l'affichage des cartes de progression.

Il affiche les choix de niveau :

- création ;
- amélioration ;
- maîtrise ;
- augmentation de caractéristique ;
- gain de point de vie ;
- amélioration du critique ;
- gain d'action par tour.

### `player-render-equipment.js`

Gère uniquement l'affichage et la saisie de :

- l'équipement ;
- l'inventaire.

### `player-savefile.js`

Gère les actions de sauvegarde manuelle :

- export d'un fichier JSON ;
- import d'un fichier JSON ;
- réinitialisation de la feuille locale.

### `player-tree.js`

Gère le chargement et l'affichage de l'arbre de compétences associé à la classe choisie.

Il charge actuellement les données de classe depuis les fichiers `classe.js` des dossiers de classes.

## Dossiers de classes

Chaque dossier de classe contient :

```text
branche1.webp
branche2.webp
branche3.webp
classe.js
```

Les images servent de miniatures pour les branches de l'arbre.

Le fichier `classe.js` contient les données textuelles et mécaniques des compétences.

## Sauvegarde locale

Chaque personnage est sauvegardé automatiquement dans le `localStorage` du navigateur sous une clé de type :

```text
personnage_joueur1
personnage_joueur2
personnage_joueur3
personnage_joueur4
```

La fermeture ou le rechargement de la page conserve donc les données sur la même machine et dans le même navigateur.

L'export JSON permet de transférer ou d'archiver une sauvegarde.

## Fichiers historiques supprimés de `refactor`

La branche `refactor` n'utilise plus les anciennes pages séparées :

```text
feuille.html
arbre.html
arbre.js
arbre.css
```

Ces fichiers appartenaient à l'ancien fonctionnement : feuille de personnage et arbre de compétences séparés.

## Pistes techniques restantes

### Conversion des classes en JSON

Les fichiers de classe sont encore des fichiers JavaScript. Une amélioration future serait de les convertir en :

```text
classe.json
```

Cela permettrait de charger les données avec un simple `fetch()` JSON, sans évaluation dynamique de code.

### Découpage éventuel du rendu de fiche

Si `player.js` redevient trop volumineux, on pourra extraire plus tard :

```text
player-render-sheet.js
```

pour y placer le rendu des caractéristiques, des points de vie et du niveau.

Pour l'instant, ce découpage n'est pas indispensable.
