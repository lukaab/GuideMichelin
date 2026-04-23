import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapSection from '../components/MapSection';
import RestaurantCardLarge from '../components/RestaurantCardLarge';
import rawRestaurants from '../data/restaurants.json';
import { useAuth } from '../lib/auth';
import { applyFilters, filterStore } from '../lib/domain/filters';
import { checkIn, loadProfile } from '../lib/profile';
import { CheckInResult, Restaurant, User } from '../types';

const FAVS_KEY = '@michelin_favorites';
const RED = '#E2231A';

export default function ResultsScreen() {
  const router = useRouter();
  const { authUser } = useAuth();
  const { location, when, covers, lat, lng } = useLocalSearchParams<{
    location: string;
    when: string;
    covers: string;
    lat: string;
    lng: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const userCoords = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
  const all = rawRestaurants as Restaurant[];
  const filtered = applyFilters(all, location ?? '', activeFilters, userCoords);

  useEffect(() => {
    if (authUser) loadProfile(authUser.id, authUser.username).then(setUser);
  }, [authUser]);

  // C1 — Chargement des favoris depuis AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(FAVS_KEY).then((raw) => {
      if (raw) setFavorites(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    filterStore.load().then(() => {
      setActiveFilters([...filterStore.active]);
    });
  }, []);

  // C1 — Toggle favori avec persistance AsyncStorage
  function toggleFav(id: number) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      AsyncStorage.setItem(FAVS_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function handleCheckin(r: Restaurant) {
    if (!user) return;
    const result: CheckInResult = await checkIn(user, r.id, r.category, r.city);
    setUser(result.user);
  }

  function clearFilters() {
    filterStore.set([]);
    setActiveFilters([]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {location || 'Résultats'}
          </Text>
          <Text style={styles.headerSub}>
            {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
            {when ? ` · ${when}` : ''}
            {covers && Number(covers) > 0 ? ` · ${covers} pers.` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/advanced-filters')}
          hitSlop={8}
          style={[styles.filterBtn, activeFilters.length > 0 && styles.filterBtnActive]}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilters.length > 0 ? '#fff' : '#1A1A1A'}
          />
          {activeFilters.length > 0 && (
            <Text style={styles.filterCount}>{activeFilters.length}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Vue liste / carte */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list-outline" size={15} color={viewMode === 'list' ? '#fff' : '#6B7280'} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            Liste
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={15} color={viewMode === 'map' ? '#fff' : '#6B7280'} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            Carte
          </Text>
        </TouchableOpacity>
      </View>

      {/* C4 — Empty state contextuel */}
      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptySub}>
            {activeFilters.length > 0
              ? 'Essayez de retirer certains filtres'
              : location && location !== 'Près de moi'
                ? `Pas de restaurant Michelin à "${location}" dans notre base`
                : 'Aucun restaurant disponible dans cette zone'}
          </Text>
          {activeFilters.length > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
              <Text style={styles.resetBtnText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* C1 — Liste avec favoris persistants */}
      {viewMode === 'list' && filtered.length > 0 && (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((r) => (
            <RestaurantCardLarge
              key={r.id}
              restaurant={r}
              favorited={favorites.includes(r.id)}
              onFavorite={() => toggleFav(r.id)}
              visited={user?.visitedRestaurants.includes(r.id)}
              onCheckin={() => handleCheckin(r)}
              onPress={() => router.push(`/restaurants/${r.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* Vue carte */}
      {viewMode === 'map' && filtered.length > 0 && (
        <MapSection
          restaurants={filtered}
          onSelectRestaurant={(r) => router.push(`/restaurants/${r.id}`)}
          userCoords={userCoords}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  headerSub: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterBtnActive: { backgroundColor: RED, borderColor: RED },
  filterCount: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  toggleBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  toggleText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  toggleTextActive: { color: '#FFFFFF' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  // C4 — Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#9B9B9B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  resetBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: RED,
  },
  resetBtnText: { color: RED, fontWeight: '600', fontSize: 14 },
});
