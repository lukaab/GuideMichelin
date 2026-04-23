import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Restaurant } from '../types';
import StarRow from './StarRow';

interface Props {
  restaurant: Restaurant;
  onPress?: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
  visited?: boolean;
  onCheckin?: () => void;
  distanceKm?: number;
}

export default function RestaurantCardLarge({
  restaurant,
  onPress,
  onFavorite,
  favorited = false,
  visited = false,
  onCheckin,
  distanceKm,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <TouchableOpacity style={styles.heartBtn} onPress={onFavorite} hitSlop={8}>
          <Text style={[styles.heart, favorited && styles.heartActive]}>
            {favorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
        {visited && (
          <View style={styles.visitedBadge}>
            <Text style={styles.visitedText}>✓ Visité</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <StarRow category={restaurant.category} size={14} />
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.meta}>
          {restaurant.city}, France
          {distanceKm !== undefined ? `  ·  ${distanceKm < 1 ? '<1 km' : `${Math.round(distanceKm)} km`}` : ''}
        </Text>
        <Text style={styles.meta}>{restaurant.priceRange} · {restaurant.cuisine}</Text>
        <TouchableOpacity
          style={[styles.checkinBtn, visited && styles.checkinBtnDone]}
          onPress={onCheckin}
          disabled={visited}
        >
          <Text style={[styles.checkinText, visited && styles.checkinTextDone]}>
            {visited ? '✓ J\'y suis allé' : 'J\'y étais ! +100 XP'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    height: 200,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heart: { fontSize: 17, color: '#CCCCCC' },
  heartActive: { color: '#E2231A' },
  visitedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  visitedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: {
    padding: 14,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    color: '#9B9B9B',
  },
  checkinBtn: {
    marginTop: 12,
    backgroundColor: '#E2231A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkinBtnDone: {
    backgroundColor: '#ECFDF5',
  },
  checkinText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  checkinTextDone: {
    color: '#059669',
  },
});
