import { StyleSheet, Text, View } from 'react-native';

interface Props {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export default function BadgeCard({ icon, name, description, unlocked }: Props) {
  return (
    <View style={[styles.card, !unlocked && styles.locked]}>
      <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{icon}</Text>
      <Text style={[styles.name, !unlocked && styles.textLocked]}>{name}</Text>
      <Text style={[styles.desc, !unlocked && styles.textLocked]} numberOfLines={2}>
        {unlocked ? description : '???'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginRight: 12,
  },
  locked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  icon: {
    fontSize: 32,
    marginBottom: 6,
  },
  iconLocked: {
    opacity: 0.3,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 4,
  },
  desc: {
    fontSize: 10,
    color: '#78350F',
    textAlign: 'center',
  },
  textLocked: {
    color: '#9CA3AF',
  },
});
