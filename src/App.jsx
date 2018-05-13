import React, { Component } from 'react';

import Filter from './Filter';
import Map from './Map';

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
