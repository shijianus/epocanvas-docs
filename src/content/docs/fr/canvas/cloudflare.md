---
title: Déploiement sur Cloudflare Pages
description: "Tutoriel illustré complet de la mise en production d'EpoCanvas Docs : transfert direct en ligne de commande avec Wrangler, build automatique via Git, liaison d'un nom de domaine personnalisé, chaque étape accompagnée de vraies captures d'écran de la console."
---

Une fois la documentation rédigée, il faut la publier sur Internet pour la rendre accessible à l'équipe et aux utilisateurs. **EpoCanvas Docs** recommande un hébergement sur **Cloudflare Pages** : pas de serveur à acheter, pas de Nginx à configurer, il suffit de transférer les fichiers statiques, et le certificat HTTPS est obtenu automatiquement. Ce site lui-même (`docs.epocanvas.com`) a été publié avec la méthode décrite ici ; toutes les captures d'écran de la console ci-dessous proviennent d'un déploiement réel.

---

## Préparation

### Ce dont vous avez besoin

| Élément | Détail |
| :--- | :--- |
| **Compte Cloudflare** | Inscription gratuite sur [dash.cloudflare.com](https://dash.cloudflare.com/) ; le service Pages ne nécessite aucun forfait payant |
| **Build complet possible en local** | Vérifiez d'abord que `pnpm run build` fonctionne et que le répertoire `dist/` est bien généré, voir [prise en main](/canvas/deployment/) |
| **Node.js + pnpm** | Les commandes de déploiement dépendent de l'environnement de développement local ; les versions requises sont celles du chapitre de prise en main |

### Comment choisir entre les deux méthodes de déploiement

![Schéma comparatif des deux voies de déploiement Cloudflare Pages : à gauche, transfert direct local en ligne de commande (méthode de ce site) ; à droite, build automatique depuis un dépôt Git (recommandé pour la collaboration en équipe)](/images/canvas/docs-deploy-compare.svg)

*Figure : comparaison des deux chemins de déploiement Cloudflare Pages. À gauche, build local puis transfert direct à l'edge avec Wrangler (méthode réellement utilisée par ce site) ; à droite, build automatique dans le cloud déclenché par un webhook GitHub.*

| Critère | Méthode 1 : transfert direct en ligne de commande | Méthode 2 : build automatique Git |
| :--- | :--- | :--- |
| Mode d'opération | Exécution locale de `pnpm run deploy` | Déclenchement automatique lors du push du code vers GitHub |
| Prise en main | Faible, deux commandes | Moyenne, une configuration unique à effectuer dans la console |
| Cas d'usage | Première mise en ligne, maintenance par une seule personne, mises à jour rapides | Collaboration à plusieurs, « commit = mise en ligne » |
| Utilisé par ce site | ✅ Oui (vérifiable dans la console) | Non activé, peut être ajouté à tout moment |

:::tip
Les deux méthodes peuvent coexister : au quotidien, build automatique via Git ; en cas de correction urgente, `pnpm run deploy` en local remplace directement la version en ligne.
:::

:::tip[Vraiment pas envie de taper des commandes ?]
La page [prise en main](/canvas/deployment/) propose des boutons de déploiement en un clic pour Cloudflare, Vercel et Netlify : un clic, l'autorisation du compte, la confirmation de la configuration, et le site de documentation est publié sur votre propre compte cloud, voir [déploiement en un clic](/canvas/deployment/#一键部署点一个按钮就上线). Le bouton Cloudflare passe par l'hébergement statique Workers, une voie indépendante de la méthode Pages présentée sur cette page ; pour un site de documentation statique, l'expérience d'accès est identique, choisissez simplement l'une des deux.
:::

---

## Méthode 1 : transfert direct en ligne de commande locale (recommandé pour une première mise en ligne)

Cette méthode consiste à construire sur la machine locale puis à téléverser directement vers Cloudflare ; c'est la méthode de déploiement **réellement utilisée par ce site**.

### Étape 1 : se connecter au compte Cloudflare

Le projet inclut déjà Wrangler (l'outil en ligne de commande officiel de Cloudflare) ; la première utilisation nécessite une authentification via le navigateur :

```bash
npx wrangler login
```

Après exécution, le terminal affiche `Opening a link in your default browser...` ; le navigateur ouvre la page d'autorisation Cloudflare, et une fois **Allow** cliqué, le terminal confirme la connexion réussie. Vérifiez l'état de connexion avec la commande suivante :

```bash
npx wrangler whoami
```

:::caution
Si vous lancez le déploiement sans être connecté, le terminal affiche `You are not authenticated. Please run 'wrangler login'.` et aucun déploiement n'a lieu.
:::

### Étape 2 : construire et téléverser en une commande

Le projet fournit dans `package.json` une commande de publication en un clic :

```bash
pnpm run deploy
```

Elle équivaut à exécuter deux étapes successives : d'abord `astro build` compile tout le site dans le répertoire `dist/` et génère l'index de recherche, puis `wrangler pages deploy dist` téléverse le résultat directement vers Cloudflare. Voici la sortie réelle de l'étape de build :

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

Une fois le téléversement terminé, Wrangler affiche l'URL d'aperçu du déploiement. Lors du premier déploiement, Wrangler demande interactivement le nom du projet ; validez simplement avec Entrée pour utiliser le nom `epocanvas-docs` préconfiguré dans `package.json`.

### Étape 3 : retrouver votre projet dans la console

Ouvrez [dash.cloudflare.com](https://dash.cloudflare.com/), cliquez sur **Compute (Workers & Pages)** dans le menu de gauche pour voir la liste des projets. L'image ci-dessous repère trois éléments clés :

![Liste des projets Workers & Pages de la console Cloudflare, avec repères sur l'entrée du menu de gauche, le bouton Create application et le projet epocanvas-docs](/images/canvas/deploy/cf-01-projects-list.png)

*Figure : liste des projets Workers & Pages. ① Menu de gauche pour accéder à Workers & Pages ; ② bouton Create application pour créer un nouveau projet ; ③ notre projet `epocanvas-docs`, affichant le domaine d'accès `epocanvas-docs.pages.dev` et l'heure du dernier déploiement.*

Cliquez sur le nom du projet pour accéder à ses détails ; l'onglet **Deployments** présente l'historique complet des déploiements :

![Page d'historique des déploiements du projet epocanvas-docs, avec repères sur le domaine de production, les enregistrements de déploiement et les statuts](/images/canvas/deploy/cf-02-deployments.png)

*Figure : page d'historique des déploiements. ① Nom du projet ; ② onglet Deployments ; ③ le domaine de production est lié à la fois à `docs.epocanvas.com` (domaine personnalisé) et à `epocanvas-docs.pages.dev` (domaine par défaut) ; ④ chaque enregistrement de déploiement indique la branche et les informations de commit ; ⑤ statut et heure de déploiement.*

:::note
Chaque exécution de `pnpm run deploy` ajoute un enregistrement en haut de la liste et devient automatiquement la version de production courante. L'historique est conservé dans la liste ; en cas de problème, un rollback est possible à tout moment.
:::

---

## Comprendre la configuration de build d'un projet à transfert direct

L'onglet **Settings** révèle la différence entre un projet à transfert direct et un projet Git :

![Page Settings de configuration de build du projet epocanvas-docs, la ligne Git repository indique non connecté](/images/canvas/deploy/cf-03-settings.png)

*Figure : onglet Settings. ① Entrée Settings ; ② la ligne Git repository affiche Connect (non connecté) — un projet à transfert direct n'a pas besoin de configuration de build Git, la construction se fait entièrement sur votre machine locale.*

:::tip
Cela illustre aussi l'avantage du transfert direct : l'environnement de build est votre propre ordinateur, sans être affecté par la file d'attente de builds de Cloudflare ; la contrepartie est que chaque mise à jour doit être exécutée en ligne de commande sur l'ordinateur qui déploie.
:::

---

## Méthode 2 : connecter un dépôt Git pour un build automatique (optionnel)

Si vous souhaitez que « chaque commit déclenche automatiquement la mise en ligne », connectez le projet à un dépôt GitHub ; Cloudflare construit alors automatiquement dans le cloud.

### Étape 1 : lancer le processus de création

Sur la page de liste des projets Workers & Pages, cliquez sur le bouton **Create application** en haut à droite (voir le repère ② de l'illustration de l'[étape 3 de la méthode 1](#第-3-步在控制台找到你的项目)), puis choisissez l'onglet **Pages**.

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
| Commande de build | `pnpm run build` |
| Répertoire de sortie du build | `dist` |

### Étape 4 : vérifier le build automatique

Cliquez sur **Enregistrer et déployer** ; Cloudflare effectue automatiquement le premier build. Ensuite, chaque push vers la branche `main` déclenche automatiquement la récupération, la construction et la mise en ligne. Les journaux de build de chaque déploiement sont consultables dans l'onglet **Deployments** du projet, en cliquant sur le déploiement correspondant.

:::caution
La page Settings d'un projet intégré à Git comporte une section supplémentaire de configuration de build (preset de framework, commande de build, etc.), différente de l'interface d'un [projet à transfert direct](#认识直传项目的构建配置) — si vous ne trouvez pas la configuration de build dans Settings, c'est que le projet courant est un projet à transfert direct ; c'est un comportement normal.
:::

---

## Lier un domaine personnalisé

Le domaine `xxx.pages.dev` attribué par défaut par Cloudflare est directement utilisable ; lier votre propre domaine (par exemple `docs.epocanvas.com`) ne prend que quelques minutes.

### Étape 1 : ouvrir les paramètres de domaine personnalisé

Sur la page de détails du projet, ouvrez l'onglet **Custom domains**, puis cliquez sur **Set up a custom domain** :

![Page des domaines personnalisés du projet epocanvas-docs, docs.epocanvas.com lié et SSL actif](/images/canvas/deploy/cf-04-domains.png)

*Figure : onglet Custom domains. ① Entrée de l'onglet ; ② bouton Set up a custom domain ; ③ le domaine `docs.epocanvas.com` déjà lié, au statut Active avec SSL enabled.*

### Étape 2 : ajouter le domaine et attendre la prise en compte

1. Cliquez sur **Set up a custom domain** et saisissez votre sous-domaine (par exemple `docs.epocanvas.com`) ;
2. Si le DNS du domaine est déjà hébergé chez Cloudflare, l'enregistrement CNAME est ajouté automatiquement ; pour un domaine hébergé ailleurs, ajoutez manuellement un enregistrement CNAME pointant vers `<nom-du-projet>.pages.dev` ;
3. Attendez l'émission du certificat (2 à 5 minutes en général) ; une fois le statut passé à **Active** (repère ③ de l'image ci-dessus), le site est accessible via le nouveau domaine.

Le certificat HTTPS est émis et renouvelé automatiquement par Cloudflare, sans demande ni configuration manuelle.

---

## Vérifier le résultat du déploiement

### Vérification du statut HTTP en ligne de commande

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Résultat réel obtenu :

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

Un `200` signifie que le site est en bonne santé. Après avoir lié votre domaine personnalisé, refaites le test en remplaçant l'URL par votre propre domaine.

### Vérification point par point dans le navigateur

| Point à vérifier | Résultat attendu |
| :--- | :--- |
| La page d'accueil et n'importe quelle page de documentation s'ouvrent | Rendu complet de la page, aucun écran blanc |
| Les dernières modifications sont effectives | Le contenu de la section venant d'être éditée est visible en ligne |
| Recherche site-wide via `Ctrl+K` | Les articles les plus récents sont trouvés (l'index est généré lors du build) |
| Bascule du thème clair/sombre | La bascule fonctionne et persiste après actualisation |

---

## Problèmes de déploiement fréquents

### Le contenu en ligne n'est pas à jour après le déploiement ?

Forcez le rechargement du navigateur (`Ctrl+F5` / `Cmd+Shift+R`) pour écarter le cache ; si le contenu reste inchangé, vérifiez sur la page Deployments de la console l'heure du dernier enregistrement, puis comparez avec le domaine d'aperçu du déploiement à l'aide de `curl -sI`.

### Le domaine personnalisé affiche un échec de handshake SSL (Error 525) ?

L'émission du certificat nécessite 2 à 5 minutes pour prendre effet à l'échelle mondiale ; attendez puis forcez le rechargement. Pendant ce délai, le domaine par défaut `xxx.pages.dev` reste accessible.

### `pnpm run deploy` échoue avec `Project not found` ?

Exécutez d'abord `npx wrangler whoami` pour confirmer que vous êtes connecté ; vérifiez ensuite que le `--project-name` du script `deploy` dans `package.json` correspond bien au nom du projet dans la console.

Pour les autres points de diagnostic, voir [FAQ et résolution des problèmes](/canvas/troubleshooting/).
