import { Checkbox, Toggle } from 'material-ui';
import * as React from 'react';

import { FilterType } from '../consts';

interface Props {
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Callback for when filter is selected.
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

const Filters = ({ selectedFilter, onSelectFilter }: Props) => (
  <div className="filters">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <h2>I want...</h2>
        <div>
          <Checkbox
            label="Good coffee"
            checked={selectedFilter === 'coffee'}
            onCheck={(e, isInputChecked) =>
              onSelectFilter(isInputChecked ? 'coffee' : null)
            }
          />
          <Checkbox
            label="To study"
            checked={selectedFilter === 'study'}
            onCheck={(e, isInputChecked) =>
              onSelectFilter(isInputChecked ? 'study' : null)
            }
          />
          <Checkbox
            label="To do it for the gram"
            checked={selectedFilter === 'gram'}
            onCheck={(e, isInputChecked) =>
              onSelectFilter(isInputChecked ? 'gram' : null)
            }
          />
        </div>
      </div>
      {selectedFilter === 'coffee' ? renderCoffeeFilters() : null}
    </div>
  </div>
);

export default Filters;
