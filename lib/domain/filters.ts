import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant } from '../../types';

export const FILTER_DEFINITIONS = [
  { id: 'vegan',       label: '🌿 Végétalien' },
  { id: 'halal',       label: '🌶️ Halal' },
  { id: 'kosher',      label: '✡️ Casher' },
  { id: 'gluten_free', label: '🌾 Sans gluten' },
  { id: 'one_star',    label: '⭐ 1 étoile' },
  { id: 'two_stars',   label: '⭐⭐ 2 étoiles' },
  { id: 'three_stars', label: '⭐⭐⭐ 3 étoiles' },
  { id: 'bib_gourmand',label: '😊 Bib Gourmand' },
  { id: 'price_low',   label: '€ Petit budget' },
  { id: 'price_mid',   label: '€€ Accessible' },
  { id: 'price_high',  label: '€€€ Gastronomique' },
  { id: 'price_luxury',label: '€€€€ Prestige' },
  { id: 'romantic',    label: '🕯️ Romantique' },
  { id: 'lively',      label: '👥 Animé' },
  { id: 'calm',        label: '🌿 Calme' },
  { id: 'terrace',     label: '🌿 Terrasse' },
  { id: 'wine_bar',    label: '🍷 Bar à vins' },
  { id: 'wheelchair',  label: '♿ Accès PMR' },
  { id: 'pets',        label: '🐾 Animaux acceptés' },
  { id: 'kids',        label: '👶 Enfants bienvenus' },
] as const;

export type FilterId = (typeof FILTER_DEFINITIONS)[number]['id'];

const CATEGORY_FILTER_MAP: Partial<Record<FilterId, Restaurant['category']>> = {
  one_star:    'Une étoile',
  two_stars:   'Deux étoiles',
  three_stars: 'Trois étoiles',
  bib_gourmand:'Bib Gourmand',
};

const PRICE_FILTER_MAP: Partial<Record<FilterId, string>> = {
  price_low:    '€',
  price_mid:    '€€',
  price_high:   '€€€',
  price_luxury: '€€€€',
};

const FEATURE_FILTER_MAP: Partial<Record<FilterId, string>> = {
  romantic:   'romantique',
  lively:     'anime',
  calm:       'calme',
  terrace:    'terrasse',
  wine_bar:   'bar-a-vins',
  wheelchair: 'pmr',
  pets:       'animaux',
  kids:       'enfants',
};

const DIETARY_FILTER_MAP: Partial<Record<FilterId, string>> = {
  vegan:       'vegan',
  halal:       'halal',
  kosher:      'casher',
  gluten_free: 'sans-gluten',
};

const FILTER_KEY = '@michelin_filters';

export const filterStore = {
  active: [] as string[],

  async load() {
    try {
      const raw = await AsyncStorage.getItem(FILTER_KEY);
      if (raw) this.active = JSON.parse(raw);
    } catch (_e) {}
  },

  async set(filters: string[]) {
    this.active = filters;
    try {
      await AsyncStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    } catch (_e) {}
  },
};

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export function applyFilters(
  restaurants: Restaurant[],
  location: string,
  activeFilterIds: string[],
  userCoords?: { lat: number; lng: number },
): Restaurant[] {
  let result = restaurants;

  if (location === 'Près de moi' && userCoords) {
    result = result
      .map((r) => ({ ...r, _dist: haversineKm(userCoords.lat, userCoords.lng, r.lat, r.lng) }))
      .filter((r) => r._dist <= 50)
      .sort((a, b) => a._dist - b._dist)
      .map(({ _dist: _d, ...r }) => r);
  } else if (location && location !== 'Près de moi') {
    const loc = location.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.city.toLowerCase().includes(loc) ||
        r.name.toLowerCase().includes(loc) ||
        r.cuisine.toLowerCase().includes(loc),
    );
  }

  const categoryFilters = activeFilterIds
    .map((id) => CATEGORY_FILTER_MAP[id as FilterId])
    .filter((c): c is Restaurant['category'] => Boolean(c));
  if (categoryFilters.length > 0) {
    result = result.filter((r) => categoryFilters.includes(r.category));
  }

  const priceFilters = activeFilterIds
    .map((id) => PRICE_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];
  if (priceFilters.length > 0) {
    result = result.filter((r) => priceFilters.includes(r.priceRange));
  }

  const featureFilters = activeFilterIds
    .map((id) => FEATURE_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];
  if (featureFilters.length > 0) {
    result = result.filter((r) => featureFilters.every((f) => r.features?.includes(f)));
  }

  const dietaryFilters = activeFilterIds
    .map((id) => DIETARY_FILTER_MAP[id as FilterId])
    .filter(Boolean) as string[];
  if (dietaryFilters.length > 0) {
    result = result.filter((r) => dietaryFilters.every((d) => r.dietary?.includes(d)));
  }

  return result;
}
