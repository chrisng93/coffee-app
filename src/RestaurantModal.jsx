import React from 'react';

const RestaurantModal = ({restaurant: {name, city, region, type, summary, orderSuggestions, yelpURL}}) => (
  <div>{name}</div>
);

export default RestaurantModal;
