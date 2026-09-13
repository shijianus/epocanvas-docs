---
title: Qu'est-ce que c'est
description: "Lisez d'abord cet article : EpoCanvas Docs est le projet de documentation officiel d'EpoCanvas. Cette page explique clairement ce que c'est, sa relation avec le dépôt de code, à quoi il sert exactement et par où commencer selon le type de lecteur."
---

**EpoCanvas Docs est le projet de documentation officiel du projet EpoCanvas**. Pour le dire simplement : ce dépôt livre la « documentation » elle-même — le site entier que vous êtes en train de parcourir en est le produit fini. Le dépôt ne contient aucun code de fonctionnalités d'un autre logiciel ; le « produit » que vous cherchez, c'est ce site de documentation.

---

## Ce que signifie « projet de documentation »

Cette expression a deux sens, tous deux vrais en même temps :

1. **C'est un manuel.** Le contenu s'organise autour de « ce que c'est, comment l'utiliser, comment le modifier, comment le mettre en ligne » : comment utiliser l'interface de lecture, comment rédiger un nouveau document, où modifier la configuration, quelles sont les commandes de déploiement. Il n'a qu'un seul objectif : permettre à quiconque récupère EpoCanvas de réaliser ce qu'il veut en suivant la documentation, sans avoir à demander de l'aide de-ci de-là.
2. **C'est aussi, en lui-même, un système de site directement exécutable.** Clonez le dépôt en local et exécutez les deux commandes `pnpm install` et `pnpm run dev` : vous obtenez un site identique à celui que vous avez sous les yeux. L'ensemble du code est basé sur Astro 5 et Starlight, sous licence MIT ; il peut être repris en bloc et transformé en site de documentation pour votre propre projet.

Il y a aussi une caractéristique facile à ignorer : **chaque fonctionnalité présentée par cette documentation, vous l'utilisez en ce moment même**. La mise en page de lecture en trois colonnes, la recherche sur l'ensemble du site via `Ctrl + K`, le changement de langue sur place parmi 10 langues en haut à droite — ce que la documentation décrit, ce sont précisément les capacités que ce site implémente lui-même ; lisez et essayez au fur et à mesure pour le vérifier.

---

## À quoi il sert concrètement

Selon le profil du lecteur, ce projet de documentation remplit trois rôles :

| Qui êtes-vous | Ce qu'il peut faire pour vous | Par où commencer |
| :--- | :--- | :--- |
| **Lecteur qui cherche seulement une information** | Vérifier comment utiliser une fonctionnalité ou résoudre une erreur donnée | Champ de recherche de la barre supérieure ou recherche `Ctrl + K` sur l'ensemble du site, pour sauter directement à la section concernée |
| **Développeur qui veut monter son propre site de documentation** | Fournir un ensemble complet et fonctionnel de code source de site de documentation et de processus de déploiement | Présentation du produit → Démarrage rapide → Mise en ligne |
| **Rédacteur participant à l'écriture de la documentation** | Préciser où placer les fichiers, comment écrire le format, comment insérer les images et comment publier | Les trois chapitres du groupe « Rédaction de la documentation et gestion du contenu » |

En une phrase : **permettre aux utilisateurs de tout comprendre, aux développeurs de tout récupérer et aux rédacteurs de suivre des règles claires.**

---

## Que contient ce projet

La barre latérale se divise en cinq groupes, chacun répondant à une question :

- **Aperçu du produit et prise en main** : qu'est-ce que c'est ? Comment le faire tourner en local ?
- **Fonctionnalités principales et guide d'utilisation** : comment utiliser concrètement l'interface de lecture, la recherche, le multilinguisme, la navigation ?
- **Rédaction de la documentation et gestion du contenu** : comment rédiger un nouveau document ? Quelles sont les règles de mise en forme et de rendu Markdown ?
- **Configuration et personnalisation** : où modifier le titre du site, le menu de navigation, les couleurs du thème ? Comment modifier les composants ?
- **Publication et exploitation** : comment publier en ligne, lier un domaine, gérer le SEO et le versionnage ?

Chaque article est consultable de manière autonome ; inutile de tout lire dans l'ordre.

---

## Deux malentendus fréquents

**Premier malentendu : « C'est le manuel d'un logiciel, je vais chercher le logiciel lui-même. »**
Ce dépôt ne contient que le code source du site de documentation, et aucun code d'autre logiciel ; ce que la documentation explique en réalité, c'est l'utilisation, la personnalisation et le déploiement de ce système de site de documentation lui-même.

**Deuxième malentendu : « C'est un site en lecture seule, le télécharger ne sert à rien. »**
C'est tout le contraire : le code source est entièrement ouvert sur GitHub et deux commandes suffisent pour l'exécuter en local ; le prendre comme modèle pour en faire le site de documentation de votre propre projet fait précisément partie des usages pour lesquels il a été conçu.

---

## Prochaines étapes

- Pour une présentation complète du positionnement du produit, des fonctionnalités principales et des choix techniques, lisez **[Présentation du produit et valeur essentielle](/canvas/)**.
- Pour faire tourner le site en local immédiatement, lisez **[Démarrage rapide (exécution en 3 minutes)](/canvas/deployment/)**.
- Pour chercher uniquement une question précise, utilisez directement le champ de recherche de la barre supérieure ou `Ctrl + K` avec vos mots-clés.
