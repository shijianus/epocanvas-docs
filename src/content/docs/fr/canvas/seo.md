---
title: SEO et optimisation des performances
description: Présentation des capacités SEO intégrées d'EpoCanvas Docs (balises meta, Open Graph, sitemap, robots.txt) et de ses mécanismes de performance, ainsi que la procédure de soumission aux moteurs de recherche.
---

Une documentation s'écrit pour être lue, à condition d'être trouvable et de s'ouvrir rapidement. **EpoCanvas Docs** intègre au niveau du build un ensemble de capacités SEO et de mécanismes de performance prêts à l'emploi ; cette page explique ce qu'ils sont, comment les vérifier et ce qu'il reste à faire après la mise en ligne.

---

## Capacités SEO intégrées

Toutes les capacités suivantes s'activent automatiquement au moment du build, sans configuration supplémentaire :

| Capacité | Implémentation | Vérification |
| :--- | :--- | :--- |
| Titre de page | `<title>Titre de l'article \| EpoCanvas Docs</title>`, issu du Frontmatter | Code source de la page ou onglet du navigateur |
| Description de page | `<meta name="description">`, issue de la `description` du Frontmatter | Code source |
| Balises Open Graph | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description` ; affichage d'une carte lors du partage sur les réseaux sociaux | Coller le lien dans un outil de discussion pour voir l'aperçu |
| Lien canonique | `<link rel="canonical">` généré automatiquement sur chaque page, pointant vers le domaine principal | Code source |
| Sitemap | `sitemap-index.xml` généré automatiquement au build | Accéder à `/sitemap-index.xml` |
| robots.txt | `public/robots.txt` inclus dans le projet, autorisant tous les robots et déclarant l'emplacement du sitemap | Accéder à `/robots.txt` |

:::tip
Le `title` et la `description` du Frontmatter sont les principaux éléments affichés par les moteurs de recherche. Lors de la rédaction, remplissez toujours une `description` courte et précise ; c'est l'optimisation SEO la plus importante qui soit.
:::

### Canonical et domaine miroir

Le domaine principal du site est `docs.epocanvas.com` ; la configuration `<site>` y correspond, et le canonical comme `og:url` de chaque page pointent vers le domaine principal. Même si le contenu est aussi accessible via le miroir `epocanvas-docs.pages.dev`, les moteurs de recherche ramènent le poids au domaine principal et ne le considèrent pas comme du contenu dupliqué.

---

## Mécanismes de performance

### Sortie purement statique, sans runtime de framework

Le résultat du build est du HTML + CSS pur. La navigation entre pages, la lecture et la surbrillance au défilement du sommaire ne nécessitent le téléchargement d'aucun framework front-end (runtime React/Vue etc. de taille nulle) ; seuls les composants interactifs comme la recherche, la bascule de thème et le changement de langue chargent quelques scripts à la demande. Le premier rendu n'attend pas JavaScript, et l'affichage reste fluide sur réseau lent comme sur appareils d'entrée de gamme.

### Compression des images au build

Les ressources statiques référencées via `public/` sont distribuées par le CDN au déploiement ; la chaîne d'outils de build intègre le module de traitement d'images sharp, ce qui réserve la possibilité d'ajouter plus tard une optimisation d'images au moment du build. Les règles actuelles exigent de limiter la largeur des captures d'écran à environ 1440 pixels et de privilégier le SVG pour les schémas, afin de contrôler le poids des images à la source.

### Chargement de l'index de recherche à la demande

Pagefind génère lors de `pnpm run build` des fragments d'index fortement compressés. Le lecteur qui ouvre une page ne télécharge aucun index ; ce n'est que lors d'une réelle recherche site-wide que le navigateur récupère les fragments correspondant aux mots-clés (quelques Ko à quelques dizaines de Ko), sans impact sur la vitesse du premier affichage.

### Comment vérifier les performances

1. Ouvrez le panneau **Network** des outils de développement du navigateur, actualisez la page et examinez le volume transféré au premier chargement ;
2. Exécutez un audit **Lighthouse** (catégorie Performance) dans une fenêtre de navigation privée Chrome et vérifiez le score ;
3. Utilisez `curl -sI https://docs.epocanvas.com` pour vérifier que les stratégies de cache du CDN comme `Cache-Control` sont bien appliquées dans les en-têtes de réponse.

---

## Trois actions recommandées après la mise en ligne

Une fois le déploiement terminé (voir [Déploiement sur Cloudflare Pages](/canvas/cloudflare/)), il est recommandé de réaliser dans l'ordre :

### 1. Soumettre le sitemap à Google Search Console

1. Ouvrez [Google Search Console](https://search.google.com/search-console) et ajoutez la ressource `docs.epocanvas.com` ;
2. Validez la propriété du domaine via un enregistrement DNS TXT selon les instructions (quelques minutes suffisent lorsque le domaine est hébergé chez Cloudflare) ;
3. Dans « Sitemaps » du menu de gauche, soumettez `https://docs.epocanvas.com/sitemap-index.xml`.

### 2. Vérifier l'indexation

Une semaine après la mise en ligne, recherchez `site:docs.epocanvas.com` sur Google pour confirmer que les articles sont indexés ; dans le rapport « Pages » de Search Console, vérifiez que le nombre de pages indexées correspond au nombre de documents.

### 3. Vérifier régulièrement les liens morts

Après une refonte de la documentation ou le renommage de chemins, les anciens liens référencés hors du site peuvent devenir invalides. Consultez les entrées « Introuvable (404) » dans le rapport « Pages » de Search Console et complétez la table `redirects` de `astro.config.mjs` avec des redirections pour les chemins invalides très fréquentés.

:::caution
Le domaine miroir `epocanvas-docs.pages.dev` sert uniquement de point d'accès de secours ; le canonical garantit déjà que les moteurs de recherche n'indexent que le domaine principal. Ne diffusez pas activement l'adresse du miroir hors du site, afin d'éviter que des lecteurs mettent en favori un domaine que vous ne contrôlez pas.
:::
