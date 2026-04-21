import { StyleSheet, Text, View } from 'react-native';

interface Props {
  progress: number; // 0 to 1
  label?: string;
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, label, color = '#E2231A', height = 8 }: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  track: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
