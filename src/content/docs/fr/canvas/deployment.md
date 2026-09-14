---
title: Démarrage rapide (en 3 minutes)
description: Préparation de l'environnement local d'EpoCanvas Docs, installation des dépendances, démarrage du serveur de développement local et aide-mémoire des commandes courantes.
---

Il existe deux chemins pour faire tourner ce site de documentation ; choisissez-en un selon votre objectif :

- **Vous voulez voir immédiatement un site en ligne** : aucune installation nécessaire, sautez directement à la section [Déploiement en un clic](#déploiement-en-un-clic-la-mise-en-ligne-en-un-seul-clic) ci-dessous ; un clic sur le bouton et, deux minutes plus tard, vous obtenez votre propre adresse ;
- **Vous voulez rédiger la documentation et modifier le contenu** : suivez d'abord [Préparation](#préparation) pour faire tourner le projet en local et visualiser l'effet au fil de vos modifications, puis publiez avec la commande de déploiement de l'[aide-mémoire des commandes](#aide-mémoire-des-commandes-de-développement-courantes) une fois la rédaction terminée.

---

## Déploiement en un clic : la mise en ligne en un seul clic

Les boutons ci-dessous sont les « boutons de déploiement » officiels de Cloudflare, Vercel et Netlify. Un clic ouvre l'assistant de déploiement de la plateforme concernée ; celle-ci clone automatiquement ce dépôt sous votre propre compte GitHub, puis effectue automatiquement le build et la publication dans le cloud. Un simple compte GitHub suffit pour l'ensemble du processus : pas besoin d'installer Node.js ou pnpm sur votre ordinateur, ni de taper la moindre commande.

### Déploiement vers Cloudflare (recommandé)

[![Déployer vers Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

Après avoir cliqué sur le bouton, l'assistant se déroule en trois étapes :

1. **Connexion et autorisation** : connectez-vous successivement à GitHub et Cloudflare. Les deux proposent des offres gratuites ; si vous n'avez pas de compte, créez-en un sur place ;
2. **Clonage du dépôt** : Cloudflare copie automatiquement ce dépôt sous votre compte GitHub ; toutes les modifications de contenu ultérieures se font dans votre propre dépôt ;
3. **Vérification de la configuration et déploiement** : l'assistant affiche enfin une page de configuration ; vérifiez les éléments selon le tableau ci-dessous, puis cliquez sur Deploy :

| Élément de configuration | Valeur affichée par défaut dans l'assistant | Comment procéder |
| :--- | :--- | :--- |
| Nom du dépôt / nom du projet | Prérempli avec `epocanvas-docs` | Conserver la valeur par défaut |
| Commande de build | Détectée automatiquement comme `pnpm run build` pour ce dépôt | Conserver la valeur par défaut |
| Commande de déploiement | Préremplie avec `pnpm run deploy` | **Remplacer par `npx wrangler deploy`** |

:::caution
Remplacez impérativement la commande de déploiement par `npx wrangler deploy`. La commande préremplie `pnpm run deploy` est la commande de transfert direct vers Cloudflare Pages réservée aux mainteneurs de ce site ; elle déploie vers un nom de projet codé en dur et provoque une erreur immédiate dans le processus de déploiement par bouton.
:::

Lors du premier déploiement, Cloudflare détecte l'absence de fichier de configuration Workers dans le dépôt, identifie automatiquement qu'il s'agit d'un site statique Astro et ouvre sur votre dépôt une Pull Request (PR) de configuration générée automatiquement — il suffit de la fusionner ; ensuite, chaque poussée de code déclenchera automatiquement un build et une mise en ligne. Du clic sur le bouton à l'affichage de l'adresse, comptez deux à trois minutes si tout se passe bien.

Une fois le déploiement terminé, Cloudflare attribue une adresse publique de la forme `https://epocanvas-docs.<votre-sous-domaine>.workers.dev`, avec certificat HTTPS intégré. Pour utiliser votre propre domaine, rendez-vous dans la console sous Workers & Pages → votre projet → **Settings** → **Domains & Routes** et ajoutez-le.

### Déploiement vers Vercel et Netlify

Si vous préférez d'autres plateformes, les deux boutons ci-dessous font la même chose ; les deux plateformes reconnaissent automatiquement les projets Astro, sans qu'aucune configuration de build ne soit à saisir manuellement :

[![Déployer avec Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Déployer vers Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel** : cliquez sur le bouton → autorisez GitHub → cliquez sur Deploy en conservant les options par défaut. Vous obtenez ensuite un domaine `xxx.vercel.app`, gratuit avec l'offre personnelle Hobby ;
- **Netlify** : cliquez sur le bouton → connectez GitHub → la plateforme clone automatiquement le dépôt et effectue le premier build. Vous obtenez ensuite un domaine `xxx.netlify.app`, largement suffisant avec l'offre gratuite.

:::note
Les trois boutons fonctionnent selon le même mécanisme : cloner le dépôt sous votre compte GitHub et configurer le déploiement continu « une poussée de code déclenche automatiquement un nouveau build et une mise en ligne ». Choisissez une seule plateforme, inutile de déployer deux fois. Ce site lui-même est hébergé par transfert direct vers Cloudflare Pages (voir [Déploiement et mise en ligne via Cloudflare Pages](/canvas/cloudflare/)), ce qui n'interfère pas avec les chemins par bouton ci-dessus — pour un site de documentation statique, l'expérience d'accès constatée par le lecteur est identique quel que soit le mode d'hébergement.
:::

---

## Préparation

Le déploiement en un clic convient pour « mettre d'abord le site en ligne », mais la rédaction et la modification de la documentation se font forcément en local. Si vous comptez écrire du contenu, vérifiez d'abord que votre ordinateur dispose des environnements de développement de base suivants :

| Outil | Version recommandée | Commande de vérification | Description |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.14.1` (20 LTS recommandé) | `node -v` | Environnement de base pour exécuter JavaScript et construire les pages statiques |
| **pnpm** | `>= 9` (10 en environnement CI) | `pnpm -v` | Gestionnaire de paquets recommandé : installation rapide et économie d'espace disque |
| **Git** | Dernière version stable | `git --version` | Sert à récupérer le code et à gérer les versions |

:::tip
Si `pnpm` n'est pas encore installé sur votre ordinateur, vous pouvez l'installer rapidement en global via le npm fourni avec Node.js :

```bash
npm install -g pnpm
```
:::

---

## Lancer le projet en local en 3 étapes

### Étape 1 : cloner le dépôt de code en local

Ouvrez un terminal et exécutez les commandes suivantes pour cloner le code du projet puis entrer dans le dossier du projet :

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### Étape 2 : installer les dépendances du projet

À la racine du projet, exécutez la commande d'installation :

```bash
pnpm install
```

pnpm télécharge automatiquement les dépendances front-end requises d'après `pnpm-lock.yaml`, notamment Astro, Starlight et le module de traitement des images locales ; cela prend généralement quelques dizaines de secondes. À la fin de l'installation, le terminal affiche la durée totale :

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### Étape 3 : démarrer le serveur de prévisualisation de développement local

Une fois les dépendances installées, exécutez la commande de démarrage :

```bash
pnpm run dev
```

Le terminal affiche des informations similaires à celles-ci (le premier démarrage précompile les dépendances et prend quelques secondes) :

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

Ouvrez alors votre navigateur à l'adresse `http://localhost:4321` : le site de documentation complet s'affiche. Après modification d'un fichier `.md` et enregistrement, la page du navigateur se rafraîchit automatiquement pour afficher le contenu à jour.

![Rendu réel de la page de démarrage rapide sur le serveur de développement local](/images/canvas/ui-quickstart.png)

*Figure : rendu réel de `http://localhost:4321/canvas/deployment/`, c'est-à-dire la page que vous êtes en train de lire.*

---

## Aide-mémoire des commandes de développement courantes

Lors de la rédaction quotidienne de la documentation ou de la maintenance du projet, on utilise principalement les commandes suivantes :

| Commande | Cas d'usage | Description détaillée |
| :--- | :--- | :--- |
| `pnpm run dev` | **Rédaction quotidienne de la documentation** | Démarre le service de débogage local avec rechargement à chaud (HMR). Après modification d'un fichier `.md`, le navigateur se rafraîchit automatiquement avec le contenu à jour. |
| `pnpm run build` | **Test de build** | Compile intégralement en local les pages statiques de l'ensemble du site et génère dans le répertoire `dist/` le HTML, le CSS ainsi que l'index de recherche Pagefind. |
| `pnpm run preview` | **Prévisualisation des artefacts de build** | Démarre en local un serveur Web léger qui exécute les artefacts de `dist/`, pour vérifier avant la publication officielle que les liens et les styles fonctionnent. |
| `pnpm run deploy` | **Publication en un clic** | Exécute d'abord automatiquement le build, puis appelle l'outil Wrangler pour pousser `dist/` vers l'environnement de production en ligne de Cloudflare Pages. |

Pour les étapes de publication complètes et les méthodes de vérification en ligne, lisez **[Déploiement et mise en ligne via Cloudflare Pages](/canvas/cloudflare/)**.

---

## Où se trouvent les fichiers de configuration essentiels ?

Pour modifier les informations de base du site, concentrez-vous sur les fichiers suivants :

- **Nom du site et sommaire** : modifiez `astro.config.mjs` à la racine. Vous pouvez y changer le `title` du site (titre du site), `site` (nom de domaine en ligne) ainsi que `sidebar` (sommaire à gauche).
- **Boutons de la barre de navigation supérieure** : modifiez `src/config/navigation.ts`. Vous pouvez y ajouter ou retirer les boutons du haut tels que « Accueil », « Présentation du produit », etc., ainsi que leurs liens de destination.
- **Couleurs des pages et styles de police** : modifiez `src/styles/custom.css`. Vous pouvez y ajuster les couleurs du thème en mode clair et sombre.
- **Ajout d'un nouveau document** : créez directement un fichier `.md` dans le répertoire `src/content/docs/canvas/`, puis enregistrez-le dans la barre latérale ; voir [Guide de rédaction et de mise en forme Markdown](/canvas/markdown/).

---

## Prochaines étapes

Une fois le service local correctement lancé, vous pouvez poursuivre avec :

- **[Disposition des pages et expérience de lecture](/canvas/layout/)** : pour connaître les détails de disposition de la barre supérieure, de la barre latérale et de l'interface du corps du texte.
- **[Règles de rendu en détail](/canvas/rendering/)** : pour comprendre comment le Markdown est rendu en page finale et éviter les pièges de la syntaxe de mise en forme.
- **[Déploiement et mise en ligne via Cloudflare Pages](/canvas/cloudflare/)** : pour publier la documentation sur le Web public et lier un nom de domaine dédié.
