import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { applyFilters, filterStore, haversineKm } from '../lib/domain/filters';
import { getRestaurants } from '../lib/restaurants';
import { Restaurant } from '../types';

const all = getRestaurants();

export default function ResultsScreen() {
  const router = useRouter();
  const { location, when, covers, lat, lng } = useLocalSearchParams<{
    location: string;
    when: string;
    covers: string;
    lat: string;
    lng: string;
  }>();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSheet, setShowSheet] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(() => [...filterStore.active]);
  const sheetAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    filterStore.load().then(() => setActiveFilters([...filterStore.active]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setActiveFilters([...filterStore.active]);
    }, []),
  );

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const userCoords =
    lat && lng && isFinite(parsedLat) && isFinite(parsedLng)
      ? { lat: parsedLat, lng: parsedLng }
      : undefined;
  const filtered = applyFilters(all, location ?? '', activeFilters, userCoords);

  function toggleFav(id: number) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
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
            {location || 'Restaurants à proximité'}
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
          userCoords={userCoords}
          onSelectRestaurant={setSelectedRestaurant}
          onPreviewVisibilityChange={(visible) => {
            setIsPreviewOpen(visible);
            if (!visible) {
              setSelectedRestaurant(null);
            }
          }}
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
          <View style={styles.sheetHandle} />
          <Text style={styles.resultsCount}>
            {selectedRestaurant
              ? `À la une : ${selectedRestaurant.name}`
              : `${filtered.length} Résultat${filtered.length > 1 ? 's' : ''}`}
          </Text>
          <ScrollView
            style={styles.sheet}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((restaurant) => (
              <RestaurantCardLarge
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => openRestaurant(restaurant)}
                favorited={favorites.includes(restaurant.id)}
                onFavorite={() => toggleFav(restaurant.id)}
                distanceKm={location === 'Près de moi' && userCoords ? haversineKm(userCoords.lat, userCoords.lng, restaurant.lat, restaurant.lng) : undefined}
              />
            ))}
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptySub}>Essayez d'ajuster vos filtres</Text>
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
    backgroundColor: '#FFFFFF',
  },
  sheet: {
    flex: 1,
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
    marginBottom: 12,
    paddingHorizontal: 16,
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
