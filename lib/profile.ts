import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseConfigured } from './supabase';
import { User, UserStats } from '../types';

const cacheKey = (userId: string) => `@michelin_profile_${userId}`;

const DEFAULT_STATS: UserStats = {
  totalVisits: 0,
  bibGourmandVisits: 0,
  starredVisits: 0,
  citiesExplored: [],
  totalXP: 0,
};

function defaultUser(userId: string, username = 'Explorer'): User {
  return { id: userId, username, xp: 0, level: 1, badges: [], visitedRestaurants: [], stats: DEFAULT_STATS };
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpProgressInLevel(xp: number): number {
  return (xp % 500) / 500;
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    xp: (row.xp as number) ?? 0,
    level: (row.level as number) ?? 1,
    badges: (row.badges as string[]) ?? [],
    visitedRestaurants: (row.visited_restaurants as number[]) ?? [],
    stats: (row.stats as UserStats) ?? DEFAULT_STATS,
  };
}

export async function loadProfile(userId: string, username?: string): Promise<User> {
  if (supabaseConfigured) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      const user = rowToUser(data);
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(user));
      return user;
    }
  }

  // Local cache (used in local mode OR as Supabase fallback)
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}

  const user = defaultUser(userId, username);
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(user));
  return user;
}

export async function saveProfile(user: User): Promise<void> {
  await AsyncStorage.setItem(cacheKey(user.id), JSON.stringify(user));

  if (supabaseConfigured) {
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      visited_restaurants: user.visitedRestaurants,
      badges: user.badges,
      stats: user.stats,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function checkIn(
  user: User,
  restaurantId: number,
  category: string,
  city: string,
): Promise<User> {
  if (user.visitedRestaurants.includes(restaurantId)) return user;

  const xpGain = 100;
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

  await saveProfile(updated);
  return updated;
}
