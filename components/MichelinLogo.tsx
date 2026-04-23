import { Text } from 'react-native';

const SIZE_MAP = { sm: 16, md: 20, lg: 26 };

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export default function MichelinLogo({ size = 'md' }: Props) {
  return (
    <Text style={{ fontSize: SIZE_MAP[size], fontWeight: '900', color: '#E2231A', letterSpacing: 3 }}>
      MICHELIN
    </Text>
  );
}
