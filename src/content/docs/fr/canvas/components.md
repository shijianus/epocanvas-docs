---
title: Composants d'interface et développement personnalisé
description: "Architecture des composants d'interface d'EpoCanvas Docs : mécanisme de remplacement des composants Starlight, rôle et flux de données des sept composants personnalisés, ainsi que les points d'attention pour la personnalisation."
---

L'interface d'**EpoCanvas Docs** n'a pas réinventé la roue : elle applique un **remplacement ciblé** par-dessus les composants natifs de Starlight. La structure de page et le traitement du contenu de Starlight sont conservés, tandis que les composants d'affichage (barre supérieure, barre latérale, sommaire, recherche, etc.) sont remplacés pour obtenir la disposition à trois colonnes et les interactions souhaitées. Cette page décrit la structure de ce système de composants et la manière de le modifier.

---

## Mécanisme de remplacement des composants

Starlight permet de remplacer n'importe quel composant natif par une implémentation personnalisée via le champ `components` de `astro.config.mjs`. Ce projet remplace 7 composants :

```javascript
// astro.config.mjs (extrait)
components: {
  Header: './src/components/starlight/Header.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
},
```

Au moment du build, chaque emplacement rendu par Starlight utilise en priorité le fichier indiqué ici. Les composants non remplacés (par exemple le pied de page Footer ou le menu mobile) continuent d'utiliser l'implémentation native.

---

## Rôle des sept composants personnalisés

L'intégralité du code source se trouve dans `src/components/starlight/` ; taille et rôle de chaque fichier :

| Fichier du composant | Taille | Rôle |
| :--- | :--- | :--- |
| `Header.astro` | environ 646 lignes | Tout le contenu de la barre supérieure : logo, champ de recherche, navigation principale, badge de version, changement de langue, bascule de thème, accès GitHub et Telegram |
| `Search.astro` | environ 837 lignes | Recherche à deux modes : recherche dans la page depuis la barre supérieure (surlignage et comptage) + fenêtre de recherche site-wide via `Ctrl+K` (Pagefind UI) |
| `Pagination.astro` | environ 123 lignes | Cartes « Page précédente / Page suivante » en bas de page : fines bordures sans relief, titres aux couleurs du thème, flèches obliques ↙/↘ indiquant le sens de navigation |
| `TwoColumnContent.astro` | environ 77 lignes | Squelette à deux colonnes pour le corps du texte et le sommaire à droite ; contrôle la largeur fixe de la colonne droite et son défilement |
| `TableOfContents.astro` | environ 64 lignes | Titre « Sommaire de cette page », icône et liste du sommaire ; filtre le titre de la page elle-même |
| `PageTitle.astro` | environ 62 lignes | Grand titre de la page (issu du `title` du Frontmatter) et horodatage « Dernière mise à jour » |
| `Sidebar.astro` | environ 22 lignes | Fine encapsulation : réutilise le composant natif `SidebarPersister` de Starlight pour conserver la position de défilement de la barre latérale lors des changements de page |

---

## Flux de données : trois fichiers de configuration pilotent toute l'interface

Les composants personnalisés ne contiennent pas eux-mêmes de données métier ; le contenu de l'interface est piloté par trois fichiers de configuration :

```text
astro.config.mjs ──→ tableaux locales + sidebar ──→ Sidebar.astro affiche le sommaire à gauche (chaque langue utilise le libellé traduit correspondant)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro affiche la navigation supérieure et la surbrillance (les liens reçoivent automatiquement le préfixe de langue)
src/utils/i18n.ts ──→ dictionnaire UI_TRANSLATIONS ──→ chaque composant récupère les libellés dans la langue courante au moment du build
```

- **Le sommaire à gauche** ne reconnaît que la déclaration `sidebar` de `astro.config.mjs` ; tout nouveau document doit y être enregistré ; le champ `translations` de chaque entrée fournit les libellés de menu en 10 langues ;
- **La navigation supérieure** récupère le texte affiché de chaque entrée via `labelKey` dans le dictionnaire `i18n.ts` ; la fonction `match` détermine quel bouton est mis en surbrillance sur la page courante (le préfixe de langue est retiré avant la comparaison) ;
- **Les textes de l'interface** (placeholder du champ de recherche, titre « Sommaire de cette page », infobulle de bascule de thème, etc.) sont produits directement dans la langue correspondante au moment du build par chaque composant via `getTranslation(key, lang)` ; les pages ne contiennent aucun script de remplacement à l'exécution.

En résumé : pour modifier le contenu de l'interface, commencez par chercher le fichier de configuration correspondant ; seules les modifications d'apparence (espacements, couleurs, icônes) nécessitent de toucher au code source des composants.

---

## Détails d'implémentation clés de chaque composant

### PageTitle : titre de la page et date de mise à jour réelle

Le grand titre de la page lit directement le `title` du Frontmatter ; par conséquent, **n'écrivez pas de titre de niveau 1 avec `#` dans le corps du texte**. L'horodatage « Dernière mise à jour » provient de l'historique des commits Git au moment du build (`lastUpdated: true` est activé dans `astro.config.mjs`) ; il s'actualise automatiquement à chaque commit, sans maintenance manuelle.

:::caution
La date de mise à jour est lue depuis l'historique Git au moment du build ; par conséquent : **les nouveaux documents pas encore commités n'affichent pas de date** (seule la signature normalisée figure sous le titre), elle apparaîtra après le commit et une nouvelle construction ; si l'environnement de build est un clone superficiel (par exemple `fetch-depth: 1` en CI), l'historique Git est incomplet et l'horodatage manquera également. Dans les deux cas, la construction n'est pas affectée.
:::

### Sidebar : implémentation de la mémorisation de la position de défilement

`Sidebar.astro` ne compte qu'une vingtaine de lignes ; l'essentiel repose sur la réutilisation du composant officiel `SidebarPersister` de Starlight : il évite de reconstruire le DOM de la barre latérale lors des changements de page, ce qui préserve la position de la barre de défilement. C'est le principe qui empêche le sommaire à gauche de « sauter » d'une page à l'autre.

### TableOfContents : génération du sommaire de la page

Les données du sommaire sont générées par Starlight au moment du build en analysant les titres du corps du texte (`##` et `###`) ; le composant se contente de filtrer le titre de la page elle-même et d'effectuer le rendu. La surbrillance au défilement est assurée côté navigateur par l'élément personnalisé `starlight-toc`, sans dépendre d'aucun framework.

### TwoColumnContent : seule source de la largeur de la colonne droite

La largeur de la colonne du sommaire à droite est fixée à `20rem` sous `@media (min-width: 72rem)` (à `21rem` à partir de `90rem` sur les écrans très larges), et la largeur maximale de la zone de contenu en est déduite d'autant. Pour ajuster la largeur de la colonne droite, modifiez uniquement ce fichier ; ne multipliez pas les surcharges éparses dans d'autres feuilles de style.

### Header : navigation, thème et langue

- Les boutons de navigation sont rendus en parcourant `navigationConfig` ; le style de l'état actif est déterminé par la valeur renvoyée par la fonction `match`, et les liens reçoivent automatiquement le préfixe de la langue courante via `localizedHref()` ;
- La bascule de thème écrit la clé `starlight-theme` dans le LocalStorage ; au chargement de la page, le thème initial est déterminé selon l'ordre « choix local → préférence système » ;
- Chaque entrée du menu déroulant des langues est un vrai lien vers la version de la page courante dans la langue correspondante ; un clic y accède directement, sans stockage d'état supplémentaire ;
- Les icônes GitHub et Telegram à droite de la barre supérieure sont écrites en dur dans `src/components/starlight/Header.astro` ; changer une adresse revient à éditer ce fichier. Telegram pointe vers la page du compte `@epocanvas` et son infobulle est la chaîne `social.telegram`. L'entrée `social` de `astro.config.mjs` pilote l'autre jeu d'icônes en bas de la barre latérale ; les deux n'interagissent pas.

### Search : recherche à deux modes

Un seul composant implémente deux systèmes de recherche (détails dans [recherche plein texte et raccourcis clavier](/canvas/search-engine/)) :

1. **Recherche dans la page** : champ de la barre supérieure ; la touche Entrée fait passer d'une occurrence à l'autre dans la page courante, le surlignage est réalisé par un script qui pose des marqueurs ;
2. **Recherche site-wide** : fenêtre `<dialog>` + interface par défaut de Pagefind ; l'index est généré à l'étape `pnpm run build`.

### Pagination : cartes de navigation

Les données « page précédente / page suivante » sont calculées par Starlight au moment du build d'après l'ordre de la `sidebar` (`Astro.locals.starlightRoute.pagination`) ; le composant se contente d'effectuer le rendu : deux cartes de largeur égale, fines bordures sans ombre, titres aux couleurs du thème, et flèches obliques ↙ / ↘ qui se déplacent dans le sens de la navigation au survol. Les flèches sont des chemins SVG en ligne ; si le site sert une langue RTL, leur direction se met automatiquement en miroir.

---

## Points d'attention pour la personnalisation

:::caution
Remplacer des composants revient à renoncer aux mises à jour ultérieures des composants natifs de Starlight. Lors d'une montée de version de Starlight, les props des composants et la structure de `Astro.locals.starlightRoute` peuvent changer ; après la mise à niveau, une campagne de tests de non-régression sur les 7 composants remplacés est indispensable.
:::

- **Pour les styles, privilégiez les variables CSS** : couleurs, polices et dimensions de mise en page sont centralisées dans les variables `:root` de `src/styles/custom.css`, voir [Configuration du site et personnalisation des styles](/canvas/configuration/) ; la plupart des personnalisations ne nécessitent pas de toucher aux composants ;
- **Ne touchez aux composants que pour modifier les interactions** : pour ajouter un bouton ou ajuster la structure, récupérez les textes d'interface avec `getTranslation(key, lang)` et complétez les entrées des 10 langues dans `i18n.ts` ; une langue manquante s'affiche par repli en chinois ;
- **Vérifiez impérativement en local après modification** : `pnpm run dev` pour contrôler les interactions, `pnpm run build` pour confirmer que les types et la construction passent (commandes locales voir [FAQ et résolution des problèmes](/canvas/troubleshooting/)).

Pour les opérations de personnalisation les plus courantes, consultez directement [Recettes de personnalisation courantes](/canvas/recipes/).
