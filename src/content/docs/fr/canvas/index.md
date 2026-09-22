---
title: Présentation du produit et valeur essentielle
description: "Manuel produit officiel d'EpoCanvas Docs — un site de documentation statique performant conçu pour les projets open source : positionnement du produit, avantages essentiels et points douloureux résolus."
---

**EpoCanvas Docs** est le système officiel de site de documentation technique conçu pour l'écosystème open source EpoCanvas. Construit sur le framework de sites statiques moderne **Astro 5** et **Starlight**, il vise à offrir aux développeurs une plateforme de documentation à la mise en page professionnelle, rapide à ouvrir, agréable à rechercher et facile à maintenir.

Qu'il s'agisse de rédiger le manuel utilisateur d'un produit, les spécifications d'interface API ou de documenter l'architecture d'un système, EpoCanvas Docs permet aux rédacteurs de se concentrer sur la rédaction d'un contenu Markdown de qualité, tout en offrant aux lecteurs une expérience de navigation confortable et naturelle.

---

## Les problèmes concrets résolus

Dans le développement quotidien et la rédaction technique, de nombreuses équipes rencontrent fréquemment les difficultés suivantes dans la maintenance de leur documentation :

1. **Pages lentes à ouvrir et gourmandes en mémoire** : les pages générées par de nombreux outils de documentation embarquent une grande quantité de JavaScript à l'exécution ; l'ouverture est lente sur mobile ou avec une connexion faible, et le défilement des longs articles est souvent saccadé.
2. **Navigation pénible dans les longs articles** : les sites de documentation courants n'ont souvent qu'un menu à gauche ; lors de la lecture d'une documentation technique de plusieurs milliers de mots, il est difficile de saisir rapidement la hiérarchie des sous-titres de l'article en cours.
3. **Recherche dépendante de services externes** : les services de recherche cloud courants comme Algolia exigent la création d'un compte supplémentaire et la configuration de clés de crawler ; ils deviennent totalement inopérants dans un environnement intranet sans accès aux services externes.
4. **Multilinguisme à moitié fait** : nombre de sites de documentation prétendent prendre en charge plusieurs langues, alors que seuls les boutons de navigation sont traduits — le corps des articles reste dans la langue d'origine ; d'autres renvoient directement une erreur 404 lorsqu'une traduction manque, obligeant le lecteur à modifier lui-même l'URL pour trouver le contenu.

EpoCanvas Docs est précisément conçu pour résoudre ces problèmes concrets.

---

## Aperçu des fonctionnalités principales

![Rendu réel dans le navigateur de la page de présentation du produit d'EpoCanvas Docs : catalogue des catégories à gauche, corps du texte au centre, table des matières de la page à droite](/images/canvas/ui-docs-reading.png)

*Figure : rendu réel de la page de présentation du produit. À gauche le catalogue des catégories de documentation, au centre le corps du texte, à droite le plan « Sur cette page » généré automatiquement, qui met en évidence la section courante au fil du défilement.*

### 1. Une interface de lecture claire en trois colonnes

- **Barre de navigation à gauche** : organise toutes les catégories de documentation par module, avec repli hiérarchique, sans saut au changement de page.
- **Zone de corps de texte au centre** : largeur maximale du corps de texte de 60rem, interligne de 1,68, blocs de code à largeur adaptative — la lecture prolongée fatigue moins.
- **Colonne de plan à droite** : extrait automatiquement les titres `h2` et `h3` de l'article pour générer « Sur cette page », met en évidence la position de lecture courante au fil du défilement, et permet un déplacement fluide en cliquant sur n'importe quel sous-titre.

### 2. Recherche en deux modes : recherche dans la page + recherche sur l'ensemble du site

- **Recherche dans la page courante** : saisissez directement des mots-clés dans le champ de recherche en haut ; tous les textes correspondants de la page sont immédiatement surlignés, avec un compteur de progression tel que `3/9`, et la touche Entrée permet de passer de l'un à l'autre.
- **Fenêtre de recherche sur l'ensemble du site** : appuyez sur `Ctrl + K` (`Cmd + K` sur Mac) pour ouvrir la fenêtre de recherche globale, basée sur l'index statique Pagefind, qui liste tous les documents correspondants avec un aperçu des paragraphes.
- Toutes les capacités de recherche s'exécutent localement dans le navigateur, sans dépendre d'aucun service backend ; la recherche reste utilisable même en hébergement intranet.

### 3. Traductions complètes en 10 langues

- Dix langues prises en charge : chinois simplifié, chinois traditionnel, anglais, japonais, coréen, espagnol, français, allemand, russe et portugais ; pour chaque langue, la navigation, la barre latérale et l'intégralité du corps des documents sont entièrement traduites.
- Un clic sur le bouton de langue en haut à droite permet d'accéder à la version de l'article dans la langue cible ; l'URL comporte un préfixe de langue (par exemple `/en/canvas/`) et peut être mise en favori ou partagée directement avec des collègues utilisant d'autres langues.
- Lorsque la traduction d'une page donnée manque encore dans une langue, la page affiche automatiquement en repli le contenu chinois par défaut, sans jamais provoquer d'erreur 404.

### 4. Mise en forme professionnelle du Markdown et du code

- Coloration syntaxique du code basée sur Expressive Code, avec la possibilité d'ajouter un titre de nom de fichier aux blocs de code, de surligner des lignes précises et d'afficher des diffs comparatifs.
- Prise en charge native de 4 encadrés colorés (Note, Tip, Caution, Danger), avec titres personnalisables.
- Prise en charge des syntaxes Markdown étendues courantes : tableaux GFM, listes de tâches, texte barré, etc. ; les règles complètes sont décrites dans [Règles de rendu en détail](/canvas/rendering/).

### 5. Build rapide et hébergement gratuit

- Compilation statique basée sur Astro 5 ; les artefacts de build sont du HTML et du CSS purs avec un peu de JS chargé à la demande — un build complet de l'ensemble du site, 10 langues et environ 180 pages, prend environ 25 secondes.
- Commande de déploiement Cloudflare Pages préconfigurée : une seule ligne de commande suffit pour publier la documentation en ligne, avec obtention automatique du certificat HTTPS.

---

## Architecture globale du projet

Pour que la documentation reste légère et facile à maintenir, le système est divisé en quatre parties selon leurs responsabilités :

![Diagramme d'architecture du système EpoCanvas Docs : les sources de contenu Markdown sont compilées par Astro, habillées des composants d'interface personnalisés, puis générées en pages statiques et hébergées sur Cloudflare Pages](/images/canvas/docs-architecture.svg)

*Figure : architecture du système. Les rédacteurs n'ont qu'à maintenir les sources de contenu Markdown ; toutes les autres étapes sont effectuées automatiquement.*

- **Socle et styles** : basé sur le noyau statique d'Astro 5 ; les variables de design sont définies dans `src/styles/custom.css`, et les thèmes clair et sombre partagent les mêmes noms de variables.
- **Gestion des sources de contenu** : tous les documents sont conservés dans le répertoire `src/content/docs/`, rédigés en Markdown pur (`.md`) ou en MDX (`.mdx`) qui permet d'embarquer des composants.
- **Composants d'interface** : en surchargeant les composants natifs de Starlight, la barre supérieure, la barre latérale, la table des matières de la page et la fenêtre de recherche ont été personnalisées.
- **Diffusion et accès** : les artefacts de compilation sont conservés dans le répertoire `dist/`, hébergés sur Cloudflare Pages et servis au plus près par les nœuds CDN mondiaux.

---

## À qui il s'adresse

EpoCanvas Docs convient aux scénarios suivants :

- **Site de documentation officiel de projets open source** : manuel produit, référence API, documentation d'architecture — tout se fait avec un seul dépôt ;
- **Base de connaissances interne d'équipe** : purement statique, sans dépendance à des services externes ; la recherche fonctionne intégralement même en intranet ;
- **Documentation à la manière d'un blog technique personnel** : vous ne rédigez que du Markdown, sans vous soucier du front-end, et publiez avec une seule commande.

Il ne convient **pas** aux scénarios nécessitant une authentification par connexion, des commentaires interactifs ou l'affichage de données en temps réel — un site purement statique n'a pas de backend ; ces besoins exigent des services complémentaires.

---

## Comparaison avec les outils de documentation courants

| Caractéristique | EpoCanvas Docs | Docusaurus | VitePress | GitBook édition commerciale |
| :--- | :--- | :--- | :--- | :--- |
| **Technologie sous-jacente** | Astro 5 + Starlight | React 18 | Vue 3 + Vite | Plateforme SaaS propriétaire |
| **Mécanisme de recherche** | Index statique local Pagefind | Dépend du service cloud Algolia | Recherche en mémoire Minisearch | Recherche backend intégrée |
| **Conception de la mise en page** | Trois colonnes (menu à gauche + corps au centre + table des matières à droite) | Nécessite la configuration de plugins pour être modifiée | Deux/trois colonnes par défaut | Deux colonnes fixes |
| **Mode de déploiement** | Transfert direct vers Cloudflare Pages | S3 / Vercel / GitHub | GitHub Pages | Hébergement privé de la plateforme |
| **Autonomie et maîtrise** | 100 % open source, code source entièrement en main | 100 % open source | 100 % open source | Propriétaire, nombreuses fonctionnalités payantes |

---

## Pile technique et versions

La pile technique réellement utilisée par la version actuelle (sur la base des artefacts de build) :

| Composant | Version | Rôle |
| :--- | :--- | :--- |
| **Astro** | v5.18.2 | Noyau de site statique, en charge du build et du routage |
| **Starlight** | v0.32.6 | Framework de site de documentation, fournit le squelette de mise en page et le traitement du contenu |
| **Expressive Code** | Intégré avec Starlight | Coloration des blocs de code, barre de titre, surlignage de lignes |
| **Pagefind** | Intégré via `@pagefind/default-ui` 1.5.2 | Génère l'index de recherche statique au moment du build |
| **Wrangler** | v4.131.0 | CLI officielle de Cloudflare, exécute le déploiement |
| **Environnement d'exécution** | Node.js 18.20.8 / 20.3+ / 22+, pnpm 10 | Développement et builds locaux ; `pnpm run deploy` exige Node.js 22 ou plus à cause de wrangler |

Lors de la mise à jour des dépendances, veuillez également lire les points d'attention relatifs aux tests de régression dans [Composants d'interface et développement personnalisé](/canvas/components/).

---

## Structure des répertoires du projet

Le code du projet est organisé comme suit, chaque répertoire ayant un rôle bien défini :

```text
epocanvas-docs/
├── public/                    # Répertoire des ressources statiques (images, icônes vectorielles à placer directement ici)
│   └── images/canvas/         # Captures d'écran de l'interface et schémas vectoriels de l'architecture du système
├── src/
│   ├── components/starlight/  # Composants de page personnalisés (barre supérieure, barre latérale, table des matières de la page, fenêtre de recherche, etc.)
│   ├── config/navigation.ts   # Configuration de la barre de navigation supérieure (ajouter/supprimer des entrées de menu se fait ici)
│   ├── content/docs/          # Emplacement des fichiers Markdown du corps des documents
│   │   ├── index.mdx          # Page d'accueil du site de documentation
│   │   ├── canvas/            # Documents des différentes sections (chinois simplifié, langue par défaut)
│   │   └── en/ ja/ ...        # Répertoires des traductions complètes dans les 9 autres langues
│   ├── styles/custom.css      # Styles globaux et variables de couleurs du thème
│   ├── utils/i18n.ts          # Dictionnaire des libellés d'interface et liste des langues
│   └── pages/404.astro        # page 404 personnalisée, message dans la langue du navigateur
├── scripts/                   # invalidation du cache, contrôles i18n / images / ancres et captures d'écran
├── astro.config.mjs           # Fichier de configuration principal du site (titre, liste des langues et catalogue de la barre latérale se configurent ici)
└── package.json               # Dépendances du projet et configuration des commandes d'exécution
```

---

## Prochaines étapes

- Vous voulez faire tourner le projet en local ? Lisez **[Démarrage rapide (en 3 minutes)](/canvas/deployment/)**.
- Vous voulez connaître la disposition précise de l'interface et son mode d'emploi ? Lisez **[Mise en page et confort de lecture](/canvas/layout/)**.
- Vous voulez commencer à rédiger de nouveaux documents ? Lisez le **[Guide de rédaction et de mise en forme Markdown](/canvas/markdown/)** et les **[Règles de rendu en détail](/canvas/rendering/)**.
