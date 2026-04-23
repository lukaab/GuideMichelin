import { StyleSheet, Text, View } from 'react-native';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { michelin: 16, guide: 12 },
  md: { michelin: 22, guide: 16 },
  lg: { michelin: 28, guide: 20 },
};

export default function MichelinLogo({ size = 'md' }: Props) {
  const s = SIZES[size];
  return (
    <View style={styles.row}>
      <Text style={[styles.michelin, { fontSize: s.michelin }]}>MICHELIN</Text>
      <Text style={[styles.guide, { fontSize: s.guide }]}> GUIDE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  michelin: {
    fontWeight: '900',
    color: '#E2231A',
    letterSpacing: 1,
  },
  guide: {
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 3,
  },
});
