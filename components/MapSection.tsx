import { Restaurant } from '../types';

export interface MapSectionProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
  onPreviewVisibilityChange?: (visible: boolean) => void;
}

declare const MapSection: React.FC<MapSectionProps>;
export default MapSection;
