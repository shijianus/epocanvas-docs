---
title: Règles de rendu en détail
description: "Règles de rendu complètes d'EpoCanvas Docs : pipeline depuis le fichier Markdown jusqu'à la page finale, et toutes les conventions relatives au Frontmatter, aux titres, aux encadrés, aux blocs de code, aux images et aux liens."
---

Cette page décrit intégralement les règles de rendu d'**EpoCanvas Docs** : quelles étapes de traitement traverse un fichier Markdown, quel rendu produit chaque syntaxe et quelles syntaxes ne sont pas prises en charge. Une lecture complète avant la rédaction permet d'éviter la grande majorité des problèmes de mise en forme.

---

## Pipeline de rendu : du fichier .md à la page en ligne

![Schéma du pipeline de rendu Markdown d'EpoCanvas Docs : les 5 étapes complètes, de l'analyse du code source Markdown, au parsing AST GFM, à la coloration syntaxique du code, à l'assemblage de la mise en page avec 7 composants personnalisés, jusqu'à la génération du HTML statique et de l'index Pagefind](/images/canvas/docs-render-pipeline.svg)

*Figure : les 5 étapes du pipeline de rendu Markdown. Les étapes s'exécutent dans l'ordre au build ; le produit du build est constitué de fichiers purement statiques, sans aucune surcharge de framework à l'exécution côté client.*

Entre l'enregistrement d'un fichier Markdown et sa lecture par un lecteur, cinq étapes se succèdent :

1. **Collecte du contenu** : au démarrage ou au build, Astro analyse le répertoire `src/content/docs/`, enregistre chaque fichier `.md` / `.mdx` comme entrée de contenu et valide le Frontmatter (l'absence de `title` provoque une erreur immédiate).
2. **Compilation Markdown** : le corps du texte est converti en HTML par le compilateur Markdown (avec les extensions GFM). Les syntaxes étendues telles que les tableaux, les listes de tâches et le texte barré prennent effet à cette étape.
3. **Coloration des blocs de code** : toutes les barrières de code sont traitées par Expressive Code, qui génère des blocs de code avec coloration syntaxique, barre de titre, numéros de ligne et bouton de copie.
4. **Application de la mise en page du site** : le HTML compilé est inséré dans le squelette de page de Starlight — la barre supérieure, la table des matières à gauche et le plan de la page à droite sont rendus par les composants personnalisés situés sous `src/components/starlight/`.
5. **Génération des index et des fichiers statiques** : lors de `pnpm run build`, Pagefind parcourt toutes les pages produites pour extraire l'index plein texte ; le HTML pur du répertoire `dist/` peut ensuite être hébergé directement sur n'importe quel serveur statique.

:::note
Le processus ci-dessus est réalisé en une seule fois au build. Une fois le site en ligne, aucun serveur n'intervient : toutes les interactions (recherche, changement de thème, changement de langue) se déroulent dans le navigateur.
:::

---

## Règles du Frontmatter

- `title` est **obligatoire** ; s'il manque, le build échoue avec l'erreur `InvalidInputError` ;
- `description` est recommandé : il s'affiche dans les résultats des moteurs de recherche et sur les cartes de partage ;
- Le Frontmatter doit être un bloc YAML valide placé tout au début du fichier ; les trois tirets sont indispensables.

---

## Règles des titres

| Règle | Explication |
| :--- | :--- |
| Ne pas écrire de titre de niveau 1 `#` dans le corps du texte | Le champ `title` du Frontmatter est déjà rendu comme grand titre de la page ; écrire un `#` dans le corps produirait deux grands titres |
| Les titres de niveau 2 `##` ouvrent le corps du texte | Les `##` et `###` alimentent automatiquement le plan « Sur cette page » à droite |
| `####` et au-delà n'entrent pas dans le plan | Les niveaux plus profonds ne sont rendus que comme style de corps du texte |
| Le texte d'un titre génère une ancre | Pour un titre en chinois, l'ancre correspond au texte chinois lui-même, par exemple `#标题规则` |

---

## Règles des encadrés (Asides)

Les encadrés utilisent la syntaxe à trois deux-points de Starlight, avec 4 types disponibles :

```markdown
:::note
提示 de complément d'information.
:::

:::tip
Astuce pour gagner en efficacité.
:::

:::caution
Risque à surveiller ou opération sujette aux erreurs.
:::

:::danger
Avertissement critique impliquant une perte de données ou une opération irréversible.
:::
```

Il est également possible d'ajouter un titre personnalisé après le type : `:::tip[安装提速]`。

:::caution
Deux erreurs fréquentes à éviter :

- La syntaxe de bloc de citation GitHub `> [!TIP]` n'est **pas prise en charge** : écrite telle quelle, `[!TIP]` s'affiche en texte ordinaire dans le bloc de citation ;
- `:::important` et `:::warning` ne sont **pas des types valides** : cela ne provoque pas d'erreur, mais le rendu est silencieusement converti en paragraphe ordinaire.

Pour migrer d'anciens documents : `> [!NOTE]` → `:::note`, `> [!WARNING]` → `:::caution`, `> [!CAUTION]` → `:::danger`.
:::

![Rendu réel des quatre encadrés colorés](/images/canvas/ui-markup-examples.png)

*Figure : affichage réel des quatre encadrés écrits avec la syntaxe ci-dessus, extrait de la page [Exemples d'encadrés, blocs de code et diagrammes](/canvas/syntax/).*

---

## Règles des blocs de code

Les barrières de code (trois accents graves) sont rendues par Expressive Code, avec les annotations suivantes (à écrire après les accents graves de la première ligne) :

| Annotation | Effet | Exemple |
| :--- | :--- | :--- |
| Identifiant de langue | Détermine le schéma de coloration syntaxique | <code>```ts</code> |
| `title="..."` | Affiche une barre de titre avec le nom du fichier | <code>```ts title="src/config/site.ts"</code> |
| `{2}` / `{2-4}` | Met en surbrillance les lignes indiquées | <code>```ts {2}</code> |
| `lang="diff"` ou `diff` | Présente les ajouts et suppressions en contraste rouge/vert | <code>```diff</code> |
| Langages de terminal comme `bash` / `sh` | Rendu avec un cadre de style terminal | <code>```bash</code> |

Tous les blocs de code sont accompagnés d'un bouton de copie en un clic ; le texte du code est également indexé par Pagefind dans l'index de recherche, ce qui permet de retrouver directement des mots-clés présents dans le code.

---

## Règles des images

- Les images sont regroupées dans `public/images/canvas/` et référencées par un chemin absolu : `![说明](/images/canvas/xxx.png)` ;
- Les schémas d'architecture et de flux utilisent le format vectoriel `.svg`, les captures d'écran d'interface un `.png` compressé ;
- Le texte alternatif est obligatoire : c'est le texte de substitution en cas d'échec de chargement de l'image, et la base de l'accessibilité ;
- **La version actuelle n'intègre pas le rendu des diagrammes Mermaid** : une barrière ` ```mermaid ` s'affiche uniquement comme un bloc de code ordinaire montrant le code source. Pour obtenir un diagramme de flux, exportez d'abord le SVG depuis un outil comme mermaid.live, puis insérez-le comme image.

---

## Règles des liens

- **Liens internes au site** : utilisez le chemin complet, commençant et finissant par `/`, par exemple `/canvas/deployment/`. Lorsqu'un chemin de document change, l'ancien chemin doit être enregistré dans la table `redirects` de `astro.config.mjs` ;
- **Liens d'ancrage** : `/canvas/rendering/#代码块规则` permet d'accéder directement à une section de cette page ;
- **Liens externes** : il suffit d'écrire l'URL complète ; dans le corps du texte, elle est présentée à la couleur du thème.

---

## Autres comportements de rendu

| Syntaxe | Résultat du rendu |
| :--- | :--- |
| `**gras**`, `*italique*`, `~~barré~~` | Styles de texte correspondants |
| `code en ligne` | Pilule en police à largeur fixe à la couleur du thème |
| Écriture <kbd>Ctrl</kbd>+<kbd>K</kbd> | Touche représentée avec un style de chapeau de touche (keycap) |
| Tableaux GFM | Tableaux de données avec bordures et surbrillance au survol |
| Listes de tâches `- [x]` | Cases à cocher visuelles (à l'état désactivé) |
| Notes de bas de page `[^nom]` | Exposant numéroté dans le corps du texte + liste de notes en bas de page, avec navigation cliquable dans les deux sens |
| Bloc de citation Markdown `>` | Ligne verticale à la couleur du thème à gauche + fond clair |
| Séparateur `---` | Fine ligne de séparation traversant la zone du corps du texte |

:::tip
En cas de doute sur le rendu d'une syntaxe, la méthode la plus fiable consiste à : lancer `pnpm run dev`, écrire un petit extrait dans un document de test, puis le vérifier de ses propres yeux dans le navigateur avant de l'utiliser officiellement.
:::
