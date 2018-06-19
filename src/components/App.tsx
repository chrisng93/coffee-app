import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel, Coordinates, FilterType, MapData } from '../types';
import { getRequest } from '../fetch';
import {composeFilterFns, filterOnFilterType, filterOnIsochrone} from '../filterMapData';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import CoffeeShop from './CoffeeShop';
import Map from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

interface Props {
  isSmallScreen: boolean;
}

interface State {
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
  // Array of Coordinates for the isochrones.
  isochroneLatLngs: Coordinates[];
}

// TODO: Use redux.
// TODO: Refactor map data filtering functions into file.
export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      map: null,
      mapData: [],
      selectedFilter: null,
      selectedCoffeeShop: null,
      selectedLocation: null,
      walkingTimeMin: 10,
      isochroneLatLngs: null,
    };
    this.setMap = this.setMap.bind(this);
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.getAndRenderIsochrones = this.getAndRenderIsochrones.bind(this);
    this.updateMapData = this.updateMapData.bind(this);
    this.onSelectLocation = this.onSelectLocation.bind(this);
  }

  componentDidMount() {
    this.getAndSetCoffeeShops();
  }

  async getAndSetCoffeeShops() {
    try {
      // TODO: Don't hardcore this API URL in.
      const coffeeShops = await getRequest<CoffeeShopModel[]>(
        'http://localhost:8080/coffee_shop',
      );
      const data: MapData[] = _.map(coffeeShops, coffeeShop => ({
        id: `coffeeshop-${coffeeShop.id.toString()}`,
        geometry: new google.maps.LatLng(
          coffeeShop.coordinates.lat,
          coffeeShop.coordinates.lng,
        ),
        metadata: coffeeShop,
        visible: true,
      }));
      this.setState({ mapData: this.state.mapData.concat(data) });
    } catch (err) {
      // TODO: Error state.
    }
  }

  setMap(newMap: google.maps.Map) {
    this.setState({ map: newMap });
  }

  onFeatureClick(event: google.maps.Data.MouseEvent) {
    // TODO: Call API to get single coffee shop info.
    this.setState({
      selectedCoffeeShop: event.feature.getProperty('metadata'),
    });
  }

  updateMapData(mapData: MapData[], updateFn: (data: MapData) => MapData) {
    let newMapData = mapData;
    if (updateFn) {
      newMapData = _.map(mapData, updateFn);
    }
    // We must do the filtering for shops inside the isochrone *after* we filter the map for other
    // reasons.
    const {isochroneLatLngs} = this.state;
    if (isochroneLatLngs) {
      // We need to create this polygon to use the google.maps.geometry.poly.containsLocation method.
      const polygon = new google.maps.Polygon({ paths: isochroneLatLngs });
      newMapData = _.map(newMapData, (data: MapData) => {
        // Hide coffee shops outside of the isochrone area.
        if (
          data.geometry instanceof google.maps.LatLng &&
          !google.maps.geometry.poly.containsLocation(
            data.geometry,
            polygon,
          )
        ) {
          data.visible = false;
        }
        return data;
      });
    }
    this.setState({ mapData: newMapData });
  }

  async getAndRenderIsochrones(location: google.maps.LatLng, walkingTimeMin: number) {
    const {map, mapData} = this.state;
    const lat = location.lat();
    const lng = location.lng();
    const newData: MapData[] = [{
      id: 'origin',
      geometry: location,
      visible: true,
    }];

    console.log('rendering with walking time', walkingTimeMin)
    // Remove isochrones if walking time not specified.
    if (walkingTimeMin === 0) {
      this.updateMapData(mapData.concat(newData), (data: MapData) => {
        if (data.id === 'isochrones') {
          data.visible = false;
        }
        return data;
      });
      return;
    }

    // Grab isochrones and render them if we have a valid walking time.
    const isochrones = await getRequest<number[][]>(
      `http://localhost:8080/isochrone?origin=${lat},${lng}&walking_time_min=${walkingTimeMin}`,
    );
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

    this.setState({isochroneLatLngs}, () => this.updateMapData(mapData.concat(newData), null));
  }

  onSetWalkingTime(newWalkingTimeMin: number) {
    const {selectedLocation} = this.state;
    if (selectedLocation) {
      this.getAndRenderIsochrones(selectedLocation, newWalkingTimeMin);
    }
    this.setState({ walkingTimeMin: newWalkingTimeMin });
  }

  onSelectLocation(location: google.maps.LatLng) {
    const {mapData, selectedFilter, walkingTimeMin} = this.state;
    if (!location) {
      this.setState({selectedLocation: location, isochroneLatLngs: null}, () => this.updateMapData(mapData, (data: MapData) => composeFilterFns(data, [(data: MapData) => filterOnFilterType(data, selectedFilter), (data: MapData) => filterOnIsochrone(data, null)])));
    } else {
      this.setState({selectedLocation: location}, () => this.getAndRenderIsochrones(location, walkingTimeMin));
    }
  }

  render() {
    const { map, mapData, selectedFilter, selectedCoffeeShop, selectedLocation, walkingTimeMin } = this.state;
    return (
      <div>
        <AppBar
          isSmallScreen={this.props.isSmallScreen}
          map={map}
          selectedFilter={selectedFilter}
          selectedLocation={selectedLocation}
          walkingTimeMin={walkingTimeMin}
          onSelectFilter={(filter: FilterType) =>
            this.setState({ selectedFilter: filter })
          }
          onSetWalkingTime={(newWalkingTimeMin: number) =>
            this.setState({ walkingTimeMin: newWalkingTimeMin })
          }
          onSelectLocation={this.onSelectLocation}
        />
        {selectedCoffeeShop ? (
          <CoffeeShop
            coffeeShop={selectedCoffeeShop}
            onCloseDialog={() => this.setState({ selectedCoffeeShop: null })}
          />
        ) : null}
        <Map
          setMap={this.setMap}
          {...NY_VIEW}
          mapStyles={MAP_STYLES}
          mapData={mapData}
          onFeatureClick={this.onFeatureClick}
        />
      </div>
    );
  }
}
