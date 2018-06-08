import React, {Component} from 'react';

import MAP_STYLES from '../mapStyles';
import AppBar from './AppBar';
import Map from './Map';

const NY_VIEW = {
  center: {lat: 40.727911, lng: -73.985537},
  zoom: 14,
};

// TODO: Use typescript.
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      mapData: [],
      selectedFilter: '',
      openNow: false,
    };
  }

  render() {
    const {map, mapData, selectedFilter, openNow} = this.state;
    return (
      <div>
        <AppBar
          map={map}
          selectedFilter={selectedFilter}
          openNow={openNow}
          onSelectFilter={selectedFilter => this.setState({selectedFilter})}
          onToggleOpenNow={() => this.setState({openNow: !openNow})}
        />
        <Map setMap={newMap => this.setState({map: newMap})} {...NY_VIEW} mapStyles={MAP_STYLES} data={mapData} />
      </div>
    );
  }
}
