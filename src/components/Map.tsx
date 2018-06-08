/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import * as React from 'react';

interface Center {
  lat: number;
  lng: number;
}

interface Props {
  center: Center;
  zoom: number;
  mapStyles?: any[];
  setMap?: (map: google.maps.Map) => void;
}

export default class Map extends React.Component<Props, {}> {
  map: google.maps.Map;

  componentDidMount() {
    const {center, zoom, mapStyles, setMap} = this.props;
    this.map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom,
      styles: mapStyles || [],
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
