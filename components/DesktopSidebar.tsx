import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import MichelinLogo from './MichelinLogo';

const RED = '#E2231A';

const NAV = [
  { label: 'Découvrir', icon: 'compass-outline' as const, route: '/(tabs)/' },
  { label: 'Rechercher', icon: 'search-outline' as const, route: '/(tabs)/search' },
  { label: 'Profil', icon: 'person-outline' as const, route: '/(tabs)/profile' },
];

export default function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, signOut } = useAuth();

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoWrap}>
        <MichelinLogo size="sm" />
      </View>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = pathname === item.route || (item.route.endsWith('/') && pathname === '/');
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.route as never)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? RED : '#6B7280'}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottom}>
        {authUser && (
          <>
            <View style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>🍽️</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {authUser.username || authUser.email}
              </Text>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
              <Ionicons name="log-out-outline" size={16} color="#9B9B9B" />
              <Text style={styles.signOutText}>Déconnexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    paddingTop: 32,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  logoWrap: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: '#FFF0F0',
  },
  navIcon: {},
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  navLabelActive: {
    color: RED,
    fontWeight: '700',
  },
  bottom: {
    paddingBottom: 24,
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 13,
    color: '#9B9B9B',
  },
});
