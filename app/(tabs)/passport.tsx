import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import rawRestaurants from '../../data/restaurants.json';
import { useAuth } from '../../lib/auth';
import { loadProfile } from '../../lib/profile';
import { Restaurant, User } from '../../types';

const MICHELIN_RED = '#E2231A';

const CATEGORY_EMOJI: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐',
  'Deux étoiles': '⭐⭐',
  'Une étoile': '⭐',
  'Bib Gourmand': '😊',
};

export default function PassportScreen() {
  const { authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) loadProfile(authUser.id).then(setUser);
  }, [authUser]);

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadProfile(authUser.id).then(setUser);
      }
    }, [authUser])
  );

  if (!user) return null;

  const visited = (rawRestaurants as Restaurant[]).filter((r) =>
    user.visitedRestaurants.includes(r.id)
  );

  const totalRestaurants = rawRestaurants.length;
  const passportProgress = user.stats.totalVisits / totalRestaurants;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Passport</Text>
        <Text style={styles.headerSub}>Votre carnet gastronomique</Text>
      </View>

      <View style={styles.passportCover}>
        <Text style={styles.passportEmoji}>🍽️</Text>
        <Text style={styles.passportTitle}>MICHELIN QUEST</Text>
        <Text style={styles.passportSub}>PASSPORT GASTRONOMIQUE</Text>
        <View style={styles.passportDivider} />
        <Text style={styles.passportName}>{user.username}</Text>
        <Text style={styles.passportLevel}>
          Niveau {user.level} · {user.xp} XP
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progression</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {user.stats.totalVisits} / {totalRestaurants} restaurants visites
          </Text>
          <Text style={styles.progressPct}>{Math.round(passportProgress * 100)}%</Text>
        </View>
        <ProgressBar progress={passportProgress} color={MICHELIN_RED} height={10} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Par categorie</Text>
        {[
          {
            label: 'Trois etoiles ⭐⭐⭐',
            count: visited.filter((r) => r.category === 'Trois étoiles').length,
            total: (rawRestaurants as Restaurant[]).filter((r) => r.category === 'Trois étoiles')
              .length,
          },
          {
            label: 'Deux etoiles ⭐⭐',
            count: visited.filter((r) => r.category === 'Deux étoiles').length,
            total: (rawRestaurants as Restaurant[]).filter((r) => r.category === 'Deux étoiles')
              .length,
          },
          {
            label: 'Une etoile ⭐',
            count: visited.filter((r) => r.category === 'Une étoile').length,
            total: (rawRestaurants as Restaurant[]).filter((r) => r.category === 'Une étoile')
              .length,
          },
          {
            label: 'Bib Gourmand 😊',
            count: visited.filter((r) => r.category === 'Bib Gourmand').length,
            total: (rawRestaurants as Restaurant[]).filter((r) => r.category === 'Bib Gourmand')
              .length,
          },
        ].map((cat) => (
          <View key={cat.label} style={styles.catRow}>
            <Text style={styles.catLabel}>{cat.label}</Text>
            <Text style={styles.catCount}>
              {cat.count}/{cat.total}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {visited.length > 0
          ? `${visited.length} restaurant${visited.length > 1 ? 's' : ''} visite${visited.length > 1 ? 's' : ''}`
          : 'Aucun restaurant visite'}
      </Text>

      {visited.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>Votre aventure commence ici</Text>
          <Text style={styles.emptyDesc}>
            Allez sur la carte, trouvez un restaurant et cochez le bouton de check-in pour remplir
            votre passport.
          </Text>
        </View>
      )}

      {visited.map((r) => (
        <View key={r.id} style={styles.visitedCard}>
          <View style={styles.visitedLeft}>
            <Text style={styles.visitedEmoji}>{CATEGORY_EMOJI[r.category]}</Text>
          </View>
          <View style={styles.visitedRight}>
            <Text style={styles.visitedName}>{r.name}</Text>
            <Text style={styles.visitedMeta}>
              {r.city} · {r.cuisine} · {r.priceRange}
            </Text>
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedBadgeText}>{r.category}</Text>
            </View>
          </View>
          <Text style={styles.visitedCheck}>✓</Text>
        </View>
      ))}
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
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  passportCover: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  passportEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  passportTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 4,
  },
  passportSub: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 2,
    marginTop: 4,
  },
  passportDivider: {
    width: 60,
    height: 1,
    backgroundColor: '#FFD700',
    marginVertical: 16,
  },
  passportName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passportLevel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#374151',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: MICHELIN_RED,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  catLabel: {
    fontSize: 13,
    color: '#374151',
  },
  catCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  visitedCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  visitedLeft: {
    marginRight: 12,
  },
  visitedEmoji: {
    fontSize: 24,
  },
  visitedRight: {
    flex: 1,
  },
  visitedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  visitedMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 6,
  },
  visitedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  visitedBadgeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  visitedCheck: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '800',
    marginLeft: 8,
  },
});
