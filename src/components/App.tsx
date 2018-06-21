import {Snackbar} from 'material-ui';
import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel, Coordinates, FilterType, MapData } from '../types';
import { getRequest } from '../fetch';
import { filterMapData } from '../filterMapData';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import CoffeeShop from './CoffeeShop';
import Map from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

// TODO: Change this.
const API_URL = 'http://localhost:8080';

const testCoffeeShop = {
  "id": 7,
  "name": "Blue Bottle Coffee",
  "coordinates": {
      "lat": 40.68736,
      "lng": -73.9897699
  },
  "yelp_id": "mRZaqNJqpS4YnRnCVRO5fQ",
  "yelp_url": "https://www.yelp.com/biz/blue-bottle-coffee-brooklyn-7?adjust_creative=yEWd7aXEfny_E9-8M2rG0Q&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=yEWd7aXEfny_E9-8M2rG0Q",
  "has_good_coffee": false,
  "is_good_for_studying": false,
  "photos": [
      "https://s3-media2.fl.yelpcdn.com/bphoto/1Vs9RjmyxVTXFizusvPSvw/o.jpg",
      "https://s3-media2.fl.yelpcdn.com/bphoto/Wm8tIfg1A3rSRvz5KQ1f2A/o.jpg",
      "https://s3-media3.fl.yelpcdn.com/bphoto/m1i0uj3dU9ZalJ4kPAr_AQ/o.jpg"
  ],
  "location": {
      "display_address": [
          "85 Dean St",
          "Brooklyn, NY 11201"
      ]
  },
  "price": "$$",
  "phone": "+15106533394",
  "hours": [
      {
          "hours_type": "REGULAR",
          "open": [
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 0
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 1
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 2
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 3
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 4
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 5
              },
              {
                  "is_overnight": false,
                  "start": "0700",
                  "end": "1900",
                  "day": 6
              }
          ],
          "is_open_now": false
      }
  ]
};

interface Props {
  isSmallScreen: boolean;
}

interface State {
  // Whether the app has an unexpected error.
  hasError: boolean;
  // Error message for the app.
  errorMessage: string;
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Data for rendering features on map.
  mapData: MapData[];
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Selected coffee shop (if any).
  selectedCoffeeShop: CoffeeShopModel;
  // The google.maps.LatLng object of the selected location, if any.
  selectedLocation: google.maps.LatLng;
  // Time in min that the user wants to walk to get coffee.
  walkingTimeMin: number;
  // Polygon for the isochrones. Used for determining if a coffee shop should be visible (if
  // isochrones exist).
  isochronePolygon: google.maps.Polygon;
}

// TODO: Use redux.
export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      map: null,
      mapData: [],
      selectedFilter: null,
      selectedCoffeeShop: null,
      selectedLocation: null,
      walkingTimeMin: 10,
      isochronePolygon: null,
    };
    this.setMap = this.setMap.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.getAndRenderIsochrones = this.getAndRenderIsochrones.bind(this);
    this.updateMapData = this.updateMapData.bind(this);
    this.onSelectFilter = this.onSelectFilter.bind(this);
    this.onSelectLocation = this.onSelectLocation.bind(this);
    this.onSetWalkingTime = this.onSetWalkingTime.bind(this);
  }

  componentDidMount() {
    this.getAndSetCoffeeShops();
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  async getAndSetCoffeeShops() {
    try {
      const coffeeShops = await getRequest<CoffeeShopModel[]>(`${API_URL}/coffee_shop`);
      const data: MapData[] = _.map(coffeeShops, coffeeShop => ({
        id: `coffeeshop-${coffeeShop.id.toString()}`,
        geometry: new google.maps.LatLng(
          coffeeShop.coordinates.lat,
          coffeeShop.coordinates.lng,
        ),
        metadata: coffeeShop,
        icon: './assets/coffee_pin.png',
        visible: true,
      }));
      this.setState({ mapData: this.state.mapData.concat(data) });
    } catch (err) {
      this.setState({errorMessage: 'Error getting coffee shops.'});
    }
  }

  setMap(newMap: google.maps.Map) {
    this.setState({ map: newMap });
  }

  onMapClick(event: google.maps.Data.MouseEvent) {
    this.onSelectLocation(event.latLng);
  }

  onFeatureClick(event: google.maps.Data.MouseEvent) {
    this.getCoffeeShopDetails(event.feature.getProperty('metadata').id);
  }

  updateMapData(mapData: MapData[], updateFn: (data: MapData) => MapData) {
    let newMapData = mapData;
    if (updateFn) {
      newMapData = _.map(mapData, updateFn);
    }
    this.setState({ mapData: newMapData });
  }

  async getAndRenderIsochrones(
    location: google.maps.LatLng,
    walkingTimeMin: number,
  ) {
    const { map, mapData, selectedFilter } = this.state;
    const lat = location.lat();
    const lng = location.lng();
    const newData: MapData[] = [
      {
        id: 'origin',
        geometry: location,
        visible: true,
      },
    ];

    console.log('rendering with walking time', walkingTimeMin);
    // Remove isochrones if walking time not specified.
    if (walkingTimeMin === 0) {
      this.updateMapData(mapData.concat(newData), (data: MapData) =>
        filterMapData(data, null, selectedFilter),
      );
      return;
    }

    try {
      // Grab isochrones and render them if we have a valid walking time.
      const isochrones = await getRequest<number[][]>(
        `${API_URL}/isochrone?origin=${lat},${lng}&walking_time_min=${walkingTimeMin}`,
      );

      // If a new request has come in after this request, exit out.
      if (
        this.state.selectedLocation !== location ||
        this.state.walkingTimeMin !== walkingTimeMin
      ) {
        return;
      }

      const isochroneLatLngs: Coordinates[] = _.map(isochrones, isochrone => ({
        lat: isochrone[0],
        lng: isochrone[1],
      }));
  
      map.panTo(location);
  
      // Add origin/isochrones and hide coffee shops that aren't within the specified
      // walking distance.
      newData.push({
        id: 'isochrones',
        geometry: new google.maps.Data.Polygon([isochroneLatLngs]),
        visible: true,
      });
 
      // We need to create this polygon to use the google.maps.geometry.poly.containsLocation method.
      const isochronePolygon = new google.maps.Polygon({
        paths: isochroneLatLngs,
      });
      this.setState({ isochronePolygon }, () =>
        this.updateMapData(mapData.concat(newData), (data: MapData) =>
          filterMapData(data, isochronePolygon, selectedFilter),
        ),
      );
    } catch (err) {
      this.setState({errorMessage: 'Error getting isochrones.'});
    }
  }

  async getCoffeeShopDetails(id: string) {
    try {
      const coffeeShop = await getRequest<CoffeeShopModel>(
        `${API_URL}/coffee_shop/${id}`,
      )
      console.log(coffeeShop)
      this.setState({selectedCoffeeShop: coffeeShop});
    } catch (err) {
      this.setState({errorMessage: 'Error getting coffee shop details.'});
    }
  }

  onSelectFilter(filter: FilterType) {
    const { mapData, isochronePolygon } = this.state;
    this.setState({ selectedFilter: filter }, () =>
      this.updateMapData(mapData, (data: MapData) =>
        filterMapData(data, isochronePolygon, filter),
      ),
    );
  }

  onSelectLocation(location: google.maps.LatLng) {
    const { mapData, selectedFilter, walkingTimeMin } = this.state;
    if (!location) {
      this.setState(
        { selectedLocation: location, isochronePolygon: null },
        () =>
          this.updateMapData(mapData, (data: MapData) =>
            filterMapData(data, null, selectedFilter),
          ),
      );
    } else {
      this.setState({ selectedLocation: location }, () =>
        this.getAndRenderIsochrones(location, walkingTimeMin),
      );
    }
  }

  onSetWalkingTime(newWalkingTimeMin: number) {
    const { selectedLocation } = this.state;
    if (selectedLocation) {
      this.getAndRenderIsochrones(selectedLocation, newWalkingTimeMin);
    }
    this.setState({ walkingTimeMin: newWalkingTimeMin });
  }

  render() {
    const {
      hasError,
      errorMessage,
      map,
      mapData,
      selectedFilter,
      selectedCoffeeShop,
      selectedLocation,
      walkingTimeMin,
    } = this.state;
    const {isSmallScreen} = this.props;
    if (hasError) {
      return <h1>Something went wrong. Please refresh your page.</h1>;
    }
    return (
      <div>
        <Snackbar
          open={errorMessage !== null}
          message={errorMessage}
          onRequestClose={() => this.setState({errorMessage: null})}
          autoHideDuration={2000}
        />
        <AppBar
          isSmallScreen={isSmallScreen}
          map={map}
          selectedFilter={selectedFilter}
          selectedLocation={selectedLocation}
          walkingTimeMin={walkingTimeMin}
          onSelectFilter={this.onSelectFilter}
          onSelectLocation={this.onSelectLocation}
          onSetWalkingTime={this.onSetWalkingTime}
        />
        {selectedCoffeeShop ? (
          <CoffeeShop
            isSmallScreen={isSmallScreen}
            coffeeShop={selectedCoffeeShop}
            onCloseDialog={() => this.setState({ selectedCoffeeShop: null })}
          />
        ) : null}
        <Map
          setMap={this.setMap}
          {...NY_VIEW}
          mapStyles={MAP_STYLES}
          mapData={mapData}
          onMapClick={this.onMapClick}
          onFeatureClick={this.onFeatureClick}
        />
      </div>
    );
  }
}
