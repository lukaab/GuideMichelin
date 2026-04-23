import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Restaurant } from '../types';
import StarRow from './StarRow';

interface Props {
  restaurant: Restaurant;
  onPress?: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
  width?: number;
}

export default function RestaurantCardSmall({
  restaurant,
  onPress,
  onFavorite,
  favorited = false,
  width = 160,
}: Props) {
  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.imageWrap, { width }]}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <TouchableOpacity style={styles.heartBtn} onPress={onFavorite} hitSlop={8}>
          <Text style={[styles.heart, favorited && styles.heartActive]}>
            {favorited ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <StarRow category={restaurant.category} size={13} />
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{restaurant.city}, France</Text>
        <Text style={styles.meta} numberOfLines={1}>{restaurant.priceRange} · {restaurant.cuisine}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    height: 150,
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
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heart: {
    fontSize: 15,
    color: '#CCCCCC',
  },
  heartActive: {
    color: '#E2231A',
  },
  body: {
    padding: 10,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  meta: {
    fontSize: 11,
    color: '#9B9B9B',
  },
});
