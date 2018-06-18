import { Toolbar, ToolbarGroup } from 'material-ui';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import * as React from 'react';

import { FilterType, MapData } from '../types';
import Filters from './Filters';
import SearchBar from './SearchBar';

const TITLE = 'Coffee Around Me';

interface Props {
  isSmallScreen: boolean;
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Data to render on map.
  mapData: MapData[];
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Update map data based on input map data and update function.
  updateMapData: (
    mapData: MapData[],
    updateFn: (data: MapData) => MapData,
  ) => void;
  // Select a filter.
  onSelectFilter: (filter: FilterType) => void;
}

interface State {
  // Whether or not filters are open.
  filtersOpen: boolean;
  // Whether or not autocomplete is open.
  autocompleteOpen: boolean;
  // Time in min that the user wants to walk to get coffee.
  walkingTimeMin: number;
}

export default class AppBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filtersOpen: false,
      autocompleteOpen: false,
      walkingTimeMin: 10,
    };
    this.updateDataFromFilterFn = this.updateDataFromFilterFn.bind(this);
  }

  updateDataFromFilterFn(data: MapData, selectedFilter: FilterType) {
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
  }

  render() {
    const {
      isSmallScreen,
      map,
      mapData,
      updateMapData,
      selectedFilter,
    } = this.props;
    const { filtersOpen, autocompleteOpen, walkingTimeMin } = this.state;
    return (
      <div>
        <Toolbar className="app-bar">
          {!autocompleteOpen || !isSmallScreen ? (
            <ToolbarGroup firstChild={true}>
              <h1>{TITLE}</h1>
            </ToolbarGroup>
          ) : null}
          <ToolbarGroup style={{ width: isSmallScreen ? '90%' : '50%' }}>
            <SearchBar
              isSmallScreen={isSmallScreen}
              map={map}
              mapData={mapData}
              updateMapData={updateMapData}
              walkingTimeMin={walkingTimeMin}
              updateDataFilter={(data: MapData) =>
                this.updateDataFromFilterFn(data, selectedFilter)
              }
              setAutocompleteOpen={(autocompleteOpen: boolean) =>
                this.setState({ autocompleteOpen })
              }
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <div onClick={() => this.setState({ filtersOpen: !filtersOpen })}>
              {filtersOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
          </ToolbarGroup>
        </Toolbar>
        {filtersOpen ? (
          <Filters
            {...this.props}
            updateMapData={(updateFn: (data: MapData) => MapData) =>
              updateMapData(mapData, updateFn)
            }
            updateDataFromFilterFn={this.updateDataFromFilterFn}
            setWalkingTime={(newWalkingTimeMin: number) =>
              this.setState({ walkingTimeMin: newWalkingTimeMin })
            }
          />
        ) : null}
      </div>
    );
  }
}
