import * as React from 'react';
import * as _ from 'underscore';

import {MapData} from '../consts';

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
  // Data to be rendered on the map.
  mapData: MapData[];
  // Method for setting the Google Map.
  setMap?: (map: google.maps.Map) => void;
}

interface State {
  idToMapData: {[id: string]: MapData};
}

export default class Map extends React.Component<Props, State> {
  map: google.maps.Map;

  constructor(props: Props) {
    super(props);
    this.state = {
      idToMapData: {},
    };
  }

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

  componentWillReceiveProps(nextProps: Props) {
    this.reconcileData(this.state.idToMapData, nextProps.mapData);
  }

  reconcileData(oldIDToMapData: {[key: string]: MapData}, newData: MapData[]) {
    const newIDToMapData: {[id: string]: MapData} = {};
    _.each(newData, data => {
      newIDToMapData[data.id] = data;
      
      // This is a new data point - add it to the map.
      if (!(data.id in oldIDToMapData)) {
        const feature = new google.maps.Data.Feature({
          id: `coffeeshop-${data.id}`,
          geometry: new google.maps.LatLng(data.coordinates.lat, data.coordinates.lng),
        });
        this.map.data.add(feature);
      } else {
        oldIDToMapData[data.id].seen = true;
      }
    });

    _.each(oldIDToMapData, data => {
      // Remove data that no longer exists in the new props.
      if (!data.seen) {
        const feature = this.map.data.getFeatureById(data.id);
        this.map.data.remove(feature);
      }
      // Reset seen boolean for next reconciliation.
      data.seen = false;
    });

    this.setState({idToMapData: newIDToMapData});
  }

  render() {
    return <div id="map" />;
  }
}
