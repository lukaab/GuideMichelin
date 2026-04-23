import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Restaurant } from '../types';

const MICHELIN_RED = '#E2231A';

const CATEGORY_COLORS: Record<string, string> = {
  'Trois étoiles': '#FFD700',
  'Deux étoiles': '#C0C0C0',
  'Une étoile': '#CD7F32',
  'Bib Gourmand': MICHELIN_RED,
};

const CATEGORY_STARS: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐',
  'Deux étoiles': '⭐⭐',
  'Une étoile': '⭐',
  'Bib Gourmand': '😊',
};

interface Props {
  restaurant: Restaurant;
  onCheckin?: () => void;
  visited?: boolean;
}

export default function RestaurantCard({ restaurant, onCheckin, visited }: Props) {
  return (
    <View style={[styles.card, visited && styles.visited]}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.price}>{restaurant.priceRange}</Text>
        </View>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[restaurant.category] }]}>
            <Text style={styles.badgeText}>
              {CATEGORY_STARS[restaurant.category]} {restaurant.category}
            </Text>
          </View>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        </View>
        <Text style={styles.city}>📍 {restaurant.city}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {restaurant.description}
        </Text>
        <TouchableOpacity
          style={[styles.checkinBtn, visited && styles.checkinBtnVisited]}
          onPress={onCheckin}
          disabled={visited}
        >
          <Text style={styles.checkinText}>{visited ? '✓ Visite' : "J'y etais !"}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  visited: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  body: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cuisine: {
    fontSize: 12,
    color: '#6B7280',
  },
  city: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 12,
  },
  checkinBtn: {
    backgroundColor: MICHELIN_RED,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkinBtnVisited: {
    backgroundColor: '#D1FAE5',
  },
  checkinText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
