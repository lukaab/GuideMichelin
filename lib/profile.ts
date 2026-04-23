import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BADGES } from './domain/gamification';
import { supabase, supabaseConfigured } from './supabase';
import { CheckInResult, User, UserStats } from '../types';

const PROFILE_PREFIX = '@michelin_profile_';

function xpToLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpProgressInLevel(xp: number): number {
  return (xp % 500) / 500;
}

function defaultUser(id: string, username: string): User {
  return {
    id,
    username,
    xp: 0,
    level: 1,
    badges: [],
    visitedRestaurants: [],
    stats: {
      totalVisits: 0,
      bibGourmandVisits: 0,
      starredVisits: 0,
      citiesExplored: [],
      totalXP: 0,
    },
  };
}

export async function loadProfile(userId: string, username = ''): Promise<User> {
  if (supabaseConfigured) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      return {
        id: userId,
        username: data.username ?? username,
        xp: data.xp ?? 0,
        level: data.level ?? 1,
        badges: data.badges ?? [],
        visitedRestaurants: data.visited_restaurants ?? [],
        stats: data.stats ?? {
          totalVisits: 0,
          bibGourmandVisits: 0,
          starredVisits: 0,
          citiesExplored: [],
          totalXP: 0,
        },
      };
    }
  }
  const key = PROFILE_PREFIX + userId;
  const raw = await AsyncStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  const user = defaultUser(userId, username);
  await AsyncStorage.setItem(key, JSON.stringify(user));
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
  const key = PROFILE_PREFIX + user.id;
  await AsyncStorage.setItem(key, JSON.stringify(user));
}

const CHALLENGE_REWARDS: Array<{
  id: string;
  xp: number;
  crossed: (prev: UserStats, next: UserStats) => boolean;
}> = [
  { id: 'first_visit', xp: 200, crossed: (p, n) => p.totalVisits < 1 && n.totalVisits >= 1 },
  { id: 'bib_5', xp: 500, crossed: (p, n) => p.bibGourmandVisits < 5 && n.bibGourmandVisits >= 5 },
  { id: 'three_cities', xp: 400, crossed: (p, n) => p.citiesExplored.length < 3 && n.citiesExplored.length >= 3 },
  { id: 'starred_3', xp: 600, crossed: (p, n) => p.starredVisits < 3 && n.starredVisits >= 3 },
  { id: 'total_10', xp: 1000, crossed: (p, n) => p.totalVisits < 10 && n.totalVisits >= 10 },
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

  const completedChallenges = CHALLENGE_REWARDS.filter((r) => r.crossed(user.stats, newStats)).map(
    (r) => r.id,
  );
  const bonusXP = CHALLENGE_REWARDS.filter((r) => r.crossed(user.stats, newStats)).reduce(
    (sum, r) => sum + r.xp,
    0,
  );
  const totalXPGained = baseXP + bonusXP;
  const newXP = user.xp + totalXPGained;

  const userWithNewStats = { ...user, stats: newStats, xp: newXP };
  const unlockedBadges = ALL_BADGES.filter(
    (b) => !user.badges.includes(b.id) && b.check(userWithNewStats),
  ).map((b) => b.id);

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
