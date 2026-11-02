---
title: Déploiement sur Cloudflare Pages
description: "Guide Cloudflare Pages : transfert Wrangler, intégration Git facultative, domaines et contrôles après publication."
---

Cette page décrit le déploiement de documentation statique sur **Cloudflare Pages** à partir des scripts du dépôt. Les captures sont des exemples existants, pas des traces de déploiement ou de tests de cette candidate. En cas de différence, suivez la console actuelle. Seuls les journaux et états réels permettent de confirmer la réussite des contrôles et du déploiement.

---

## Préparation

### Ce dont vous avez besoin

| Élément | Détail |
| :--- | :--- |
| **Compte Cloudflare** | Inscription gratuite sur [dash.cloudflare.com](https://dash.cloudflare.com/) ; le service Pages ne nécessite aucun forfait payant |
| **Build complet possible en local** | Vérifiez d'abord que `pnpm run verify` fonctionne et que le répertoire `dist/` est bien généré, voir [Démarrage rapide](/canvas/deployment/) |
| **Node.js + pnpm** | Les commandes de déploiement dépendent de l'environnement de développement local ; les versions requises sont celles du chapitre de prise en main |

### Comment choisir entre les deux méthodes de déploiement

![Transfert local avec Wrangler et build intégré à Git](/images/canvas/docs-deploy-compare.svg)

*Figure : build local et transfert Wrangler à gauche, build cloud déclenché par Git à droite. Ce schéma ne prouve pas que ces chemins ont été testés lors de cette révision.*

| Critère | Méthode 1 : transfert direct en ligne de commande | Méthode 2 : build automatique Git |
| :--- | :--- | :--- |
| Mode d'opération | Exécution locale de `pnpm run deploy` | Déclenchement automatique lors du push du code vers GitHub |
| Prise en main | Faible, deux commandes | Moyenne, une configuration unique à effectuer dans la console |
| Cas d'usage | Première mise en ligne, maintenance par une seule personne, mises à jour rapides | Collaboration à plusieurs, « commit = mise en ligne » |
| Contrôles | Verify complet avant transfert | Configurer verify complet dans la commande cloud |

:::tip
Choisissez Direct Upload ou l’intégration Git à la création du projet. Ne supposez pas qu’un projet Direct Upload peut être converti directement en projet Git ; créez le projet adapté en changeant de méthode. Un transfert urgent avec Wrangler doit aussi passer les contrôles.
:::

:::tip[Vraiment pas envie de taper des commandes ?]
La page [prise en main](/canvas/deployment/) propose des boutons de déploiement en un clic pour Cloudflare, Vercel et Netlify : un clic, l'autorisation du compte, la confirmation de la configuration, et le site de documentation est publié sur votre propre compte cloud, voir [déploiement en un clic](/canvas/deployment/#déploiement-en-un-clic--la-mise-en-ligne-en-un-seul-clic). Le bouton Cloudflare passe par l'hébergement statique Workers, une voie indépendante de la méthode Pages présentée sur cette page ; pour un site de documentation statique, l'expérience d'accès est identique, choisissez simplement l'une des deux.
:::

---

## Méthode 1 : transfert direct en ligne de commande locale (recommandé pour une première mise en ligne)

Cette méthode construit localement puis transfère avec Wrangler. `pnpm run deploy` cible le projet `epocanvas-docs` des mainteneurs, pas un déploiement générique utilisable tel quel par chaque fork.

### Étape 1 : se connecter au compte Cloudflare

Le projet inclut déjà Wrangler (l'outil en ligne de commande officiel de Cloudflare) ; la première utilisation nécessite une authentification via le navigateur :

```bash
pnpm exec wrangler login
```

Après exécution, le terminal affiche `Opening a link in your default browser...` ; le navigateur ouvre la page d'autorisation Cloudflare, et une fois **Allow** cliqué, le terminal confirme la connexion réussie. Vérifiez l'état de connexion avec la commande suivante :

```bash
pnpm exec wrangler whoami
```

:::caution
Une connexion ou un jeton Cloudflare avec les droits nécessaires est requis. En cas d’échec, vérifiez `wrangler whoami`, le compte et les droits du projet. Le texte exact dépend de la version.
:::

### Étape 2 : construire et téléverser en une commande

Le projet fournit dans `scripts/verify-release.mjs` une commande de publication en un clic :

Autorisez avec `pnpm exec wrangler login`. `scripts/verify-release.mjs` exige `main`, un arbre propre incluant les fichiers non suivis, un amont `origin/main` et un HEAD identique au commit distant réel. `pnpm run deploy` exécute `pnpm run verify` complet, recontrôle Git, puis appelle Wrangler. Le projet cible est défini dans le script ; configurez le vôtre avant réutilisation.

```bash
pnpm run deploy
```

`pnpm run deploy` exécute les contrôles de configuration, types Astro, build, tests et contenu/artefacts avant transfert. Pour ne vérifier que les prérequis, utilisez la commande ci-dessous. Elle lit encore les références Git distantes, mais ne lance ni validation complète, ni build, ni transfert. Un dry-run réussi ne signifie pas que les tests ont réussi.

```bash
pnpm run deploy --dry-run
```

Wrangler affiche l’URL après un transfert réussi. Le script fixe `--project-name epocanvas-docs --branch main` ; vérifiez l’existence du projet dans votre compte et sa branche de production.

### Étape 3 : retrouver votre projet dans la console

Ouvrez [dash.cloudflare.com](https://dash.cloudflare.com/), cliquez sur **Compute (Workers & Pages)** dans le menu de gauche pour voir la liste des projets. L'image ci-dessous repère trois éléments clés :

![Liste des projets Workers & Pages de la console Cloudflare, avec repères sur l'entrée du menu de gauche, le bouton Create application et le projet epocanvas-docs](/images/canvas/deploy/cf-01-projects-list.png)

*Figure : liste des projets Workers & Pages. ① Menu de gauche pour accéder à Workers & Pages ; ② bouton Create application pour créer un nouveau projet ; ③ notre projet `epocanvas-docs`, affichant le domaine d'accès `epocanvas-docs.pages.dev` et l'heure du dernier déploiement.*

Cliquez sur le nom du projet pour accéder à ses détails ; l'onglet **Deployments** présente l'historique complet des déploiements :

![Page d'historique des déploiements du projet epocanvas-docs, avec repères sur le domaine de production, les enregistrements de déploiement et les statuts](/images/canvas/deploy/cf-02-deployments.png)

*Figure : page d'historique des déploiements. ① Nom du projet ; ② onglet Deployments ; ③ le domaine de production est lié à la fois à `docs.epocanvas.com` (domaine personnalisé) et à `epocanvas-docs.pages.dev` (domaine par défaut) ; ④ chaque enregistrement de déploiement indique la branche et les informations de commit ; ⑤ statut et heure de déploiement.*

:::note
Seul un transfert réussi crée un enregistrement. Vérifiez statut, branche, commit et domaine dans Deployments. Une commande refusée ou un contrôle en échec ne met pas le site en ligne à jour.
:::

---

## Comprendre la configuration de build d'un projet à transfert direct

L'onglet **Settings** révèle la différence entre un projet à transfert direct et un projet Git :

![Page Settings de configuration de build du projet epocanvas-docs, la ligne Git repository indique non connecté](/images/canvas/deploy/cf-03-settings.png)

*Figure : onglet Settings. ① Entrée Settings ; ② la ligne Git repository affiche Connect (non connecté) — un projet à transfert direct n'a pas besoin de configuration de build Git, la construction se fait entièrement sur votre machine locale.*

:::tip
Le transfert direct évite la file de builds cloud. La machine doit disposer des bons Node, pnpm, Git et identifiants ; elle n’est pas limitée à un ordinateur précis.
:::

---

## Méthode 2 : connecter un dépôt Git pour un build automatique (optionnel)

Pour un build déclenché par push, créez un projet Pages intégré à Git et connectez le dépôt. Ce qui suit est un guide de configuration, pas une affirmation d’activation ou de validation lors de cette révision.

### Étape 1 : lancer le processus de création

Sur la page de liste des projets Workers & Pages, cliquez sur le bouton **Create application** en haut à droite (voir le repère ② de l'illustration de l'[étape 3 de la méthode 1](#étape-3--retrouver-votre-projet-dans-la-console)), puis choisissez l'onglet **Pages**.

### Étape 2 : connecter le dépôt Git

1. Dans l'interface de création, choisissez **Connect to Git** ;
2. Autorisez Cloudflare à accéder à votre compte GitHub ;
3. Dans la liste des dépôts, sélectionnez le dépôt de documentation `epocanvas-docs` ;
4. Cliquez sur **Commencer la configuration**.

### Étape 3 : renseigner la configuration de build

Dans « Set up builds and deployments », renseignez la configuration suivante :

| Paramètre | Valeur à saisir |
| :--- | :--- |
| Preset de framework | `Astro` |
| Commande de build | `pnpm install --frozen-lockfile && pnpm run verify` |
| Répertoire de sortie | `dist` |
| Node.js | `22.23.4`, conforme à `.node-version` |
| pnpm | `10.34.5`, conforme à `packageManager` |

### Étape 4 : vérifier le build automatique

Vérifiez Node et pnpm dans le cloud, cliquez sur **Enregistrer et déployer**, puis examinez les journaux Deployments. Installation, vérification complète et transfert doivent réussir. Les pushes suivants dépendent de la branche de production et des réglages d’automatisation. Une CI GitHub réussie ne déploie pas Pages à elle seule.

:::caution
La page Settings d'un projet intégré à Git comporte une section supplémentaire de configuration de build (preset de framework, commande de build, etc.), différente de l'interface d'un [projet à transfert direct](#comprendre-la-configuration-de-build-dun-projet-à-transfert-direct) — si vous ne trouvez pas la configuration de build dans Settings, c'est que le projet courant est un projet à transfert direct ; c'est un comportement normal.
:::

---

## Lier un domaine personnalisé

Cloudflare fournit `<project-name>.pages.dev` et permet un domaine personnalisé. Les domaines ci-dessous sont des exemples ; les délais DNS et certificat dépendent de l’état réel.

### Étape 1 : ouvrir les paramètres de domaine personnalisé

Sur la page de détails du projet, ouvrez l'onglet **Custom domains**, puis cliquez sur **Set up a custom domain** :

![Page des domaines personnalisés du projet epocanvas-docs, docs.epocanvas.com lié et SSL actif](/images/canvas/deploy/cf-04-domains.png)

*Figure : onglet Custom domains. ① Entrée de l'onglet ; ② bouton Set up a custom domain ; ③ le domaine `docs.epocanvas.com` déjà lié, au statut Active avec SSL enabled.*

### Étape 2 : ajouter le domaine et attendre la prise en compte

1. Cliquez sur **Set up a custom domain** et saisissez votre sous-domaine (par exemple `docs.epocanvas.com`) ;
2. Si le DNS du domaine est déjà hébergé chez Cloudflare, l'enregistrement CNAME est ajouté automatiquement ; pour un domaine hébergé ailleurs, ajoutez manuellement un enregistrement CNAME pointant vers `<nom-du-projet>.pages.dev` ;
3. Attendez la validation DNS et le certificat, puis testez le domaine une fois **Active**. Un délai fixe de quelques minutes ne garantit pas la fin de l’opération.

Le certificat HTTPS est émis et renouvelé automatiquement par Cloudflare, sans demande ni configuration manuelle.

---

## Vérifier le résultat du déploiement

### Vérification du statut HTTP en ligne de commande

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Exemple de réponse (la date et le statut dépendent de la requête réelle) :

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` indique seulement que cette URL a répondu correctement, pas que les traductions, ressources, recherches ou contenus récents sont valides. Poursuivez les contrôles sur les deux domaines.

### Vérification point par point dans le navigateur

| Point à vérifier | Résultat attendu |
| :--- | :--- |
| La page d'accueil et n'importe quelle page de documentation s'ouvrent | Rendu complet de la page, aucun écran blanc |
| Les dernières modifications sont effectives | Le contenu de la section venant d'être éditée est visible en ligne |
| Recherche sur l'ensemble du site via `Ctrl+K` | Les articles les plus récents sont trouvés (l'index est généré lors du build) |
| Bascule du thème clair/sombre | La bascule fonctionne et persiste après actualisation |

---

## Problèmes de déploiement fréquents

### Le contenu en ligne n'est pas à jour après le déploiement ?

Forcez le rechargement du navigateur (`Ctrl+F5` / `Cmd+Shift+R`) pour écarter le cache ; si le contenu reste inchangé, vérifiez sur la page Deployments de la console l'heure du dernier enregistrement, puis comparez avec le domaine d'aperçu du déploiement à l'aide de `curl -sI`.

### Le domaine personnalisé affiche un échec de handshake SSL (Error 525) ?

Vérifiez la validation et le certificat dans Custom domains, puis DNS, proxy et détails de l’erreur. Ne vous contentez pas d’attendre quelques minutes ; comparez avec `pages.dev`.

### `pnpm run deploy` échoue avec `Project not found` ?

Exécutez d'abord `pnpm exec wrangler whoami` pour confirmer que vous êtes connecté ; vérifiez ensuite que le `--project-name` dans `scripts/verify-release.mjs` correspond bien au nom du projet dans la console.

Pour les autres points de diagnostic, voir [FAQ et résolution des problèmes](/canvas/troubleshooting/).
