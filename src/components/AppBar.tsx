import { Toolbar, ToolbarGroup } from 'material-ui';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import * as React from 'react';

import { FilterType } from '../consts';
import Filters from './Filters';
import SearchBar from './SearchBar';

const TITLE = 'Coffee App';

interface Props {
  map: google.maps.Map;
  selectedFilter: FilterType;
  openNow: boolean;
  onSelectFilter: (filter: FilterType) => void;
  onToggleOpenNow: () => void;
}

interface State {
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
    const { filtersOpen } = this.state;
    return (
      <div>
        <Toolbar className="app-bar">
          <ToolbarGroup firstChild={true}>
            <h1>{TITLE}</h1>
          </ToolbarGroup>
          <ToolbarGroup style={{ width: '50%' }}>
            <SearchBar map={this.props.map} />
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
