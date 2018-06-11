import * as React from 'react';
import * as _ from 'underscore';

import { MapData } from '../consts';

interface Center {
  lat: number;
  lng: number;
}

interface Props {
  // Center and zoom for the map.
  center: Center;
  zoom: number;
  // Data to be rendered on the map.
  mapData: MapData[];
  // Custom styles for the basemap.
  mapStyles?: any[];
  // Method for setting the Google Map.
  setMap?: (map: google.maps.Map) => void;
}

interface State {
  idToMapData: { [id: string]: MapData };
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
    const { center, zoom, mapStyles, mapData, setMap } = this.props;
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
    this.reconcileData(mapData);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.mapData !== nextProps.mapData) {
      this.reconcileData(nextProps.mapData);
    }
  }

  reconcileData(newData: MapData[]) {
    const oldIDToMapData = { ...this.state.idToMapData };
    const newIDToMapData: { [id: string]: MapData } = {};
    _.each(newData, data => {
      // Need to create a copy of the data, otherwise the data in the mapping gets mutated
      // immediately when new props are sent in. (Objects in JS are passed by reference)
      newIDToMapData[data.id] = {...data};

      // This is a new data point - add it to the map.
      if (!(data.id in oldIDToMapData)) {
        this.addFeature(data);
      } else {
        const oldData = oldIDToMapData[data.id];
        if (oldData.visible && !data.visible) {
          this.removeFeature(data);
        } else if (!oldData.visible && data.visible) {
          this.addFeature(data);
        }
        oldData.seen = true;
      }
    });

    _.each(oldIDToMapData, data => {
      // Remove data that no longer exists in the new props.
      if (!data.seen) {
        this.removeFeature(data);
      }
      // Reset seen boolean for next reconciliation.
      data.seen = false;
    });

    this.setState({ idToMapData: newIDToMapData });
  }

  addFeature(data: MapData) {
    if (this.map.data.getFeatureById(data.id)) {
      return;
    }

    const feature = new google.maps.Data.Feature({
      id: data.id,
      geometry: new google.maps.LatLng(
        data.coordinates.lat,
        data.coordinates.lng,
      ),
    });
    this.map.data.add(feature);
  }

  removeFeature(data: MapData) {
    const feature = this.map.data.getFeatureById(data.id);
    if (feature) {
      this.map.data.remove(feature);
    }
  }

  render() {
    return <div id="map" />;
  }
}
