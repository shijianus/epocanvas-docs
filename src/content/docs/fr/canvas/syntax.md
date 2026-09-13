---
title: Exemples d'encadrés, blocs de code et diagrammes
description: Utilisation concrète et rendu réel des 4 encadrés colorés d'EpoCanvas Docs, des titres et de la surbrillance de lignes dans les blocs de code, des comparaisons diff et de l'insertion de diagrammes.
---

Rédiger une documentation technique de qualité exige non seulement un texte clair, mais aussi des mises en garde bien visibles, des exemples de code correctement formatés et des schémas compréhensibles au premier coup d'œil. Tous les exemples de cette page utilisent une syntaxe réellement active : le rendu que vous voyez est le résultat du rendu — cette page est elle-même un exemple vivant.

---

## 1. Les quatre encadrés colorés

Les encadrés utilisent la syntaxe à trois deux-points : ouverture par `:::type`, fermeture par `:::`, avec le contenu entre les deux. Le site repose sur Starlight et prend en charge les quatre types **note, tip, caution, danger**.

### Syntaxe et rendu réel côte à côte

:::note
**note (complément d'information)** : pour présenter des connaissances de contexte, détailler des choix de conception ou signaler des prérequis.
:::

:::tip
**tip (astuce pratique)** : pour partager des petites astuces ou de bonnes pratiques qui font gagner du temps.
:::

:::caution
**caution (avertissement)** : signale un éventuel conflit de compatibilité, une erreur potentielle ou une opération demandant une attention particulière.
:::

:::danger
**danger (avertissement critique)** : alerte de niveau maximal concernant une perte de données, un écrasement de l'environnement de production ou une opération irréversible.
:::

### Un encadré peut contenir n'importe quel contenu

À l'intérieur d'un encadré, on peut continuer à utiliser des listes, des blocs de code, des tableaux, etc. :

:::tip[Installation accélérée]
L'installation des dépendances avec pnpm est bien plus rapide qu'avec npm :

```bash
npm install -g pnpm
```
:::

:::caution
Deux écritures invalides fréquentes, à éviter :

- La syntaxe de bloc de citation GitHub `> [!NOTE]` n'est pas prise en charge et s'affiche telle quelle comme un bloc de citation ordinaire ;
- `:::important` et `:::warning` ne sont **pas des types pris en charge sur ce site** : ils ne provoquent pas d'erreur, mais sont silencieusement rendus comme des paragraphes ordinaires, sans aucun style d'encadré.

Lors d'une migration depuis des documents GitHub, réécrivez `> [!NOTE]` en `:::note`, `> [!WARNING]` en `:::caution` et `> [!CAUTION]` en `:::danger`.
:::

---

## 2. Mise en forme avancée des blocs de code

### 2.1 Titre de fichier et surbrillance de lignes

Indiquez `title="chemin du fichier"` sur la première ligne de la barrière de code, et mettez les lignes importantes en surbrillance avec `{numéro de ligne}` :

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // cette ligne est mise en évidence par un fond de surbrillance
  version: '1.2.0',
};
```
````

**Rendu obtenu :**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 Comparaison de modifications de code (diff)

Pour présenter une montée de version de configuration ou une refactorisation, le langage `diff` rend les changements évidents : les lignes commençant par `-` s'affichent comme supprimées, celles commençant par `+` comme ajoutées :

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Rendu obtenu :**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 2.3 Commandes de terminal

Les langages de terminal comme `bash`, `sh` et `powershell` sont rendus avec un cadre sombre de style terminal :

```bash
pnpm run build
```

---

## 3. Comment insérer un diagramme ?

La version actuelle n'intègre **pas le rendu des diagrammes textuels tels que Mermaid**. Écrire directement une barrière ` ```mermaid ` ne fait qu'afficher le code source comme un bloc de code ordinaire, sans générer de graphique.

La méthode recommandée consiste à rédiger et exporter un **diagramme vectoriel SVG** dans un outil comme [mermaid.live](https://mermaid.live), à l'enregistrer dans `public/images/canvas/`, puis à l'insérer avec la syntaxe des images. C'est ainsi qu'ont été réalisés le schéma d'architecture et le diagramme de changement de langue de ce site :

![Schéma de l'architecture du système](/images/canvas/docs-architecture.svg)

*Figure : schéma d'architecture inséré sous forme d'image SVG, net quel que soit le niveau de zoom.*

Si vous avez réellement besoin de rendre directement du code Mermaid en graphique, vous devez intégrer au projet un plugin de rendu supplémentaire (comme `rehype-mermaid`) ; cela relève de la personnalisation du projet, à n'envisager qu'après avoir évalué le coût de maintenance.

---

## 4. Autres mises en forme utiles

- Code en ligne : `pnpm run dev`, rendu en police à largeur fixe à la couleur du thème ;
- Touches clavier : <kbd>Ctrl</kbd> + <kbd>K</kbd>, rendues avec un style de chapeau de touche (keycap) ;
- Liste de tâches :

```markdown
- [x] Prise en charge de la coloration syntaxique
- [x] Prise en charge de la copie en un clic
- [ ] Rendu Mermaid intégré (prévu)
```

Rendu sous forme d'éléments de liste avec état de coche.

### 4.1 Notes de bas de page

Pour indiquer les sources d'information ou ajouter un complément, utilisez la syntaxe des notes de bas de page GFM :

````markdown
L'index statique est généré par Pagefind au build[^pagefind].

[^pagefind]: [Documentation officielle de Pagefind](https://pagefind.app/) — bibliothèque de recherche locale pour sites statiques.
````

**Rendu obtenu :** un exposant numéroté cliquable apparaît à la fin du texte[^pagefind-demo] ; un clic y conduit en douceur vers la liste des notes en bas de page.

[^pagefind-demo]: Voici la note de bas de page réellement rendue au bas de cette page.

En combinant habilement encadrés, annotations de code et schémas, vous améliorez nettement le confort de lecture et le caractère professionnel de votre documentation technique. Pour l'ensemble des conventions de syntaxe, lisez **[Règles de rendu en détail](/canvas/rendering/)**.
