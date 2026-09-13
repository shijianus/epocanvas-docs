---
title: Mise en page et confort de lecture
description: Présentation de la mise en page à trois colonnes d'EpoCanvas Docs, des interactions dans chaque zone de l'interface, du thème clair/sombre et de l'expérience responsive sur mobile et tablette.
---

Pour offrir aux lecteurs une expérience de lecture agréable et efficace, **EpoCanvas Docs** adopte une mise en page de page classique et claire à trois colonnes. Lors de la lecture de longs articles, le lecteur sait à tout moment « où il se situe dans l'ensemble du site » et « quelle section de l'article il est en train de lire ».

---

## Présentation des zones de l'interface

À l'ouverture d'un document, la page se divise en quatre zones fonctionnelles principales :

![Image annotée de l'interface de lecture à trois colonnes d'EpoCanvas Docs : ① barre de navigation supérieure ② table des matières à gauche ③ corps du texte au centre ④ table des matières de la page](/images/canvas/ui-layout-annotated.png)

*Figure : image annotée de la mise en page à trois colonnes, avec la page « Règles de rendu en détail » comme exemple. ① barre de navigation globale en haut ; ② table des matières des catégories à gauche ; ③ zone de lecture du corps du texte au centre ; ④ plan « Sur cette page » à droite. Les quatre zones sont délimitées dans l'image par des bordures et des numéros.*

![Schéma des zones de la mise en page d'EpoCanvas Docs](/images/canvas/docs-layout-3tier.svg)

*Figure : schéma structurel de la mise en page à trois colonnes, avec le nom et le rôle de chaque zone.*

### 1. Barre de navigation globale en haut (Header)

Située tout en haut de la page, elle est fixe et reste toujours visible lors du défilement vers le bas ; sa hauteur est de `3.5rem`. De gauche à droite, la barre supérieure contient les éléments suivants (voir l'image annotée ci-dessous) :

![Gros plan annoté des éléments de la barre supérieure : ① Logo ② champ de recherche ③ navigation principale ④ badge de version ⑤ changement de langue ⑥ changement de thème ⑦ GitHub ⑧ Telegram](/images/canvas/ui-topnav-annotated.png)

*Figure : gros plan annoté des éléments de la barre supérieure. ① Logo et nom du site ; ② champ de recherche global ; ③ groupe de boutons de la navigation principale ; ④ badge de version ; ⑤ sélecteur de langue ; ⑥ bascule du thème clair/sombre ; ⑦ accès au dépôt GitHub ; ⑧ accès à la communauté Telegram.*

- **Logo et titre du site (①)** : à gauche, l'icône EpoCanvas et le nom du projet sont affichés ; un clic permet de revenir rapidement à la page d'accueil de la documentation.
- **Champ de recherche global (②)** : saisissez des mots-clés dans le champ pour rechercher directement dans le contenu de la page courante ; `Ctrl+K` / `Cmd+K` ouvre la fenêtre de recherche site-wide, voir [Recherche plein texte et raccourcis clavier](/canvas/search-engine/).
- **Boutons de navigation principale (③)** : ils fournissent des liens de saut rapide vers les fonctions courantes telles que « Accueil », « Présentation du produit », « Prise en main » ; la section courante est mise en surbrillance automatiquement.
- **Badge de version (④)** : il affiche le numéro de la version publiée correspondant à la documentation courante (par exemple `v1.2.0`) ; un clic permet de consulter l'historique détaillé des mises à jour sur GitHub.
- **Sélecteur multilingue (⑤)** : un clic sur le bouton de langue déploie une liste de 10 langues disponibles ; après sélection, vous êtes redirigé vers la version de l'article courant dans la langue cible, avec bascule simultanée de la navigation, de la barre latérale et du corps du texte.
- **Bascule du thème clair/sombre (⑥)** : une icône soleil/lune permet de passer du mode clair au mode sombre.
- **GitHub et Telegram (⑦⑧)** : les icônes à droite mènent respectivement au dépôt open source et à la communauté technique.

### 2. Table des matières des catégories à gauche (Sidebar)

Située à gauche de la page (largeur de `16.5rem`, soit environ 264 pixels), elle présente tous les chapitres de la documentation selon une hiérarchie logique :

- **Groupes repliables** : les documents sont organisés en groupes tels que « Présentation du produit et prise en main », « Fonctionnalités principales et guide d'utilisation » ; un clic sur le nom d'un groupe le déploie ou le replie.
- **Mise en surbrillance de la page courante** : l'article en cours de lecture est mis en évidence dans le menu de gauche par un fond en forme de pilule à la couleur du thème.
- **Mémorisation de la position de défilement** : lors du passage d'un article à un autre, la position de la barre de défilement de la barre latérale de gauche reste inchangée et ne revient pas en haut.

### 3. Zone de lecture du corps du texte au centre (Main Content)

Située au centre de l'écran, c'est la zone principale qui accueille le contenu de la documentation technique :

- **Titre de la page et date de mise à jour** : en haut du corps du texte figurent le titre de l'article (issu du champ `title` du Frontmatter) ainsi que la date « Dernière mise à jour le », ce qui facilite l'évaluation de l'actualité du contenu.
- **Largeur de lecture adaptée** : la largeur maximale de la zone de lecture est limitée à `60rem`, afin d'éviter qu'un écran trop large ne produise des lignes de texte trop longues et gênent la lecture.
- **Liens de navigation en bas de page** : en fin de chaque document sont générés automatiquement les liens « Précédent » et « Suivant », pour une lecture continue dans l'ordre de la barre latérale.
- **Bouton de copie des blocs de code** : chaque bloc de code comporte un bouton de copie dans son coin supérieur droit, pour copier le code d'origine en un clic.

### 4. Plan de l'article à droite (Table of Contents)

Situé à droite du corps du texte :

- **Extraction automatique des titres** : lors du rendu de la page, le système analyse automatiquement les titres de niveau 2 (`##`) et de niveau 3 (`###`) du document courant pour générer le plan « Sur cette page ».
- **Suivi avec surbrillance dynamique** : pendant la lecture, à mesure que la page défile vers le bas, le plan met automatiquement en surbrillance la section en cours de lecture.
- **Accès direct fluide au clic** : un clic sur n'importe quel sous-titre du plan fait défiler la page en douceur jusqu'au paragraphe correspondant et met à jour l'ancre dans la barre d'adresse (par exemple `#présentation-des-zones-de-linterface`), ce qui facilite le partage.

---

## Modes clair et sombre

EpoCanvas Docs propose à la fois un thème clair et un thème sombre ; les deux palettes sont entièrement définies par les variables CSS du fichier `src/styles/custom.css` :

- **Suivi des préférences système** : à la première ouverture du site, celui-ci détecte le réglage clair/sombre du système d'exploitation et affiche le thème correspondant.
- **Bascule manuelle et mémorisation** : un clic sur le bouton de bascule du thème dans la barre supérieure permet de changer manuellement ; le choix est enregistré dans le LocalStorage du navigateur et reste effectif à la prochaine ouverture.

![Effet de l'interface de lecture en mode clair](/images/canvas/ui-theme-light.png)

*Figure : rendu du même site en mode clair (exemple avec la page de prise en main).*

---

## Adaptation responsive sur mobile et tablette

Sur des écrans de tailles différentes, comme un téléphone ou une tablette, la page ajuste automatiquement sa mise en page pour s'adapter à la taille de l'écran :

| Type d'appareil | Largeur d'écran | Comportement de la mise en page |
| :--- | :--- | :--- |
| **Ordinateur de bureau grand écran / ordinateur portable** | `>= 1152px` | Affichage complet de la mise en page standard à trois colonnes (menu à gauche + corps du texte au centre + plan à droite). |
| **Tablette / fenêtre étroite** | `768px ~ 1152px` | Le plan de droite est masqué ; la mise en page à deux colonnes (navigation à gauche et corps du texte) est conservée. |
| **Téléphone intelligent** | `< 768px` | Les deux barres latérales sont repliées et le corps du texte occupe toute la largeur. Un clic sur le bouton de menu de la barre supérieure fait glisser la barre latérale sous forme de tiroir. |

Que ce soit sur un écran ultra-large ou pour une consultation rapide sur un téléphone, l'expérience de lecture reste naturelle et confortable.
