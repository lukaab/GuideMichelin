import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserStats } from '../types';

const USER_KEY = '@michelin_quest_user';

const DEFAULT_STATS: UserStats = {
  totalVisits: 0,
  bibGourmandVisits: 0,
  starredVisits: 0,
  citiesExplored: [],
  totalXP: 0,
};

const DEFAULT_USER: User = {
  id: '1',
  username: 'Explorer',
  xp: 0,
  level: 1,
  badges: [],
  visitedRestaurants: [],
  stats: DEFAULT_STATS,
};

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpProgressInLevel(xp: number): number {
  return (xp % 500) / 500;
}

export async function loadUser(): Promise<User> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function checkInRestaurant(
  user: User,
  restaurantId: number,
  category: string,
  city: string,
  xpGain = 100
): Promise<User> {
  if (user.visitedRestaurants.includes(restaurantId)) return user;

  const newStats: UserStats = {
    ...user.stats,
    totalVisits: user.stats.totalVisits + 1,
    bibGourmandVisits:
      category === 'Bib Gourmand'
        ? user.stats.bibGourmandVisits + 1
        : user.stats.bibGourmandVisits,
    starredVisits:
      category !== 'Bib Gourmand'
        ? user.stats.starredVisits + 1
        : user.stats.starredVisits,
    citiesExplored: user.stats.citiesExplored.includes(city)
      ? user.stats.citiesExplored
      : [...user.stats.citiesExplored, city],
    totalXP: user.stats.totalXP + xpGain,
  };

  const newXP = user.xp + xpGain;
  const updated: User = {
    ...user,
    xp: newXP,
    level: xpToLevel(newXP),
    visitedRestaurants: [...user.visitedRestaurants, restaurantId],
    stats: newStats,
  };

  await saveUser(updated);
  return updated;
}
