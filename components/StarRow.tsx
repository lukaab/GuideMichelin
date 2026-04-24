import { Text } from 'react-native';

const STAR_MAP: Record<string, string> = {
  'Trois étoiles': '⭐⭐⭐',
  'Deux étoiles': '⭐⭐',
  'Une étoile': '⭐',
  'Bib Gourmand': '😊',
};

interface Props {
  category: string;
  size?: number;
}

export default function StarRow({ category, size = 16 }: Props) {
  return <Text style={{ fontSize: size }}>{STAR_MAP[category] ?? ''}</Text>;
}
