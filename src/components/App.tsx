import {Snackbar} from 'material-ui';
import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel, Coordinates, FilterType, MapData } from '../types';
import { getRequest } from '../fetch';
import { filterMapData } from '../filterMapData';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import CoffeeShop from './CoffeeShop';
import Loading from './Loading';
import Map from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

// TODO: Change this.
const API_URL = 'http://localhost:8080';

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
  isFetchingIsochrone: boolean;
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
      isFetchingIsochrone: false,
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
    if (event.feature.getId() === 'origin' || event.feature.getId() === 'isochrone') {
      return;
    }
    this.getCoffeeShopDetails(event.feature.getProperty('metadata'));
  }

  updateMapData(mapData: MapData[], updateFn: (data: MapData) => MapData) {
    let newMapData = mapData;
    if (updateFn) {
      newMapData = _.map(mapData, updateFn);
    }
    this.setState({ mapData: newMapData });
  }

  getAndRenderIsochrones(
    location: google.maps.LatLng,
    walkingTimeMin: number,
  ) {
    this.setState({isFetchingIsochrone: true}, async () => {
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
        this.setState({isFetchingIsochrone: false}, () =>
          this.updateMapData(mapData.concat(newData), (data: MapData) =>
            filterMapData(data, null, selectedFilter),
          )
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
        this.setState({ isochronePolygon, isFetchingIsochrone: false }, () =>
          this.updateMapData(mapData.concat(newData), (data: MapData) =>
            filterMapData(data, isochronePolygon, selectedFilter),
          ),
        );
      } catch (err) {
        this.setState({isFetchingIsochrone: false, errorMessage: 'Error getting isochrones.'});
      }
    });
  }

  getCoffeeShopDetails(coffeeShop: CoffeeShopModel) {
    this.setState({selectedCoffeeShop: coffeeShop}, async () => {
      try {
        const coffeeShopWithDetails = await getRequest<CoffeeShopModel>(
          `${API_URL}/coffee_shop/${coffeeShop.id}`,
        )
        console.log(coffeeShopWithDetails)
        this.setState({selectedCoffeeShop: coffeeShopWithDetails});
      } catch (err) {
        this.setState({errorMessage: 'Error getting coffee shop details.'});
      }
    });
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
      isFetchingIsochrone,
    } = this.state;
    const {isSmallScreen} = this.props;
    if (hasError) {
      return <h1 style={{textAlign: 'center'}}>Something went wrong. Please refresh your page.</h1>;
    }
    return (
      <div>
        <Snackbar
          open={errorMessage !== null}
          message={errorMessage}
          onRequestClose={() => this.setState({errorMessage: null})}
          autoHideDuration={2000}
        />
        {isFetchingIsochrone ? <Loading /> : null}
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
