import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapSection from '../components/MapSection';
import MichelinLogo from '../components/MichelinLogo';
import RestaurantCardLarge from '../components/RestaurantCardLarge';
import { useAuth } from '../lib/auth';
import { applyFilters, filterStore, haversineKm } from '../lib/domain/filters';
import { checkIn, loadProfile } from '../lib/profile';
import { getRestaurants } from '../lib/restaurants';
import { CheckInResult, Restaurant, User } from '../types';

const all = getRestaurants();
const FAVS_KEY = '@michelin_favorites';

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
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSheet, setShowSheet] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const sheetAnim = useRef(new Animated.Value(1)).current;

  const userCoords = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
  const filtered = applyFilters(all, location ?? '', activeFilters, userCoords);

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadProfile(authUser.id, authUser.username).then(setUser);
      }
      filterStore.load().then(() => setActiveFilters([...filterStore.active]));
    }, [authUser])
  );

  useEffect(() => {
    if (authUser) {
      loadProfile(authUser.id, authUser.username).then(setUser);
    }
  }, [authUser]);

  useEffect(() => {
    AsyncStorage.getItem(FAVS_KEY).then((raw) => {
      if (raw) setFavorites(JSON.parse(raw));
    });
  }, []);

  function toggleFav(id: number) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id];
      AsyncStorage.setItem(FAVS_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function handleCheckin(restaurant: Restaurant) {
    if (!user) return;

    const result: CheckInResult = await checkIn(
      user,
      restaurant.id,
      restaurant.category,
      restaurant.city
    );

    setUser(result.user);

    const lines: string[] = [`+${result.xpGained} XP gagnes !`];

    if (result.completedChallenges.length > 0) {
      lines.push(
        `Challenge${result.completedChallenges.length > 1 ? 's' : ''} complete${
          result.completedChallenges.length > 1 ? 's' : ''
        } !`
      );
    }

    if (result.unlockedBadges.length > 0) {
      lines.push(
        `Badge${result.unlockedBadges.length > 1 ? 's' : ''} debloque${
          result.unlockedBadges.length > 1 ? 's' : ''
        } !`
      );
    }

    Alert.alert('Etape validee', lines.join('\n'));
  }

  function openRestaurant(restaurant: Restaurant) {
    router.push(`/restaurants/${restaurant.id}`);
  }

  function openFilters() {
    router.push('/advanced-filters');
  }

  const subtitle = [when, covers ? `${covers} personne${Number(covers) > 1 ? 's' : ''}` : null]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    if (isPreviewOpen) {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShowSheet(false);
        }
      });
      return;
    }

    setShowSheet(true);
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [isPreviewOpen, sheetAnim]);

  const filterCount = activeFilters.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MichelinLogo size="sm" />
      </View>

      <View style={styles.summaryBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.summaryTextWrap}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {location || 'Restaurants a proximite'}
          </Text>
          {subtitle ? <Text style={styles.summarySubtitle}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity onPress={openFilters} hitSlop={8} style={styles.filterBtn}>
          <Ionicons
            name="options-outline"
            size={22}
            color={filterCount > 0 ? '#E2231A' : '#1A1A1A'}
          />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.mapWrap, isPreviewOpen && styles.mapWrapExpanded]}>
        <MapSection
          restaurants={filtered}
          onSelectRestaurant={setSelectedRestaurant}
          onPreviewVisibilityChange={(visible) => {
            setIsPreviewOpen(visible);
            if (!visible) {
              setSelectedRestaurant(null);
            }
          }}
          userCoords={userCoords}
        />
      </View>

      {showSheet && (
        <Animated.View
          style={[
            styles.sheetWrap,
            {
              opacity: sheetAnim,
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.sheet}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.resultsCount}>
              {selectedRestaurant
                ? `A la une : ${selectedRestaurant.name}`
                : `${filtered.length} Resultat${filtered.length > 1 ? 's' : ''}`}
            </Text>
            {filtered.map((restaurant) => {
              const distanceKm =
                userCoords && location === 'Près de moi'
                  ? haversineKm(userCoords.lat, userCoords.lng, restaurant.lat, restaurant.lng)
                  : undefined;

              return (
                <RestaurantCardLarge
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() => openRestaurant(restaurant)}
                  favorited={favorites.includes(restaurant.id)}
                  onFavorite={() => toggleFav(restaurant.id)}
                  visited={!!user?.visitedRestaurants.includes(restaurant.id)}
                  onCheckin={user ? () => handleCheckin(restaurant) : undefined}
                  distanceKm={distanceKm}
                />
              );
            })}
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucun resultat</Text>
                <Text style={styles.emptySub}>Essayez de modifier vos filtres</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 28,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  summaryTextWrap: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#9B9B9B',
    marginTop: 2,
  },
  filterBtn: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E2231A',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  mapWrap: {
    height: '38%',
  },
  mapWrapExpanded: {
    flex: 1,
    height: undefined,
  },
  sheetWrap: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  resultsCount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#9B9B9B',
  },
});
