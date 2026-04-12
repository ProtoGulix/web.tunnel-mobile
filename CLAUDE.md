# CLAUDE.md — Standards & Règles du projet web.tunnel-mobile

> Ce fichier définit les conventions, patterns attendus et règles absolues pour maintenir un niveau
> d'excellence dans le code. À lire avant toute modification. À faire évoluer après chaque décision
> architecturale significative.

---

## 1. ARCHITECTURE & ORGANISATION

### Structure des dossiers

```
src/
├── api/              # Un fichier par domaine. Fonctions pures, pas de logique UI.
├── auth/             # Context d'authentification isolé
├── components/
│   ├── <domaine>/    # interventions/, stock/, purchases/, achats/
│   └── ui/           # Composants réutilisables (pas de dépendance domaine)
├── config/           # Tokens de design : colors.js, badges.js, typography.js, spacing.js
├── hooks/
│   └── <domaine>/    # Un dossier par domaine, même logique que components/
├── lib/
│   └── api/          # client.js + errors.js — couche technique API
├── pages/            # Écrans complets, un dossier par domaine
├── router/           # routes.jsx uniquement
└── utils/            # Fonctions pures utilitaires (formatters, dateUtils, etc.)
```

### Règles de localisation

- **Composant réutilisable** (usage dans 2+ domaines) → `src/components/ui/`
- **Composant de domaine** → `src/components/<domaine>/`
- **Jamais** de composant réutilisable défini dans `src/pages/`
- **Fonctions utilitaires** (formatDate, formatTime, etc.) → `src/utils/` (pas inline dans les composants)
- **`src/screens/`** n'est pas un répertoire standard — les nouveaux écrans vont dans `src/pages/`

---

## 2. COMPOSANTS

### Structure type d'un composant

```jsx
// 1. Imports (react, libs, composants internes, utils, api)
// 2. Constantes locales (si vraiment locales à ce fichier)
// 3. Sous-composants (si petits et étroitement couplés)
// 4. Composant principal + export
```

### Règles

- **Pas de logique métier dans les composants** — extraire dans un custom hook
- **Pas de formatters inline** — utiliser `src/utils/dateUtils.js`, `src/utils/formatters.js`
- **Pas de maps couleur/statut** dans les composants — utiliser `src/config/badges.js` (source de vérité unique)
- **Toujours `<ListStatus>`** pour les états loading/error/empty dans les listes
- **Toujours `<BottomBar>` + `<BottomBtn>`** pour les actions bas d'écran
- **Toujours `<PageHeader>`** en haut de chaque page/vue

### Composants à utiliser (ne pas recréer)

| Besoin | Composant |
|---|---|
| Badge coloré | `<DynBadge color={hex}>` |
| Badge statut intervention | `<StatusBadge status={...}>` |
| Badge priorité | `<PriorityBadge priority={...}>` |
| Ligne de liste | `<ListRow>` |
| Sélecteur async | `<AsyncSearchSelect>` |
| États liste | `<ListStatus loading error empty>` |
| Barre action bas | `<BottomBar>` + `<BottomBtn>` |
| En-tête page | `<PageHeader title onBack action>` |
| Ligne infos détail | `<InfoRow icon label value>` |
| Titre section | `<SectionTitle>` |

### Pattern couleur dynamique — À NE PAS RÉINVENTER

```jsx
// ❌ INTERDIT — pattern manuel
<span style={{ backgroundColor: color + '22', color }}>label</span>

// ✅ CORRECT
<DynBadge color={color}>label</DynBadge>
```

---

## 3. DESIGN SYSTEM

### Tokens de couleur

**Source de vérité : `src/config/colors.js` + `src/config/badges.js` + `tailwind.config.js`**

- **Jamais** de code couleur hexadécimal hardcodé dans un composant
- Utiliser les classes Tailwind custom : `text-tunnel-blue`, `bg-tunnel-sidebar`, etc.
- Pour les couleurs dynamiques (venant de l'API) : utiliser `style={{ color: apiColor }}` — acceptable UNIQUEMENT si la couleur vient de l'API

```jsx
// ❌ INTERDIT
<div className="text-[#1F3A5F]" />
<div style={{ color: '#1F3A5F' }} />

// ✅ CORRECT
<div className="text-tunnel-blue" />
<div className="text-[#1F3A5F]" />  // seulement si color vient de l'API

// ✅ ACCEPTABLE (couleur API)
<div style={{ color: item.statut_color }} />
```

### Couleurs de référence

```
Tunnel Blue:    #1F3A5F  → text-tunnel-blue / bg-tunnel-blue
Sidebar:        #2E2E2E  → bg-tunnel-sidebar
Surface:        #F4F6F8  → bg-tunnel-surface
Border:         #E0E0E0  → border-tunnel-border
Text secondary: #616161
Text muted:     #909090
Danger:         #C62828
Warning:        #ED6C02
Success:        #2E7D32
```

### Typographie

- Utiliser les classes custom définies dans `tailwind.config.js` (pas `text-[17.6px]`)
- Hiérarchie : `text-h3` > `text-body` > `text-sm` > `text-xs`
- Monospace (codes) : `font-mono text-[11px]`

### Espacements

- Padding pages : `px-4`
- Gap listes : `gap-3` (items) / `gap-1.5` (éléments inline)
- Section separator : `mt-2` entre blocs de contenu sur fond gris

### Safe areas (mobile)

- **Toujours** appliquer `safe-top` sur les headers si à portée du notch
- **Toujours** appliquer `safe-bottom` sur les `<BottomBar>` et barres de navigation
- `<AppShell>` gère `safe-top` — les pages n'ont pas besoin de le répéter

---

## 4. HOOKS

### Convention de retour

Tous les hooks de data fetching retournent un **objet nommé** (pas un tableau) :

```js
return { items, loading, error, reload }         // liste
return { item, loading, error, reload }          // détail
return { query, setQuery, results, loading }     // recherche
return { submit, status, error }                 // mutation
```

### Règles

- **Toujours nettoyer** les effets (`clearInterval`, `AbortController`)
- **Jamais** de `// eslint-disable-line` sur un tableau de dépendances — corriger le problème
- Le polling (si nécessaire) doit être pausable et disposable

---

## 5. API LAYER

### Format de réponse

Le client normalise les réponses. Les fonctions API retournent soit :
- **Un tableau** : `[...items]`
- **Un objet** : `{ items: [...], facets: [...], total: ... }`

Toujours gérer les deux cas côté hook :
```js
const items = Array.isArray(res) ? res : (res.items ?? [])
```

### Paramètres

- Limites de pagination : constante `DEFAULT_PAGE_SIZE = 50` dans `src/lib/api/client.js`
- Jamais de `limit: 50` ou `limit: 30` hardcodé dans une fonction API

### Gestion d'erreur

```js
// Pattern standard dans les hooks
try {
  const data = await myApiCall(params)
  setItems(data)
} catch (err) {
  const msg = err?.data?.detail ?? err?.message ?? 'Erreur inconnue'
  setError(msg)
} finally {
  setLoading(false)
}
```

---

## 6. ROUTING

### Conventions de paramètres

- Paramètre d'ID : toujours `:id` (pas `:itemId`, `:requestId`, etc.)
  - Exception acceptable si deux IDs sur la même route : `:parentId` + `:id`
- Query params pour l'état de la vue : `?tab=`, `?statut=`, `?family=`
- Toujours `{ replace: true }` pour les changements de filtre/tab

### Pattern page avec détail

```jsx
// Dans la page, détection de l'ID par useParams
const { id } = useParams()

if (id) return <DetailView id={id} onBack={() => navigate('/ma-route')} />
return <ListView onSelect={id => navigate(`/ma-route/${id}`)} />
```

---

## 7. QUALITÉ & MAINTENANCE

### Règles absolues

1. **Zéro duplication de mapping couleur/statut** — tout est dans `config/badges.js`
2. **Zéro composant réutilisable dans `pages/`**
3. **Zéro `// eslint-disable`** sans explication + ticket de dette
4. **Zéro null access sans guard** sur les données API : toujours `item?.field ?? fallback`
5. **Zéro magic number** : extraire en constante nommée

### Patterns interdits

```jsx
// ❌ Overlay modal inline
<div style={{ background: 'rgba(0,0,0,0.35)' }}>

// ❌ Badge couleur manuel
<span style={{ backgroundColor: color + '22', color }}>

// ❌ Maps statut/couleur dupliqués en dehors de config/badges.js
const STATUS_COLOR = { ouvert: '#1F3A5F', ... }

// ❌ Formatter inline dans un composant
const formatDate = (d) => new Intl.DateTimeFormat(...)...

// ❌ Hardcode de couleur hex
className="text-[#1F3A5F]"
```

### Checklist avant PR

- [ ] Aucune couleur hex hardcodée (sauf venant de l'API)
- [ ] Aucun formatter/helper défini inline — dans `src/utils/`
- [ ] Les états loading/error/empty utilisent `<ListStatus>`
- [ ] Les actions bas de page utilisent `<BottomBar>` + `<BottomBtn>`
- [ ] Null guards sur toutes les propriétés API
- [ ] Nettoyage des effets (intervals, subscriptions)
- [ ] Pas de `console.log` de debug oublié

---

## 8. PATTERNS DE RÉFÉRENCE

### Page liste + détail (pattern établi)

Voir [InterventionRequestsPage.jsx](src/pages/intervention-requests/InterventionRequestsPage.jsx) — implémentation de référence :
- Routage liste/détail par `useParams`
- Filtres par `useSearchParams`
- `<BottomBar>` + `<BottomBtn>` pour les actions
- `<ListStatus>` pour les états
- `<DIDetail>` comme composant de détail isolé

### Hook data fetching (pattern établi)

Voir [useInterventionRequests.js](src/hooks/interventions/useInterventionRequests.js) — structure de référence.

### Formulaire en plein écran (pattern établi)

Voir [DIForm.jsx](src/components/interventions/DIForm.jsx) — structure de référence.
