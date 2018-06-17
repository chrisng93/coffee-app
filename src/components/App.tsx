import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel, FilterType, MapData } from '../types';
import { getRequest } from '../fetch';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import CoffeeShop from './CoffeeShop';
import Map from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

interface State {
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Data for rendering features on map.
  mapData: MapData[];
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Selected coffee shop (if any).
  selectedCoffeeShop: CoffeeShopModel;
}

export default class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      map: null,
      mapData: [],
      selectedFilter: null,
      selectedCoffeeShop: null,
    };
    this.setMap = this.setMap.bind(this);
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.addMapData = this.addMapData.bind(this);
  }

  componentDidMount() {
    this.getAndSetCoffeeShops();
  }

  setNewMapData(currentMapData: MapData[], additionalMapData: MapData[]) {
    this.setState({ mapData: currentMapData.concat(additionalMapData) });
  }

  async getAndSetCoffeeShops() {
    try {
      // TODO: Don't hardcore this API URL in.
      const coffeeShops = await getRequest<CoffeeShopModel[]>(
        'http://localhost:8080/coffee_shop',
      );
      const data: MapData[] = _.map(coffeeShops, coffeeShop => ({
        id: `coffeeshop-${coffeeShop.id.toString()}`,
        geometry: new google.maps.LatLng(coffeeShop.coordinates.lat, coffeeShop.coordinates.lng),
        metadata: coffeeShop,
        visible: true,
      }));
      this.setNewMapData(this.state.mapData, data);
    } catch (err) {
      // TODO: Error state.
    }
  }

  onSelectFilter(selectedFilter: FilterType, mapData: MapData[]) {
    const newMapData: MapData[] = _.map(mapData, data => {
      if (!selectedFilter) {
        data.visible = true;
      } else if (selectedFilter === 'coffee') {
        // NOTE: has_good_coffee is not implemented yet.
        data.visible = data.metadata.has_good_coffee;
      } else if (selectedFilter === 'study') {
        data.visible = data.metadata.is_good_for_studying;
      } else {
        // NOTE: is_instagrammable is not implemented yet.
        data.visible = data.metadata.is_instagrammable;
      }
      return data;
    });
    this.setState({ selectedFilter, mapData: newMapData });
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

  addMapData(data: MapData[]) {
    this.setNewMapData(this.state.mapData, data);
  }

  render() {
    const {
      map,
      mapData,
      selectedFilter,
      selectedCoffeeShop,
    } = this.state;
    return (
      <div>
        <AppBar
          map={map}
          selectedFilter={selectedFilter}
          addMapData={this.addMapData}
          onSelectFilter={filter => this.onSelectFilter(filter, mapData)}
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
