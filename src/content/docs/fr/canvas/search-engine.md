---
title: Recherche plein texte et raccourcis clavier
description: "Mode d'emploi de la recherche bimodale d'EpoCanvas Docs : recherche dans la page depuis la barre supérieure et fenêtre de recherche site-wide via Ctrl+K, avec mécanisme d'index statique local."
---

Lors de la consultation d'une grande quantité de documentation technique, retrouver rapidement l'option de configuration ou le paramètre recherché est essentiel. **EpoCanvas Docs** intègre une **recherche bimodale** : le champ de recherche de la barre supérieure assure un repérage rapide dans la page courante, tandis que la fenêtre `Ctrl+K` permet d'interroger l'ensemble des documents du site. Les deux recherches s'effectuent entièrement en local dans le navigateur, sans aucun service backend ; le site reste donc utilisable même hébergé sur un intranet sans accès à Internet.

---

## Quelle recherche utiliser et quand ?

| Situation | Recherche à utiliser | Comment procéder |
| :--- | :--- | :--- |
| Vous vous souvenez qu'un passage se trouve dans **l'article courant** | Recherche dans la page | Cliquez directement sur le champ de recherche de la barre supérieure et saisissez les mots-clés |
| Vous ne savez pas dans **quel article** se trouve le contenu et devez chercher sur tout le site | Recherche site-wide | Appuyez sur `Ctrl + K` (`Cmd + K` sur Mac) |

---

## Recherche dans la page : le champ de recherche de la barre supérieure

Cliquez sur le champ de recherche au centre de la barre supérieure (icône en forme de loupe) et saisissez directement les mots-clés :

![Image annotée de la recherche dans la page depuis la barre supérieure : ① champ de saisie ② compteur de correspondances ③ navigation précédent/suivant ④ effacement ⑤ surlignage dans la page](/images/canvas/ui-inpage-search.png)

*Figure : rendu annoté réel après saisie de « déploiement » dans le champ de recherche de la barre supérieure. ① champ de saisie de la barre supérieure ; ② compteur de correspondances (N-ième correspondance sur M au total) ; ③ boutons de navigation précédent / suivant ; ④ bouton d'effacement ; ⑤ surlignage automatique de toutes les occurrences dans la page courante.*

### Saisir les mots-clés

Les recherches acceptent les expressions en français ou en anglais (par exemple « déploiement », « composant »), les mots anglais ainsi que des extraits de code (par exemple `pnpm`, `astro.config.mjs`). Pendant la saisie, tous les textes correspondants de la page courante sont immédiatement surlignés et la page défile automatiquement jusqu'à la première correspondance.

### Naviguer entre les correspondances

- <kbd>Entrée</kbd> ou la flèche vers le bas : passer à la correspondance suivante ;
- <kbd>Maj + Entrée</kbd> ou la flèche vers le haut : revenir à la correspondance précédente ;
- Le champ de recherche affiche en temps réel le compteur de progression `N-ième correspondance sur M au total`, pour savoir où vous en êtes à tout moment.

### Effacer la recherche et restaurer la page

Appuyez sur <kbd>Échap</kbd> ou cliquez sur le bouton `×` pour effacer tout le surlignage et restaurer l'état initial de la page.

---

## Recherche site-wide : la fenêtre Ctrl+K

Où que vous soyez sur le site, appuyez sur le raccourci clavier <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> sur Mac), ou cliquez sur le badge `Ctrl K` situé à droite du champ de recherche : une fenêtre de recherche globale apparaît au centre de l'écran :

![Image annotée de la fenêtre de recherche site-wide : ① badge de déclenchement ② champ de recherche ③ liste de résultats ④ barre des raccourcis clavier](/images/canvas/ui-search-modal.png)

*Figure : rendu annoté réel après saisie de « déploiement » dans la fenêtre. ① le badge `Ctrl K` à droite du champ de recherche (un clic ouvre également la fenêtre) ; ② champ de saisie de la recherche ; ③ liste de résultats groupés par document, les correspondances surlignées ; ④ barre d'aide aux raccourcis clavier en bas.*

### Saisir les mots-clés

Les recherches acceptent les expressions en français ou en anglais (par exemple « déploiement », « composant »), les mots anglais ainsi que des extraits de code (par exemple `pnpm`, `astro.config.mjs`). Les résultats dont le titre correspond apparaissent en premier.

### Parcourir la liste de résultats

Les résultats sont groupés par document ; chaque entrée affiche le titre du document, la section concernée et un extrait contextuel contenant les mots-clés, avec les correspondances surlignées. Un clic sur le titre d'un groupe déploie ou replie les passages trouvés dans ce document.

### Réaliser tout le processus au clavier

- <kbd>↑</kbd> <kbd>↓</kbd> : déplacer la sélection entre les résultats ;
- <kbd>Entrée</kbd> : ouvrir le résultat sélectionné et aller au paragraphe correspondant ;
- <kbd>Échap</kbd> : fermer la fenêtre.

Aucune souris n'est nécessaire.

---

## Pourquoi la recherche est-elle si rapide ?

![Diagramme comparatif du mécanisme de recherche bimodale d'EpoCanvas Docs : à gauche la recherche dans la page depuis la barre supérieure (parcours du DOM avec surlignage, comptage en temps réel et défilement fluide), à droite la fenêtre de recherche site-wide (déclenchée par Ctrl+K, correspondance en quelques secondes via l'index inversé en mémoire WASM de Pagefind)](/images/canvas/docs-search-flow.svg)

*Figure : comparaison du fonctionnement de la recherche bimodale. À gauche, le repérage rapide de mots-clés dans la page depuis la barre supérieure ; à droite, la recherche site-wide fondée sur l'index statique de Pagefind WASM ; les deux s'exécutent entièrement en local dans le navigateur.*

Sur de nombreux sites, la recherche documentaire envoie les requêtes vers une base de données sur un serveur distant, et il ne reste qu'à attendre le chargement lorsque le réseau est mauvais.

EpoCanvas Docs utilise la solution de recherche statique locale **Pagefind** :

1. **Extraction de l'index lors du build** : lors de l'exécution de `pnpm run build`, le système extrait automatiquement le contenu de chaque document et génère un ensemble de fragments d'index statiques compressés.
2. **Téléchargement léger à la demande** : lors de la saisie dans le champ de recherche, le navigateur ne récupère que les fragments d'index correspondant aux caractères saisis (quelques Ko à quelques dizaines de Ko seulement).
3. **Correspondance instantanée en local** : la correspondance et le tri s'effectuent entièrement en local dans le navigateur, sans latence de requête réseau ; la recherche fonctionne intégralement même sur un intranet sans accès à Internet.

---

## Conseils pratiques pour la recherche

- **Découper en plusieurs mots** : pour obtenir des résultats plus précis, saisissez plusieurs mots séparés par des espaces (par exemple `Cloudflare domaine`).
- **Privilégier les titres** : les titres de documents et de sections ont le poids le plus élevé dans le tri ; les résultats dont le titre contient les mots-clés apparaissent en premier.
- **Limites du mode développement** : le serveur de développement lancé par `pnpm run dev` ne reconstruit pas l'index site-wide en temps réel ; pour qu'un nouvel article apparaisse dans la recherche globale, il faut d'abord exécuter `pnpm run build`. La recherche dans la page n'est pas concernée par cette limite.
