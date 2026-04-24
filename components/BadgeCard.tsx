import { StyleSheet, Text, View } from 'react-native';

interface Props {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export default function BadgeCard({ icon, name, description, unlocked }: Props) {
  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{icon}</Text>
      <Text style={[styles.name, !unlocked && styles.textLocked]}>{name}</Text>
      <Text style={[styles.desc, !unlocked && styles.textLocked]} numberOfLines={2}>
        {description}
      </Text>
      {!unlocked && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  cardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  icon: { fontSize: 28, marginBottom: 6 },
  iconLocked: { opacity: 0.3 },
  name: { fontSize: 11, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 4 },
  desc: { fontSize: 10, color: '#9B9B9B', textAlign: 'center', lineHeight: 13 },
  textLocked: { color: '#D1D5DB' },
  lockOverlay: { position: 'absolute', top: 8, right: 8 },
  lockIcon: { fontSize: 12 },
});
