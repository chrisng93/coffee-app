import * as moment from 'moment';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Maps to the coffee shop model we get back from the API.
export interface CoffeeShop {
  id: number;
  last_updated: moment.Moment;
  name: string;
  coordinates: Coordinates;
  yelp_id: string;
  yelp_url: string;
  has_good_coffee: boolean;
  is_good_for_studying: boolean;
}

// Types of filters that the user can select.
export type FilterType = 'coffee' | 'study' | 'gram';
