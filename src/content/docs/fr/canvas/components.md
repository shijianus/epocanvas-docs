---
title: Composants d'interface et développement personnalisé
description: "Architecture des composants d'interface d'EpoCanvas Docs : mécanisme de remplacement des composants Starlight, rôle et flux de données des composants personnalisés, ainsi que les points d'attention pour la personnalisation."
---

L'interface d'**EpoCanvas Docs** n'a pas réinventé la roue : elle applique un **remplacement ciblé** par-dessus les composants natifs de Starlight. La structure de page et le traitement du contenu de Starlight sont conservés, tandis que les composants d'affichage (barre supérieure, barre latérale, sommaire, recherche, etc.) sont remplacés pour obtenir la disposition à trois colonnes et les interactions souhaitées. Cette page décrit la structure de ce système de composants et la manière de le modifier.

---

## Mécanisme de remplacement des composants

Enregistrez les remplacements dans `components` de `astro.config.mjs` comme ci-dessous ; la configuration actuelle fait foi.

```javascript
// astro.config.mjs (extrait)
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

Les remplacements enregistrés sont prioritaires au build. Les autres composants conservent leur implémentation Starlight native.

---

## Rôle des composants de remplacement personnalisés

Les fichiers se trouvent dans `src/components/starlight/` ; voici leurs rôles principaux.

| Fichier du composant | Rôle |
| :--- | :--- |
| `Header.astro` | Tout le contenu de la barre supérieure : logo, champ de recherche, navigation principale, badge de version, changement de langue, bascule de thème, accès GitHub et Telegram |
| `Search.astro` | Recherche à deux modes : recherche dans la page depuis la barre supérieure (surlignage et comptage) + fenêtre de recherche site-wide via `Ctrl+K` (Pagefind UI) |
| `Pagination.astro` | Cartes « Page précédente / Page suivante » en bas de page : fines bordures sans relief, titres aux couleurs du thème, flèches obliques ↙/↘ indiquant le sens de navigation |
| `TwoColumnContent.astro` | Squelette à deux colonnes pour le corps du texte et le sommaire à droite ; contrôle la largeur fixe de la colonne droite et son défilement |
| `TableOfContents.astro` | Titre « Sommaire de cette page », icône et liste du sommaire ; filtre le titre de la page elle-même |
| `PageTitle.astro` | Grand titre de la page (issu du `title` du Frontmatter) et horodatage « Dernière mise à jour » |
| `Sidebar.astro` | Fine encapsulation : réutilise le composant natif `SidebarPersister` de Starlight pour conserver la position de défilement de la barre latérale lors des changements de page |
| `SkipLink.astro` | Affiche un lien d’accès au contenu au focus clavier et déplace le focus vers le titre `_top` |
| `MobileMenuToggle.astro` | Ouvre et ferme la barre latérale mobile, synchronise son état et restitue le focus après Échap |

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

Le titre de la page vient du `title` du Frontmatter ; **n’ajoutez donc pas de titre de niveau 1 avec `#` dans le corps du texte**. Avec `lastUpdated: true` dans `astro.config.mjs`, sans date de remplacement dans le Frontmatter, le build lit la date du dernier commit Git ayant modifié ce fichier. Ce n’est ni la date de chaque commit du dépôt ni celle de chaque build ; modifier d’autres fichiers ne change pas la date de cette page.

:::caution
Un nouveau document non commité n’a pas d’historique Git lisible et n’affiche pas de date. Les modifications non commitées d’un fichier existant ne changent pas non plus sa date de commit. Un clone superficiel (`fetch-depth: 1`, par exemple) peut renvoyer la date du commit à la limite de l’historique ou aucune date ; ce n’est pas un historique complet. Utilisez tout l’historique Git pour des dates exactes (`fetch-depth: 0` en CI). L’échec de lecture d’une date ne fait pas échouer le build.
:::

### Sidebar : implémentation de la mémorisation de la position de défilement

`Sidebar.astro` réutilise `SidebarPersister` de Starlight pour restaurer le défilement lors des changements de page. `MobileMenuToggle.astro` gère l’état et le focus du menu mobile.

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

Le champ de recherche dans la page apparaît uniquement à partir de `64rem` ; en dessous reste le bouton global. Utilisez la recherche du navigateur pour l’article courant. En cas de différence avec les captures, fiez-vous à l’interface actuelle.

### Pagination : cartes de navigation

Les données « page précédente / page suivante » sont calculées par Starlight au moment du build d'après l'ordre de la `sidebar` (`Astro.locals.starlightRoute.pagination`) ; le composant se contente d'effectuer le rendu : deux cartes de largeur égale, fines bordures sans ombre, titres aux couleurs du thème, et flèches obliques ↙ / ↘ qui se déplacent dans le sens de la navigation au survol. Les flèches sont des chemins SVG en ligne ; si le site sert une langue RTL, leur direction se met automatiquement en miroir.

---

## Points d'attention pour la personnalisation

:::caution
Remplacer des composants revient à renoncer aux mises à jour ultérieures des composants natifs de Starlight. Lors d'une montée de version de Starlight, les props des composants et la structure de `Astro.locals.starlightRoute` peuvent changer ; après la mise à niveau, une campagne de tests de non-régression sur les composants remplacés est indispensable.
:::

- **Pour les styles, privilégiez les variables CSS** : couleurs, polices et dimensions de mise en page sont centralisées dans les variables `:root` de `src/styles/custom.css`, voir [Configuration du site et personnalisation des styles](/canvas/configuration/) ; la plupart des personnalisations ne nécessitent pas de toucher aux composants ;
- **Ne touchez aux composants que pour modifier les interactions** : pour ajouter un bouton ou ajuster la structure, récupérez les textes d'interface avec `getTranslation(key, lang)` et complétez les entrées des 10 langues dans `i18n.ts` ; une langue manquante s'affiche par repli en chinois ;
- **Vérifiez impérativement en local après modification** : `pnpm run dev` pour contrôler les interactions, `pnpm run verify` pour confirmer que les types et la construction passent (commandes locales voir [FAQ et résolution des problèmes](/canvas/troubleshooting/)).

Pour les opérations de personnalisation les plus courantes, consultez directement [Recettes de personnalisation courantes](/canvas/recipes/).
