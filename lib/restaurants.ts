import rawRestaurants from '../data/restaurants.json';
import { Restaurant } from '../types';

const restaurants = rawRestaurants as Restaurant[];

export function getRestaurants(): Restaurant[] {
  return restaurants;
}

export function getRestaurantById(id: number): Restaurant | undefined {
  return restaurants.find((restaurant) => restaurant.id === id);
}
