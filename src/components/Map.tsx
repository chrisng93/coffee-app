import * as React from 'react';
import * as _ from 'underscore';

import { MapData } from '../types';

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
  onMapClick?: (event: google.maps.Data.MouseEvent) => void;
  onFeatureClick?: (event: google.maps.Data.MouseEvent) => void;
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
    const {
      center,
      zoom,
      mapStyles,
      mapData,
      onMapClick,
      onFeatureClick,
      setMap,
    } = this.props;
    this.map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom,
      minZoom: 12,
      maxZoom: 18,
      styles: mapStyles || [],
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    });
    if (setMap) {
      setMap(this.map);
    }
    if (onMapClick) {
      this.map.addListener('click', onMapClick);
    }
    if (onFeatureClick) {
      this.map.data.addListener('click', onFeatureClick);
    }
    this.reconcileData(mapData);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.mapData !== nextProps.mapData) {
      this.reconcileData(nextProps.mapData);
    }
  }

  reconcileData(newData: MapData[]) {
    const { idToMapData } = this.state;
    const oldIDToMapData = { ...idToMapData };
    const newIDToMapData: { [id: string]: MapData } = {};

    _.each(newData, data => {
      // Need to create a copy of the data, otherwise the data in the mapping gets mutated
      // immediately when new props are sent in. (Objects in JS are passed by reference)
      newIDToMapData[data.id] = { ...data };

      // This is a new data point - add it to the map.
      if (!(data.id in oldIDToMapData)) {
        this.addData(data);
      } else {
        const oldData = oldIDToMapData[data.id];
        if (oldData.visible && !data.visible) {
          // Remove data if it should no longer be visible.
          this.removeData(data);
        } else if (!oldData.visible && data.visible) {
          // Add data if it should be visible.
          this.addData(data);
        }
        if (oldData.geometry !== data.geometry) {
          // Re-render data if geometry has changed.
          this.removeData(data);
          this.addData(data);
        }
        oldData.seen = true;
      }
    });

    _.each(oldIDToMapData, data => {
      // Remove data that no longer exists in the new props.
      if (!data.seen) {
        this.removeData(data);
      }
      // Reset seen boolean for next reconciliation.
      data.seen = false;
    });

    // Set map's center at the origin if present.
    const origin = this.map.data.getFeatureById('origin');
    if (origin && newIDToMapData.origin && newIDToMapData.origin.visible) {
      let originLatLng: google.maps.LatLng;
      origin.getGeometry().forEachLatLng(latLng => (originLatLng = latLng));
      this.map.setCenter(originLatLng);
    }

    this.setState({ idToMapData: newIDToMapData });
  }

  addData(data: MapData) {
    if (this.map.data.getFeatureById(data.id)) {
      return;
    }

    const feature = new google.maps.Data.Feature({
      id: data.id,
      geometry: data.geometry,
      properties: { metadata: data.metadata },
    });
    this.map.data.add(feature);
    if (data.icon) {
      this.map.data.overrideStyle(feature, {
        icon: {
          url: data.icon,
          scaledSize: new google.maps.Size(46, 46),
        },
      });
    }

    // Special case for isochrones - fit the map to these bounds.
    if (data.id === 'isochrones') {
      const bounds = new google.maps.LatLngBounds();
      (data.geometry as google.maps.Data.Geometry).forEachLatLng(latLng =>
        bounds.extend(latLng),
      );
      this.map.fitBounds(bounds);
    }
  }

  removeData(data: MapData) {
    const feature = this.map.data.getFeatureById(data.id);
    if (feature) {
      this.map.data.remove(feature);
    }
  }

  render() {
    return <div id="map" />;
  }
}
