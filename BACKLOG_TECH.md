# Backlog de dette technique — web.tunnel-mobile

> Généré suite à l'audit complet du 2026-04-12.
> Les items sont triés par priorité. Cocher au fur et à mesure.

---

## 🔴 CRITIQUE — À corriger avant la prochaine feature

### [C-1] Race condition : polling + mise à jour manuelle
- **Fichier** : `src/hooks/interventions/useInterventionsList.js` (~ligne 94)
- **Problème** : L'intervalle de 30s recharge les données et peut écraser les mises à jour locales en cours
- **Fix** : Implémenter un `AbortController` par fetch + pauser le polling si un formulaire est ouvert
- **Impact** : Données perdues pour l'utilisateur

### [C-2] Null guards manquants sur données API
- **Fichiers** :
  - `src/components/interventions/DICard.jsx:47` → `item.description` sans guard
  - `src/screens/InterventionsScreen.tsx:131-138` → `item.equipements` sans guard
- **Fix** : Remplacer par `item?.description ?? '—'` et `item?.equipements ?? []`
- **Impact** : Crash app sur données partielles

### [C-3] Duplication des maps statut/couleur
- **Fichiers concernés** :
  - `src/config/badges.js` ← source de vérité (à garder)
  - `src/screens/InterventionsScreen.tsx:62-93` ← DUPLIQUER à supprimer
  - `src/pages/intervention-requests/InterventionRequestsPage.jsx:54-61` ← `STATUS_COLOR` / `STATUS_LABEL` à supprimer
- **Fix** : Importer depuis `config/badges.js` partout, supprimer les définitions locales
- **Impact** : Incohérences visuelles, maintenance impossible

---

## 🟠 HAUTE PRIORITÉ — Prochaine itération

### [H-1] Extraire `SheetPicker` en composant réutilisable
- **Fichiers** :
  - `src/components/actions/ActionForm.jsx` (défini localement ~ligne 54-90)
  - `src/components/interventions/InterventionForm.jsx` (redéfini localement ~ligne 18-54)
- **Fix** : Créer `src/components/ui/SheetPicker.jsx` et l'importer dans les deux

### [H-2] Ajouter un Error Boundary au niveau des routes
- **Fichier** : `src/router/routes.jsx`
- **Fix** : Créer `src/components/ui/ErrorBoundary.jsx` (class component) et wrapper les routes principales
- **Impact** : Sans ça, tout crash = écran blanc

### [H-3] Standardiser le format de réponse API
- **Fichier** : `src/lib/api/client.js` + tous les fichiers `src/api/*.js`
- **Problème** : Certaines fonctions font `.then(res => res.items ?? res)`, d'autres non
- **Fix** : Normaliser dans le client OU documenter clairement ce que retourne chaque endpoint

### [H-4] Extraire les formatters dans `src/utils/`
- **Fichiers à créer** :
  - `src/utils/dateUtils.js` : `formatDateFr`, `formatWeekLabel`, `formatTime`, `isToday`, `getMonday`, `addDays`, `toDateStr`
  - `src/utils/formatters.js` : autres helpers de formatage
- **Fichiers à nettoyer** :
  - `src/screens/InterventionsScreen.tsx:17-60` (définitions inline)
  - `src/pages/intervention-requests/InterventionRequestsPage.jsx:17-23` (`formatDateFr` inline)

### [H-5] Clarifier la relation `screens/` vs `pages/`
- **Problème** : `src/screens/InterventionsScreen.tsx` est un fichier TypeScript seul dans un projet JSX
- **Options** :
  - Option A : Migrer `InterventionsScreen.tsx` → `src/pages/interventions/InterventionsPage.jsx`
  - Option B : Documenter la distinction dans CLAUDE.md et s'y tenir
- **Décision** : À prendre avec le dev

### [H-6] Ajouter une route 404
- **Fichier** : `src/router/routes.jsx`
- **Fix** : Ajouter `<Route path="*" element={<NotFoundPage />} />` en bas des routes

### [H-7] Constante pour les limites de pagination
- **Fichier** : `src/lib/api/client.js` ou `src/config/api.js`
- **Fix** : `export const DEFAULT_PAGE_SIZE = 50` — remplacer tous les `limit: 50` et `limit: 30` hardcodés

---

## 🟡 MOYEN — Dette à résorber progressivement

### [M-1] `ActionCard` mal placé
- **Fichier** : `src/pages/planning/ActionCard.jsx`
- **Fix** : Déplacer vers `src/components/interventions/ActionCard.jsx` (c'est un composant réutilisable)

### [M-2] Pattern badge couleur manuel — remplacer par `<DynBadge>`
- **Occurrences** : 8+ dans le projet
- **Pattern à supprimer** : `style={{ backgroundColor: color + '22', color }}`
- **Fix** : Utiliser `<DynBadge color={color}>` systématiquement

### [M-3] Overlay modal inline — extraire en classe CSS
- **Occurrences** : 3+ fichiers avec `style={{ background: 'rgba(0,0,0,0.35)' }}`
- **Fix** : Créer classe utilitaire `.modal-overlay` dans `index.css`

### [M-4] Couleurs hex hardcodées → tokens Tailwind
- **Fichier** : `src/components/ui/BottomNav.jsx:16-17` (`#2E2E2E` hardcodé)
- Et 20+ autres occurrences projet-wide
- **Fix** : Remplacer par `text-tunnel-blue`, `bg-tunnel-sidebar`, etc.

### [M-5] React.memo sur les composants de liste
- **Fichiers** : `DICard.jsx`, `InterventionCard.jsx` (si existe), composants de ligne stock
- **Fix** : `export default React.memo(DICard)`
- **Impact** : Performance sur les longues listes

### [M-6] Lazy loading des routes
- **Fichier** : `src/router/routes.jsx`
- **Fix** : `const StockPage = lazy(() => import('../pages/stock/StockPage'))` + `<Suspense>`
- **Impact** : Réduction du bundle initial

### [M-7] Paramètre route `:id` vs noms custom
- **Fichier** : `src/router/routes.jsx:48`
- **Problème** : `/:itemId` au lieu de `/:id` — incohérent avec les autres routes
- **Fix** : Harmoniser sur `:id` dans tout le router

### [M-8] BOTTOM_NAV_ITEMS config inutilisée
- **Fichier** : `src/config/navigation.js:42-48`
- **Problème** : `BottomNav.jsx` hardcode ses items au lieu d'importer la config
- **Fix** : Soit utiliser la config dans `BottomNav`, soit supprimer la config

---

## 🟢 POLISH — Quand le reste est stable

### [P-1] Accessibilité : ARIA labels
- Ajouter `aria-label` sur les boutons icon-only (`<button><X /></button>`)
- Remplacer les `<div onClick>` par de vrais `<button>`

### [P-2] Validation de formulaire côté client
- `src/components/actions/ActionForm.jsx` a une `validate()` partielle
- Compléter et harmoniser avec les autres formulaires

### [P-3] Support offline PWA
- `vite-plugin-pwa` configuré mais pas de page offline
- Ajouter `offline.html` et stratégie de cache dans `vite.config.js`

### [P-4] Optimisation images
- `Tunnel_Logo.png` chargé sans optimisation
- Convertir en WebP + attribut `loading="lazy"`

### [P-5] Typographie — supprimer les tailles arbitraires
- Supprimer `text-[11px]`, `text-[17.6px]`, etc.
- Utiliser uniquement les classes custom du design system

---

## Suivi des décisions

| Date | Décision |
|---|---|
| 2026-04-12 | Audit initial — backlog créé |
