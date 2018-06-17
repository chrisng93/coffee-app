import * as moment from 'moment';

interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapData {
  id: string;
  geometry: google.maps.Data.Geometry | google.maps.LatLng;
  // Whether or not the data should be shown on the map.
  visible: boolean;
  walkingRadiusOptions?: { [key: string]: any };
  // Metadata associated with data point. For example, this could be the CoffeeShop object.
  metadata?: { [key: string]: any };
  // Used when reconciling data.
  seen?: boolean;
}

// Maps to the coffee shop model we get back from the API.
export interface CoffeeShopModel {
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
