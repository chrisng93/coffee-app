import { List, ListItem, TextField } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';
import * as _ from 'underscore';

import { MapData, METERS_PER_HOUR_WALKING_SPEED_MANHATTAN } from '../consts';

interface Props {
  // Google Map used for places service.
  map: google.maps.Map;
  // Add feature data to the map.
  addMapData: (data: MapData[]) => void;
  // Add walking radius to map.
  setWalkingRadius: (walkingRadiusOptions: google.maps.CircleOptions) => void;
}

interface State {
  // User's search text.
  searchText: string;
  // List of predictions given search text.
  predictions: google.maps.places.AutocompletePrediction[];
  // Currently selected prediction. -1 if there are no predictions.
  selectedPrediction: number;
}

const findRadius = (timeMin: number) =>
  (METERS_PER_HOUR_WALKING_SPEED_MANHATTAN * timeMin * 1) / 60;

export default class SearchBar extends React.Component<Props, State> {
  private autocomplete: google.maps.places.AutocompleteService; // Google autocomplete service.
  private places: google.maps.places.PlacesService; // Google places service.

  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: '',
      predictions: [],
      selectedPrediction: -1,
    };
    this.autocomplete = new google.maps.places.AutocompleteService();
    this.clearSearch = this.clearSearch.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', event =>
      this.handleKeyDown(event.keyCode),
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.places && nextProps.map) {
      this.places = new google.maps.places.PlacesService(nextProps.map);
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
    const { map, addMapData, setWalkingRadius } = this.props;
    this.places.getDetails(
      { placeId: selection.place_id },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(`Places failure: ${status}`);
          return;
        }

        map.panTo(result.geometry.location);
        addMapData([
          {
            id: 'search',
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
            visible: true,
          },
        ]);
        setWalkingRadius({
          strokeColor: '#607D8B',
          fillColor: '#B0BEC5',
          radius: findRadius(5),
          center: result.geometry.location,
        });

        this.setState({
          searchText: selection.description.toLowerCase(),
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
    } else if (keyCode === 13 && selectedPrediction > -1) {
      // Enter key event, we have an actual selection.
      this.onSelectPrediction(predictions[selectedPrediction]);
    } else if (keyCode === 27) {
      // Escape key event, reset the predictions.
      this.setState({ predictions: [], selectedPrediction: -1 });
    }
  }

  clearSearch() {
    this.props.setWalkingRadius(null);
    this.setState({ searchText: '', predictions: [], selectedPrediction: -1 });
  }

  render() {
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
            style={{ height: '100%', lineHeight: '16px' }}
            hintStyle={{ paddingLeft: '24px' }}
            inputStyle={{ paddingLeft: '24px' }}
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
