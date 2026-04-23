import { Restaurant } from '../../types';

export const FILTER_DEFINITIONS = [
  { id: 'vegan', label: '🌿 Végétalien' },
  { id: 'halal', label: '🌶️ Halal' },
  { id: 'kosher', label: '✡️ Casher' },
  { id: 'gluten_free', label: '🌾 Sans gluten' },
  { id: 'one_star', label: '⭐ 1 étoile' },
  { id: 'two_stars', label: '⭐⭐ 2 étoiles' },
  { id: 'three_stars', label: '⭐⭐⭐ 3 étoiles' },
  { id: 'bib_gourmand', label: '😊 Bib Gourmand' },
  { id: 'romantic', label: '🕯️ Romantique' },
  { id: 'lively', label: '👥 Animé' },
  { id: 'calm', label: '🌿 Calme' },
  { id: 'terrace', label: '🌿 Terrasse' },
  { id: 'wine_bar', label: '🍷 Bar à vins' },
  { id: 'wheelchair', label: '♿ Accès PMR' },
  { id: 'pets', label: '🐾 Animaux acceptés' },
  { id: 'kids', label: '👶 Enfants bienvenus' },
] as const;

export type FilterId = (typeof FILTER_DEFINITIONS)[number]['id'];

const CATEGORY_FILTER_MAP: Partial<Record<FilterId, Restaurant['category']>> = {
  one_star: 'Une étoile',
  two_stars: 'Deux étoiles',
  three_stars: 'Trois étoiles',
  bib_gourmand: 'Bib Gourmand',
};

export const filterStore = {
  active: [] as string[],
};

export function applyFilters(
  restaurants: Restaurant[],
  location: string,
  activeFilterIds: string[],
): Restaurant[] {
  let result = restaurants;

  if (location && location !== 'Près de moi') {
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

  return result;
}
