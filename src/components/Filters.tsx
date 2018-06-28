import { Checkbox, FlatButton, TextField } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';

import { FilterType, MapData } from '../types';

interface Props {
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // The google.maps.LatLng object of the selected location, if any.
  selectedLocation: google.maps.LatLng;
  // Set the walking time to get coffee.
  onSetWalkingTime: (walkingTimeDisplay: number) => void;
  // Select a filter.
  onSelectFilter: (filter: FilterType) => void;
  // Time in min that the user wants to walk to get coffee. This is the actual value, rather than
  // the display in the text field.
  walkingTimeMin: number;
  onError: (msg: string) => void;
}

interface State {
  walkingTimeDisplay: number | string;
  walkingTimeError: string;
}

export default class Filters extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      walkingTimeDisplay: props.walkingTimeMin,
      walkingTimeError: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.walkingTimeMin !== nextProps.walkingTimeMin) {
      this.setState({ walkingTimeDisplay: nextProps.walkingTimeMin });
    }
  }

  onWalkingTimeInputChanged(val: string) {
    const numVal = val === '' ? 0 : parseInt(val);
    if (isNaN(numVal)) {
      this.setState({
        walkingTimeDisplay: val,
        walkingTimeError: 'Please enter a valid number',
      });
      return;
    }
    this.setState({ walkingTimeDisplay: numVal, walkingTimeError: '' });
  }

  onSubmit() {
    const { selectedLocation, onSetWalkingTime, onError } = this.props;
    if (!selectedLocation) {
      onError('Please select a location first');
    } else {
      onSetWalkingTime(parseInt(this.state.walkingTimeDisplay as string));
    }
  }

  render() {
    const { walkingTimeDisplay, walkingTimeError } = this.state;
    const { selectedFilter, onSelectFilter } = this.props;
    return (
      <div className="filters">
        {/* TODO: Add good coffee / instagrammable filters. */}
        <Checkbox
          label="Good for studying"
          checked={selectedFilter === 'study'}
          iconStyle={{ fill: colors.blueGrey700 }}
          onCheck={(e, isInputChecked) =>
            onSelectFilter(isInputChecked ? 'study' : null)
          }
        />
        <div style={{display: 'flex', alignItems: 'center'}}>
          <TextField
            value={walkingTimeDisplay || ''}
            floatingLabelText="Walking time (minutes)"
            errorText={walkingTimeDisplay !== '' && walkingTimeError}
            floatingLabelFocusStyle={{ color: colors.blueGrey700 }}
            underlineFocusStyle={{ borderColor: colors.blueGrey700 }}
            onChange={(event, val) => this.onWalkingTimeInputChanged(val)}
          />
          <FlatButton
            label="Submit"
            style={{marginTop: '20px', marginLeft: '12px'}}
            hoverColor={colors.blueGrey700}
            onClick={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}
