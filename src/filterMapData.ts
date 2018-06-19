import * as _ from 'underscore';

import { FilterType, MapData } from './types';

type FilterMapDataFn = (data: MapData) => MapData;

export function composeFilterFns(data: MapData, filterFns: FilterMapDataFn[]) {
  _.each(filterFns, filterFn => data = filterFn(data));
  return data;
}

export const filterOnIsochrone = (data: MapData, polygon: google.maps.Polygon) => {
  if (!polygon) {
    if (data.id === 'origin' || data.id === 'isochrones') {
      data.visible = false;
    } else {
      data.visible = true;
    }
  } else if ( // Hide coffee shops outside of the isochrone area.
    data.geometry instanceof google.maps.LatLng &&
    !google.maps.geometry.poly.containsLocation(
      data.geometry,
      polygon,
    )
  ) {
    data.visible = false;
  }
  return data;
};

export const filterOnFilterType = (data: MapData, selectedFilter: FilterType) => {
  // TODO: Add back filtering for good coffee and instagrammable.
  if (!selectedFilter) {
    data.visible = true;
  } else if (selectedFilter === 'study') {
    if (data.metadata) {
      data.visible = data.metadata.is_good_for_studying;
    }
  }
  return data;
};
