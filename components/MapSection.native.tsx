import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Restaurant } from '../types';

const MICHELIN_RED = '#E2231A';
const MICHELIN_GOLD = '#D4A017';
const MARKER_IMAGES = {
  'Bib Gourmand': {
    default: require('../assets/map-markers/marker-bib.png'),
    selected: require('../assets/map-markers/marker-bib-selected.png'),
  },
  'Une étoile': {
    default: require('../assets/map-markers/marker-1star.png'),
    selected: require('../assets/map-markers/marker-1star-selected.png'),
  },
  'Deux étoiles': {
    default: require('../assets/map-markers/marker-2star.png'),
    selected: require('../assets/map-markers/marker-2star-selected.png'),
  },
  'Trois étoiles': {
    default: require('../assets/map-markers/marker-3star.png'),
    selected: require('../assets/map-markers/marker-3star-selected.png'),
  },
} as const;

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F5F1E8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6258' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F5F1E8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ECE5D8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#DCE8D5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E8E0D2' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D7E8F3' }] },
];

const CATEGORY_META: Record<string, { color: string; label: string; subtitle: string }> = {
  'Trois étoiles': { color: '#B68910', label: '3', subtitle: 'Trois étoiles' },
  'Deux étoiles': { color: '#A0A0A0', label: '2', subtitle: 'Deux étoiles' },
  'Une étoile': { color: '#B87333', label: '1', subtitle: 'Une étoile' },
  'Bib Gourmand': { color: MICHELIN_RED, label: 'BIB', subtitle: 'Bib Gourmand' },
};

interface Props {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
  onPreviewVisibilityChange?: (visible: boolean) => void;
  userCoords?: { lat: number; lng: number };
}

export default function MapSection({
  restaurants,
  onSelectRestaurant,
  onPreviewVisibilityChange,
  userCoords,
}: Props) {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const previewAnim = useRef(new Animated.Value(0)).current;
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (!userCoords) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      },
      600
    );
  }, [userCoords]);

  useEffect(() => {
    if (!selectedRestaurant) return;

    Animated.spring(previewAnim, {
      toValue: 1,
      friction: 8,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [selectedRestaurant, previewAnim]);

  function closePreview() {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSelectedRestaurant(null);
        onPreviewVisibilityChange?.(false);
      }
    });
  }

  function handleSelectRestaurant(restaurant: Restaurant) {
    previewAnim.stopAnimation();
    previewAnim.setValue(0);
    setSelectedRestaurant(restaurant);
    onSelectRestaurant(restaurant);
    onPreviewVisibilityChange?.(true);
    mapRef.current?.animateToRegion(
      {
        latitude: restaurant.lat,
        longitude: restaurant.lng,
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      },
      500
    );
  }

  function openRestaurantPage() {
    if (!selectedRestaurant) return;
    router.push(`/restaurants/${selectedRestaurant.id}`);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={MAP_STYLE}
        showsUserLocation={!!userCoords}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        onPress={() => {
          if (selectedRestaurant) closePreview();
        }}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.8,
          longitudeDelta: 0.8,
        }}
      >
        {restaurants.map((restaurant) => {
          const selected = selectedRestaurant?.id === restaurant.id;
          const markerImage = selected
            ? MARKER_IMAGES[restaurant.category].selected
            : MARKER_IMAGES[restaurant.category].default;

          return (
            <Marker
              key={restaurant.id}
              coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
              anchor={{ x: 0.5, y: 1 }}
              image={markerImage}
              tracksViewChanges={false}
              onPress={() => handleSelectRestaurant(restaurant)}
            />
          );
        })}
      </MapView>

      {selectedRestaurant && (
        <Animated.View
          style={[
            styles.previewCard,
            {
              opacity: previewAnim,
              transform: [
                {
                  translateY: previewAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.previewImageWrap}>
            <Image source={{ uri: selectedRestaurant.image }} style={styles.previewImage} />
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>
                {CATEGORY_META[selectedRestaurant.category].subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.previewBody}>
            <View style={styles.previewTopRow}>
              <View style={styles.previewTitleWrap}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {selectedRestaurant.name}
                </Text>
                <Text style={styles.previewMeta}>
                  {selectedRestaurant.city} · {selectedRestaurant.cuisine}
                </Text>
              </View>
              <Text style={styles.previewPrice}>{selectedRestaurant.priceRange}</Text>
            </View>

            <Text style={styles.previewDescription} numberOfLines={2}>
              {selectedRestaurant.description}
            </Text>

            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.previewGhostBtn} onPress={closePreview}>
                <Text style={styles.previewGhostText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewPrimaryBtn} onPress={openRestaurantPage}>
                <Text style={styles.previewPrimaryText}>Voir la fiche</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  previewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  previewImageWrap: {
    height: 132,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F3D7A5',
  },
  previewBadgeText: {
    fontSize: 11,
    color: MICHELIN_GOLD,
    fontWeight: '800',
  },
  previewBody: {
    padding: 16,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewTitleWrap: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  previewMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  previewPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: MICHELIN_RED,
  },
  previewDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 12,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  previewGhostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewGhostText: {
    color: '#374151',
    fontWeight: '700',
  },
  previewPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MICHELIN_RED,
    borderRadius: 14,
    paddingVertical: 12,
  },
  previewPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
