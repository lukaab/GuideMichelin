import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import rawRestaurants from '../../data/restaurants.json';
import { useAuth } from '../../lib/auth';
import { checkIn, loadProfile } from '../../lib/profile';
import { CheckInResult, Restaurant, User } from '../../types';

const RED = '#E2231A';

const CATEGORY_LABEL: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐ Trois étoiles Michelin',
  'Deux étoiles': '⭐⭐ Deux étoiles Michelin',
  'Une étoile': '⭐ Une étoile Michelin',
  'Bib Gourmand': '😊 Bib Gourmand',
};

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [showXPFloat, setShowXPFloat] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const restaurant = (rawRestaurants as Restaurant[]).find((r) => r.id === Number(id));

  useEffect(() => {
    if (authUser) loadProfile(authUser.id, authUser.username).then(setUser);
  }, [authUser]);

  if (!restaurant) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Restaurant introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const visited = user?.visitedRestaurants.includes(restaurant.id) ?? false;

  // C2 — Animation "+100 XP" flottante
  function triggerXPFloat() {
    setShowXPFloat(true);
    floatAnim.setValue(0);
    fadeAnim.setValue(1);
    Animated.parallel([
      Animated.timing(floatAnim, { toValue: -80, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => setShowXPFloat(false));
  }

  async function handleCheckin() {
    if (!user || visited || !restaurant) return;
    triggerXPFloat();
    const result: CheckInResult = await checkIn(
      user,
      restaurant.id,
      restaurant.category,
      restaurant.city,
    );
    setUser(result.user);

    const lines: string[] = [`+${result.xpGained} XP gagnés !`];
    if (result.completedChallenges.length > 0) {
      const s = result.completedChallenges.length > 1 ? 's' : '';
      lines.push(`🎯 Challenge${s} complété${s} !`);
    }
    if (result.unlockedBadges.length > 0) {
      const s = result.unlockedBadges.length > 1 ? 's' : '';
      lines.push(`🏅 Badge${s} débloqué${s} !`);
    }
    Alert.alert('Étape validée ✓', lines.join('\n'));
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Image hero */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: restaurant.image }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          {visited && (
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedText}>✓ Visité</Text>
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          <Text style={styles.categoryLabel}>{CATEGORY_LABEL[restaurant.category]}</Text>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={13} color="#9B9B9B" /> {restaurant.address}
          </Text>

          {/* Infos rapides */}
          <View style={styles.factsRow}>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Prix</Text>
              <Text style={styles.factValue}>{restaurant.priceRange}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Cuisine</Text>
              <Text style={styles.factValue} numberOfLines={2}>{restaurant.cuisine}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Récompense</Text>
              <Text style={styles.factValue}>+100 XP{'\n'}+ bonus</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{restaurant.description}</Text>

          {/* Ambiance / features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Ambiance & services</Text>
              <View style={styles.tagsRow}>
                {restaurant.features.map((f) => (
                  <View key={f} style={styles.tag}>
                    <Text style={styles.tagText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Options alimentaires */}
          {restaurant.dietary && restaurant.dietary.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Options alimentaires</Text>
              <View style={styles.tagsRow}>
                {restaurant.dietary.map((d) => (
                  <View key={d} style={[styles.tag, styles.tagGreen]}>
                    <Text style={[styles.tagText, styles.tagTextGreen]}>{d}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer sticky check-in */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkinBtn, visited && styles.checkinBtnDone]}
          onPress={handleCheckin}
          disabled={visited}
          activeOpacity={0.85}
        >
          <Text style={[styles.checkinText, visited && styles.checkinTextDone]}>
            {visited ? "✓ J'y suis allé" : "J'y étais ! +100 XP"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* C2 — XP flottant */}
      {showXPFloat && (
        <Animated.Text
          style={[
            styles.xpFloat,
            { opacity: fadeAnim, transform: [{ translateY: floatAnim }] },
          ]}
        >
          +100 XP ⭐
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: '#9B9B9B' },
  backLink: { paddingHorizontal: 20, paddingVertical: 10 },
  backLinkText: { fontSize: 15, color: RED, fontWeight: '600' },
  imageWrap: { height: 260, position: 'relative', backgroundColor: '#E5E7EB' },
  image: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 32,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  visitedBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 32,
    right: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  visitedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  content: { padding: 20 },
  categoryLabel: { fontSize: 13, color: '#9B9B9B', fontWeight: '500', marginBottom: 6 },
  name: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  location: { fontSize: 13, color: '#9B9B9B', marginBottom: 20 },
  factsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  factCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  factLabel: { fontSize: 11, color: '#9B9B9B', fontWeight: '500', textAlign: 'center' },
  factValue: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, marginTop: 8 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  tagGreen: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  tagTextGreen: { color: '#065F46' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkinBtn: {
    backgroundColor: RED,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkinBtnDone: { backgroundColor: '#ECFDF5' },
  checkinText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  checkinTextDone: { color: '#059669' },
  // C2 — Animation XP
  xpFloat: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 116 : 96,
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: '900',
    color: RED,
    zIndex: 100,
  },
});
