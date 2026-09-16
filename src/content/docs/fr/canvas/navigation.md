---
title: Navigation supérieure et routage des pages
description: Configuration de la barre de navigation supérieure d'EpoCanvas Docs, règles de mise en surbrillance dynamique des chemins, badge de version externe et configuration des redirections historiques.
---

La barre de navigation supérieure est le passage principal par lequel l'utilisateur circule entre les différentes sections fonctionnelles. **EpoCanvas Docs** regroupe tous les éléments de navigation dans un unique fichier de configuration : une modification en un seul endroit s'applique à tout le site, avec en prime une mise en surbrillance précise de la page courante et un mécanisme de redirection des anciens liens.

---

## Centre de configuration de la navigation (`src/config/navigation.ts`)

Tous les boutons de navigation de la barre supérieure sont maintenus sous forme de tableau déclaratif dans `src/config/navigation.ts`. Les champs de chaque entrée sont définis comme suit :

```typescript
// Définition des propriétés d'un élément de navigation
export interface NavItem {
  id: string; // identifiant unique
  labelKey: string; // nom de la clé dans le dictionnaire de traductions multilingues
  defaultLabel: string; // texte affiché par défaut (ex. « Accueil », « Produit »)
  href: string; // lien de destination ou chemin relatif
  match?: (pathname: string) => boolean; // règle déterminant si le bouton doit être mis en évidence sur la page courante
  badge?: string; // petite capsule supplémentaire (ex. numéro de version « v1.2.0 »)
  isExternal?: boolean; // lien externe ou non (ouvert dans une nouvelle fenêtre le cas échéant)
}
```

### Configuration officielle actuelle (extrait)

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // suivent guide (guide de rédaction), deploy (déploiement), faq (questions fréquentes)
  // ainsi que l'entrée externe release vers les GitHub Releases
];
```

Pour ajouter ou supprimer un élément de navigation, il suffit d'ajouter ou de retirer une entrée de ce tableau ; après enregistrement, le serveur de développement local se met à jour automatiquement à chaud.

---

## Règles d'activation et de mise en surbrillance dynamiques

Avec un simple test du type `pathname.startsWith('/canvas')`, lorsque vous consultez la page « Prise en main » `/canvas/deployment/`, les deux boutons « Présentation du produit » et « Prise en main » risquent de s'allumer en même temps, ce qui est déroutant.

C'est pourquoi chaque élément de navigation déclare son périmètre de surbrillance au moyen d'une fonction `match` :

- Sur la page d'accueil `/`, seul le bouton « Accueil » est actif ;
- Sur les documents courants comme `/canvas/layout/`, `/canvas/about/`, c'est le bouton « Présentation du produit » qui est activé ;
- Sur les pages dont le chemin contient `deployment`, seul le bouton « Prise en main » est activé, à l'exclusion de tout autre ;
- Le bouton actif porte un fond en forme de pilule à la couleur du thème, ce qui le distingue nettement des boutons inactifs.

Lors de l'ajout d'une page de documentation, pensez à ajouter le mot-clé du chemin dans la règle `match` de l'élément de navigation correspondant, sinon la barre supérieure ne mettra pas correctement en surbrillance.

---

## Liens externes et interaction avec le badge de version

Si un élément de navigation pointe vers un site externe (par exemple la page Releases du dépôt GitHub) :

1. Configurez `isExternal: true` ;
2. Le système ajoute automatiquement au lien les attributs de sécurité `target="_blank" rel="noopener noreferrer"` et l'ouvre dans un nouvel onglet ;
3. Une petite flèche diagonale sortante (`↗`) accompagne le texte, pour indiquer au lecteur qu'un clic le quittera du site courant.

Le badge de version (`badge: 'v1.2.0'`) s'affiche sous forme de pilule dans le bouton ; pensez à le mettre à jour en même temps à chaque nouvelle version, voir [Gestion des versions et workflows automatisés](/canvas/releases/).

---

## Règles de redirection des pages (`astro.config.mjs`)

Il est inévitable d'ajuster les chemins de la documentation au fil des itérations du projet. Pour éviter que les anciens liens mis en favori par les lecteurs ne débouchent sur une erreur 404, vous pouvez enregistrer la correspondance entre anciens et nouveaux chemins dans la table `redirects` de `astro.config.mjs` :

```javascript
export default defineConfig({
  redirects: {
    // après le renommage sémantique des chemins de sections, les anciens liens redirigent vers les nouvelles adresses
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

Au build, Astro génère pour ces chemins des pages de redirection automatique : les lecteurs qui visitent l'ancienne adresse sont conduits en douceur vers la nouvelle, et le poids SEO auprès des moteurs de recherche est également transmis.
