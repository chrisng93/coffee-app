import * as moment from 'moment';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapData {
  id: string;
  geometry: google.maps.Data.Geometry | google.maps.LatLng;
  // Whether or not the data should be shown on the map.
  visible: boolean;
  // Metadata associated with data point. For example, this could be the CoffeeShop object.
  metadata?: { [key: string]: any };
  // Link to a custom icon to use.
  icon?: string;
  // Used when reconciling data.
  seen?: boolean;
}

export interface DailyHours {
  is_overnight: boolean;
  start: string;
  end: string;
  day: number;
}

interface HoursOverview {
  hours_type: string;
  is_open_now: boolean;
  open: DailyHours[];
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
  // Keys below are added when getting coffee shop details.
  photos?: string[];
  location?: {
    display_address: string[];
  };
  price?: string;
  phone?: string;
  hours: HoursOverview[];
}

// Types of filters that the user can select.
export type FilterType = 'coffee' | 'study' | 'gram';
