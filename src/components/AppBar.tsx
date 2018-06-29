import { Toolbar, ToolbarGroup } from 'material-ui';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import * as React from 'react';

import { FilterType } from '../types';
import Filters from './Filters';
import SearchBar from './SearchBar';

const TITLE = 'Coffee Around Me';

interface Props {
  isSmallScreen: boolean;
  // Map for passing down to SearchBar.
  map: google.maps.Map;
  // Whether or not filters are open.
  filtersOpen: boolean;
  // Toggle filter open status.
  onToggleFilter: () => void;
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // The google.maps.LatLng object of the selected location, if any.
  selectedLocation: google.maps.LatLng;
  // Time in min that the user wants to walk to get coffee.
  walkingTimeMin: number;
  // Select a filter.
  onSelectFilter: (filter: FilterType) => void;
  // Set the walking time to get coffee.
  onSetWalkingTime: (walkingTimeDisplay: number) => void;
  // Set the selected location.
  onSelectLocation: (location: google.maps.LatLng) => void;
}

interface State {
  // Whether or not autocomplete is open.
  autocompleteOpen: boolean;
}

export default class AppBar extends React.Component<Props, State> {
  public readonly state: State = {
    autocompleteOpen: false,
  };

  render() {
    const {
      isSmallScreen,
      map,
      filtersOpen,
      onToggleFilter,
      selectedFilter,
      selectedLocation,
      walkingTimeMin,
      onSelectFilter,
      onSetWalkingTime,
      onSelectLocation,
    } = this.props;
    const { autocompleteOpen } = this.state;
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
              selectedLocation={selectedLocation}
              setAutocompleteOpen={(autocompleteOpen: boolean) =>
                this.setState({ autocompleteOpen })
              }
              onSelectLocation={onSelectLocation}
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <div onClick={onToggleFilter}>
              {filtersOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
          </ToolbarGroup>
        </Toolbar>
        {filtersOpen ? (
          <Filters
            selectedFilter={selectedFilter}
            selectedLocation={selectedLocation}
            onSelectFilter={onSelectFilter}
            onSetWalkingTime={onSetWalkingTime}
            walkingTimeMin={walkingTimeMin}
          />
        ) : null}
      </div>
    );
  }
}
