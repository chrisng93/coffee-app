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
}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      map: null,
      mapData: [],
      selectedFilter: null,
      selectedCoffeeShop: null,
    };
    this.setMap = this.setMap.bind(this);
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.updateMapData = this.updateMapData.bind(this);
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
    this.setState({ mapData: _.map(mapData, updateFn) });
  }

  render() {
    const { map, mapData, selectedFilter, selectedCoffeeShop } = this.state;
    return (
      <div>
        <AppBar
          isSmallScreen={this.props.isSmallScreen}
          map={map}
          mapData={mapData}
          selectedFilter={selectedFilter}
          updateMapData={this.updateMapData}
          onSelectFilter={(filter: FilterType) =>
            this.setState({ selectedFilter: filter })
          }
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
