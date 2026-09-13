---
title: Navigation supérieure et routage des pages
description: Configuration de la barre de navigation supérieure d'EpoCanvas Docs, règles de mise en surbrillance dynamique des chemins, badge de version externe et configuration des redirections historiques.
---

La barre de navigation supérieure est le passage principal par lequel l'utilisateur circule entre les différentes sections fonctionnelles. **EpoCanvas Docs** regroupe tous les éléments de navigation dans un unique fichier de configuration : une modification en un seul endroit s'applique à tout le site, avec en prime une mise en surbrillance précise de la page courante et un mécanisme de redirection des anciens liens.

---

## Centre de configuration de la navigation (`src/config/navigation.ts`)

Tous les boutons de navigation de la barre supérieure sont maintenus sous forme de tableau déclaratif dans `src/config/navigation.ts`. Les champs de chaque entrée sont définis comme suit :

```typescript
// 导航条目属性定义
export interface NavItem {
  id: string; // 唯一标识符
  labelKey: string; // 多语言翻译字典中的键名
  defaultLabel: string; // 默认显示的文本（如"首页"、"产品说明"）
  href: string; // 跳转链接或相对路径
  match?: (pathname: string) => boolean; // 判断当前页面是否应高亮该按钮的规则
  badge?: string; // 额外显示的小胶囊徽标（如版本号 "v1.2.0"）
  isExternal?: boolean; // 是否为外部网页跳转（是则在新窗口打开）
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
  // 后续还有 guide（编写规范）、deploy（部署上线）、faq（常见问题）
  // 以及指向 GitHub Releases 的 release 外部条目
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
    // 本站章节路径语义化重命名后，旧链接全部保留跳转
    '/canvas/rule-engine': '/canvas/cloudflare',
    '/canvas/dns-setup': '/canvas/layout',
  },
});
```

Au build, Astro génère pour ces chemins des pages de redirection automatique : les lecteurs qui visitent l'ancienne adresse sont conduits en douceur vers la nouvelle, et le poids SEO auprès des moteurs de recherche est également transmis.
