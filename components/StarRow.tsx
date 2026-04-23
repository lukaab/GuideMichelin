import { StyleSheet, Text, View } from 'react-native';
import MichelinStarIcon from './MichelinStarIcon';

const RED = '#E2231A';

const COUNT: Record<string, number> = {
  'Trois étoiles': 3,
  'Deux étoiles': 2,
  'Une étoile': 1,
  'Bib Gourmand': 0,
};

interface Props {
  category: string;
  size?: number;
}

export default function StarRow({ category, size = 14 }: Props) {
  const count = COUNT[category] ?? 0;
  if (count === 0) {
    return (
      <View style={styles.row}>
        <Text style={[styles.bib, { fontSize: size }]}>😊</Text>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <MichelinStarIcon key={i} size={size} color={RED} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bib: {
    lineHeight: 18,
  },
});
