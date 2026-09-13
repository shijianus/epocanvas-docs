# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | Français

EpoCanvas Docs est le site de documentation officiel du projet EpoCanvas. Il repose sur Astro 5 et Starlight et propose, dès l'installation, une mise en page de lecture à trois colonnes, une recherche en deux modes et un contenu entièrement multilingue. Le contenu est rédigé en Markdown standard et publié sur Cloudflare Pages.

**Site en ligne** : [https://docs.epocanvas.com](https://docs.epocanvas.com) (miroir : [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))

## Aperçu

![Page d'accueil de la documentation EpoCanvas Docs](./public/images/canvas/ui-home-landing.png)

Le site utilise une mise en page à trois colonnes : navigation par catégories à gauche, contenu de l'article au centre et table des matières de la page en cours à droite. Le thème sombre est activé par défaut, suit les préférences du système et peut être modifié manuellement depuis l'en-tête.

## Fonctionnalités

- **Mise en page de lecture à trois colonnes** — la largeur du contenu est limitée pour faciliter la lecture longue ; la barre latérale conserve sa position de défilement d'une page à l'autre, et le sommaire à droite surligne la section en cours pendant le défilement.
- **Recherche en deux modes** — le champ de recherche de l'en-tête recherche dans la page en cours, tandis que `Ctrl+K` / `Cmd+K` ouvre une fenêtre de recherche sur l'ensemble du site, propulsée par Pagefind. L'index est généré au moment de la compilation et toutes les requêtes s'exécutent dans le navigateur, sans service de recherche tiers ; le site fonctionne donc également sur un réseau interne sans accès à Internet.
- **Contenu entièrement multilingue** — l'interface et le texte de chaque article sont disponibles en 10 langues : chinois simplifié (par défaut), chinois traditionnel, anglais, japonais, coréen, espagnol, français, allemand, russe et portugais. Chaque langue possède son propre préfixe d'URL (par ex. `/en/`) ; les pages sans traduction affichent automatiquement le chinois au lieu d'une erreur 404.
- **Extensions Markdown** — quatre types d'encadrés (`:::note`, `:::tip`, `:::caution`, `:::danger`), coloration syntaxique Shiki avec étiquette de nom de fichier, surlignage de lignes et rendu des diffs.
- **Déploiement en une commande** — le site est compilé en fichiers statiques et publié sur Cloudflare Pages ; les domaines personnalisés et les certificats HTTPS sont configurés automatiquement.

## Prérequis

- Node.js 20 ou supérieur (18.17+ pris en charge)
- pnpm 10

## Démarrage rapide

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

Ouvrez `http://localhost:4321` dans votre navigateur. Tant que le serveur de développement est en cours d'exécution, les modifications Markdown sont reflétées immédiatement.

### Commandes

| Commande | Description |
| :--- | :--- |
| `pnpm run dev` | Démarre le serveur de développement local avec rechargement à chaud |
| `pnpm run build` | Compile le site statique dans `dist/` et génère l'index de recherche |
| `pnpm run preview` | Prévisualise le résultat de la compilation en local |
| `pnpm run deploy` | Compile et publie sur Cloudflare Pages |

## Structure du projet

```text
epocanvas-docs/
├── public/images/canvas/       # Captures d'écran et schémas utilisés par la documentation
├── src/
│   ├── components/starlight/   # Composants Starlight surchargés (Header, Sidebar, …)
│   ├── config/navigation.ts    # Configuration de la barre de navigation supérieure
│   ├── content/docs/           # Contenu de la documentation, rédigé en Markdown
│   ├── styles/custom.css       # Couleurs du thème et styles de mise en page
│   └── utils/i18n.ts           # Textes d'interface et registre des langues
├── astro.config.mjs            # Configuration du site : titre, barre latérale, redirections
├── AGENTS.md                   # Lignes directrices rédactionnelles
├── LICENSE
└── package.json
```

## Rédiger la documentation

1. Créez un nouveau fichier `.md` dans `src/content/docs/canvas/`.
2. Ajoutez le frontmatter au début du fichier :

   ```yaml
   ---
   title: Titre du document
   description: Description de la page en une phrase
   ---
   ```

3. Enregistrez la page dans le tableau `sidebar` de `astro.config.mjs` ; une page non enregistrée n'apparaît pas dans la navigation.
4. Placez les images dans `public/images/canvas/` et référencez-les avec un chemin absolu :

   ```markdown
   ![texte alternatif](/images/canvas/your-image.png)
   ```

Exécutez `pnpm run build` avant de valider afin de vérifier que le site se compile sans erreur.

## Déploiement

Le site est hébergé sur Cloudflare Pages :

- **Publication locale** — exécutez `wrangler login` une fois pour vous authentifier, puis `pnpm run deploy` compile et publie le site.
- **Domaine personnalisé** — dans le tableau de bord Cloudflare, ouvrez le projet Pages `epocanvas-docs` et ajoutez le domaine dans *Custom domains*. L'enregistrement CNAME et le certificat SSL sont provisionnés automatiquement.

## Contributions

Les issues et les pull requests sont les bienvenues. Avant de soumettre une PR, exécutez `pnpm run build` en local et assurez-vous que la compilation aboutit.

## Licence

[MIT](./LICENSE)
