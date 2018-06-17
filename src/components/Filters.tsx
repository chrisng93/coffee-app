import { Checkbox, Slider } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';
import * as _ from 'underscore';

import { FilterType, MapData } from '../types';

interface Props {
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Update map data based on update function.
  updateMapData: (updateFn: (data: MapData) => MapData) => void;
  // Set the walking time to get coffee.
  setWalkingTime: (walkingTimeMin: number) => void;
  // Select a filter.
  onSelectFilter: (filter: FilterType) => void;
  // Update map data based on selected filter.
  updateDataFromFilterFn: (data: MapData, selectedFilter: FilterType) => MapData;
}

// Render all options for coffee filters. Shown when coffee filter is selected.
const renderCoffeeFilters = () => (
  <div style={{ display: 'flex', flex: 1 }}>
    <div style={{ flex: 1 }}>
      <h3>Types</h3>
      <div>
        <Checkbox label="Cold brew" />
        <Checkbox label="Matcha" />
      </div>
    </div>
    <div style={{ flex: 1 }}>
      <h3>Milk Substitutes</h3>
      <div>
        <Checkbox label="Oat milk" />
        <Checkbox label="Almond milk" />
      </div>
    </div>
  </div>
);

const selectFilter = (
  updateMapData: (updateFn: (data: MapData) => MapData) => void,
  onSelectFilter: (filter: FilterType) => void,
  updateDataFromFilterFn: (data: MapData, selectedFilter: FilterType) => MapData,
  filter: FilterType,
) => {
  updateMapData((data: MapData) => updateDataFromFilterFn(data, filter));
  onSelectFilter(filter);
};

// Filters define the options for the end user to filter out coffee shops. Currently not in use.
// Most of the functionality for the filters isn't implemented on the backend yet.
const Filters = ({ selectedFilter, updateMapData, onSelectFilter, updateDataFromFilterFn, setWalkingTime }: Props) => (
  <div className="filters">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div>Walking time
          <Slider
            defaultValue={5}
            min={1}
            max={30}
            step={1}
            style={{color: colors.blueGrey500}}
            sliderStyle={{color: colors.blueGrey500}}
            onChange={(event, val) => _.debounce(() => setWalkingTime(val), 100)()}
          />
        </div>
        <h2>I want...</h2>
        <div>
          <Checkbox
            label="Good coffee"
            checked={selectedFilter === 'coffee'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, updateDataFromFilterFn, isInputChecked ? 'coffee' : null)
            }
          />
          <Checkbox
            label="To study"
            checked={selectedFilter === 'study'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, updateDataFromFilterFn, isInputChecked ? 'study' : null)
            }
          />
          <Checkbox
            label="To do it for the gram"
            checked={selectedFilter === 'gram'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, updateDataFromFilterFn, isInputChecked ? 'gram' : null)
            }
          />
        </div>
      </div>
      {selectedFilter === 'coffee' ? renderCoffeeFilters() : null}
    </div>
  </div>
);

export default Filters;
