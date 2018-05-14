import {Checkbox, Toggle} from 'material-ui';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const COFFEE = 'coffee';
const STUDY = 'study';
const GRAM = 'gram';

const renderCoffeeFilters = () =>
  <div style={{display: 'flex', flex: 1}}>
    <div style={{flex: 1}}>
      <h3>Types</h3>
      <div>
        <Checkbox label="Cold brew" />
        <Checkbox label="Matcha" />
      </div>
    </div>
    <div style={{flex: 1}}>
      <h3>Milk Substitutes</h3>
      <div>
        <Checkbox label="Oat milk" />
        <Checkbox label="Almond milk" />
      </div>
    </div>
  </div>;

const Filters = ({selectedFilter, openNow, onSelectFilter, onToggleOpenNow}) =>
  <div className="filters">
    <Toggle
      label="Open Now"
      toggled={openNow}
      onToggle={onToggleOpenNow}
      style={{width: 'auto'}}
    />
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{flex: 1}}>
        <h2>I want...</h2>
        <div>
          <Checkbox
            label="Good coffee"
            checked={selectedFilter === COFFEE}
            onCheck={(e, isInputChecked) => onSelectFilter(isInputChecked ? COFFEE : null)}
          />
          <Checkbox
            label="To study"
            checked={selectedFilter === STUDY}
            onCheck={(e, isInputChecked) => onSelectFilter(isInputChecked ? STUDY : null)}
          />
          <Checkbox
            label="To do it for the gram"
            checked={selectedFilter === GRAM}
            onCheck={(e, isInputChecked) => onSelectFilter(isInputChecked ? GRAM : null)}
          />
        </div>
      </div>
      {selectedFilter === COFFEE ? renderCoffeeFilters() : null}
    </div>
  </div>;

Filters.propTypes = {
  map: PropTypes.any,
  selectedFilter: PropTypes.string.isRequired,
  openNow: PropTypes.bool.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  onToggleOpenNow: PropTypes.func.isRequired,
};

export default Filters;
