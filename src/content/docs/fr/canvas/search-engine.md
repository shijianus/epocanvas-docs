---
title: Recherche plein texte et raccourcis clavier
description: "Mode d'emploi de la recherche bimodale d'EpoCanvas Docs : recherche dans la page depuis la barre supérieure et fenêtre de recherche site-wide via Ctrl+K, avec mécanisme d'index statique local."
---

**EpoCanvas Docs** propose une recherche dans la page et une recherche globale. À partir de `64rem` de largeur, le champ apparaît dans l’en-tête ; en dessous, seul le bouton de recherche globale reste visible. Cette recherche utilise l’index statique Pagefind, sans backend de recherche.

---

## Quelle recherche utiliser et quand ?

| Situation | Recherche à utiliser | Comment procéder |
| :--- | :--- | :--- |
| Le texte se trouve dans **l’article courant** | Recherche dans la page | Champ supérieur à partir de `64rem` ; sinon, Rechercher dans la page du navigateur |
| Vous ignorez **dans quel article** chercher | Recherche globale | Bouton de l’en-tête ou `Ctrl + K` (`Cmd + K` sur Mac) |

---

## Recherche dans la page : le champ de recherche de la barre supérieure

Ces instructions s’appliquent à une largeur d’au moins `64rem`. Saisissez les mots-clés dans le champ supérieur. En dessous, le champ, le compteur et les commandes sont masqués ; seule la loupe ouvrant la recherche globale reste visible. Pour l’article courant, utilisez la recherche intégrée au navigateur.

![Image annotée de la recherche dans la page depuis la barre supérieure : ① champ de saisie ② compteur de correspondances ③ navigation précédent/suivant ④ effacement ⑤ surlignage dans la page](/images/canvas/ui-inpage-search.png)

*Figure : capture existante fournie à titre de repère. Le compteur et les commandes précédent/suivant et effacer se trouvent maintenant sous le champ, pas à l’intérieur, et sont masqués sur écran étroit. Si leur position, les nombres ou la disposition diffèrent, fiez-vous à l’interface réelle.*

### Saisir les mots-clés

Saisissez des mots ou du code comme `pnpm` et `astro.config.mjs`. Les correspondances visibles du corps sont surlignées et la première est affichée. La navigation et le contenu masqué sont exclus.

### Naviguer entre les correspondances

- Avec le champ actif, <kbd>Entrée</kbd> ou le bouton flèche bas : correspondance suivante ;
- Avec le champ actif, <kbd>Maj + Entrée</kbd> ou le bouton flèche haut : correspondance précédente ;
- Sous le champ, le compteur `N/M` (par exemple `3/9`) indique la correspondance courante et le total.

### Effacer la recherche et restaurer la page

Avec le focus dans le champ, appuyez sur <kbd>Échap</kbd>, ou cliquez sur `×`, pour effacer la requête et le surlignage.

---

## Recherche site-wide : la fenêtre Ctrl+K

Appuyez sur <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> sur Mac), ou sur le bouton de l’en-tête. Il affiche le raccourci sur écran large et une loupe sous `64rem`. Les deux ouvrent la recherche globale, pas un champ de recherche dans la page.

![Image annotée de la fenêtre de recherche site-wide : ① badge de déclenchement ② champ de recherche ③ liste de résultats ④ barre des raccourcis clavier](/images/canvas/ui-search-modal.png)

*Figure : capture existante du champ et des résultats. Si les boutons ou les raccourcis indiqués diffèrent de la disposition actuelle, suivez l’interface réelle et les instructions ci-dessous. Aujourd’hui, Tab place le focus sur les liens ; les indications du bas peuvent être masquées sur écran étroit.*

### Saisir les mots-clés

Saisissez des mots dans la langue de la page ou du code comme `pnpm` et `astro.config.mjs`. Pagefind classe par pertinence ; une correspondance dans le titre ne garantit pas la première position.

### Parcourir la liste de résultats

Les résultats sont regroupés par document, avec titre, extrait et sous-résultats de sections disponibles. Titres et sous-résultats sont des liens : le titre ouvre le document et un lien de section suit son ancre. Le titre n’est pas une commande de dépliage ou de repliage.

### Réaliser tout le processus au clavier

- <kbd>Tab</kbd> / <kbd>Maj + Tab</kbd> : déplacer le focus entre champs, boutons et liens de résultats ;
- Sur un lien de résultat actif, <kbd>Entrée</kbd> : ouvrir le lien ; les liens de section suivent leur ancre ;
- <kbd>Échap</kbd> : fermer la fenêtre.

L’interface Pagefind actuelle ne sélectionne pas les résultats avec <kbd>↑</kbd> / <kbd>↓</kbd> et ne déplie pas les passages lors d’un clic sur le titre d’un document.

---

## Pourquoi la recherche est-elle si rapide ?

![Diagramme comparatif du mécanisme de recherche bimodale d'EpoCanvas Docs : à gauche la recherche dans la page depuis la barre supérieure (parcours du DOM avec surlignage, comptage en temps réel et défilement fluide), à droite la fenêtre de recherche site-wide (déclenchée par Ctrl+K, correspondance en quelques secondes via l'index inversé en mémoire WASM de Pagefind)](/images/canvas/docs-search-flow.svg)

*Figure : comparaison du fonctionnement de la recherche bimodale. À gauche, le repérage rapide de mots-clés dans la page depuis la barre supérieure ; à droite, la recherche site-wide fondée sur l'index statique de Pagefind WASM ; les deux s'exécutent entièrement en local dans le navigateur.*

Sur de nombreux sites, la recherche documentaire envoie les requêtes vers une base de données sur un serveur distant, et il ne reste qu'à attendre le chargement lorsque le réseau est mauvais.

EpoCanvas Docs utilise la solution de recherche statique locale **Pagefind** :

1. **Extraction de l'index lors du build** : lors de l'exécution de `pnpm run build`, le système extrait automatiquement le contenu de chaque document et génère un ensemble de fragments d'index statiques compressés.
2. **Téléchargement à la demande** : le navigateur charge depuis le site le programme de recherche et les fragments d’index nécessaires. Le chargement initial ou l’absence de cache implique encore des requêtes réseau.
3. **Calcul dans le navigateur** : une fois l’index chargé, recherche et classement sont locaux. Un intranet doit aussi servir les fichiers de recherche ; cela ne signifie pas qu’une première visite fonctionne sans réseau.

---

## Conseils pratiques pour la recherche

- **Découper en plusieurs mots** : pour obtenir des résultats plus précis, saisissez plusieurs mots séparés par des espaces (par exemple `Cloudflare domaine`).
- **Utiliser des termes précis** : titres et noms de sections aident à cibler la recherche, mais Pagefind décide de l’ordre par pertinence.
- **Limites du mode développement** : l'index du site n'est généré qu'à la compilation ; dans le serveur de développement lancé par `pnpm run dev`, la fenêtre `Ctrl+K` ne charge pas l'index et la recherche globale y est donc indisponible. Pour la tester, exécutez `pnpm run build` puis `pnpm run preview`. La recherche dans la page n'est pas concernée.
