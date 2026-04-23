import { StyleSheet, Text, View } from 'react-native';

interface MapMarkerIconProps {
  category: string;
  color: string;
  selected?: boolean;
}

export default function MapMarkerIcon({
  category,
  color,
  selected = false,
}: MapMarkerIconProps) {
  const starCount =
    category === 'Trois étoiles'
      ? 3
      : category === 'Deux étoiles'
        ? 2
        : category === 'Une étoile'
          ? 1
          : 0;

  return (
    <View
      style={[
        styles.shell,
        starCount === 3
          ? styles.shellThreeStars
          : starCount === 2
            ? styles.shellTwoStars
            : starCount === 1
              ? styles.shellOneStar
              : styles.shellBib,
        { borderColor: color },
        selected && [styles.shellSelected, { shadowColor: color }],
      ]}
    >
      {starCount > 0 ? (
        <View style={styles.starRow}>
          {Array.from({ length: starCount }).map((_, index) => (
            <Text key={index} style={[styles.star, { color }]}>
              ✦
            </Text>
          ))}
        </View>
      ) : (
        <Text style={[styles.bibText, { color }]}>BIB</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 9,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  shellBib: {
    width: 48,
  },
  shellOneStar: {
    width: 42,
  },
  shellTwoStars: {
    width: 50,
  },
  shellThreeStars: {
    width: 58,
  },
  shellSelected: {
    transform: [{ scale: 1.04 }],
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  star: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 15,
  },
  bibText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
