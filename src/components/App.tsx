import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShop, FilterType } from '../consts';
import {getRequest} from '../fetch';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import Map, {MapData} from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

interface State {
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Data for rendering features on map.
  // TODO: Implement.
  mapData: MapData[];
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Whether or not "open now" filter toggled.
  openNow: boolean;
}

export default class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      map: null,
      mapData: [],
      selectedFilter: null,
      openNow: false,
    };
    this.onSelectFilter = this.onSelectFilter.bind(this);
  }

  componentDidMount() {
    this.getAndSetCoffeeShops();
  }

  async getAndSetCoffeeShops() {
    // TODO: Don't hardcore this API URL in.
    const coffeeShops = await getRequest<CoffeeShop[]>("http://localhost:8080/coffee_shop");
    const data: MapData[] = _.map(coffeeShops, coffeeShop => ({
      id: coffeeShop.id.toString(),
      coordinates: {lat: coffeeShop.coordinates.lat, lng: coffeeShop.coordinates.lng},
    }));
    this.setState({mapData: this.state.mapData.concat(data)});
  }

  onSelectFilter(selectedFilter: FilterType) {
    this.setState({selectedFilter});
  }

  render() {
    const { map, mapData, selectedFilter, openNow } = this.state;
    return (
      <div>
        <AppBar
          map={map}
          selectedFilter={selectedFilter}
          openNow={openNow}
          onSelectFilter={this.onSelectFilter}
          onToggleOpenNow={() => this.setState({ openNow: !openNow })}
        />
        <Map
          setMap={(newMap: google.maps.Map) => this.setState({ map: newMap })}
          {...NY_VIEW}
          mapStyles={MAP_STYLES}
          mapData={mapData}
        />
      </div>
    );
  }
}
