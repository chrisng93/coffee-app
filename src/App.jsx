import React, {Component} from 'react';

import Filter from './Filter';
import Map from './Map';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
    };
  }

  render() {
    return (
      <div>
        <Map setMap={map => this.setState({map})} />
        <Filter map={this.state.map} />
      </div>
    );
  }
}
