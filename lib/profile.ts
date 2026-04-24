import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BADGES } from './domain/gamification';
import { supabase, supabaseConfigured } from './supabase';
import { CheckInResult, User, UserStats } from '../types';

const PROFILE_PREFIX = '@michelin_profile_';

const DEFAULT_STATS: UserStats = {
  totalVisits: 0,
  bibGourmandVisits: 0,
  starredVisits: 0,
  citiesExplored: [],
  totalXP: 0,
};

const CHALLENGE_REWARDS: Array<{
  id: string;
  xp: number;
  crossed: (prev: UserStats, next: UserStats) => boolean;
}> = [
  { id: 'first_visit', xp: 200, crossed: (p, n) => p.totalVisits < 1 && n.totalVisits >= 1 },
  { id: 'bib_5', xp: 500, crossed: (p, n) => p.bibGourmandVisits < 5 && n.bibGourmandVisits >= 5 },
  {
    id: 'three_cities',
    xp: 400,
    crossed: (p, n) => p.citiesExplored.length < 3 && n.citiesExplored.length >= 3,
  },
  { id: 'starred_3', xp: 600, crossed: (p, n) => p.starredVisits < 3 && n.starredVisits >= 3 },
  { id: 'total_10', xp: 1000, crossed: (p, n) => p.totalVisits < 10 && n.totalVisits >= 10 },
];

function defaultUser(id: string, username = 'Explorer'): User {
  return {
    id,
    username,
    xp: 0,
    level: 1,
    badges: [],
    visitedRestaurants: [],
    stats: DEFAULT_STATS,
  };
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpProgressInLevel(xp: number): number {
  return (xp % 500) / 500;
}

function rowToUser(row: Record<string, unknown>, fallbackUsername = 'Explorer'): User {
  return {
    id: row.id as string,
    username: (row.username as string) ?? fallbackUsername,
    xp: (row.xp as number) ?? 0,
    level: (row.level as number) ?? 1,
    badges: (row.badges as string[]) ?? [],
    visitedRestaurants: (row.visited_restaurants as number[]) ?? [],
    stats: (row.stats as UserStats) ?? DEFAULT_STATS,
  };
}

export async function loadProfile(userId: string, username = 'Explorer'): Promise<User> {
  if (supabaseConfigured) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      const user = rowToUser(data, username);
      await AsyncStorage.setItem(PROFILE_PREFIX + userId, JSON.stringify(user));
      return user;
    }
  }

  try {
    const raw = await AsyncStorage.getItem(PROFILE_PREFIX + userId);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore corrupted local cache and rebuild from defaults.
  }

  const user = defaultUser(userId, username);
  await AsyncStorage.setItem(PROFILE_PREFIX + userId, JSON.stringify(user));
  return user;
}

export async function saveProfile(user: User): Promise<void> {
  if (supabaseConfigured) {
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      badges: user.badges,
      visited_restaurants: user.visitedRestaurants,
      stats: user.stats,
      updated_at: new Date().toISOString(),
    });
  }

  await AsyncStorage.setItem(PROFILE_PREFIX + user.id, JSON.stringify(user));
}

export async function checkIn(
  user: User,
  restaurantId: number,
  category: string,
  city: string
): Promise<CheckInResult> {
  if (user.visitedRestaurants.includes(restaurantId)) {
    return { user, xpGained: 0, completedChallenges: [], unlockedBadges: [] };
  }

  const baseXP = 100;
  const newStats: UserStats = {
    ...user.stats,
    totalVisits: user.stats.totalVisits + 1,
    bibGourmandVisits:
      category === 'Bib Gourmand'
        ? user.stats.bibGourmandVisits + 1
        : user.stats.bibGourmandVisits,
    starredVisits:
      category !== 'Bib Gourmand' ? user.stats.starredVisits + 1 : user.stats.starredVisits,
    citiesExplored: user.stats.citiesExplored.includes(city)
      ? user.stats.citiesExplored
      : [...user.stats.citiesExplored, city],
    totalXP: user.stats.totalXP + baseXP,
  };

  const completedChallenges = CHALLENGE_REWARDS.filter((reward) =>
    reward.crossed(user.stats, newStats)
  ).map((reward) => reward.id);

  const bonusXP = CHALLENGE_REWARDS.filter((reward) => reward.crossed(user.stats, newStats)).reduce(
    (sum, reward) => sum + reward.xp,
    0
  );

  const totalXPGained = baseXP + bonusXP;
  const newXP = user.xp + totalXPGained;

  const userWithNewStats: User = {
    ...user,
    xp: newXP,
    stats: newStats,
  };

  const unlockedBadges = ALL_BADGES.filter(
    (badge) => !user.badges.includes(badge.id) && badge.check(userWithNewStats)
  ).map((badge) => badge.id);

  const updated: User = {
    ...user,
    xp: newXP,
    level: xpToLevel(newXP),
    badges: [...user.badges, ...unlockedBadges],
    visitedRestaurants: [...user.visitedRestaurants, restaurantId],
    stats: {
      ...newStats,
      totalXP: newStats.totalXP + bonusXP,
    },
  };

  await saveProfile(updated);
  return {
    user: updated,
    xpGained: totalXPGained,
    completedChallenges,
    unlockedBadges,
  };
}
