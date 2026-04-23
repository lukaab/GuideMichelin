import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Restaurant } from '../types';
import StarRow from './StarRow';

interface Props {
  restaurant: Restaurant;
  favorited?: boolean;
  onFavorite?: () => void;
  onPress?: () => void;
  width?: number;
}

export default function RestaurantCardSmall({ restaurant, favorited = false, onFavorite, onPress, width = 180 }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <TouchableOpacity style={styles.heartBtn} onPress={onFavorite} hitSlop={8}>
          <Text style={[styles.heart, favorited && styles.heartActive]}>
            {favorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <StarRow category={restaurant.category} size={12} />
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.meta}>{restaurant.city} · {restaurant.priceRange}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrap: { height: 120, backgroundColor: '#E5E7EB', position: 'relative' },
  image: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { fontSize: 14, color: '#CCCCCC' },
  heartActive: { color: '#E2231A' },
  body: { padding: 10, gap: 2 },
  name: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  meta: { fontSize: 11, color: '#9B9B9B' },
});
