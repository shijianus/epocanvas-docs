---
title: Gestion des versions et workflows automatisés
description: Convention de nommage des numéros de version d'EpoCanvas Docs, étapes standard de publication d'une nouvelle version et pipeline de publication automatisée via GitHub Actions.
---

Pour que les lecteurs sachent clairement « à quelle version du produit correspond la documentation courante » et que l'équipe puisse suivre l'historique des modifications de manière ordonnée, **EpoCanvas Docs** adopte une numérotation sémantique des versions et un processus de publication fixe.

---

## 1. Règles de numérotation sémantique (SemVer)

Les versions stables suivent `vMAJOR.MINOR.PATCH` ; les préversions ajoutent un identifiant, comme la candidate actuelle `v1.3.2-beta.1`. Cela ne signifie ni publication d’une Release ni déploiement en production.

| Type de changement | Exemple | Situation déclenchante |
| :--- | :--- | :--- |
| **Numéro majeur (Major)** | `v2.0.0` | Refonte majeure du système de documentation (par exemple montée de la version majeure d'Astro, remplacement complet de la mise en page). |
| **Numéro mineur (Minor)** | `v1.2.0` | Fonctionnalités importantes comme l'ajout de chapitres de documentation, l'ajout d'une langue, la montée du design system. |
| **Numéro de révision (Patch)** | `v1.2.1` | Petites corrections comme la rectification de fautes de frappe, la mise à jour d'exemples de code ou l'ajustement de détails de style. |

---

## 2. Le processus standard de publication d'une nouvelle version en 3 étapes

### Première étape : rédiger les notes de mise à jour (`RELEASE_NOTES.md`)

Décrivez la mise à jour dans `RELEASE_NOTES.md`, à la racine du projet ; ce fichier devient le corps de la Release GitHub. Sa première ligne doit être exactement `# EpoCanvas Docs v<version>`, avec la même version que `package.json` ; `verify:config` contrôle ce format. L’exemple ci-dessous illustre seulement le format : utilisez une version encore inutilisée pour publier. Le texte d’une préversion doit aussi contenir `candidate` ou `prerelease`.

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### Corrections
- Correction d'une coquille dans une commande du chapitre de déploiement.
- Mise à jour des captures d'écran de l'interface vers la dernière version.
```

### Deuxième étape : mettre à jour le numéro de version de package.json

Le badge de version de la barre de navigation est déjà lié automatiquement au champ `version` de `package.json`, qui constitue la source unique de vérité (Single Source of Truth) pour la version de tout le site. Mettez à jour le numéro de version dans `package.json` (ou exécutez `pnpm version patch --no-git-tag-version`) : le badge de la barre supérieure se synchronise automatiquement avec le dernier numéro, sans modification manuelle en plusieurs endroits :

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### Troisième étape : committer le code et poser le tag Git

```bash
# 1. Committer toutes les modifications
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. Poser le tag de version correspondant et le pousser
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. Pipeline de publication automatisé GitHub Actions

Le workflow de référence est [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml) ; le YAML complet n’est pas recopié ici. Un push de tag `v*` le déclenche. Avant de créer le tag, exécutez cette vérification locale ; elle n’écrit aucune Release GitHub et ne déploie pas le site :

```bash
pnpm run verify
```

1. Le job `validate` utilise les permissions en lecture seule `contents: read` et exécute d’abord la vérification complète `pnpm run verify`.
2. Une fois la validation réussie, seul le job `publish` reçoit les permissions `contents: write` pour créer ou mettre à jour la Release GitHub à partir de `RELEASE_NOTES.md`.
3. Une Release existante est mise à jour sur place, sans suppression ni recréation. GitHub détermine `Latest` selon la version des releases stables ; les préversions ne sont pas marquées `Latest`. Le badge de version du header donne accès à l’historique.

:::note
Ce workflow crée ou met à jour les Releases GitHub sans déployer automatiquement le site. Une fusion dans `main` ne le déploie pas non plus. La publication passe par `pnpm run deploy` en local ou une intégration Git de l’hébergeur configurée séparément ; voir [Déploiement sur Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Workflow de collaboration sur le contenu

Lorsque plusieurs personnes maintiennent la documentation, la collaboration suit le processus fixe « branche → revue → fusion → publication », afin de garantir que le contenu en ligne reste toujours buildable :

```text
Branche main (source des versions ; le site change uniquement après déploiement)
  │
  ├─ 1. Créer une branche de fonctionnalité depuis main   git checkout -b docs/new-guide
  ├─ 2. Rédiger / modifier le Markdown
  ├─ 3. Vérification locale                               pnpm run verify
  ├─ 4. Pousser la branche et ouvrir une Pull Request     déclenche la validation CI complète
  ├─ 5. Fusionner dans main après validation de la revue  ne déploie pas automatiquement le site
  └─ 6. Poser un tag v* au moment de publier              déclenche le pipeline GitHub Release
```

### Points d'attention pour la revue des Pull Request

La CI (`build.yml`) exécute `pnpm run verify` : tests, contrôles de configuration et de types Astro, build et contrôles du contenu et des artefacts. Le rendu visuel reste à vérifier manuellement :

- **Validité des liens** : les nouveaux liens internes et ancres fonctionnent-ils ; les documents dont le chemin a changé ont-ils été enregistrés dans les redirections ;
- **Rendu** : la syntaxe `:::` des encadrés et les annotations des blocs de code s'affichent-elles correctement sur la page (la CI ne vérifie pas le visuel) ;
- **Cohérence texte/images** : les nouvelles captures d'écran ont-elles un texte descriptif et sont-elles nettes ;
- **Conventions de nommage** : noms de fichiers en minuscules avec traits d'union, `title` et `description` du Frontmatter complets.

### Répartition suggérée des rôles

| Rôle | Responsabilités |
| :--- | :--- |
| Auteur de la documentation | Rédiger le contenu, faire l'auto-vérification locale, ouvrir la PR |
| Reviseur | Vérifier le rendu et les liens, fusionner le code |
| Responsable de la publication | Poser les tags de version, tenir à jour `RELEASE_NOTES.md`, synchroniser le badge de version de la barre de navigation |

---

## 5. Vérifications de build en CI

`.github/workflows/build.yml` effectue la validation complète lors des push sur `main` et des Pull Requests. La CI utilise Node.js 22.23.4, fixé dans `.node-version`, et pnpm 10.34.5. Exécutez la même vérification localement avant de committer :

```bash
pnpm run verify
```
