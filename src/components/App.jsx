import React, {Component} from 'react';

import AppBar from './AppBar';
import Map from './Map';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      selectedFilter: '',
      openNow: false,
    };
  }

  render() {
    const {selectedFilter, openNow} = this.state;
    return (
      <div>
        <AppBar
          map={this.state.map}
          selectedFilter={selectedFilter}
          openNow={openNow}
          onSelectFilter={selectedFilter => this.setState({selectedFilter})}
          onToggleOpenNow={() => this.setState({openNow: !openNow})}
        />
        <Map setMap={map => this.setState({map})} />
      </div>
    );
  }
}
