import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

import STYLES from './styles';

export default class Filter extends Component {
  render() {
    return (
      <Paper style={STYLES.filter} zDepth={2} rounded={false} />
    );
  }
}
