---
title: Configuration du site et personnalisation des styles
description: Guide de modification du fichier de configuration principal d'EpoCanvas Docs, ajustement du menu de la barre latérale, remplacement du logo de marque et personnalisation des couleurs du thème.
---

Si vous souhaitez utiliser **EpoCanvas Docs** comme site de documentation pour votre équipe, ou ajuster le titre du site, le logo, la structure du sommaire et les couleurs du thème, ce chapitre présente les points d'entrée de personnalisation les plus courants. Une fois les modifications de configuration enregistrées, le serveur de développement local applique automatiquement le rechargement à chaud, visible immédiatement dans le navigateur.

---

## 1. Informations de base du site (`astro.config.mjs`)

Le fichier `astro.config.mjs` à la racine du projet est le fichier de configuration principal de l'ensemble du site de documentation. Les options directement liées aux informations du site sont les suivantes (les commentaires indiquent quand les modifier) :

```javascript
import { unified } from '@astrojs/markdown-remark';

// Modifiez ensemble le SITE_ORIGIN existant et l’URL Sitemap de public/robots.txt.
// site et hreflangXDefault() partagent cette valeur ; ne changez pas seulement site.
const SITE_ORIGIN = 'https://docs.epocanvas.com';

export default defineConfig({
  // Domaine de production du site, affecte les liens SEO et la génération du sitemap
  site: SITE_ORIGIN,

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeWrapTables, rehypeLocalizeInternalLinks, rehypeLocalizeDiagramImages, rehypeLocalizeAsides, rehypeLocalizeFootnotes],
    }),
  },

  integrations: [
    starlight({
      // Titre du site, affiché dans l'onglet du navigateur et dans la barre supérieure
      title: 'EpoCanvas Docs',
      // Description du site, utilisée dans les extraits des résultats des moteurs de recherche
      description: 'Guide des technologies full stack, de l’architecture et de l’exploitation des produits EpoCanvas',

      // Chemin de l'image du logo affichée à gauche de la barre supérieure
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // Mettre à true pour afficher uniquement le logo et masquer le texte du titre
      },

      // Liens sociaux de la barre latérale Starlight.
      // Les URL GitHub/Telegram du header sont définies à part dans src/components/starlight/Header.astro.
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shijianus/epocanvas-docs' },
      ],

      // Feuilles de style personnalisées
      customCss: ['./src/styles/custom.css'],

      // Sommaire de la barre latérale (voir la section suivante)
      sidebar: [/* ... */],
    }),
  ],

  // Table de redirection des anciens chemins, pour éviter les liens cassés
  redirects: { '/mail': '/canvas/' },
});
```

Sous Astro 7, ce site configure `markdown.processor` avec `unified()` de `@astrojs/markdown-remark` 7.3.5. Les `rehypePlugins` ci-dessus réutilisent les plugins existants dans `astro.config.mjs` ; conservez leurs définitions de fonctions lors des modifications de configuration.

---

## 2. Comment modifier le menu du sommaire à gauche ?

Le sommaire des catégories de documentation à gauche est contrôlé par le tableau `sidebar` de la configuration Starlight dans `astro.config.mjs` :

```javascript
sidebar: [
  // Groupe 1 : présentation du produit
  {
    label: 'Présentation du produit et prise en main',       // Nom du groupe
    items: [
      { label: 'Présentation du produit et valeur clé', link: '/canvas/' },
      { label: 'Prise en main (lancer en 3 minutes)', link: '/canvas/deployment/' },
    ],
  },
  // Groupe 2 : vous pouvez ajouter vos propres groupes métier
  {
    label: 'Guide utilisateur',
    items: [
      { label: 'Guide de rédaction et de mise en forme Markdown', link: '/canvas/markdown/' },
    ],
  },
];
```

- **`label`** : nom de la catégorie ou de l'article affiché dans la barre latérale ; il peut différer du `title` du Frontmatter (par exemple avec un nom d'affichage plus court) ;
- **`link`** : chemin d'accès de l'article, correspondant à l'emplacement du fichier sous `src/content/docs/`.

:::caution
Un nouveau fichier `.md` doit être enregistré dans le tableau `sidebar` pour apparaître dans le sommaire à gauche ; créer le fichier sans l'enregistrer est l'erreur la plus courante des débutants.
:::

---

## 3. Personnalisation des couleurs du thème de marque (`src/styles/custom.css`)

Toutes les couleurs du site sont contrôlées par des variables CSS, définies dans `src/styles/custom.css`. Le haut du fichier contient les variables du thème clair, et le bloc `:root[data-theme='dark']` celles du thème sombre :

```css
:root {
  /* Couleur principale de la marque (thème clair) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* Fond clair des éléments sélectionnés */
  --sl-color-accent-high: #1d4ed8;                  /* Liens et texte en surbrillance */

  /* Couleur de fond de la page et lignes de séparation */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* Le thème sombre utilise les mêmes noms de variables ; seules les valeurs de couleur changent */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

Par exemple, pour passer la couleur principale de tout le site à un vert dynamique, il suffit de remplacer `--sl-color-accent` par une teinte de la gamme `#10b981` dans les deux blocs (clair et sombre) ; les boutons, les états sélectionnés et les liens changeront automatiquement de couleur.

Les dimensions de la mise en page sont également définies de manière centralisée en haut de ce fichier :

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Largeur du sommaire à gauche */
  --sl-content-width: 60rem;    /* Largeur maximale du corps du texte */
  --sl-nav-height: 3.5rem;      /* Hauteur de la barre supérieure */
}
```

---

## 4. Remplacer le logo du site

1. Préparez un logo vectoriel `.svg` valide. Ces étapes concernent uniquement SVG ; ne renommez pas un fichier PNG en `.svg`.
2. Remplacez séparément `public/images/logo.svg` pour la barre supérieure et `src/assets/logo.svg` pour l’image d’accueil.
3. Actualisez le navigateur sur le serveur de développement local et vérifiez les deux logos. Le site en ligne ne change qu’après un nouveau build et un déploiement.

:::tip
Les deux logos ont des usages différents : `public/images/logo.svg` est utilisé dans la barre supérieure, tandis que `src/assets/logo.svg` sert à la grande image décorative à droite de la page d'accueil ; il est recommandé de remplacer les deux.
:::
