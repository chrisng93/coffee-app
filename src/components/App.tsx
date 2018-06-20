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
  // Polygon for the isochrones. Used for determining if a coffee shop should be visible (if
  // isochrones exist).
  isochronePolygon: google.maps.Polygon;
}

// TODO: Use redux.
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
      isochronePolygon: null,
    };
    this.setMap = this.setMap.bind(this);
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
      // TODO: Handle error.
    }
  }

  async getCoffeeShopDetails(id: string) {
    try {
      const coffeeShop = await getRequest<CoffeeShopModel>(
        `${API_URL}/coffee_shop/${id}`,
      )
      this.setState({selectedCoffeeShop: coffeeShop});
    } catch (err) {
      // TODO: Handle error.
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
      map,
      mapData,
      selectedFilter,
      selectedCoffeeShop,
      selectedLocation,
      walkingTimeMin,
    } = this.state;
    const {isSmallScreen} = this.props;
    return (
      <div>
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
          onFeatureClick={this.onFeatureClick}
        />
      </div>
    );
  }
}
