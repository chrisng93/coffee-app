import * as React from 'react';

import { FilterType } from '../consts';
import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import Map from './Map';

const NY_VIEW = {
  center: { lat: 40.727911, lng: -73.985537 },
  zoom: 14,
};

interface State {
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Data for rendering features on map.
  // TODO: Implement.
  mapData: any[];
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
  }

  render() {
    const { map, mapData, selectedFilter, openNow } = this.state;
    return (
      <div>
        <AppBar
          map={map}
          selectedFilter={selectedFilter}
          openNow={openNow}
          onSelectFilter={(selectedFilter: FilterType) =>
            this.setState({ selectedFilter })
          }
          onToggleOpenNow={() => this.setState({ openNow: !openNow })}
        />
        <Map
          setMap={(newMap: google.maps.Map) => this.setState({ map: newMap })}
          {...NY_VIEW}
          mapStyles={MAP_STYLES}
        />
      </div>
    );
  }
}
