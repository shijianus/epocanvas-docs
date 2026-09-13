---
title: Recettes de personnalisation courantes
description: "Aide-mémoire des opérations de personnalisation les plus fréquentes d'EpoCanvas Docs : étapes complètes pour ajouter un document, un bouton de navigation, une langue d'interface, modifier les couleurs du thème, le logo, les dimensions de mise en page et les textes de recherche."
---

Cette page rassemble les besoins de personnalisation les plus courants sous forme d'aide-mémoire « suivez simplement les étapes ». Pour chaque recette, l'emplacement des modifications est indiqué jusqu'au fichier concerné ; avant de vous lancer, il est conseillé de lire les [règles de rendu](/canvas/rendering/) et le [système de composants](/canvas/components/), cela évite bien des détours.

---

## Recette 1 : ajouter un document

1. Créez un nouveau fichier `.md` sous `src/content/docs/canvas/` (nom en lettres minuscules anglaises avec des tirets, par exemple `user-guide.md`) ;
2. Rédigez le Frontmatter en tête de fichier :

   ```yaml
   ---
   title: Guide d’utilisation
   description: Une phrase résumant le contenu de l’article, affichée dans les résultats de recherche et les cartes de partage.
   ---
   ```

3. Ouvrez `astro.config.mjs` et enregistrez le document dans le groupe cible du tableau `sidebar` :

   ```javascript
   { label: 'Guide d’utilisation', link: '/canvas/user-guide/' }
   ```

4. Après enregistrement, vérifiez dans l'aperçu local que le document apparaît bien dans le sommaire à gauche, puis exécutez `pnpm run deploy` pour publier.

:::warning
Si vous créez le fichier sans l'enregistrer dans la `sidebar`, la page reste accessible mais n'apparaît pas dans le sommaire à gauche — c'est l'erreur la plus courante des débutants.
:::

---

## Recette 2 : ajouter un bouton de navigation supérieure

1. Ouvrez `src/config/navigation.ts` et ajoutez une entrée au tableau `navigationConfig` :

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: 'Blog',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // les liens externes s'ouvrent dans un nouvel onglet
   },
   ```

2. Ouvrez `src/utils/i18n.ts` et complétez les entrées de traduction de `nav.blog` pour les 10 langues ;
3. Après enregistrement, le nouveau bouton apparaît immédiatement dans la barre supérieure ; pour qu'un lien interne participe à la surbrillance de navigation, configurez-lui une fonction `match`.

---

## Recette 3 : ajuster les règles de surbrillance de page

Lorsqu'un changement de chemin de page provoque une surbrillance erronée dans la barre supérieure, modifiez la fonction `match` de l'entrée concernée dans `navigation.ts` :

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

La règle : la correspondance exacte est prioritaire, `includes` sert de repli ; les fonctions `match` de plusieurs boutons ne doivent pas se chevaucher, sinon deux boutons peuvent être surlignés en même temps.

---

## Recette 4 : changer les couleurs du thème de marque

1. Ouvrez `src/styles/custom.css` ;
2. Modifiez simultanément le trio de couleurs principales dans les deux blocs, clair (`:root`) et sombre (`:root[data-theme='dark']`) :

   ```css
   --sl-color-accent: #10b981;      /* Couleur principale : boutons, états sélectionnés */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* Fond clair des éléments sélectionnés */
   --sl-color-accent-high: #047857; /* Liens et texte en surbrillance */
   ```

3. Après enregistrement, boutons, surlignages et liens de tout le site changent de couleur automatiquement. Ne modifier qu'un seul bloc désynchronise les couleurs de l'autre thème.

---

## Recette 5 : remplacer le logo

| Emplacement | Fichier | Usage |
| :--- | :--- | :--- |
| À gauche de la barre supérieure | `public/images/logo.svg` | Icône de la barre supérieure des pages internes, chemin configuré dans `logo.src` de `astro.config.mjs` |
| Grande image de la page d'accueil | `src/assets/logo.svg` | Image décorative à droite de la page d'accueil |

Il est recommandé de remplacer les deux en même temps. Le logo utilise le format vectoriel SVG ; en réglant `logo.replacesTitle` sur `true` dans `astro.config.mjs`, le texte du titre est masqué et seule l'icône reste.

---

## Recette 6 : ajuster les dimensions de la mise en page

Les trois paramètres de mise en page sont centralisés en haut de `src/styles/custom.css` :

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Largeur du sommaire à gauche */
  --sl-content-width: 60rem;    /* Largeur maximale du corps du texte */
  --sl-nav-height: 3.5rem;      /* Hauteur de la barre supérieure */
}
```

:::caution
La largeur de la colonne du sommaire à droite ne figure pas dans ces variables : elle est contrôlée par la valeur `20rem` de `src/components/starlight/TwoColumnContent.astro` (`21rem` sur les écrans très larges). Lorsque vous ajustez la largeur de la colonne droite, modifiez également dans le même fichier le `max-width: calc(100% - 20rem)` de la zone de contenu.
:::

---

## Recette 7 : modifier les textes du champ de recherche

Le placeholder du champ de recherche, les infobulles des boutons et les autres textes d'interface proviennent du dictionnaire multilingue de `src/utils/i18n.ts`. Ouvrez ce fichier et modifiez les entrées comme `search.placeholder` selon la structure à deux niveaux « langue → clé d'entrée » :

```typescript
// Chemin du fichier : src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ... autres entrées de cette langue
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ... autres entrées de cette langue
  },
  // les 8 autres langues fonctionnent de la même manière
};
```

Les langues non modifiées se rabattent automatiquement sur la valeur par défaut en chinois, sans erreur. Après enregistrement, le rechargement à chaud local rend le changement immédiatement visible, sans build.

---

## Recette 8 : ajouter des balises `<head>` de vérification au site

Pour connecter des services comme Google Search Console ou la plateforme pour webmasters de Baidu, il faut injecter une balise de vérification dans le `<head>`. Ouvrez `astro.config.mjs` et ajoutez au tableau `head` de la configuration Starlight :

```javascript
head: [
  // configuration favicon existante ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: 'chaîne de vérification',
    },
  },
],
```

Après enregistrement et redéploiement, lancez la vérification avec le bouton fourni par la plateforme. Pour la configuration des moteurs de recherche après la mise en ligne, voir [SEO et optimisation des performances](/canvas/seo/).

---

## Procédure de vérification générale après modification

Quel que soit le type de personnalisation, vérifiez dans cet ordre avant de committer :

```bash
pnpm run dev      # 1. vérifier le rendu page par page dans le navigateur
pnpm exec astro check && pnpm run build   # 2. vérification des types + build complet
pnpm run preview  # 3. prévisualiser le résultat du build, publier une fois tout vérifié
```

Pour la mise en production, voir [Déploiement sur Cloudflare Pages](/canvas/cloudflare/).
