import * as React from 'react';

interface Center {
  lat: number;
  lng: number;
}

interface Props {
  // Center and zoom for the map.
  center: Center;
  zoom: number;
  // Custom styles for the basemap.
  mapStyles?: any[];
  // Method for setting the Google Map.
  setMap?: (map: google.maps.Map) => void;
}

export default class Map extends React.Component<Props, {}> {
  map: google.maps.Map;

  componentDidMount() {
    const { center, zoom, mapStyles, setMap } = this.props;
    this.map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom,
      minZoom: 14,
      maxZoom: 18,
      styles: mapStyles || [],
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    });
    if (setMap) {
      setMap(this.map);
    }
  }

  // TODO: Reconcile data and use it to render features on the map.

  render() {
    return (
      <div>
        <div id="map" />
      </div>
    );
  }
}
