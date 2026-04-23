import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BadgeCard from '../../components/BadgeCard';
import ProgressBar from '../../components/ProgressBar';
import rawRestaurants from '../../data/restaurants.json';
import { useAuth } from '../../lib/auth';
import { loadProfile, xpProgressInLevel } from '../../lib/profile';
import { Restaurant, User } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const RED = '#E2231A';

const ALL_BADGES = [
  { id: 'first_star', name: 'First Star', icon: '⭐', description: 'Premier restaurant étoilé', check: (u: User) => u.stats.starredVisits >= 1 },
  { id: 'bib_explorer', name: 'Bib Explorer', icon: '😊', description: '5 Bib Gourmand testés', check: (u: User) => u.stats.bibGourmandVisits >= 5 },
  { id: 'city_hunter', name: 'City Hunter', icon: '🏙️', description: '3 villes explorées', check: (u: User) => u.stats.citiesExplored.length >= 3 },
  { id: 'trend_seeker', name: 'Trend Seeker', icon: '🔥', description: '3 restaurants visités', check: (u: User) => u.stats.totalVisits >= 3 },
  { id: 'gastronome', name: 'Gastronome', icon: '👨‍🍳', description: '10 restaurants visités', check: (u: User) => u.stats.totalVisits >= 10 },
  { id: 'triple_star', name: 'Triple Star', icon: '🌟', description: '1 restaurant 3 étoiles', check: (u: User) => u.stats.starredVisits >= 1 },
];

const CHALLENGES = [
  { id: 'first_visit', title: 'Premier Pas', desc: 'Visitez votre premier restaurant Michelin', target: 1, getValue: (u: User) => u.stats.totalVisits, xp: 200 },
  { id: 'bib_5', title: 'Bib Explorer', desc: 'Testez 5 Bib Gourmand', target: 5, getValue: (u: User) => u.stats.bibGourmandVisits, xp: 500 },
  { id: 'three_cities', title: 'City Hunter', desc: '3 villes différentes', target: 3, getValue: (u: User) => u.stats.citiesExplored.length, xp: 400 },
  { id: 'starred_3', title: 'Star Chaser', desc: 'Visitez 3 restaurants étoilés', target: 3, getValue: (u: User) => u.stats.starredVisits, xp: 600 },
  { id: 'total_10', title: 'Gastronome', desc: '10 visites au total', target: 10, getValue: (u: User) => u.stats.totalVisits, xp: 1000 },
];

function getLevelTitle(level: number) {
  if (level < 3) return 'Curieux Gourmet';
  if (level < 6) return 'Explorateur Gastronomique';
  if (level < 10) return "Chasseur d'Étoiles";
  return 'Grand Maître Michelin';
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐',
  'Deux étoiles': '⭐⭐',
  'Une étoile': '⭐',
  'Bib Gourmand': '😊',
};

export default function ProfileScreen() {
  const { authUser, signOut } = useAuth();
  const { isDesktop } = useBreakpoint();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) loadProfile(authUser.id, authUser.username).then(setUser);
  }, [authUser]);

  function handleSignOut() {
    Alert.alert('Déconnexion', 'Votre progression est sauvegardée. À bientôt !', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!user) return null;

  const xpProgress = xpProgressInLevel(user.xp);
  const xpInLevel = user.xp % 500;
  const visited = (rawRestaurants as Restaurant[]).filter((r) =>
    user.visitedRestaurants.includes(r.id),
  );

  return (
    <ScrollView
      style={[styles.container, isDesktop && styles.containerDesktop]}
      contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Profil</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutIcon}>
          <Ionicons name="log-out-outline" size={22} color="#9B9B9B" />
        </TouchableOpacity>
      </View>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarEmoji}>🍽️</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Niveau {user.level}</Text>
        </View>

        <View style={styles.xpBarWrap}>
          <View style={styles.xpBarRow}>
            <Text style={styles.xpLabel}>⭐ {user.xp} XP</Text>
            <Text style={styles.xpNext}>{500 - xpInLevel} XP → niv. {user.level + 1}</Text>
          </View>
          <ProgressBar progress={xpProgress} color={RED} height={8} />
        </View>
      </View>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          { label: 'Visites', value: user.stats.totalVisits },
          { label: 'Étoilés', value: user.stats.starredVisits },
          { label: 'Bib Gourmand', value: user.stats.bibGourmandVisits },
          { label: 'Villes', value: user.stats.citiesExplored.length },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Badges ───────────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Mes Badges</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.badgesScroll}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {ALL_BADGES.map((b) => (
          <BadgeCard
            key={b.id}
            icon={b.icon}
            name={b.name}
            description={b.description}
            unlocked={b.check(user)}
          />
        ))}
      </ScrollView>

      {/* ── Challenges ───────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Challenges</Text>
      <View style={styles.challengesList}>
        {CHALLENGES.map((c) => {
          const current = Math.min(c.getValue(user), c.target);
          const done = current >= c.target;
          return (
            <View key={c.id} style={[styles.challengeCard, done && styles.challengeDone]}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{c.title}</Text>
                <View style={[styles.xpTag, done && styles.xpTagDone]}>
                  <Text style={[styles.xpTagText, done && styles.xpTagTextDone]}>+{c.xp} XP</Text>
                </View>
              </View>
              <Text style={styles.challengeDesc}>{c.desc}</Text>
              <View style={styles.challengeProgress}>
                <View style={{ flex: 1 }}>
                  <ProgressBar progress={current / c.target} color={done ? '#10B981' : RED} height={6} />
                </View>
                <Text style={styles.challengeCount}>{current}/{c.target}</Text>
              </View>
              {done && <Text style={styles.doneLabel}>✓ Complété</Text>}
            </View>
          );
        })}
      </View>

      {/* ── Food Passport ─────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Food Passport</Text>
      <View style={styles.passportCard}>
        <Text style={styles.passportTitle}>MICHELIN QUEST</Text>
        <Text style={styles.passportSub}>PASSPORT GASTRONOMIQUE</Text>
        <View style={styles.passportDivider} />
        <Text style={styles.passportUser}>{user.username}</Text>
        <ProgressBar
          progress={user.stats.totalVisits / (rawRestaurants as Restaurant[]).length}
          color="#FFD700"
          height={6}
        />
        <Text style={styles.passportCount}>
          {user.stats.totalVisits} / {(rawRestaurants as Restaurant[]).length} restaurants visités
        </Text>
      </View>

      {visited.length > 0 && (
        <>
          <Text style={styles.subSectionTitle}>{visited.length} restaurant{visited.length > 1 ? 's' : ''} visité{visited.length > 1 ? 's' : ''}</Text>
          {visited.map((r) => (
            <View key={r.id} style={styles.visitedRow}>
              <Text style={styles.visitedEmoji}>{CATEGORY_EMOJI[r.category]}</Text>
              <View style={styles.visitedInfo}>
                <Text style={styles.visitedName}>{r.name}</Text>
                <Text style={styles.visitedMeta}>{r.city} · {r.priceRange}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDesktop: {},
  content: {
    paddingBottom: 48,
  },
  contentDesktop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 32,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  signOutIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero
  heroCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: RED,
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 16,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  xpBarWrap: {
    width: '100%',
  },
  xpBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  xpNext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: RED,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9B9B9B',
    textAlign: 'center',
  },
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  // Badges
  badgesScroll: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  // Challenges
  challengesList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  challengeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  challengeDone: {
    borderLeftColor: '#10B981',
    opacity: 0.8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  xpTag: {
    backgroundColor: '#FFF0E0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  xpTagDone: {
    backgroundColor: '#ECFDF5',
  },
  xpTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  xpTagTextDone: {
    color: '#065F46',
  },
  challengeDesc: {
    fontSize: 12,
    color: '#9B9B9B',
    marginBottom: 10,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  challengeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 28,
    textAlign: 'right',
  },
  doneLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 6,
  },
  // Passport
  passportCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  passportTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 4,
    marginBottom: 4,
  },
  passportSub: {
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 2,
    marginBottom: 14,
  },
  passportDivider: {
    width: 48,
    height: 1,
    backgroundColor: '#FFD700',
    marginBottom: 14,
  },
  passportUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  passportCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  // Visited restaurants
  visitedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  visitedEmoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  visitedInfo: {
    flex: 1,
  },
  visitedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  visitedMeta: {
    fontSize: 12,
    color: '#9B9B9B',
    marginTop: 1,
  },
});
