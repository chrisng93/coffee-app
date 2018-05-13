/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import Dialog from 'material-ui/Dialog';
import React, { Component } from 'react';

import RestaurantModal from './RestaurantModal';

const NY_VIEW = {
  center: {lat: 40.727911, lng: -73.985537},
  zoom: 14,
}

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...NY_VIEW,
    };
    this.map = null;
  }

  componentDidMount() {
    this.map = new google.maps.Map(document.getElementById('map'), NY_VIEW);
    // this.map.fitBounds(this.createBounds(restaurants));
  }

  createBounds() {

  }

  render() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  }
}
