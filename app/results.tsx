import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MichelinLogo from '../components/MichelinLogo';
import RestaurantCardLarge from '../components/RestaurantCardLarge';
import MapSection from '../components/MapSection';
import rawRestaurants from '../data/restaurants.json';
import { Restaurant } from '../types';

const all = rawRestaurants as Restaurant[];

export default function ResultsScreen() {
  const router = useRouter();
  const { location, when, covers } = useLocalSearchParams<{ location: string; when: string; covers: string }>();
  const [favorites, setFavorites] = useState<number[]>([]);

  function toggleFav(id: number) {
    setFavorites((p) => (p.includes(id) ? p.filter((f) => f !== id) : [...p, id]));
  }

  const subtitle = [when, covers ? `${covers} personne${Number(covers) > 1 ? 's' : ''}` : null].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MichelinLogo size="sm" />
      </View>

      {/* Search summary bar */}
      <View style={styles.summaryBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.summaryTextWrap}>
          <Text style={styles.summaryTitle} numberOfLines={1}>{location || 'Restaurants à proximité'}</Text>
          {subtitle ? <Text style={styles.summarySubtitle}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => router.push('/advanced-filters')} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapSection restaurants={all} onSelectRestaurant={() => {}} />
      </View>

      {/* Bottom sheet */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetHandle} />
        <Text style={styles.resultsCount}>{all.length} Résultats</Text>
        {all.map((r) => (
          <RestaurantCardLarge
            key={r.id}
            restaurant={r}
            favorited={favorites.includes(r.id)}
            onFavorite={() => toggleFav(r.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
  backBtn: { padding: 4 },
  summaryTextWrap: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  summarySubtitle: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  mapWrap: { height: '38%' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF' },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 14,
  },
  resultsCount: {
    fontSize: 17, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 16,
  },
});
