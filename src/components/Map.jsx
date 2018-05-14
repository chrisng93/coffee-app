/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import MAP_STYLES from '../mapStyles';

const NY_VIEW = {
  center: {lat: 40.727911, lng: -73.985537},
  zoom: 14,
}

export default class Map extends Component {
  map;

  constructor(props) {
    super(props);
    this.state = {
      ...NY_VIEW,
    };
    this.map = null;
  }

  componentDidMount() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      ...NY_VIEW,
      styles: MAP_STYLES,
    });
    this.props.setMap(this.map);
  }

  render() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  }
}

Map.propTypes = {
  setMap: PropTypes.func.isRequired,
};
