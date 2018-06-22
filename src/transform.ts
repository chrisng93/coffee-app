import * as _ from 'underscore';

import { CoffeeShopModel, Coordinates, MapData } from './types';

export const coffeeShopsToMapData = (coffeeShops: CoffeeShopModel[]): MapData[] => {
  return _.map(coffeeShops, coffeeShop => ({
    id: `coffeeshop-${coffeeShop.id.toString()}`,
    geometry: new google.maps.LatLng(
      coffeeShop.coordinates.lat,
      coffeeShop.coordinates.lng,
    ),
    metadata: coffeeShop,
    icon: './assets/coffee_pin.png',
    visible: true,
  }));
};

export const isochronesToCoordinatesAndMapData = (isochrones: number[][]) => {
  const isochroneLatLngs: Coordinates[] = _.map(isochrones, isochrone => ({
    lat: isochrone[0],
    lng: isochrone[1],
  }));
  const mapData: MapData = {
    id: 'isochrones',
    geometry: new google.maps.Data.Polygon([isochroneLatLngs]),
    visible: true,
  };
  return [isochroneLatLngs, mapData];
};
