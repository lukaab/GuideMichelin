import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapSection from '../../components/MapSection';
import RestaurantCard from '../../components/RestaurantCard';
import rawRestaurants from '../../data/restaurants.json';
import { useAuth } from '../../lib/auth';
import { checkIn, loadProfile } from '../../lib/profile';
import { Restaurant, User } from '../../types';

const MICHELIN_RED = '#E2231A';

const CATEGORIES = ['Tous', 'Une étoile', 'Deux étoiles', 'Trois étoiles', 'Bib Gourmand'];
const PRICES = ['Tous', '€', '€€', '€€€', '€€€€'];
const CITIES = ['Toutes', 'Paris', 'Lyon', 'Nice'];

export default function ExploreScreen() {
  const { authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [priceFilter, setPriceFilter] = useState('Tous');
  const [cityFilter, setCityFilter] = useState('Toutes');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    if (authUser) loadProfile(authUser.id).then(setUser);
  }, [authUser]);

  const restaurants = (rawRestaurants as Restaurant[]).filter((r) => {
    if (categoryFilter !== 'Tous' && r.category !== categoryFilter) return false;
    if (priceFilter !== 'Tous' && r.priceRange !== priceFilter) return false;
    if (cityFilter !== 'Toutes' && r.city !== cityFilter) return false;
    return true;
  });

  function showToast(msg: string) {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleCheckin(restaurant: Restaurant) {
    if (!user) return;
    const updated = await checkIn(user, restaurant.id, restaurant.category, restaurant.city);
    setUser(updated);
    setSelectedRestaurant(null);
    showToast(`+100 XP 🎉 Bienvenue chez ${restaurant.name} !`);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🍽️ Michelin Quest</Text>
          <Text style={styles.subtitle}>Explorez · Collectionnez · Progressez</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⭐ {user?.xp ?? 0} XP</Text>
        </View>
      </View>

      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            🗺️ Carte
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            📋 Liste
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, cityFilter === c && styles.chipActive]}
              onPress={() => setCityFilter(c)}
            >
              <Text style={[styles.chipText, cityFilter === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, categoryFilter === cat && styles.chipActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.chipText, categoryFilter === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {PRICES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priceFilter === p && styles.chipActive]}
              onPress={() => setPriceFilter(p)}
            >
              <Text style={[styles.chipText, priceFilter === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map or List */}
      {viewMode === 'map' ? (
        <MapSection restaurants={restaurants} onSelectRestaurant={setSelectedRestaurant} />
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          <Text style={styles.listCount}>
            {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}
          </Text>
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              visited={user?.visitedRestaurants.includes(r.id)}
              onCheckin={() => handleCheckin(r)}
            />
          ))}
        </ScrollView>
      )}

      {/* Restaurant detail modal */}
      <Modal
        visible={!!selectedRestaurant}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRestaurant(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            onPress={() => setSelectedRestaurant(null)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedRestaurant && (
              <RestaurantCard
                restaurant={selectedRestaurant}
                visited={user?.visitedRestaurants.includes(selectedRestaurant.id)}
                onCheckin={() => handleCheckin(selectedRestaurant)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* XP Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  toggleRow: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#111827',
  },
  filtersWrap: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: MICHELIN_RED,
    borderColor: MICHELIN_RED,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listCount: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
