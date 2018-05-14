import {Toolbar, ToolbarGroup} from 'material-ui';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Filters from './Filters';
import SearchBar from './SearchBar';

const TITLE = 'Coffee App';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtersOpen: false,
    };
  }

  render() {
    const {filtersOpen} = this.state;
    return (
      <div>
        <Toolbar className="app-bar">
          <ToolbarGroup firstChild={true}>
            <h1>{TITLE}</h1>
          </ToolbarGroup>
          <ToolbarGroup style={{width: '50%'}}>
            <SearchBar map={this.props.map} />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <div onClick={() => this.setState({filtersOpen: !filtersOpen})}>
              {filtersOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
          </ToolbarGroup>
        </Toolbar>
        {filtersOpen ? <Filters {...this.props} /> : null}
      </div>
    );
  }
}

Filter.propTypes = {
  map: PropTypes.any,
  selectedFilter: PropTypes.string.isRequired,
  openNow: PropTypes.bool.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  onToggleOpenNow: PropTypes.func.isRequired,
};
