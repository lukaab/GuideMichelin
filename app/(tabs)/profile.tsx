import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BadgeCard from '../../components/BadgeCard';
import ProgressBar from '../../components/ProgressBar';
import { useAuth } from '../../lib/auth';
import { loadProfile } from '../../lib/profile';
import { User } from '../../types';

const MICHELIN_RED = '#E2231A';

const ALL_BADGES = [
  {
    id: 'first_star',
    name: 'First Star',
    icon: '⭐',
    description: 'Premier restaurant étoilé visité',
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
    description: '3 restaurants populaires',
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
    description: 'Un restaurant 3 étoiles visité',
    check: (u: User) => u.stats.starredVisits >= 1,
  },
];

function getLevelTitle(level: number): string {
  if (level < 3) return 'Curieux Gourmet';
  if (level < 6) return 'Explorateur Gastronomique';
  if (level < 10) return 'Chasseur d\'Étoiles';
  return 'Grand Maître Michelin';
}

export default function ProfileScreen() {
  const { authUser, signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) loadProfile(authUser.id).then(setUser);
  }, [authUser]);

  function handleSignOut() {
    Alert.alert('Déconnexion', 'Votre progression est sauvegardée. À bientôt !', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!user) return null;

  const xpInLevel = user.xp % 500;
  const progress = xpInLevel / 500;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      {/* Avatar & Level */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🍽️</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Niveau {user.level}</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.card}>
        <View style={styles.xpRow}>
          <Text style={styles.xpTotal}>⭐ {user.xp} XP</Text>
          <Text style={styles.xpNext}>{500 - xpInLevel} XP → niv. {user.level + 1}</Text>
        </View>
        <ProgressBar progress={progress} color={MICHELIN_RED} height={10} />
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.totalVisits}</Text>
          <Text style={styles.statLabel}>Visites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.starredVisits}</Text>
          <Text style={styles.statLabel}>Étoilés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.bibGourmandVisits}</Text>
          <Text style={styles.statLabel}>Bib Gourmand</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.citiesExplored.length}</Text>
          <Text style={styles.statLabel}>Villes</Text>
        </View>
      </View>

      {/* Badges */}
      <Text style={styles.sectionTitle}>Mes Badges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
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

      {/* Cities explored */}
      {user.stats.citiesExplored.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Villes Explorées</Text>
          <View style={styles.citiesRow}>
            {user.stats.citiesExplored.map((city) => (
              <View key={city} style={styles.cityChip}>
                <Text style={styles.cityText}>📍 {city}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: MICHELIN_RED,
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  levelTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: MICHELIN_RED,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  xpNext: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: MICHELIN_RED,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  badgesRow: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  citiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  cityChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cityText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  signOutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
});
