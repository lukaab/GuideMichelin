import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import StarRow from '../../components/StarRow';
import { useAuth } from '../../lib/auth';
import { checkIn, loadProfile } from '../../lib/profile';
import { getRestaurantById } from '../../lib/restaurants';
import { User } from '../../types';

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const restaurant = getRestaurantById(restaurantId);
  const { authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) {
      loadProfile(authUser.id, authUser.username).then(setUser);
    }
  }, [authUser]);

  if (!restaurant) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Restaurant introuvable</Text>
        <TouchableOpacity style={styles.backGhostBtn} onPress={() => router.back()}>
          <Text style={styles.backGhostText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentRestaurant = restaurant;
  const visited = !!user?.visitedRestaurants.includes(currentRestaurant.id);

  async function handleCheckin() {
    if (!user || visited) return;
    const updated = await checkIn(
      user,
      currentRestaurant.id,
      currentRestaurant.category,
      currentRestaurant.city
    );
    setUser(updated);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: currentRestaurant.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View style={styles.heroCard}>
            <StarRow category={restaurant.category} size={16} />
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.meta}>
              {currentRestaurant.city} · {currentRestaurant.priceRange} · {currentRestaurant.cuisine}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Ionicons name="location-outline" size={15} color="#E2231A" />
              <Text style={styles.infoChipText}>{currentRestaurant.address}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{currentRestaurant.description}</Text>

          <Text style={styles.sectionTitle}>Expérience</Text>
          <View style={styles.factsGrid}>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Catégorie</Text>
              <Text style={styles.factValue}>{currentRestaurant.category}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Cuisine</Text>
              <Text style={styles.factValue}>{currentRestaurant.cuisine}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Budget</Text>
              <Text style={styles.factValue}>{currentRestaurant.priceRange}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Récompense</Text>
              <Text style={styles.factValue}>+100 XP</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Michelin Quest</Text>
          <Text style={styles.bottomValue}>{visited ? 'Déjà visité' : 'Ajoutez cette étape à votre passport'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, visited && styles.primaryBtnDone]}
          onPress={handleCheckin}
          disabled={visited}
        >
          <Text style={[styles.primaryBtnText, visited && styles.primaryBtnTextDone]}>
            {visited ? '✓ Validé' : "J'y étais"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    height: 340,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.26)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 28,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  meta: {
    fontSize: 14,
    color: '#4B5563',
  },
  section: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 22,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  infoChipText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 22,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
  },
  factLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  factValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#E2231A',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryBtnDone: {
    backgroundColor: '#ECFDF5',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  primaryBtnTextDone: {
    color: '#059669',
  },
  empty: {
    flex: 1,
    backgroundColor: '#F6F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  backGhostBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backGhostText: {
    color: '#374151',
    fontWeight: '700',
  },
});
