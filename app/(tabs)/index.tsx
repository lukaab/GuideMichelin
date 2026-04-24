import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MichelinLogo from '../../components/MichelinLogo';
import RestaurantCardLarge from '../../components/RestaurantCardLarge';
import RestaurantCardSmall from '../../components/RestaurantCardSmall';
import rawRestaurants from '../../data/restaurants.json';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useAuth } from '../../lib/auth';
import { checkIn, loadProfile } from '../../lib/profile';
import { CheckInResult, Restaurant, User } from '../../types';

export default function DecouvrirScreen() {
  const router = useRouter();
  const { authUser } = useAuth();
  const { isDesktop } = useBreakpoint();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (authUser) loadProfile(authUser.id, authUser.username).then(setUser);
  }, [authUser]);

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadProfile(authUser.id, authUser.username).then(setUser);
      }
    }, [authUser])
  );

  const all = rawRestaurants as Restaurant[];
  const featured = all.filter((restaurant) => restaurant.category !== 'Bib Gourmand');
  const discover = all.filter(
    (restaurant) =>
      !user?.visitedRestaurants.includes(restaurant.id) && restaurant.category === 'Bib Gourmand'
  );

  function toggleFav(id: number) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  }

  function showToast(message: string) {
    setToastMsg(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleCheckin(restaurant: Restaurant) {
    if (!user) return;
    const result: CheckInResult = await checkIn(
      user,
      restaurant.id,
      restaurant.category,
      restaurant.city
    );
    setUser(result.user);
    setSelected(null);
    showToast(`+${result.xpGained} XP · ${restaurant.name} ajoute a votre passport !`);
  }

  if (isDesktop) {
    return (
      <ScrollView style={styles.desktopContainer} contentContainerStyle={styles.desktopContent}>
        <View style={styles.desktopHeader}>
          <MichelinLogo size="lg" />
          <TouchableOpacity
            style={styles.desktopSearchBar}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search-outline" size={18} color="#9B9B9B" />
            <Text style={styles.desktopSearchText}>Ou voulez-vous diner ?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>A ne pas manquer</Text>
        <View style={styles.desktopGrid}>
          {featured.map((restaurant) => (
            <RestaurantCardSmall
              key={restaurant.id}
              restaurant={restaurant}
              width={220}
              favorited={favorites.includes(restaurant.id)}
              onFavorite={() => toggleFav(restaurant.id)}
              onPress={() => setSelected(restaurant)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Vous ne connaissez pas</Text>
        <View style={styles.desktopGrid}>
          {discover.map((restaurant) => (
            <RestaurantCardSmall
              key={restaurant.id}
              restaurant={restaurant}
              width={220}
              favorited={favorites.includes(restaurant.id)}
              onFavorite={() => toggleFav(restaurant.id)}
              onPress={() => setSelected(restaurant)}
            />
          ))}
        </View>

        <DetailModal
          restaurant={selected}
          user={user}
          onClose={() => setSelected(null)}
          onCheckin={handleCheckin}
        />
        <Toast anim={toastAnim} msg={toastMsg} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MichelinLogo size="md" />
      </View>

      <View style={styles.searchWrap}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={17} color="#9B9B9B" style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Ou voulez-vous diner ?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text style={styles.sectionTitle}>A ne pas manquer</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
        >
          {featured.map((restaurant) => (
            <RestaurantCardSmall
              key={restaurant.id}
              restaurant={restaurant}
              favorited={favorites.includes(restaurant.id)}
              onFavorite={() => toggleFav(restaurant.id)}
              onPress={() => setSelected(restaurant)}
            />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Vous ne connaissez pas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
        >
          {discover.map((restaurant) => (
            <RestaurantCardSmall
              key={restaurant.id}
              restaurant={restaurant}
              favorited={favorites.includes(restaurant.id)}
              onFavorite={() => toggleFav(restaurant.id)}
              onPress={() => setSelected(restaurant)}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <DetailModal
        restaurant={selected}
        user={user}
        onClose={() => setSelected(null)}
        onCheckin={handleCheckin}
      />
      <Toast anim={toastAnim} msg={toastMsg} />
    </View>
  );
}

function DetailModal({
  restaurant,
  user,
  onClose,
  onCheckin,
}: {
  restaurant: Restaurant | null;
  user: User | null;
  onClose: () => void;
  onCheckin: (restaurant: Restaurant) => void;
}) {
  return (
    <Modal visible={!!restaurant} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalDismiss} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          {restaurant && (
            <RestaurantCardLarge
              restaurant={restaurant}
              visited={user?.visitedRestaurants.includes(restaurant.id)}
              onCheckin={() => onCheckin(restaurant)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function Toast({ anim, msg }: { anim: Animated.Value; msg: string }) {
  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.toastText}>{msg}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 14,
    backgroundColor: '#F5F5F5',
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchText: { fontSize: 15, color: '#9B9B9B', flex: 1 },
  scroll: { flex: 1 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  rowContent: { paddingHorizontal: 20, paddingBottom: 4 },
  desktopContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  desktopContent: { padding: 40, maxWidth: 1100, alignSelf: 'center', width: '100%' },
  desktopHeader: { marginBottom: 32, gap: 20 },
  desktopSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 10,
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  desktopSearchText: { fontSize: 15, color: '#9B9B9B' },
  desktopGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 8,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toastText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
