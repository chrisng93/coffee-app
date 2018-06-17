import { Checkbox, Slider } from 'material-ui';
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

const updateData = (data: MapData, selectedFilter: FilterType) => {
  if (!selectedFilter) {
    data.visible = true;
  } else if (selectedFilter === 'coffee') {
    // NOTE: has_good_coffee is not implemented yet.
    data.visible = data.metadata.has_good_coffee;
  } else if (selectedFilter === 'study') {
    data.visible = data.metadata.is_good_for_studying;
  } else {
    // NOTE: is_instagrammable is not implemented yet.
    data.visible = data.metadata.is_instagrammable;
  }
  return data;
};

const selectFilter = (
  updateMapData: (updateFn: (data: MapData) => MapData) => void,
  onSelectFilter: (filter: FilterType) => void,
  filter: FilterType,
) => {
  updateMapData((data: MapData) => updateData(data, filter));
  onSelectFilter(filter);
};

const Filters = ({ selectedFilter, updateMapData, onSelectFilter, setWalkingTime }: Props) => (
  <div className="filters">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div>Walking time
          <Slider
            defaultValue={5}
            min={1}
            max={30}
            step={1}
            onChange={(event, val) => _.debounce(() => setWalkingTime(val), 100)()}
          />
        </div>
        <h2>I want...</h2>
        <div>
          <Checkbox
            label="Good coffee"
            checked={selectedFilter === 'coffee'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, isInputChecked ? 'coffee' : null)
            }
          />
          <Checkbox
            label="To study"
            checked={selectedFilter === 'study'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, isInputChecked ? 'study' : null)
            }
          />
          <Checkbox
            label="To do it for the gram"
            checked={selectedFilter === 'gram'}
            onCheck={(e, isInputChecked) =>
              selectFilter(updateMapData, onSelectFilter, isInputChecked ? 'gram' : null)
            }
          />
        </div>
      </div>
      {selectedFilter === 'coffee' ? renderCoffeeFilters() : null}
    </div>
  </div>
);

export default Filters;
