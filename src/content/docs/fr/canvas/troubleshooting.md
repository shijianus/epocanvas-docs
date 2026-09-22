---
title: FAQ et résolution des problèmes
description: "Liste de diagnostic pour EpoCanvas Docs : erreurs d'exécution locale, documents invisibles, anomalies de rendu des encadrés, recherche défaillante et déploiement Cloudflare Pages."
---

En cas d'anomalie lors de l'utilisation, de la rédaction ou du déploiement d'**EpoCanvas Docs**, commencez par chercher ici la situation correspondante. Les problèmes sont classés selon l'ordre « démarrage local → rédaction de la documentation → recherche → déploiement » ; chacun est accompagné de sa cause et d'une solution vérifiée.

---

## 1. Problèmes de démarrage local et d'installation

### Q1 : `pnpm run dev` indique que le port 4321 est déjà occupé

- **Cause** : un serveur de développement démarré précédemment ne s'est pas complètement arrêté, ou un autre programme occupe le port 4321.
- **Solution** : démarrez sur un autre port :

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2 : erreur de compilation du module Sharp lors de l'installation des dépendances

- **Cause** : Sharp est le module C++ sous-jacent qui compresse les images au moment du build ; après un changement de version de Node.js, l'ancien cache peut ne plus correspondre.
- **Solution** : nettoyez les dépendances puis réinstallez :

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### Q3 : `pnpm install` échoue avec `packages field missing or empty`

- **Cause** : le contenu de `pnpm-workspace.yaml` est vide ou incomplet ; pnpm l'interprète comme un fichier de configuration de workspace et signale l'erreur.
- **Solution** : assurez-vous que le fichier contient le champ `packages` :

  ```yaml
  packages:
    - .
  ```

---

## 2. Problèmes de rédaction et de rendu des documents

### Q4 : un nouveau fichier Markdown a été créé, mais il n'apparaît pas dans la barre latérale à gauche

- **Cause** : le sommaire de la barre latérale est déclaré manuellement ; tout nouveau fichier doit être enregistré dans la configuration.
- **Solution** : ouvrez `astro.config.mjs` et ajoutez une entrée dans le groupe approprié du tableau `sidebar` :

  ```javascript
  { label: 'Description de la nouvelle fonctionnalité', link: '/canvas/new-feature/' }
  ```

### Q5 : le terminal signale l'erreur `"title" is required`

- **Cause** : le `title` manque en tête du fichier Markdown, ou les trois tirets `---` d'ouverture ne respectent pas le format.
- **Solution** : vérifiez le Frontmatter tout en haut du fichier :

  ```yaml
  ---
  title: Titre de l’article
  description: Description de l’article
  ---
  ```

### Q6 : deux grands titres identiques apparaissent sur la page

- **Cause** : un titre de niveau 1 `#` a été écrit dans le corps du texte. Le `title` du Frontmatter est déjà rendu comme grand titre ; ajouter un `#` dans le corps crée forcément un doublon.
- **Solution** : supprimez le titre `#` du corps du texte ; les sections commencent à `##`. Règles complètes voir [règles de rendu en détail](/canvas/rendering/#règles-des-titres).

### Q7 : `> [!TIP]` a été écrit mais l'encadré ne change pas de couleur et le texte s'affiche tel quel

- **Cause** : la syntaxe de citation à la GitHub `> [!TIP]` n'est pas prise en charge ; le compilateur Markdown ne la reconnaît pas.
- **Solution** : utilisez la syntaxe à trois deux-points :

  ```markdown
  :::tip
  Voici la syntaxe correcte.
  :::
  ```

### Q8 : une image insérée s'affiche en image cassée

- **Cause** : le chemin de l'image est erroné, ou l'image n'a pas été placée dans le répertoire statique `public/`.
- **Solution** :
  1. Vérifiez que l'image est enregistrée dans `public/images/canvas/ui-docs-reading.png` ;
  2. Référencez-la avec un chemin absolu commençant par `/` : `![Description](/images/canvas/ui-docs-reading.png)`, sans chemin relatif du type `../public/...`.

---

## 3. Problèmes de recherche

### Q9 : en débogage local avec `pnpm dev`, la recherche globale ne trouve pas l'article venant d'être rédigé

- **Cause** : la recherche globale s'appuie sur l'index Pagefind, généré uniquement lors de `pnpm run build` ; en mode développement, la fenêtre `Ctrl+K` ne charge pas l'index (elle s'ouvre sans champ de recherche), donc la recherche globale y est indisponible. C'est le comportement prévu du framework, pas un défaut du site.
- **Solution** : après un build complet, vérifiez avec le serveur d'aperçu :

  ```bash
  pnpm run build
  pnpm run preview
  ```

  La recherche dans la page depuis la barre supérieure n'est pas concernée par cette limite ; en développement, utilisez-la directement pour localiser du contenu dans la page courante.

### Q10 : la fenêtre de recherche ne s'ouvre pas avec `Ctrl+K`

- **Cause** : certains outils de saisie, gestionnaires de presse-papiers ou logiciels de capture d'écran occupent le raccourci clavier `Ctrl+K` / `Cmd+K`.
- **Solution** : cliquez directement sur le petit badge `Ctrl K` à droite du champ de recherche ; cela ouvre également la fenêtre de recherche sur l'ensemble du site.

---

## 4. Problèmes de déploiement Cloudflare Pages

### Q11 : un domaine personnalisé fraîchement lié signale un échec de handshake SSL (Error 525)

- **Cause** : l'émission du certificat Universal SSL par Cloudflare pour un nouveau domaine demande 2 à 5 minutes pour prendre effet à l'échelle mondiale.
- **Solution** : attendez quelques minutes puis forcez le rechargement (`Ctrl+F5` / `Cmd+Shift+R`) ; pendant ce délai, le domaine par défaut `<nom-du-projet>.pages.dev` reste toujours accessible.

### Q12 : `pnpm run deploy` échoue avec `Project not found`

- **Cause** : le paramètre `--project-name` de la commande de déploiement ne correspond pas au nom du projet dans la console Cloudflare ; il est aussi possible que la machine locale ne soit pas connectée.
- **Solution** :
  1. Exécutez d'abord `npx wrangler whoami` pour confirmer que vous êtes connecté ;
  2. Vérifiez le nom du projet dans la console Cloudflare et, si nécessaire, corrigez le paramètre `--project-name` du script `deploy` dans `package.json`.

---

## 5. Autocontrôle local avant commit

Avant de pousser vers GitHub, exécutez la commande suivante pour un autocontrôle complet (vérification des types + build intégral) :

```bash
pnpm exec astro check && pnpm run build
```

Lorsque `astro check` affiche `0 errors` et que le build se termine par `Complete!`, la documentation ne contient pas d'erreur de syntaxe et le commit peut être envoyé sereinement. La CI du dépôt (`build.yml`) exécute le même build après chaque push ; passer ces vérifications en local au préalable évite un échec de CI.
