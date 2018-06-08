/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class Map extends Component {
  map;

  componentDidMount() {
    const {center, zoom, mapStyles, setMap} = this.props;
    this.map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom,
      styles: mapStyles || {},
      fullscreenControl: false,
    });
    if (setMap) {
      setMap(this.map);
    }
  }

  // TODO: Reconcile data and use it to render.

  render() {
    return (
      <div>
        <div id="map"></div>
      </div>
    );
  }
}

Map.propTypes = {
  center: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  mapStyles: PropTypes.array,
  setMap: PropTypes.func,
};
