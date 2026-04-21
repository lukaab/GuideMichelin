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
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: (stats: UserStats) => boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  deadline?: string;
  completed: boolean;
}

export interface UserStats {
  totalVisits: number;
  bibGourmandVisits: number;
  starredVisits: number;
  citiesExplored: string[];
  totalXP: number;
}

export interface User {
  id: string;
  username: string;
  xp: number;
  level: number;
  badges: string[];
  visitedRestaurants: number[];
  stats: UserStats;
}
