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
  walkingRadiusOptions?: google.maps.CircleOptions;
  // Custom styles for the basemap.
  mapStyles?: any[];
  onFeatureClick?: (event: google.maps.Data.MouseEvent) => void;
  // Method for setting the Google Map.
  setMap?: (map: google.maps.Map) => void;
}

interface State {
  idToMapData: { [id: string]: MapData };
  walkingRadius: google.maps.Circle;
}

export default class Map extends React.Component<Props, State> {
  map: google.maps.Map;

  constructor(props: Props) {
    super(props);
    this.state = {
      idToMapData: {},
      walkingRadius: null,
    };
  }

  componentDidMount() {
    const {
      center,
      zoom,
      mapStyles,
      mapData,
      walkingRadiusOptions,
      onFeatureClick,
      setMap,
    } = this.props;
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
    if (onFeatureClick) {
      this.map.data.addListener('click', onFeatureClick);
    }
    this.reconcileData(mapData, walkingRadiusOptions);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.mapData !== nextProps.mapData ||
      this.props.walkingRadiusOptions !== nextProps.walkingRadiusOptions
    ) {
      this.reconcileData(nextProps.mapData, nextProps.walkingRadiusOptions);
    }
  }

  reconcileData(
    newData: MapData[],
    walkingRadiusOptions: google.maps.CircleOptions,
  ) {
    const { idToMapData, walkingRadius } = this.state;
    const oldIDToMapData = { ...idToMapData };
    const newIDToMapData: { [id: string]: MapData } = {};

    // Set visibility based on walking radius.
    let newWalkingRadius = walkingRadius;
    if (walkingRadiusOptions) {
      if (walkingRadius) {
        walkingRadius.setMap(null);
      }
      newWalkingRadius = new google.maps.Circle({
        map: this.map,
        ...walkingRadiusOptions,
      });
      this.map.fitBounds(newWalkingRadius.getBounds());
    } else {
      if (walkingRadius) {
        walkingRadius.setMap(null);
        newWalkingRadius = null;
      }
    }

    const walkingRadiusBounds =
      newWalkingRadius && newWalkingRadius.getBounds();
    _.each(newData, data => {
      // We need to set visibility for each feature in the map component since we need to get the
      // bounds of the walking radius in order to determine visibility.
      if (
        walkingRadiusBounds &&
        !walkingRadiusBounds.contains(data.coordinates)
      ) {
        data.visible = false;
      }
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
        if (oldData.coordinates !== data.coordinates) {
          // Re-render data if coordinates changed.
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

    // If there's a walking radius, filter out (set visibility) coffee shops that are outside of
    // the radius.

    this.setState({
      idToMapData: newIDToMapData,
      walkingRadius: newWalkingRadius,
    });
  }

  addData(data: MapData) {
    if (this.map.data.getFeatureById(data.id)) {
      return;
    }

    const feature = new google.maps.Data.Feature({
      id: data.id,
      geometry: new google.maps.LatLng(
        data.coordinates.lat,
        data.coordinates.lng,
      ),
      properties: { metadata: data.metadata },
    });
    this.map.data.add(feature);
  }

  removeData(data: MapData) {
    const feature = this.map.data.getFeatureById(data.id);
    if (feature) {
      this.map.data.remove(feature);
    }
  }

  filterForWalkingRadius(
    oldData: { [id: string]: MapData },
    newData: { [id: string]: MapData },
  ) {
    const { walkingRadius } = this.state;
    if (walkingRadius) {
      _.each(newData, (data, id) => {
        const {
          coordinates: { lat, lng },
        } = data;
        if (
          !walkingRadius.getBounds().contains(new google.maps.LatLng(lat, lng))
        ) {
          console.log('not visible');
          newData[id].visible = false;
        }
      });
      this.setState({ idToMapData: newData });
    }
  }

  render() {
    return <div id="map" />;
  }
}
