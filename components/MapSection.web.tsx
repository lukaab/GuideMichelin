import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Restaurant } from '../types';

const MICHELIN_RED = '#E2231A';

const CATEGORY_EMOJI: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐',
  'Deux étoiles': '⭐⭐',
  'Une étoile': '⭐',
  'Bib Gourmand': '😊',
};

interface Props {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
}

export default function MapSection({ restaurants, onSelectRestaurant }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>🗺️ Carte disponible sur mobile — utilisez Expo Go pour l'expérience complète</Text>
      </View>
      {restaurants.map((r) => (
        <TouchableOpacity key={r.id} style={styles.row} onPress={() => onSelectRestaurant(r)}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowEmoji}>{CATEGORY_EMOJI[r.category]}</Text>
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowName}>{r.name}</Text>
            <Text style={styles.rowMeta}>{r.city} · {r.cuisine} · {r.priceRange}</Text>
            <Text style={styles.rowCat}>{r.category}</Text>
          </View>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  notice: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noticeText: {
    fontSize: 13,
    color: '#1D4ED8',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLeft: {
    marginRight: 12,
  },
  rowEmoji: {
    fontSize: 22,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  rowMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rowCat: {
    fontSize: 11,
    color: MICHELIN_RED,
    fontWeight: '600',
    marginTop: 4,
  },
  rowArrow: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
