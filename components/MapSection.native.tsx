import { StyleSheet } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Restaurant } from '../types';
import { View, Text } from 'react-native';

const MICHELIN_RED = '#E2231A';

const MARKER_COLORS: Record<string, string> = {
  'Trois étoiles': '#FFD700',
  'Deux étoiles': '#C0C0C0',
  'Une étoile': '#CD7F32',
  'Bib Gourmand': MICHELIN_RED,
};

interface Props {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
}

export default function MapSection({ restaurants, onSelectRestaurant }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.8,
        longitudeDelta: 0.8,
      }}
    >
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          coordinate={{ latitude: r.lat, longitude: r.lng }}
          pinColor={MARKER_COLORS[r.category]}
          onPress={() => onSelectRestaurant(r)}
        >
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutName}>{r.name}</Text>
              <Text style={styles.calloutCat}>{r.category}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  callout: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#111827',
  },
  calloutCat: {
    fontSize: 11,
    color: MICHELIN_RED,
    marginTop: 2,
  },
});
