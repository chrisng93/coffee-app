/*eslint-disable no-undef*/
// Need to disable no-undef for google maps definitions.
import {List, ListItem, TextField} from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as _ from 'underscore';

export default class SearchBar extends Component {
  autocomplete; // Google autocomplete service.
  places; // Google places service.

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      predictions: [],
      selectedPrediction: -1,
    };
    this.autocomplete = new google.maps.places.AutocompleteService();
  }

  componentWillMount() {
    document.addEventListener('keydown', event => this.handleKeyDown(event));
  }

  componentWillReceiveProps(nextProps) {
    if (!this.places && nextProps.map) {
      this.places = new google.maps.places.PlacesService(nextProps.map);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', event => this.handleKeyDown(event));
  }

  onInputChange(input) {
    const {map} = this.props;
    const bounds = map ? map.getBounds() : null;
    this.setState({searchText: input}, () => {
      if (!input) {
        this.setState({predictions: []});
        return;
      }

      this.autocomplete.getPlacePredictions({bounds, input}, (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(`Autocomplete failure: ${status}`);
          return;
        }
        this.setState({predictions: predictions && predictions.length ? predictions : []});
      });
    });
  }

  onSelectPrediction({place_id}) {
    const {map} = this.props;
    this.places.getDetails({placeId: place_id}, (result, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(`Places failure: ${status}`);
        return;
      }

      map.panTo(result.geometry.location);
      const feature = new google.maps.Data.Feature({id: 'search', geometry: result.geometry.location});
      map.data.add(feature);

      this.setState({searchText: '', predictions: [], selectedPrediction: -1});
    });
  }

  handleKeyDown(event) {
    let {predictions, selectedPrediction} = this.state;
    if (!predictions.length) {
      return;
    }

    if (event.keyCode === 38 && selectedPrediction > -1) {
      // Up arrow event, don't allow user to select below index -1 (no selection).
      selectedPrediction = Math.min(selectedPrediction--, predictions.length - 1);
      this.setState({selectedPrediction});
    } else if (event.keyCode === 40 && selectedPrediction < predictions.length - 1) {
      // Down arrow event, don't allow user to select more than the predictions array size.
      selectedPrediction++;
      this.setState({selectedPrediction});
    } else if (event.keyCode === 13 && selectedPrediction > -1) {
      // Enter key event, we have an actual selection.
      this.onSelectPrediction(predictions[selectedPrediction]);
    }
  }

  render() {
    const {searchText, predictions, selectedPrediction} = this.state;
    return (
      <div className="search-bar">
        <TextField
          value={searchText}
          hintText="Search"
          onChange={(event, val) => this.onInputChange(val)}
          underlineShow={false}
          fullWidth={true}
          style={{height: '100%', lineHeight: '16px'}}
          hintStyle={{paddingLeft: '24px'}}
          inputStyle={{paddingLeft: '24px'}}
        />
        <List>
          {_.map(predictions, (prediction, index) =>
            <ListItem
              key={prediction.description}
              primaryText={prediction.description}
              style={{backgroundColor: selectedPrediction === index ? colors.grey200 : colors.white}}
              hoverColor={colors.white}
              onClick={() => this.onSelectPrediction(prediction)}
              onMouseEnter={() => this.setState({selectedPrediction: index})}
            />
          )}
        </List>
      </div>
    );
  }
}

SearchBar.propTypes = {
  map: PropTypes.any,
};
