import { Challenge, User } from '../../types';

export function getLevelTitle(level: number): string {
  if (level < 3) return 'Curieux Gourmet';
  if (level < 6) return 'Explorateur Gastronomique';
  if (level < 10) return "Chasseur d'Étoiles";
  return 'Grand Maître Michelin';
}

export const ALL_BADGES = [
  {
    id: 'first_star',
    name: 'First Star',
    icon: '⭐',
    description: 'Premier restaurant étoilé',
    check: (u: User) => u.stats.starredVisits >= 1,
  },
  {
    id: 'bib_explorer',
    name: 'Bib Explorer',
    icon: '😊',
    description: '5 Bib Gourmand testés',
    check: (u: User) => u.stats.bibGourmandVisits >= 5,
  },
  {
    id: 'city_hunter',
    name: 'City Hunter',
    icon: '🏙️',
    description: '3 villes explorées',
    check: (u: User) => u.stats.citiesExplored.length >= 3,
  },
  {
    id: 'trend_seeker',
    name: 'Trend Seeker',
    icon: '🔥',
    description: '3 restaurants visités',
    check: (u: User) => u.stats.totalVisits >= 3,
  },
  {
    id: 'gastronome',
    name: 'Gastronome',
    icon: '👨‍🍳',
    description: '10 restaurants visités',
    check: (u: User) => u.stats.totalVisits >= 10,
  },
  {
    id: 'triple_star',
    name: 'Triple Star',
    icon: '🌟',
    description: '3 restaurants étoilés visités',
    check: (u: User) => u.stats.starredVisits >= 3,
  },
];

export function buildChallenges(user: User): Challenge[] {
  return [
    {
      id: 'first_visit',
      title: 'Premier Pas',
      description: 'Visitez votre premier restaurant Michelin',
      target: 1,
      current: Math.min(user.stats.totalVisits, 1),
      xpReward: 200,
      completed: user.stats.totalVisits >= 1,
    },
    {
      id: 'bib_5',
      title: 'Bib Explorer',
      description: 'Testez 5 Bib Gourmand',
      target: 5,
      current: Math.min(user.stats.bibGourmandVisits, 5),
      xpReward: 500,
      completed: user.stats.bibGourmandVisits >= 5,
    },
    {
      id: 'three_cities',
      title: 'City Hunter',
      description: 'Explorez des restaurants dans 3 villes différentes',
      target: 3,
      current: Math.min(user.stats.citiesExplored.length, 3),
      xpReward: 400,
      completed: user.stats.citiesExplored.length >= 3,
    },
    {
      id: 'starred_3',
      title: 'Star Chaser',
      description: 'Visitez 3 restaurants étoilés',
      target: 3,
      current: Math.min(user.stats.starredVisits, 3),
      xpReward: 600,
      completed: user.stats.starredVisits >= 3,
    },
    {
      id: 'total_10',
      title: 'Gastronome Confirmé',
      description: 'Atteignez 10 visites au total',
      target: 10,
      current: Math.min(user.stats.totalVisits, 10),
      xpReward: 1000,
      completed: user.stats.totalVisits >= 10,
    },
  ];
}
