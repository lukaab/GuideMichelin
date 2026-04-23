import { Restaurant } from '../types';

export interface MapSectionProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
  onPreviewVisibilityChange?: (visible: boolean) => void;
  userCoords?: { lat: number; lng: number };
}

declare const MapSection: React.FC<MapSectionProps>;
export default MapSection;
