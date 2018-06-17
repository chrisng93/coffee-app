import { Toolbar, ToolbarGroup } from 'material-ui';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import * as React from 'react';

import { FilterType, MapData } from '../consts';
import Filters from './Filters';
import SearchBar from './SearchBar';

const TITLE = 'Coffee Around Me';

interface Props {
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Add feature data to the map.
  addMapData: (data: MapData[]) => void;
  // Add walking radius to map.
  setWalkingRadius: (walkingRadiusOptions: google.maps.CircleOptions) => void;
  // Callback for when filter is selected.
  onSelectFilter: (filter: FilterType) => void;
}

interface State {
  // Whether or not filters are open.
  filtersOpen: boolean;
}

export default class Filter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filtersOpen: false,
    };
  }

  render() {
    const { map, addMapData, setWalkingRadius } = this.props;
    const { filtersOpen } = this.state;
    return (
      <div>
        <Toolbar className="app-bar">
          <ToolbarGroup firstChild={true}>
            <h1>{TITLE}</h1>
          </ToolbarGroup>
          <ToolbarGroup style={{ width: '50%' }}>
            <SearchBar
              map={map}
              addMapData={addMapData}
              setWalkingRadius={setWalkingRadius}
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <div onClick={() => this.setState({ filtersOpen: !filtersOpen })}>
              {filtersOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
          </ToolbarGroup>
        </Toolbar>
        {filtersOpen ? <Filters {...this.props} /> : null}
      </div>
    );
  }
}
