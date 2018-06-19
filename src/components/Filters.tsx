import { Checkbox, TextField } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';

import { FilterType, MapData } from '../types';

interface Props {
  // Currently selected filter. Null if none.
  selectedFilter: FilterType;
  // Set the walking time to get coffee.
  onSetWalkingTime: (walkingTimeDisplay: number) => void;
  // Select a filter.
  onSelectFilter: (filter: FilterType) => void;
  // Time in min that the user wants to walk to get coffee. This is the actual value, rather than
  // the display in the text field.
  walkingTimeMin: number;
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
    this.props.onSetWalkingTime(numVal);
    this.setState({ walkingTimeDisplay: numVal, walkingTimeError: '' });
  }

  render() {
    const { walkingTimeDisplay, walkingTimeError } = this.state;
    const { selectedFilter, onSelectFilter } = this.props;
    return (
      <div className="filters">
        <TextField
          value={walkingTimeDisplay || ''}
          floatingLabelText="Walking time (minutes)"
          errorText={walkingTimeDisplay !== '' && walkingTimeError}
          floatingLabelFocusStyle={{ color: colors.blueGrey700 }}
          underlineFocusStyle={{ borderColor: colors.blueGrey700 }}
          onChange={(event, val) => this.onWalkingTimeInputChanged(val)}
        />
        {/* TODO: Add good coffee / instagrammable filters. */}
        <Checkbox
          label="Good for studying"
          checked={selectedFilter === 'study'}
          onCheck={(e, isInputChecked) =>
            onSelectFilter(isInputChecked ? 'study' : null)
          }
        />
      </div>
    );
  }
}
