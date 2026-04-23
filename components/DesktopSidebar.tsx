import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const NAV_ITEMS: { label: string; iconOn: IoniconsName; iconOff: IoniconsName; path: string }[] = [
  { label: 'Découvrir', iconOn: 'compass', iconOff: 'compass-outline', path: '/' },
  { label: 'Rechercher', iconOn: 'search', iconOff: 'search-outline', path: '/search' },
  { label: 'Profil', iconOn: 'person', iconOff: 'person-outline', path: '/profile' },
];

const RED = '#E2231A';

export default function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>MICHELIN</Text>
      <Text style={styles.logoSub}>QUEST</Text>
      <View style={styles.divider} />
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        return (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, active && styles.navItemActive]}
            onPress={() => router.push(item.path as never)}
          >
            <Ionicons
              name={active ? item.iconOn : item.iconOff}
              size={22}
              color={active ? RED : '#6B7280'}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logo: { fontSize: 18, fontWeight: '900', color: RED, letterSpacing: 3 },
  logoSub: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 4, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: { backgroundColor: '#FEF2F2' },
  navLabel: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  navLabelActive: { color: RED, fontWeight: '700' },
});
