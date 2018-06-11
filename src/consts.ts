import * as moment from 'moment';

interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapData {
  id: string;
  coordinates: Coordinates;
  // Whether or not the data should be shown on the map.
  visible: boolean;
  // Metadata associated with data point. For example, this could be the CoffeeShop object.
  metadata?: { [key: string]: any };
  // Used when reconciling data.
  seen?: boolean;
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
