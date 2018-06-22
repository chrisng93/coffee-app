import { CircularProgress } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import * as React from 'react';

const Loading = () => (
  <div className="loading">
    <CircularProgress size={120} thickness={8} color={colors.white} />
  </div>
);

export default Loading;
