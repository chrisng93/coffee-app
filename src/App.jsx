import React, { Component } from 'react';

import Filter from './Filter';
import Map from './Map';

// const TITLE = 'Coffee App';

export default class App extends Component {
  render() {
    return (
      <div>
        <Map />
        <Filter />
      </div>
    );
  }
}
