import { List, ListItem, TextField } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';
import * as _ from 'underscore';

interface Props {
  map: google.maps.Map;
}

interface State {
  searchText: string;
  predictions: google.maps.places.AutocompletePrediction[];
  selectedPrediction: number;
}

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

  onSelectPrediction(place_id: string) {
    const { map } = this.props;
    this.places.getDetails({ placeId: place_id }, (result, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(`Places failure: ${status}`);
        return;
      }

      map.panTo(result.geometry.location);
      const feature = new google.maps.Data.Feature({
        id: 'search',
        geometry: result.geometry.location,
      });
      // TODO: Use map's mapData to render.
      map.data.add(feature);

      this.setState({
        searchText: '',
        predictions: [],
        selectedPrediction: -1,
      });
    });
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
      this.onSelectPrediction(predictions[selectedPrediction].place_id);
    } else if (keyCode === 27) {
      this.setState({ predictions: [], selectedPrediction: -1 });
    }
  }

  render() {
    const { searchText, predictions, selectedPrediction } = this.state;
    return (
      <div className="search-bar">
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
              onClick={() => this.onSelectPrediction(prediction.place_id)}
              onMouseEnter={() => this.setState({ selectedPrediction: index })}
            />
          ))}
        </List>
      </div>
    );
  }
}