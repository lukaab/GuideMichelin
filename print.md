# Michelin Quest — Sprint Guide

> **4 tracks parallèles, zéro conflit de merge si chacun reste dans ses fichiers.**
> Lire ce guide entièrement avant de commencer.

> **Note lint :** ESLint v9 est installé mais la config est en format v8 (`.eslintrc.js`). Ce conflit est **déjà réglé** — `ESLINT_USE_FLAT_CONFIG=false` est dans les scripts `package.json`. `npm run lint` fonctionne sans rien toucher.

---

## Règles communes

- **Ne pas toucher aux fichiers des autres tracks** (liste claire dans chaque section)
- Toute la logique métier va dans `lib/domain/` — jamais directement dans les écrans
- Pas besoin de tests, pas de refacto "bonus" : scope = ce qui est listé ici, rien de plus
- Couleurs Michelin : rouge `#E2231A`, noir `#1A1A1A`, or `#FFD700`
- `npm run lint` doit passer à la fin de votre track

---

## Architecture actuelle (à connaître)

```
lib/
  domain/
    gamification.ts   ← ALL_BADGES, buildChallenges(), getLevelTitle()
    filters.ts        ← FILTER_DEFINITIONS, filterStore, applyFilters()
  profile.ts          ← checkIn(), loadProfile(), saveProfile()
  restaurants.ts      ← getRestaurants(), getRestaurantById()
  auth.tsx            ← useAuth() hook

app/
  (tabs)/
    index.tsx         ← Home/Discover
    search.tsx        ← Formulaire 3 étapes (Où/Quand/Qui)
    profile.tsx       ← Profil utilisateur
    challenges.tsx    ← Liste challenges
  restaurants/[id].tsx ← Détail + bouton check-in
  results.tsx         ← Résultats filtrés + carte
  advanced-filters.tsx ← Modale filtres avancés

data/
  restaurants.json    ← 20+ restos avec id, name, city, category, cuisine, priceRange, lat, lng

types/index.ts        ← Restaurant, User, Badge, Challenge, UserStats
```

---

---

# TRACK A — Gamification complète

**Dev A touche :** `lib/profile.ts`, `lib/domain/gamification.ts`, `app/restaurants/[id].tsx`, `types/index.ts`
**Dev A ne touche PAS :** `lib/domain/filters.ts`, `results.tsx`, `advanced-filters.tsx`, `search.tsx`, `restaurants.json`

---

## A1 — XP challenge bonus au check-in

**Problème :** `checkIn()` dans `lib/profile.ts` donne toujours +100 XP, mais les bonus challenges (+200, +500...) ne se déclenchent jamais.

**Solution :** Après avoir mis à jour les stats, vérifier quels challenges viennent d'être franchis (condition false avant, true après), ajouter le XP bonus, et retourner les infos pour afficher une notification.

### Étape 1 — Changer le type de retour de `checkIn()`

Dans `types/index.ts`, ajouter à la fin :

```typescript
export interface CheckInResult {
  user: User;
  xpGained: number;
  completedChallenges: string[];   // ids des challenges fraîchement complétés
  unlockedBadges: string[];        // ids des badges fraîchement débloqués
}
```

### Étape 2 — Réécrire `checkIn()` dans `lib/profile.ts`

Remplacer la fonction `checkIn` existante par :

```typescript
import { ALL_BADGES, buildChallenges } from './domain/gamification';
import { CheckInResult } from '../types';

// Rewards pour chaque challenge (condition de franchissement)
const CHALLENGE_REWARDS: Array<{
  id: string;
  xp: number;
  crossed: (prev: UserStats, next: UserStats) => boolean;
}> = [
  { id: 'first_visit',   xp: 200,  crossed: (p, n) => p.totalVisits < 1 && n.totalVisits >= 1 },
  { id: 'bib_5',         xp: 500,  crossed: (p, n) => p.bibGourmandVisits < 5 && n.bibGourmandVisits >= 5 },
  { id: 'three_cities',  xp: 400,  crossed: (p, n) => p.citiesExplored.length < 3 && n.citiesExplored.length >= 3 },
  { id: 'starred_3',     xp: 600,  crossed: (p, n) => p.starredVisits < 3 && n.starredVisits >= 3 },
  { id: 'total_10',      xp: 1000, crossed: (p, n) => p.totalVisits < 10 && n.totalVisits >= 10 },
];

export async function checkIn(
  user: User,
  restaurantId: number,
  category: string,
  city: string,
): Promise<CheckInResult> {
  if (user.visitedRestaurants.includes(restaurantId)) {
    return { user, xpGained: 0, completedChallenges: [], unlockedBadges: [] };
  }

  const baseXP = 100;
  const newStats: UserStats = {
    ...user.stats,
    totalVisits: user.stats.totalVisits + 1,
    bibGourmandVisits:
      category === 'Bib Gourmand' ? user.stats.bibGourmandVisits + 1 : user.stats.bibGourmandVisits,
    starredVisits:
      category !== 'Bib Gourmand' ? user.stats.starredVisits + 1 : user.stats.starredVisits,
    citiesExplored: user.stats.citiesExplored.includes(city)
      ? user.stats.citiesExplored
      : [...user.stats.citiesExplored, city],
    totalXP: user.stats.totalXP + baseXP,
  };

  // Challenges fraîchement complétés
  const completedChallenges = CHALLENGE_REWARDS
    .filter((r) => r.crossed(user.stats, newStats))
    .map((r) => r.id);

  const bonusXP = CHALLENGE_REWARDS
    .filter((r) => r.crossed(user.stats, newStats))
    .reduce((sum, r) => sum + r.xp, 0);

  const totalXPGained = baseXP + bonusXP;
  const newXP = user.xp + totalXPGained;

  // Badges fraîchement débloqués
  const userWithNewStats = { ...user, stats: newStats, xp: newXP };
  const unlockedBadges = ALL_BADGES
    .filter((b) => !user.badges.includes(b.id) && b.check(userWithNewStats))
    .map((b) => b.id);

  const updated: User = {
    ...user,
    xp: newXP,
    level: xpToLevel(newXP),
    badges: [...user.badges, ...unlockedBadges],
    visitedRestaurants: [...user.visitedRestaurants, restaurantId],
    stats: { ...newStats, totalXP: newStats.totalXP + bonusXP },
  };

  await saveProfile(updated);
  return { user: updated, xpGained: totalXPGained, completedChallenges, unlockedBadges };
}
```

---

## A2 — Notification check-in dans `app/restaurants/[id].tsx`

**Problème :** Le bouton "J'y étais" ne montre aucun feedback sur les XP gagnés / badges débloqués.

Modifier `handleCheckin()` dans `app/restaurants/[id].tsx` :

```typescript
import { Alert } from 'react-native';
import { CheckInResult } from '../../types';

async function handleCheckin() {
  if (!user || visited) return;

  const result: CheckInResult = await checkIn(
    user,
    currentRestaurant.id,
    currentRestaurant.category,
    currentRestaurant.city,
  );

  setUser(result.user);

  // Construire le message de feedback
  const lines: string[] = [`+${result.xpGained} XP gagnés !`];

  if (result.completedChallenges.length > 0) {
    lines.push(`🎯 Challenge${result.completedChallenges.length > 1 ? 's' : ''} complété${result.completedChallenges.length > 1 ? 's' : ''} !`);
  }

  if (result.unlockedBadges.length > 0) {
    lines.push(`🏅 Badge${result.unlockedBadges.length > 1 ? 's' : ''} débloqué${result.unlockedBadges.length > 1 ? 's' : ''} !`);
  }

  Alert.alert('Étape validée ✓', lines.join('\n'));
}
```

Et mettre à jour le factCard "Récompense" pour afficher "+100 XP + bonus" :

```tsx
<Text style={styles.factValue}>+100 XP</Text>
// → remplacer par :
<Text style={styles.factValue}>+100 XP{'\n'}+ bonus challenges</Text>
```

---

## A — Définition of done

- [ ] Check-in sur un nouveau restaurant → Alert avec XP total (base + bonus)
- [ ] Si un challenge est franchi lors du check-in → mention dans l'Alert
- [ ] Si un badge est débloqué → mention dans l'Alert
- [ ] `npm run lint` passe

---

---

# TRACK B — Filtres & Données

**Dev B touche :** `data/restaurants.json`, `lib/domain/filters.ts`, `app/advanced-filters.tsx`, `app/(tabs)/search.tsx`, `types/index.ts`, `app/results.tsx` (appel filterStore.load uniquement)
**Dev B ne touche PAS :** `lib/profile.ts`, `[id].tsx`, `gamification.ts`

---

## B1 — Enrichir `restaurants.json` avec features et dietary

**Problème :** Les filtres ambiance (Romantique, Terrasse…) et diét. (Halal, Casher…) sont sélectionnables mais n'ont aucun effet car le JSON n'a pas ces champs.

Dans `types/index.ts`, étendre l'interface `Restaurant` :

```typescript
export interface Restaurant {
  id: number;
  name: string;
  city: string;
  address: string;
  category: 'Une étoile' | 'Deux étoiles' | 'Trois étoiles' | 'Bib Gourmand';
  cuisine: string;
  priceRange: '€' | '€€' | '€€€' | '€€€€';
  lat: number;
  lng: number;
  description: string;
  image: string;
  visited?: boolean;
  features?: string[];   // ← NOUVEAU
  dietary?: string[];    // ← NOUVEAU
}
```

Valeurs autorisées pour **`features`** :
`"terrasse"`, `"romantique"`, `"anime"`, `"calme"`, `"bar-a-vins"`, `"pmr"`, `"animaux"`, `"enfants"`

Valeurs autorisées pour **`dietary`** :
`"vegan"`, `"halal"`, `"casher"`, `"sans-gluten"`, `"vegetarien"`

**Enrichir les entrées dans `restaurants.json`** — pour chaque restaurant, ajouter les deux champs selon ce qui fait sens (pas besoin d'être exhaustif, 3-5 valeurs par resto suffisent pour la démo) :

```json
{
  "id": 2,
  "name": "Septime",
  "city": "Paris",
  ...
  "features": ["terrasse", "anime"],
  "dietary": ["vegetarien"]
}
```

Couvrir les cas de test pour la démo : au moins 3-4 restos avec `"terrasse"`, 2-3 avec `"romantique"`, 2 avec `"halal"`.

---

## B2 — Persistance du filterStore

**Propriétaire : Dev B** (c'est `filters.ts` — son fichier).

Dans `lib/domain/filters.ts`, remplacer le `filterStore` minimal existant :

```typescript
export const filterStore = {
  active: [] as string[],
};
```

Par la version persistante :

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_KEY = '@michelin_filters';

export const filterStore = {
  active: [] as string[],

  async load() {
    try {
      const raw = await AsyncStorage.getItem(FILTER_KEY);
      if (raw) this.active = JSON.parse(raw);
    } catch {}
  },

  async set(filters: string[]) {
    this.active = filters;
    try {
      await AsyncStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    } catch {}
  },
};
```

Puis dans `app/advanced-filters.tsx`, mettre à jour `handleApply` :

```typescript
function handleApply() {
  filterStore.set(selected);  // était: filterStore.active = selected
  router.back();
}
```

Et dans `app/results.tsx`, ajouter un `useEffect` de chargement initial (1 seul endroit) :

```typescript
useEffect(() => {
  filterStore.load().then(() => {
    setActiveFilters([...filterStore.active]);
  });
}, []);
```

---

## B3 — Brancher les filtres dans `applyFilters()`

Dans `lib/domain/filters.ts`, étendre la fonction `applyFilters` :

```typescript
export function applyFilters(
  restaurants: Restaurant[],
  location: string,
  activeFilterIds: string[],
): Restaurant[] {
  let result = restaurants;

  // Filtre par ville / nom / cuisine
  if (location && location !== 'Près de moi') {
    const loc = location.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.city.toLowerCase().includes(loc) ||
        r.name.toLowerCase().includes(loc) ||
        r.cuisine.toLowerCase().includes(loc),
    );
  }

  // Filtre par catégorie Michelin (étoiles / Bib)
  const categoryFilters = activeFilterIds
    .map((id) => CATEGORY_FILTER_MAP[id as FilterId])
    .filter((c): c is Restaurant['category'] => Boolean(c));

  if (categoryFilters.length > 0) {
    result = result.filter((r) => categoryFilters.includes(r.category));
  }

  // Filtre par prix
  const PRICE_FILTER_MAP: Partial<Record<FilterId, string>> = {
    price_low: '€',
    price_mid: '€€',
    price_high: '€€€',
    price_luxury: '€€€€',
  };
  const priceFilters = activeFilterIds
    .map((id) => PRICE_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];

  if (priceFilters.length > 0) {
    result = result.filter((r) => priceFilters.includes(r.priceRange));
  }

  // Filtre par features (ambiance / accessibilité)
  const FEATURE_FILTER_MAP: Partial<Record<FilterId, string>> = {
    romantic: 'romantique',
    lively: 'anime',
    calm: 'calme',
    terrace: 'terrasse',
    wine_bar: 'bar-a-vins',
    wheelchair: 'pmr',
    pets: 'animaux',
    kids: 'enfants',
  };
  const featureFilters = activeFilterIds
    .map((id) => FEATURE_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];

  if (featureFilters.length > 0) {
    result = result.filter((r) =>
      featureFilters.every((f) => r.features?.includes(f)),
    );
  }

  // Filtre par dietary
  const DIETARY_FILTER_MAP: Partial<Record<FilterId, string>> = {
    vegan: 'vegan',
    halal: 'halal',
    kosher: 'casher',
    gluten_free: 'sans-gluten',
  };
  const dietaryFilters = activeFilterIds
    .map((id) => DIETARY_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];

  if (dietaryFilters.length > 0) {
    result = result.filter((r) =>
      dietaryFilters.every((d) => r.dietary?.includes(d)),
    );
  }

  return result;
}
```

Et ajouter les filtres prix dans `FILTER_DEFINITIONS` (ajouter après `bib_gourmand`) :

```typescript
{ id: 'price_low',    label: '€ Petit budget' },
{ id: 'price_mid',    label: '€€ Accessible' },
{ id: 'price_high',   label: '€€€ Gastronomique' },
{ id: 'price_luxury', label: '€€€€ Prestige' },
```

Et dans `FilterId` (le type est auto-inféré depuis `FILTER_DEFINITIONS` via `as const`, donc juste ajouter les entrées suffit).

---

## B4 — Géolocalisation "Près de moi"

**Problème :** Quand l'user sélectionne "Près de moi" dans search.tsx, rien ne se passe (pas de géoloc demandée, pas de filtrage par distance).

### Dans `app/(tabs)/search.tsx`

Ajouter l'import :

```typescript
import * as Location from 'expo-location';
```

Ajouter un state pour les coordonnées :

```typescript
const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
```

Remplacer `selectLocation('Près de moi')` dans la suggestion par un appel async :

```typescript
async function handleNearMe() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission refusée',
      'Activez la localisation dans les réglages pour utiliser cette fonctionnalité.',
    );
    return;
  }
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
  setLocation('Près de moi');
  setLocationLabel('Près de moi');
  setStep('quand');
}
```

Dans la liste des suggestions, changer :

```tsx
// Avant :
onPress={() => selectLocation(s.title)}

// Pour "Près de moi" uniquement :
onPress={s.title === 'Près de moi' ? handleNearMe : () => selectLocation(s.title)}
```

Dans `handleSearch`, passer les coords :

```typescript
function handleSearch() {
  router.push({
    pathname: '/results',
    params: {
      location: locationLabel || location,
      when,
      covers: String(totalCovers),
      lat: userCoords ? String(userCoords.lat) : '',
      lng: userCoords ? String(userCoords.lng) : '',
    },
  });
}
```

### Dans `lib/domain/filters.ts`

Ajouter la fonction distance et l'intégrer dans `applyFilters` :

```typescript
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

Modifier la signature de `applyFilters` pour accepter les coords :

```typescript
export function applyFilters(
  restaurants: Restaurant[],
  location: string,
  activeFilterIds: string[],
  userCoords?: { lat: number; lng: number },  // ← NOUVEAU
): Restaurant[] {
  // ... code existant ...

  // Filtre géographique si "Près de moi" et coords disponibles
  if (location === 'Près de moi' && userCoords) {
    const RADIUS_KM = 50;
    result = result
      .map((r) => ({ ...r, _dist: haversineKm(userCoords.lat, userCoords.lng, r.lat, r.lng) }))
      .filter((r) => r._dist <= RADIUS_KM)
      .sort((a, b) => a._dist - b._dist)
      .map(({ _dist, ...r }) => r);
  }

  return result;
}
```

### Dans `app/results.tsx`

Lire `lat` et `lng` des params et passer à `applyFilters` :

```typescript
const { location, when, covers, lat, lng } = useLocalSearchParams<{
  location: string; when: string; covers: string; lat: string; lng: string;
}>();

const userCoords = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
const filtered = applyFilters(all, location ?? '', activeFilters, userCoords);
```

> ⚠️ Ce changement touche `results.tsx` qui est normalement dans le périmètre du Dev C. **Coordonner avec Dev C** ou faire ce changement en dernier et merger proprement.

---

## B — Définition of done

- [ ] Relancer l'app → filtres actifs toujours présents (persistance AsyncStorage)
- [ ] Sélectionner "Terrasse" dans les filtres → seuls les restos avec `features: ["terrasse"]` apparaissent
- [ ] Sélectionner "€" → seuls les restos budget apparaissent
- [ ] Sélectionner "Halal" → seuls les restos halal apparaissent
- [ ] Cliquer "Près de moi" dans search → demande de permission géoloc → résultats triés par distance
- [ ] `npm run lint` passe

---

---

# TRACK C — UX & Persistance

**Dev C touche :** `app/results.tsx`, `app/restaurants/[id].tsx` (animation uniquement), `components/MapSection.web.tsx`
**Dev C ne touche PAS :** `lib/domain/`, `lib/profile.ts`, `search.tsx`, `profile.tsx`, `challenges.tsx`

> ⚠️ Conflit potentiel avec Track A sur `[id].tsx` : Dev A ajoute la logique dans `handleCheckin()`, Dev C ajoute l'animation. **Merger en dernier ou se partager le fichier section par section.**

---

## C1 — Favoris persistants

**Problème :** Les favoris dans `results.tsx` sont en state local — perdus à chaque navigation.

Dans `app/results.tsx`, remplacer la gestion des favoris :

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVS_KEY = '@michelin_favorites';

// Remplacer :
const [favorites, setFavorites] = useState<number[]>([]);

// Par (charge depuis AsyncStorage au montage) :
const [favorites, setFavorites] = useState<number[]>([]);

useEffect(() => {
  AsyncStorage.getItem(FAVS_KEY).then((raw) => {
    if (raw) setFavorites(JSON.parse(raw));
  });
}, []);

// Remplacer toggleFav :
function toggleFav(id: number) {
  setFavorites((prev) => {
    const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
    AsyncStorage.setItem(FAVS_KEY, JSON.stringify(next));
    return next;
  });
}
```

---

## C2 — Animation XP au check-in

**Problème :** Appuyer sur "J'y étais" dans `[id].tsx` ne donne aucun retour visuel immédiat (juste le bouton qui devient vert). L'Alert de Dev A arrive après une latence async.

Ajouter une animation "+100 XP" qui flotte depuis le bouton vers le haut, **en complément** de l'Alert de Dev A (ne pas remplacer, juste ajouter).

Dans `app/restaurants/[id].tsx`, ajouter :

```typescript
import { Animated } from 'react-native';
import { useRef, useState } from 'react';

// Dans le composant :
const [showXPFloat, setShowXPFloat] = useState(false);
const floatAnim = useRef(new Animated.Value(0)).current;
const fadeAnim = useRef(new Animated.Value(1)).current;

function triggerXPFloat() {
  setShowXPFloat(true);
  floatAnim.setValue(0);
  fadeAnim.setValue(1);
  Animated.parallel([
    Animated.timing(floatAnim, { toValue: -80, duration: 900, useNativeDriver: true }),
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]),
  ]).start(() => setShowXPFloat(false));
}

// Appeler triggerXPFloat() au début de handleCheckin() (avant l'await) :
async function handleCheckin() {
  if (!user || visited) return;
  triggerXPFloat(); // ← déclencher immédiatement, avant l'await
  const result = await checkIn(...);
  // ...
}
```

Dans le JSX, ajouter juste avant `</View>` (fermeture du container) :

```tsx
{showXPFloat && (
  <Animated.Text
    style={[
      styles.xpFloat,
      {
        opacity: fadeAnim,
        transform: [{ translateY: floatAnim }],
      },
    ]}
  >
    +100 XP
  </Animated.Text>
)}
```

Dans les styles :

```typescript
xpFloat: {
  position: 'absolute',
  bottom: 80,
  alignSelf: 'center',
  fontSize: 28,
  fontWeight: '900',
  color: '#E2231A',
  zIndex: 100,
},
```

---

## C3 — Vérifier et réparer MapSection.web.tsx

**Contexte :** `results.tsx` passe maintenant `filtered` à `MapSection` au lieu de `all`. Vérifier que la version web de la carte gère bien un tableau vide et un tableau qui change.

Ouvrir `components/MapSection.web.tsx` et vérifier :

1. La prop `restaurants` est bien utilisée (et non pas un import direct de `getRestaurants()`)
2. Si `restaurants` est vide, afficher un état vide propre (pas un crash)
3. Si les coordonnées sont `0,0` ou invalides, ne pas planter

Exemple de guard à ajouter si nécessaire :

```typescript
if (!restaurants || restaurants.length === 0) {
  return (
    <View style={styles.emptyMap}>
      <Text style={styles.emptyMapText}>Aucun restaurant à afficher</Text>
    </View>
  );
}
```

---

## C4 — Résultat vide : message contextuel

Dans `app/results.tsx`, le message "Aucun résultat / Essayez d'ajuster vos filtres" est déjà en place mais générique. Le rendre contextuel :

```tsx
// Remplacer le bloc emptyState par :
{filtered.length === 0 && (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>Aucun résultat</Text>
    <Text style={styles.emptySub}>
      {activeFilters.length > 0
        ? 'Essayez de retirer certains filtres'
        : location && location !== 'Près de moi'
          ? `Pas de restaurant Michelin à "${location}" dans notre base`
          : 'Aucun restaurant disponible'}
    </Text>
    {activeFilters.length > 0 && (
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={() => {
          filterStore.set([]);
          setActiveFilters([]);
        }}
      >
        <Text style={styles.resetBtnText}>Effacer les filtres</Text>
      </TouchableOpacity>
    )}
  </View>
)}
```

Ajouter les styles :

```typescript
resetBtn: {
  marginTop: 16,
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: '#E2231A',
},
resetBtnText: {
  color: '#E2231A',
  fontWeight: '600',
  fontSize: 14,
},
```

---

## C — Définition of done

- [ ] Ajouter un favori → relancer l'app → le favori est toujours là
- [ ] Appuyer "J'y étais" → animation "+100 XP" flotte vers le haut immédiatement
- [ ] Filtrer sur une ville sans restos → message clair avec bouton "Effacer les filtres"
- [ ] Ouvrir la version web → la carte s'affiche sans crash même avec 0 résultats
- [ ] `npm run lint` passe

---

---

---

---

# TRACK D — Social (mini track ~1h30)

**Dev D touche :** `app/(tabs)/leaderboard.tsx` (nouveau), `app/(tabs)/_layout.tsx`, `app/(tabs)/profile.tsx`
**Dev D ne touche PAS :** `lib/domain/`, `lib/profile.ts`, `results.tsx`, `restaurants.json`, `search.tsx`

> Track indépendant — zéro conflit avec A, B, C sauf 1 ligne dans `_layout.tsx` et 1 bouton dans `profile.tsx`.

---

## D0 — Seeder de faux profils (10 min, pas de code)

Le leaderboard sera vide si personne d'autre n'a de compte. Avant de coder, aller dans le **Supabase dashboard → Table Editor → profiles** et insérer 8 faux profils manuellement :

| id (uuid) | username | xp | level | badges | visited_restaurants | stats |
|-----------|----------|----|-------|--------|-------------------|-------|
| `aaaaaaaa-0000-0000-0000-000000000001` | `Julie_B` | 2400 | 5 | `["first_star","city_hunter"]` | `[1,2,3]` | `{"totalVisits":3,"bibGourmandVisits":0,"starredVisits":3,"citiesExplored":["Paris","Lyon"],"totalXP":2400}` |
| `aaaaaaaa-0000-0000-0000-000000000002` | `Marc_G` | 1800 | 4 | `["first_star","bib_explorer"]` | `[4,5]` | `{"totalVisits":5,"bibGourmandVisits":5,"starredVisits":0,"citiesExplored":["Paris"],"totalXP":1800}` |
| `aaaaaaaa-0000-0000-0000-000000000003` | `Sophie_L` | 3200 | 7 | `["first_star","city_hunter","gastronome"]` | `[1,2,3,4,5,6,7,8,9,10]` | `{"totalVisits":10,"bibGourmandVisits":2,"starredVisits":8,"citiesExplored":["Paris","Lyon","Bordeaux"],"totalXP":3200}` |

Répéter avec des XP variés (500, 900, 1200, 1600, 2100, 2800) pour avoir un leaderboard réaliste.

> Si Supabase RLS bloque l'insert direct : désactiver temporairement RLS sur `profiles` dans Authentication → Policies, insérer, réactiver.

---

## D1 — Écran Leaderboard

Créer `app/(tabs)/leaderboard.tsx` :

```tsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { supabase, supabaseConfigured } from '../../lib/supabase';

const RED = '#E2231A';
const GOLD = '#FFD700';

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  badges: string[];
}

const MEDAL = ['🥇', '🥈', '🥉'];

const MOCK_ENTRIES: LeaderboardEntry[] = [
  { id: 'mock-1', username: 'Sophie_L', xp: 3200, level: 7, badges: ['first_star', 'city_hunter', 'gastronome'] },
  { id: 'mock-2', username: 'Julie_B',  xp: 2400, level: 5, badges: ['first_star', 'city_hunter'] },
  { id: 'mock-3', username: 'Thomas_R', xp: 2100, level: 5, badges: ['first_star', 'trend_seeker'] },
  { id: 'mock-4', username: 'Marc_G',   xp: 1800, level: 4, badges: ['first_star', 'bib_explorer'] },
  { id: 'mock-5', username: 'Léa_M',    xp: 1600, level: 4, badges: ['first_star'] },
  { id: 'mock-6', username: 'Hugo_D',   xp: 1200, level: 3, badges: ['first_star'] },
  { id: 'mock-7', username: 'Clara_V',  xp: 900,  level: 2, badges: [] },
  { id: 'mock-8', username: 'Romain_P', xp: 500,  level: 1, badges: [] },
];

export default function LeaderboardScreen() {
  const { authUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabaseConfigured) {
        // Fallback local pour la démo si Supabase non configuré ou seed raté
        setEntries(MOCK_ENTRIES);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, username, xp, level, badges')
        .order('xp', { ascending: false })
        .limit(20);
      // Si Supabase répond mais vide (seed pas fait), fallback mock
      setEntries(data && data.length > 0 ? (data as LeaderboardEntry[]) : MOCK_ENTRIES);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Classement</Text>
        <Text style={styles.headerSub}>Top explorateurs Michelin</Text>
      </View>

      {loading && <ActivityIndicator color={RED} style={{ marginTop: 40 }} />}

      {entries.map((entry, i) => {
        const isMe = entry.id === authUser?.id;
        return (
          <View key={entry.id} style={[styles.row, isMe && styles.rowMe, i === 0 && styles.rowFirst]}>
            <Text style={[styles.rank, i < 3 && styles.rankMedal]}>
              {i < 3 ? MEDAL[i] : `${i + 1}`}
            </Text>
            <View style={styles.info}>
              <Text style={[styles.username, isMe && styles.usernameMe]}>
                {entry.username}{isMe ? ' (moi)' : ''}
              </Text>
              <Text style={styles.level}>Niveau {entry.level} · {entry.badges.length} badge{entry.badges.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.xpWrap}>
              <Text style={[styles.xp, i === 0 && styles.xpFirst]}>{entry.xp.toLocaleString()}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: '#1A1A1A',
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: GOLD, letterSpacing: 1 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  rowFirst: { borderWidth: 1.5, borderColor: GOLD },
  rowMe: { borderWidth: 1.5, borderColor: RED },
  rank: { fontSize: 16, fontWeight: '700', color: '#9B9B9B', minWidth: 28, textAlign: 'center' },
  rankMedal: { fontSize: 22 },
  info: { flex: 1 },
  username: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  usernameMe: { color: RED },
  level: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  xpWrap: { alignItems: 'flex-end' },
  xp: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  xpFirst: { color: GOLD },
  xpLabel: { fontSize: 11, color: '#9B9B9B' },
});
```

---

## D2 — Ajouter le tab Leaderboard dans `_layout.tsx`

Dans `app/(tabs)/_layout.tsx`, ajouter un `<Tabs.Screen>` pour le leaderboard :

```tsx
<Tabs.Screen
  name="leaderboard"
  options={{
    title: 'Classement',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="trophy-outline" size={size} color={color} />
    ),
  }}
/>
```

> Placer ce tab après "Profil" dans l'ordre.

---

## D3 — Bouton "Partager" sur les badges dans `profile.tsx`

**Objectif :** Quand un badge est débloqué, permettre à l'user de le partager via le share sheet natif.

Dans `app/(tabs)/profile.tsx`, ajouter l'import :

```typescript
import { Share } from 'react-native';
```

Ajouter la fonction de partage dans le composant :

```typescript
async function handleShareBadge(badgeName: string, badgeIcon: string) {
  await Share.share({
    message: `${badgeIcon} Je viens de débloquer le badge "${badgeName}" sur Michelin Quest ! Rejoins-moi pour explorer les meilleures tables Michelin 🍽️`,
    title: 'Michelin Quest',
  });
}
```

Dans le rendu des badges, wrapper `BadgeCard` dans un `TouchableOpacity` conditionnel (seulement si le badge est débloqué) :

```tsx
{ALL_BADGES.map((b) => {
  const unlocked = b.check(user);
  return unlocked ? (
    <TouchableOpacity key={b.id} onPress={() => handleShareBadge(b.name, b.icon)}>
      <BadgeCard icon={b.icon} name={b.name} description={b.description} unlocked />
    </TouchableOpacity>
  ) : (
    <BadgeCard key={b.id} icon={b.icon} name={b.name} description={b.description} unlocked={false} />
  );
})}
```

---

## D4 — Activité récente (bonus, ~20 min)

Si le temps le permet : ajouter une section "Activité récente" en bas du leaderboard avec des événements mockés. Très visible en démo, peu coûteux.

Ajouter ce bloc après la liste du leaderboard dans le JSX :

```tsx
const RECENT_ACTIVITY = [
  { user: 'Sophie_L', action: 'a visité', place: 'Le Grand Véfour', time: 'il y a 2h', icon: '⭐⭐' },
  { user: 'Julie_B',  action: 'a débloqué', place: 'Badge City Hunter', time: 'il y a 5h', icon: '🏙️' },
  { user: 'Marc_G',   action: 'a visité', place: 'Bouillon Chartier', time: 'hier', icon: '😊' },
  { user: 'Thomas_R', action: 'a visité', place: 'Septime', time: 'hier', icon: '⭐' },
];

// Dans le JSX, après la liste des entries :
<Text style={styles.sectionTitle}>Activité récente</Text>
{RECENT_ACTIVITY.map((a, i) => (
  <View key={i} style={styles.activityRow}>
    <Text style={styles.activityIcon}>{a.icon}</Text>
    <Text style={styles.activityText}>
      <Text style={styles.activityUser}>{a.user}</Text>
      {` ${a.action} `}
      <Text style={styles.activityPlace}>{a.place}</Text>
    </Text>
    <Text style={styles.activityTime}>{a.time}</Text>
  </View>
))}
```

Styles à ajouter :

```typescript
sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginHorizontal: 16, marginTop: 24, marginBottom: 8 },
activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF' },
activityIcon: { fontSize: 18, width: 28, textAlign: 'center' },
activityText: { flex: 1, fontSize: 13, color: '#4B5563' },
activityUser: { fontWeight: '700', color: '#1A1A1A' },
activityPlace: { fontWeight: '600', color: '#E2231A' },
activityTime: { fontSize: 11, color: '#9B9B9B' },
```

---

## D — Définition of done

- [ ] Onglet "Classement" visible dans la navigation
- [ ] Leaderboard affiche 8 profils même sans Supabase (mock fallback)
- [ ] Si Supabase est configuré et seedé → données réelles, profil connecté mis en évidence
- [ ] L'utilisateur connecté est mis en évidence (bordure rouge + "(moi)")
- [ ] Top 3 avec médailles 🥇🥈🥉, 1er avec bordure or
- [ ] Badge débloqué → tap → share sheet natif s'ouvre
- [ ] (Bonus) Section "Activité récente" visible en bas du leaderboard
- [ ] `npm run lint` passe

---

## Merge order recommandé

```
Track D (fichiers majoritairement indépendants : leaderboard.tsx nouveau, 1 ligne _layout.tsx, 1 bouton profile.tsx)
  ↓ merge en premier — leaderboard.tsx + 1 ligne _layout.tsx, aucun risque

Track B (filters.ts + restaurants.json + search.tsx + results.tsx partiel)
  ↓ merge en second — filterStore persistence doit exister avant que A ou C ne s'en servent

Track A (profile.ts + [id].tsx logique + types/index.ts)
  ↓ merge en troisième — CheckInResult doit être dans types avant que C merge

Track C (results.tsx + [id].tsx animation + MapSection.web.tsx)
  ↓ merge en dernier
  → Conflit probable sur [id].tsx avec A : garder les deux blocs (handleCheckin de A + animation de C)
  → Conflit probable sur results.tsx avec B : garder le useEffect filterStore.load de B
```

## Points de coordination obligatoires

| Qui | Quoi | Quand |
|-----|------|-------|
| Dev B + Dev C | `applyFilters` accepte `userCoords` en 4e param (B5) → Dev C met à jour l'appel dans `results.tsx` | Avant merge de C |
| Dev A + Dev C | `[id].tsx` : A touche `handleCheckin()` et types, C touche animation et styles | Merger proprement — ne pas écraser |
| Dev A | Signature `checkIn()` change : retourne `CheckInResult` au lieu de `User` — annoncer aux autres avant de merger | Avant merge de A |
| Dev B + Dev C | `results.tsx` : B ajoute `filterStore.load()`, C ajoute favoris/empty state — sections séparées, pas de winner | Merger les deux blocs |
| Dev D | `profile.tsx` bouton share : aucun autre track ne touche ce fichier, merge sans contrainte | N'importe quand |