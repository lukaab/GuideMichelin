import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { getRestaurants } from '../lib/restaurants';
import { Restaurant } from '../types';

const all = getRestaurants();

export default function ResultsScreen() {
  const router = useRouter();
  const { location, when, covers } = useLocalSearchParams<{
    location: string;
    when: string;
    covers: string;
  }>();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSheet, setShowSheet] = useState(true);
  const sheetAnim = useRef(new Animated.Value(1)).current;

  function toggleFav(id: number) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  function openRestaurant(restaurant: Restaurant) {
    router.push(`/restaurants/${restaurant.id}`);
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
        <TouchableOpacity onPress={() => router.push('/advanced-filters')} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={[styles.mapWrap, isPreviewOpen && styles.mapWrapExpanded]}>
        <MapSection
          restaurants={all}
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
          <ScrollView
            style={styles.sheet}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.resultsCount}>
              {selectedRestaurant ? `À la une : ${selectedRestaurant.name}` : `${all.length} Résultats`}
            </Text>
            {all.map((restaurant) => (
              <RestaurantCardLarge
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => openRestaurant(restaurant)}
                favorited={favorites.includes(restaurant.id)}
                onFavorite={() => toggleFav(restaurant.id)}
              />
            ))}
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
});
