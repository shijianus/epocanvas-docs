---
title: Gestion des versions et workflows automatisés
description: Convention de nommage des numéros de version d'EpoCanvas Docs, étapes standard de publication d'une nouvelle version et pipeline de publication automatisée via GitHub Actions.
---

Pour que les lecteurs sachent clairement « à quelle version du produit correspond la documentation courante » et que l'équipe puisse suivre l'historique des modifications de manière ordonnée, **EpoCanvas Docs** adopte une numérotation sémantique des versions et un processus de publication fixe.

---

## 1. Règles de numérotation sémantique (SemVer)

Les numéros de version suivent le format `v majeure.mineure.corrective` (actuellement `v1.2.0`) :

| Type de changement | Exemple | Situation déclenchante |
| :--- | :--- | :--- |
| **Numéro majeur (Major)** | `v2.0.0` | Refonte majeure du système de documentation (par exemple montée de la version majeure d'Astro, remplacement complet de la mise en page). |
| **Numéro mineur (Minor)** | `v1.2.0` | Fonctionnalités importantes comme l'ajout de chapitres de documentation, l'ajout d'une langue, la montée du design system. |
| **Numéro de révision (Patch)** | `v1.2.1` | Petites corrections comme la rectification de fautes de frappe, la mise à jour d'exemples de code ou l'ajustement de détails de style. |

---

## 2. Le processus standard de publication d'une nouvelle version en 3 étapes

### Première étape : rédiger les notes de mise à jour (`RELEASE_NOTES.md`)

Décrivez clairement le contenu de la mise à jour dans le fichier `RELEASE_NOTES.md` à la racine du projet ; ce fichier sert de texte descriptif de la GitHub Release :

```markdown
## [v1.2.1] - 2026-09-18

### Corrections
- Correction d'une coquille dans une commande du chapitre de déploiement.
- Mise à jour des captures d'écran de l'interface vers la dernière version.
```

### Deuxième étape : mettre à jour le numéro de version de package.json

Le badge de version de la barre de navigation est déjà lié automatiquement au champ `version` de `package.json`, qui constitue la source unique de vérité (Single Source of Truth) pour la version de tout le site. Mettez à jour le numéro de version dans `package.json` (ou exécutez `pnpm version patch`) : le badge de la barre supérieure se synchronise automatiquement avec le dernier numéro, sans modification manuelle en plusieurs endroits :

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

Le projet est livré avec un workflow de publication automatique dans `.github/workflows/release.yml`, dont voici le contenu réel :

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # déclenchement automatique lors du push d'un tag commençant par v

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

Une fois le tag `v1.2.1` poussé, GitHub lance automatiquement le pipeline :

1. Extraction du code du dépôt ;
2. Création de la version officielle sur la page **Releases** du dépôt, avec `RELEASE_NOTES.md` comme description et marquage comme latest ;
3. Les lecteurs peuvent consulter les archives de toutes les versions historiques en cliquant sur le badge de version de la barre supérieure.

:::note
Ce pipeline se charge uniquement de créer la GitHub Release et **n'effectue pas le déploiement du site**. La mise à jour en ligne est assurée par le build Git automatique de Cloudflare Pages (ou par `pnpm run deploy` en local) ; les deux mécanismes sont indépendants l'un de l'autre, voir [Déploiement sur Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Workflow de collaboration sur le contenu

Lorsque plusieurs personnes maintiennent la documentation, la collaboration suit le processus fixe « branche → revue → fusion → publication », afin de garantir que le contenu en ligne reste toujours buildable :

```text
Branche main (toujours publiable, correspond au site en ligne)
  │
  ├─ 1. Créer une branche de fonctionnalité depuis main   git checkout -b docs/new-guide
  ├─ 2. Rédiger / modifier le Markdown
  ├─ 3. Vérification locale                               pnpm exec astro check && pnpm run build
  ├─ 4. Pousser la branche et ouvrir une Pull Request     déclenche le build CI
  ├─ 5. Fusionner dans main après validation de la revue  déclenche le déploiement automatique en ligne
  └─ 6. Poser un tag v* au moment de publier              déclenche le pipeline GitHub Release
```

### Points d'attention pour la revue des Pull Request

La CI (`build.yml`) garantit seulement que « le build passe » ; les points suivants demandent une revue humaine :

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

Le dépôt est configuré avec `.github/workflows/build.yml`, qui exécute automatiquement l'installation des dépendances et un build complet à chaque push sur la branche `main` et sur chaque Pull Request, afin de détecter en amont les problèmes de build comme les liens cassés ou les erreurs de Frontmatter. Exécuter les mêmes vérifications en local avant de committer permet d'éviter un échec de CI après le push :

```bash
pnpm exec astro check && pnpm run build
```
