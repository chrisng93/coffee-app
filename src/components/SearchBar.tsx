import { List, ListItem, TextField } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';
import * as _ from 'underscore';

interface Props {
  isSmallScreen: boolean;
  // Google Map used for places service.
  map: google.maps.Map;
  // The google.maps.LatLng object of the selected location, if any.
  selectedLocation: google.maps.LatLng;
  // Update autocomplete open state in AppBar.
  setAutocompleteOpen: (open: boolean) => void;
  // Set the selected location.
  onSelectLocation: (location: google.maps.LatLng) => void;
}

interface State {
  // User's search text.
  searchText: string;
  // List of predictions given search text.
  predictions: google.maps.places.AutocompletePrediction[];
  // Currently selected prediction. -1 if there are no predictions.
  selectedPrediction: number;
}

export default class SearchBar extends React.Component<Props, State> {
  private autocomplete: google.maps.places.AutocompleteService; // Google autocomplete service.
  private geocoder: google.maps.Geocoder; // Google geocode service.
  private places: google.maps.places.PlacesService; // Google places service.

  constructor(props: Props) {
    super(props);
    this.autocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.clearSearch = this.clearSearch.bind(this);
  }

  public readonly state: State = {
    searchText: '',
    predictions: [],
    selectedPrediction: -1,
  };

  componentWillMount() {
    document.addEventListener('keydown', event =>
      this.handleKeyDown(event.keyCode),
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.places && nextProps.map) {
      this.places = new google.maps.places.PlacesService(nextProps.map);
    }
    if (this.props.selectedLocation !== nextProps.selectedLocation) {
      if (nextProps.selectedLocation) {
        this.setState({
          searchText: `${nextProps.selectedLocation
            .lat()
            .toFixed(4)}, ${nextProps.selectedLocation.lng().toFixed(4)}`,
        });
      } else {
        this.setState({ searchText: '' });
      }
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (this.state.predictions.length !== nextState.predictions.length) {
      this.props.setAutocompleteOpen(nextState.predictions.length !== 0);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', event =>
      this.handleKeyDown(event.keyCode),
    );
  }

  onInputChange(input: string) {
    const { map } = this.props;
    const bounds = map ? map.getBounds() : null;
    this.setState({ searchText: input }, () => {
      if (!input) {
        this.setState({ predictions: [] });
        return;
      }

      this.autocomplete.getPlacePredictions(
        { bounds, input },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.error(`Autocomplete failure: ${status}`);
            return;
          }

          this.setState({
            predictions: predictions && predictions.length ? predictions : [],
          });
        },
      );
    });
  }

  onSelectPrediction(selection: google.maps.places.AutocompletePrediction) {
    this.places.getDetails(
      { placeId: selection.place_id },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(`Places failure: ${status}`);
          return;
        }

        this.props.onSelectLocation(result.geometry.location);
        this.setState({
          searchText: selection.description.toLowerCase(),
          predictions: [],
          selectedPrediction: -1,
        });
      },
    );
  }

  onGeocode() {
    this.geocoder.geocode(
      { address: this.state.searchText, bounds: this.props.map.getBounds() },
      (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK) {
          console.error(`Places failure: ${status}`);
          return;
        }

        this.props.onSelectLocation(results[0].geometry.location);
        this.setState({
          searchText: results[0].formatted_address,
          predictions: [],
          selectedPrediction: -1,
        });
      },
    );
  }

  handleKeyDown(keyCode: number) {
    let { predictions, selectedPrediction } = this.state;
    if (!predictions.length) {
      return;
    }

    if (keyCode === 38 && selectedPrediction > 0) {
      // Up arrow event, don't allow user to select below index -1 (no selection).
      selectedPrediction--;
      this.setState({ selectedPrediction });
    } else if (keyCode === 40 && selectedPrediction < predictions.length - 1) {
      // Down arrow event, don't allow user to select more than the predictions array size.
      selectedPrediction++;
      this.setState({ selectedPrediction });
    } else if (keyCode === 13) {
      if (selectedPrediction > -1) {
        // Enter key event, we have an actual selection.
        this.onSelectPrediction(predictions[selectedPrediction]);
      } else {
        this.onGeocode();
      }
    } else if (keyCode === 27) {
      // Escape key event, reset the predictions.
      this.setState({ predictions: [], selectedPrediction: -1 });
    }
  }

  clearSearch() {
    this.props.onSelectLocation(null);
    this.setState({ searchText: '', predictions: [], selectedPrediction: -1 });
  }

  render() {
    const { isSmallScreen } = this.props;
    const { searchText, predictions, selectedPrediction } = this.state;
    return (
      <div className="search-bar">
        <div className="search-text-wrapper">
          <TextField
            value={searchText}
            hintText="Search"
            onChange={(event, val) => this.onInputChange(val)}
            underlineShow={false}
            fullWidth={true}
            style={{
              height: '100%',
              width: isSmallScreen ? '90%' : '100%',
              lineHeight: '16px',
              overflow: 'hidden',
            }}
            hintStyle={{ paddingLeft: isSmallScreen ? '12px' : '24px' }}
            inputStyle={{ paddingLeft: isSmallScreen ? '12px' : '24px' }}
          />
          {searchText ? (
            <div className="search-text-delete" onClick={this.clearSearch}>
              x
            </div>
          ) : null}
        </div>
        <List>
          {_.map(predictions, (prediction, index) => (
            <ListItem
              key={prediction.description}
              primaryText={prediction.description}
              style={{
                backgroundColor:
                  selectedPrediction === index ? colors.grey200 : colors.white,
              }}
              hoverColor={colors.white}
              onClick={() => this.onSelectPrediction(prediction)}
              onMouseEnter={() => this.setState({ selectedPrediction: index })}
            />
          ))}
        </List>
      </div>
    );
  }
}
