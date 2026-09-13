---
title: Guide de rédaction et de mise en forme Markdown
description: "Conventions de stockage des fichiers de documentation d'EpoCanvas Docs, exigences de métadonnées Frontmatter et liste complète de tous les formats pris en charge : écriture et rendu réel du Markdown de base et des syntaxes étendues, mis en regard."
---

Ajouter ou modifier des documents dans **EpoCanvas Docs** est très simple. Tout le contenu du corps du texte est rédigé en syntaxe **Markdown** standard : dès lors que vous savez écrire du Markdown, vous pouvez immédiatement participer à la rédaction et à la maintenance de la documentation.

Cette page est la liste complète des formats pris en charge sur l'ensemble du site : la section 3 énumère un par un les formats Markdown de base, la section 4 liste les syntaxes étendues que ce site prend en charge en plus. Chaque entrée présente en regard « comment l'écrire » et « à quoi ressemble le rendu » ; l'effet que vous voyez actuellement est le résultat réel du rendu.

---

## 1. Où placer les fichiers de documentation ?

Tous les fichiers de documentation sont stockés dans le répertoire `src/content/docs/` du projet :

```text
src/content/docs/
├── index.mdx          # Page d'accueil du site
├── canvas/            # Chapitres de documentation principaux (chinois simplifié, langue par défaut)
│   ├── index.md       # Présentation du produit
│   ├── deployment.md  # Démarrage rapide
│   ├── layout.md      # Disposition des pages
│   ├── ...            # Autres documents
└── en/ ja/ ...        # Traductions dans les 9 autres langues, structure de répertoires strictement identique au chinois
```

- **Exigences sur les noms de fichiers** : utilisez des lettres minuscules et des tirets (par exemple `quickstart-guide.md`), sans caractères chinois ni espaces. Le nom de fichier détermine l'URL d'accès : `canvas/deployment.md` correspond à `/canvas/deployment/`.
- **Extension** : en général, un fichier `.md` en texte brut suffit ; si vous devez intégrer des composants interactifs dans l'article (comme la grille de cartes de la page d'accueil), utilisez le format `.mdx`.
- **Enregistrement dans la barre latérale** : après création d'un fichier, il faut l'enregistrer dans le tableau `sidebar` de `astro.config.mjs`, sinon il n'apparaîtra pas dans le catalogue à gauche.
- **Traductions multilingues** : les traductions dans les autres langues sont placées dans le répertoire `src/content/docs/<langue>/`, avec une structure de sous-répertoires identique à la version chinoise (par exemple `en/canvas/deployment.md` correspond à la version anglaise du démarrage rapide) ; les pages dont la traduction n'existe pas encore affichent automatiquement le contenu chinois en repli.

---

## 2. Comment écrire les métadonnées d'en-tête (Frontmatter) ?

En haut de chaque document Markdown doit obligatoirement figurer un bloc de métadonnées YAML délimité par trois tirets `---` :

```yaml
---
title: Démarrage rapide (en 3 minutes)
description: Guide de préparation de l'environnement local d'EpoCanvas Docs, d'installation des dépendances et de démarrage du service.
---
```

### Description des champs

| Nom du champ | Obligatoire ? | Rôle |
| :--- | :--- | :--- |
| `title` | **Obligatoire** | Titre principal de l'article. Rendu comme grand titre en haut de la page et utilisé comme titre de l'onglet du navigateur. |
| `description` | Recommandé | Résumé court de l'article. Utilisé dans les résultats de recherche du navigateur et comme texte descriptif des cartes de partage sur les réseaux sociaux. |
| `template` | Page d'accueil uniquement | Avec la valeur `splash`, utilise le modèle de page d'accueil sans barre latérale. |

:::tip
Si vous oubliez le `title` en rédigeant un document, Astro signale clairement l'erreur dans le terminal au moment du build en indiquant le nom du fichier ; ajoutez-le simplement comme indiqué.
:::

---

## 3. Panorama des formats Markdown de base

Ce site rend le Markdown standard avec les extensions GFM ; tous les formats ci-dessous sont pris en charge. Commencez par le panorama, puis examinez entrée par entrée la mise en regard de l'écriture et du rendu :

| Format | Écriture rapide | Usage |
| :--- | :--- | :--- |
| Titres | `## Titre de section` | Structurer le document, repris automatiquement dans la table des matières de la page à droite |
| Paragraphes et retours à la ligne | Ligne vide pour séparer les paragraphes | Unité de base du corps du texte |
| Gras / italique / barré | `**gras**` `*italique*` `~~barré~~` | Mettre en évidence du texte important |
| Code en ligne | `` `commande` `` | Marquer commandes, noms de fichiers, raccourcis clavier |
| Touches de clavier | `<kbd>Ctrl</kbd>` | Représentation des touches sous forme de touche de clavier |
| Listes à puces / numérotées | `- élément` / `1. élément` | Énumérer des éléments parallèles ou des étapes |
| Listes de tâches | `- [x] Terminé` | Liste de vérification avec cases à cocher |
| Blocs de citation | `> texte cité` | Citer un texte original, ajouter une note de côté |
| Blocs de code | Entourés de trois accents graves | Code multi-lignes, avec coloration et bouton de copie |
| Tableaux | Colonnes séparées par des barres verticales | Comparaison de paramètres, présentation de données |
| Liens | `[texte](adresse)` | Aller vers une autre page du site ou un site externe |
| Images | `![description](chemin)` | Insérer des captures d'écran, des schémas d'architecture |
| Lignes de séparation | `---` | Délimiter de grandes parties |

### 3.1 Niveaux de titres

**N'écrivez pas de titre de niveau 1 (`#`) dans le corps du texte** — le `title` du Frontmatter est déjà rendu automatiquement comme grand titre de la page ; ajouter un `#` dans le corps donnerait deux grands titres sur la page. Les sections commencent au niveau 2 (`##`) :

```markdown
## Grand titre de niveau 2 (chapitre)

### Sous-titre de niveau 3 (section)
```

**Rendu** : la page que vous lisez est un exemple tout prêt — « 3. Panorama des formats Markdown de base » est un titre de niveau 2 et la présente section « 3.1 Niveaux de titres » un titre de niveau 3 ; tous deux apparaissent déjà dans la « table des matières de la page » à droite. Les titres de niveau 4 (`####`) ne reçoivent qu'un style de corps de texte et ne sont plus repris dans la table des matières ; ils conviennent aux petites subdivisions que l'on ne veut pas y voir figurer.

### 3.2 Paragraphes et retours à la ligne

Markdown sépare les paragraphes par une ligne vide ; c'est l'endroit où les débutants trébuchent le plus souvent :

```markdown
Ceci est le premier paragraphe : entre les deux phrases, une seule touche Entrée a été pressée,
aussi les deux restent-elles dans le même paragraphe après rendu.

Cette ligne est séparée du texte précédent par une ligne vide ; après rendu, elle forme un nouveau paragraphe.

Cette ligne se termine par une barre oblique inversée\
la ligne qui suit commence donc réellement sur une nouvelle ligne.
```

**Rendu :**

Ceci est le premier paragraphe : entre les deux phrases, une seule touche Entrée a été pressée,
aussi les deux restent-elles dans le même paragraphe après rendu.

Cette ligne est séparée du texte précédent par une ligne vide ; après rendu, elle forme un nouveau paragraphe.

Cette ligne se termine par une barre oblique inversée\
la ligne qui suit commence donc réellement sur une nouvelle ligne.

Résumé des règles : **une seule touche Entrée = retour à la ligne dans le code source, sans séparation de paragraphe** ; pour commencer un nouveau paragraphe, insérez une ligne vide ; pour forcer un retour à la ligne à l'intérieur d'un paragraphe, utilisez une barre oblique inversée en fin de ligne ou deux espaces en fin de ligne.

### 3.3 Emphase du texte et styles en ligne

```markdown
Ceci est du **gras**, ceci est de l'*italique*, ceci du ***gras italique***, ceci du ~~texte barré~~.

Marquez commandes et noms de fichiers avec du code en ligne : exécutez `pnpm run dev` pour lancer le service de développement.

Les touches du clavier s'écrivent avec des balises HTML : <kbd>Ctrl</kbd> + <kbd>K</kbd> ouvre la recherche sur l'ensemble du site.
```

**Rendu :**

Ceci est du **gras**, ceci est de l'*italique*, ceci du ***gras italique***, ceci du ~~texte barré~~.

Marquez commandes et noms de fichiers avec du code en ligne : exécutez `pnpm run dev` pour lancer le service de développement.

Les touches du clavier s'écrivent avec des balises HTML : <kbd>Ctrl</kbd> + <kbd>K</kbd> ouvre la recherche sur l'ensemble du site.

### 3.4 Listes et listes de tâches

```markdown
Liste à puces, sous-éléments indentés de deux espaces :
- Fonctionnalité principale une
- Fonctionnalité principale deux
  - Sous-fonctionnalité de la deux
  - Autre sous-fonctionnalité de la deux

Liste numérotée :
1. Étape 1 : installer Node.js
2. Étape 2 : cloner le dépôt de code
3. Étape 3 : lancer le service de développement

Liste de tâches :
- [x] Coloration syntaxique prise en charge
- [x] Copie en un clic prise en charge
- [ ] Tâche à faire
```

**Rendu :**

Liste à puces, sous-éléments indentés de deux espaces :

- Fonctionnalité principale une
- Fonctionnalité principale deux
  - Sous-fonctionnalité de la deux
  - Autre sous-fonctionnalité de la deux

Liste numérotée :

1. Étape 1 : installer Node.js
2. Étape 2 : cloner le dépôt de code
3. Étape 3 : lancer le service de développement

Liste de tâches :

- [x] Coloration syntaxique prise en charge
- [x] Copie en un clic prise en charge
- [ ] Tâche à faire

### 3.5 Blocs de citation

```markdown
> Ceci est une citation. Elle convient pour des extraits de texte original, des explications de contexte ou des notes de côté.
> Plusieurs lignes consécutives s'écrivent dans le même bloc de citation.

> > Une citation peut elle-même en imbriquer une autre.

> Une citation peut aussi contenir une liste :
>
> - Premier point
> - Deuxième point
```

**Rendu :**

> Ceci est une citation. Elle convient pour des extraits de texte original, des explications de contexte ou des notes de côté.
> Plusieurs lignes consécutives s'écrivent dans le même bloc de citation.

> > Une citation peut elle-même en imbriquer une autre.

> Une citation peut aussi contenir une liste :
>
> - Premier point
> - Deuxième point

:::note
Le bloc de citation n'est qu'un style sobre et **ne remplace pas un encadré**. Pour une mise en garde colorée et visible, utilisez la syntaxe des encadrés de la section 4.1.
:::

### 3.6 Blocs de code

Entourez le code de trois accents graves et indiquez le langage juste après la première ligne d'accents graves pour obtenir la coloration syntaxique ; chaque bloc de code comporte un bouton de copie en un clic à sa droite :

````markdown
```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```
````

**Rendu :**

```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

L'identifiant de langage détermine le schéma de coloration ; les identifiants courants comme `js`, `ts`, `bash`, `json`, `yaml`, `html`, `css`, `python` sont tous pris en charge. Les langages de terminal comme `bash` sont rendus avec une bordure sombre de style terminal :

```bash
pnpm run build
```

Les usages avancés des blocs de code — titre de nom de fichier, surlignage de lignes précises — sont présentés à la section 4.2.

### 3.7 Tableaux

Dans la rangée de tirets sous l'en-tête, les deux-points contrôlent l'alignement (deux-points à gauche : aligné à gauche ; des deux côtés : centré ; à droite : aligné à droite) :

```markdown
| Commande | Paramètre | Description |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Exemple aligné à gauche |
| `astro build` | aucun | Exemple centré |
| `astro preview` | `--port` | Exemple aligné à droite |
```

**Rendu :**

| Commande | Paramètre | Description |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Exemple aligné à gauche |
| `astro build` | aucun | Exemple centré |
| `astro preview` | `--port` | Exemple aligné à droite |

:::tip
Quand un tableau est trop large, aucun traitement manuel n'est nécessaire : le site ajoute automatiquement une barre de défilement horizontale aux tableaux, ce qui permet une lecture complète même sur mobile.
:::

### 3.8 Liens

```markdown
Lien interne : [Démarrage rapide](/canvas/deployment/)

Lien externe : [Site officiel d'Astro](https://astro.build)

Ancre dans la page : [Aller à la section « Tableaux »](#37-tableaux)

Lien automatique : <https://github.com/shijianus/epocanvas-docs>
```

**Rendu :**

Lien interne : [Démarrage rapide](/canvas/deployment/)

Lien externe : [Site officiel d'Astro](https://astro.build)

Ancre dans la page : [Aller à la section « Tableaux »](#37-tableaux)

Lien automatique : <https://github.com/shijianus/epocanvas-docs>

Conventions d'écriture :

- **Liens internes** : utilisez le chemin complet, commençant et finissant par `/` (par exemple `/canvas/deployment/`), pas de chemin relatif ;
- **Ancres** : l'ancre est l'ID obtenu à partir du texte du titre ; pour un titre chinois, l'ancre est le texte chinois lui-même (ponctuation retirée, espaces remplacés par des tirets) ; cliquez sur l'adresse dans la barre d'adresse du navigateur pour copier un lien avec l'ancre ;
- Le texte du lien doit indiquer clairement la destination ; n'écrivez pas « cliquez ici ».

### 3.9 Images et légendes

Placez uniformément les ressources images nécessaires à la documentation dans le répertoire `public/images/canvas/` et référencez-les avec un chemin absolu commençant par `/` :

```markdown
![Rendu réel de la page de démarrage rapide sur le serveur de développement local](/images/canvas/ui-quickstart.png)

*Figure : le texte en italique sur la ligne juste sous l'image est affiché comme légende.*
```

**Rendu :**

![Rendu réel de la page de démarrage rapide sur le serveur de développement local](/images/canvas/ui-quickstart.png)

*Figure : rendu réel de la page de démarrage rapide, ici à titre de démonstration.*

**Conventions pour les images** :

- **Schémas d'architecture et organigrammes** : enregistrez-les en vectoriel `.svg`, qui reste net même agrandi sur mobile et sur écrans haute définition. Les schémas d'architecture de ce site sont tous dans `public/images/canvas/docs-*.svg`.
- **Captures d'écran de l'interface** : enregistrez-les en `.png` compressé, d'une largeur d'environ 1440 pixels ; ne téléversez pas directement les originaux de plusieurs dizaines de Mo.
- **Texte descriptif obligatoire** : le texte entre `![ ]` est rendu comme texte alternatif de l'image ; décrivez soigneusement le contenu de l'image, ne le laissez pas vide.

Après insertion d'une image, **vérifiez impérativement le rendu réel dans le navigateur** et assurez-vous que le chemin est correct et que l'image s'affiche normalement avant de soumettre.

### 3.10 Lignes de séparation

Trois tirets ou plus, seuls sur une ligne, sont rendus comme une ligne de séparation, pour délimiter de grandes parties :

```markdown
Le contenu précédent est terminé.

---

Commence ici un nouveau sujet.
```

**Rendu :**

Le contenu précédent est terminé.

---

Commence ici un nouveau sujet.

:::caution
Une ligne vide est obligatoire au-dessus de la ligne de séparation. Un `---` collé juste sous une ligne de texte est interprété comme « une autre façon d'écrire un titre » et transforme la ligne précédente en grand titre.
:::

---

## 4. Formats étendus : syntaxes enrichies de ce site

Les formats suivants sont des syntaxes étendues que ce site prend en charge en plus du Markdown standard ; ils sont fournis par le moteur de rendu (encadrés Starlight et Expressive Code).

### 4.1 Les quatre encadrés colorés

Les encadrés utilisent la syntaxe à trois deux-points : ouverture par `:::type`, fermeture par `:::` seul sur une ligne ; il existe quatre types, aux couleurs et icônes distinctes :

:::note
**note (précisions)** : connaissances de contexte, détails de conception, prérequis.
:::

:::tip
**tip (astuce)** : raccourcis pratiques pour gagner en efficacité, bonnes pratiques.
:::

:::caution
**caution (attention)** : opérations où l'on se trompe facilement, problèmes de compatibilité potentiels.
:::

:::danger
**danger (danger)** : opérations irréversibles comme la perte de données ou l'écrasement d'un environnement de production.
:::

Des crochets après le type permettent de personnaliser le titre :

````markdown
:::tip[Installer plus vite]
L'installation des dépendances avec pnpm est bien plus rapide qu'avec npm :

```bash
npm install -g pnpm
```
:::
````

**Rendu :**

:::tip[Installer plus vite]
L'installation des dépendances avec pnpm est bien plus rapide qu'avec npm :

```bash
npm install -g pnpm
```
:::

À l'intérieur d'un encadré, on peut continuer à utiliser listes, blocs de code, tableaux et toute autre mise en forme ; pour davantage d'exemples, voir [Exemples d'encadrés, de blocs de code et de diagrammes](/canvas/syntax/).

### 4.2 Titre de nom de fichier et surlignage de lignes des blocs de code

Indiquez `title="chemin du fichier"` sur la première ligne du bloc de code pour afficher une barre de titre, et `{numéros de lignes}` pour surligner les lignes importantes, plusieurs numéros étant séparés par des virgules :

````markdown
```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs', // ← ligne surlignée
  version: '1.0.0',
  locale: 'zh-CN',        // ← ligne surlignée
};
```
````

**Rendu :**

```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.0.0',
  locale: 'zh-CN',
};
```

### 4.3 Différences incrémentales (diff)

Utilisez le langage `diff` pour présenter des modifications de configuration : les lignes commençant par `-` apparaissent comme supprimées, celles commençant par `+` comme ajoutées :

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Rendu :**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 4.4 Notes de bas de page

Pour indiquer la source d'une information ou ajouter une précision, utilisez la syntaxe des notes de bas de page GFM :

````markdown
L'index de recherche de l'ensemble du site est généré par Pagefind au moment du build[^pf].

[^pf]: [Documentation officielle de Pagefind](https://pagefind.app/) — bibliothèque de recherche locale pour sites statiques.
````

**Rendu :** un marqueur de renvoi en exposant numéroté apparaît dans le corps du texte[^md-page] ; un clic permet un déplacement fluide vers l'entrée de note correspondante en bas de page.

[^md-page]: Voici précisément la note rendue en bas de cette page — quel que soit l'endroit où elle est écrite dans le texte, le contenu des notes est regroupé au bas de la page.

### 4.5 Aide-mémoire des syntaxes non prises en charge et pièges fréquents

Les écritures suivantes sont courantes sur d'autres plateformes, mais sur ce site elles **ne fonctionnent pas** ou ne se comportent pas comme attendu ; évitez-les d'emblée lors de la rédaction :

| Écriture piégeuse | Comportement réel | Alternative correcte |
| :--- | :--- | :--- |
| Bloc <code>```mermaid</code> | Le code source s'affiche comme bloc de code ordinaire, sans graphique | Exportez un SVG depuis mermaid.live puis insérez-le comme image |
| Syntaxe d'avis GitHub `> [!NOTE]` | Rendue comme un bloc de citation ordinaire | Réécrire en `:::note` |
| `:::warning` / `:::important` | Rendus silencieusement en paragraphes ordinaires, sans style d'encadré | Réécrire en `:::caution` |
| Titre de niveau 1 `#` dans le corps du texte | Deux grands titres sur la page | Supprimez le `#` et commencez le corps au niveau `##` |
| Retour à la ligne avec une seule touche Entrée | Les deux lignes sont fusionnées en une seule | Séparez les paragraphes par une ligne vide, ou ajoutez une barre oblique inversée en fin de ligne |

---

## 5. Pour aller plus loin

- Pour connaître le pipeline de rendu complet du Markdown, du fichier à la page, et l'ensemble des conventions, lisez **[Règles de rendu en détail](/canvas/rendering/)**.
- Pour voir les encadrés, blocs de code, notes de bas de page et autres syntaxes rassemblés dans une « page d'exemples vivante », lisez **[Exemples d'encadrés, de blocs de code et de diagrammes](/canvas/syntax/)**.
