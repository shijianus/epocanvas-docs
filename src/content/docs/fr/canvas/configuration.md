---
title: Configuration du site et personnalisation des styles
description: Guide de modification du fichier de configuration principal d'EpoCanvas Docs, ajustement du menu de la barre latérale, remplacement du logo de marque et personnalisation des couleurs du thème.
---

Si vous souhaitez utiliser **EpoCanvas Docs** comme site de documentation pour votre équipe, ou ajuster le titre du site, le logo, la structure du sommaire et les couleurs du thème, ce chapitre présente les points d'entrée de personnalisation les plus courants. Une fois les modifications de configuration enregistrées, le serveur de développement local applique automatiquement le rechargement à chaud, visible immédiatement dans le navigateur.

---

## 1. Informations de base du site (`astro.config.mjs`)

Le fichier `astro.config.mjs` à la racine du projet est le fichier de configuration principal de l'ensemble du site de documentation. Les options directement liées aux informations du site sont les suivantes (les commentaires indiquent quand les modifier) :

```javascript
export default defineConfig({
  // Domaine de production du site, affecte les liens SEO et la génération du sitemap
  site: 'https://docs.epocanvas.com',

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

      // Lien vers le dépôt GitHub en haut à droite
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

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
      { label: 'Création de compte et connexion', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`** : nom de la catégorie ou de l'article affiché dans la barre latérale ; il peut différer du `title` du Frontmatter (par exemple avec un nom d'affichage plus court) ;
- **`link`** : chemin d'accès de l'article, correspondant à l'emplacement du fichier sous `src/content/docs/`.

:::warning
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

1. Préparez une image vectorielle du logo de marque (`.svg` recommandé, un `.png` net fonctionne aussi) ;
2. Remplacez le fichier existant en l'enregistrant sous `public/images/logo.svg` (l'image principale de la page d'accueil se trouve dans `src/assets/logo.svg`) ;
3. Actualisez le navigateur : l'icône de la barre supérieure et celle de la page d'accueil sont remplacées automatiquement.

:::tip
Les deux logos ont des usages différents : `public/images/logo.svg` est utilisé dans la barre supérieure, tandis que `src/assets/logo.svg` sert à la grande image décorative à droite de la page d'accueil ; il est recommandé de remplacer les deux.
:::
