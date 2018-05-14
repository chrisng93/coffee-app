/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import {Checkbox, Toggle} from 'material-ui';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import SearchBar from './SearchBar';

const TITLE = 'Coffee App';
const COFFEE = 'coffee';
const STUDY = 'study';
const GRAM = 'gram';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFilter: null,
    };
  }

  renderCoffeeSubfilters() {
    return (
      <div>
        <div>
          <h3>Types</h3>
          <div>
            <Checkbox label="Cold brew" />
            <Checkbox label="Matcha" />
          </div>
        </div>
        <div>
          <h3>Milk Substitutes</h3>
          <div>
            <Checkbox label="Oat milk" />
            <Checkbox label="Almond milk" />
          </div>
        </div>
      </div>
    );
  }

  renderStudySubfilters() {
    return (
      <div>
        <h3>Options</h3>
        <Checkbox label="Wifi" />
        <Checkbox label="Quiet" />
        <Checkbox label="Has outlets" />
        <Checkbox label="Open late" />
      </div>
    );
  }

  renderSubfilters() {
    const {selectedFilter} = this.state;
    switch (selectedFilter) {
      case COFFEE:
        return this.renderCoffeeSubfilters();
      case STUDY:
        return this.renderStudySubfilters();
      default:
        return null;
    }
  }

  render() {
    const {selectedFilter} = this.state;
    return (
      <div className="filter">
        <h1>{TITLE}</h1>
        <SearchBar map={this.props.map} />
        <div style={{margin: '16px'}}>
          <Toggle label="Open Now" onToggle={() => console.log('Filter for open restaurants')} />
          <div>
            <h2>I want...</h2>
            <div>
              <Checkbox
                label="Good coffee"
                checked={selectedFilter === COFFEE}
                onCheck={(e, isInputChecked) => this.setState({selectedFilter: isInputChecked ? COFFEE : null})}
              />
              <Checkbox
                label="To study"
                checked={selectedFilter === STUDY}
                onCheck={(e, isInputChecked) => this.setState({selectedFilter: isInputChecked ? STUDY : null})}
              />
              <Checkbox
                label="To do it for the gram"
                checked={selectedFilter === GRAM}
                onCheck={(e, isInputChecked) => this.setState({selectedFilter: isInputChecked ? GRAM : null})}
              />
            </div>
          </div>
          {this.renderSubfilters()}
        </div>
      </div>
    );
  }
}

Filter.propTypes = {
  map: PropTypes.any,
};
